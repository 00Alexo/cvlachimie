const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const TestResult = require('../models/TestResult');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Grade test endpoint
router.post('/grade', upload.fields([
    { name: 'barem', maxCount: 1 },
    { name: 'elev', maxCount: 1 }
]), async (req, res) => {
    const startTime = Date.now();
    
    try {
        if (!req.files || !req.files.barem || !req.files.elev) {
            return res.status(400).json({
                error: 'Both barem and elev images are required'
            });
        }

        const baremPath = req.files.barem[0].path;
        const elevPath = req.files.elev[0].path;
        const pythonScriptPath = path.join(__dirname, '../python/verificareGrila.py');
        const testTitle = req.body.testTitle || 'Test Grilă';

        // Run Python script
        console.log(pythonScriptPath, baremPath, elevPath);
        const pythonProcess = spawn('python3', [pythonScriptPath, baremPath, elevPath]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            // Clean up uploaded files
            try {
                fs.unlinkSync(baremPath);
                fs.unlinkSync(elevPath);
            } catch (err) {
                console.error('Error cleaning up files:', err);
            }

            if (code !== 0) {
                console.error('Python script error:', errorString);
                return res.status(500).json({
                    error: 'Error processing images',
                    details: errorString
                });
            }

            try {
                const results = JSON.parse(dataString);
                const processingTime = Date.now() - startTime;
                
                // Save to MongoDB
                const testResult = new TestResult({
                    testTitle: testTitle,
                    studentName: results.student_name || {
                        name: '',
                        confidence: 0,
                        success: false
                    },
                    correctAnswers: results.correct_answers,
                    totalQuestions: results.total_questions,
                    //scorePercentage: results.score_percentage,
                    //gradeOutOf10: results.grade_out_of_10,
                    baremMatrix: results.barem_matrix,
                    elevMatrix: results.elev_matrix,
                    details: results.details,
                    resultImage: results.result_image,
                    processingTime: processingTime
                });

                const savedResult = await testResult.save();
                console.log('Test result saved to MongoDB:', savedResult._id);
                
                // Add additional metadata to response
                const response = {
                    success: true,
                    timestamp: new Date().toISOString(),
                    processingTime: processingTime,
                    savedId: savedResult._id,
                    ...results
                };

                res.json(response);
            } catch (err) {
                console.error('Error parsing Python output or saving to DB:', err);
                res.status(500).json({
                    error: 'Error parsing results or saving to database',
                    details: err.message
                });
            }
        });

    } catch (error) {
        console.error('Error in grading endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Get all test results
router.get('/results', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const filter = {};
        
        // Filter by student name if provided
        if (req.query.studentName) {
            filter['studentName.name'] = new RegExp(req.query.studentName, 'i');
        }
        
        // Filter by test title if provided
        if (req.query.testTitle) {
            filter.testTitle = new RegExp(req.query.testTitle, 'i');
        }
        
        // Filter by date range if provided
        if (req.query.startDate || req.query.endDate) {
            filter.timestamp = {};
            if (req.query.startDate) {
                filter.timestamp.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.timestamp.$lte = new Date(req.query.endDate);
            }
        }

        const totalResults = await TestResult.countDocuments(filter);
        const results = await TestResult.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .select('-resultImage'); // Exclude heavy image data from list

        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            success: true,
            results: results.map(result => result.getFormattedResult()),
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalResults: totalResults,
                limit: limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching test results:', error);
        res.status(500).json({
            error: 'Error fetching test results',
            details: error.message
        });
    }
});

// Get single test result with full details
router.get('/results/:id', async (req, res) => {
    try {
        const result = await TestResult.findById(req.params.id);
        
        if (!result) {
            return res.status(404).json({
                error: 'Test result not found'
            });
        }

        res.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error('Error fetching test result:', error);
        res.status(500).json({
            error: 'Error fetching test result',
            details: error.message
        });
    }
});

// Delete test result
router.delete('/results/:id', async (req, res) => {
    try {
        const result = await TestResult.findByIdAndDelete(req.params.id);
        
        if (!result) {
            return res.status(404).json({
                error: 'Test result not found'
            });
        }

        res.json({
            success: true,
            message: 'Test result deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting test result:', error);
        res.status(500).json({
            error: 'Error deleting test result',
            details: error.message
        });
    }
});

// Get statistics
router.get('/stats', async (req, res) => {
    try {
        const totalTests = await TestResult.countDocuments();
        const averageScore = await TestResult.aggregate([
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$scorePercentage' },
                    avgGrade: { $avg: '$gradeOutOf10' },
                    maxScore: { $max: '$scorePercentage' },
                    minScore: { $min: '$scorePercentage' }
                }
            }
        ]);

        const recentTests = await TestResult.find()
            .sort({ timestamp: -1 })
            .limit(5)
            .select('testTitle studentName.name scorePercentage timestamp');

        res.json({
            success: true,
            stats: {
                totalTests: totalTests,
                averageScore: averageScore[0]?.avgScore?.toFixed(1) || 0,
                averageGrade: averageScore[0]?.avgGrade?.toFixed(1) || 0,
                maxScore: averageScore[0]?.maxScore || 0,
                minScore: averageScore[0]?.minScore || 0,
                recentTests: recentTests.map(test => ({
                    testTitle: test.testTitle,
                    studentName: test.studentName.name || 'Nu s-a detectat',
                    score: test.scorePercentage + '%',
                    date: test.timestamp.toLocaleDateString('ro-RO')
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            error: 'Error fetching statistics',
            details: error.message
        });
    }
});

module.exports = router;