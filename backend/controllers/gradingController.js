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

// Helper function to process single test
const processSingleTest = (baremPath, elevPath, testTitle = 'Test Grilă') => {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = path.join(__dirname, '../python/verificareGrila.py');
        const pythonProcess = spawn('python', [pythonScriptPath, baremPath, elevPath]);

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
                fs.unlinkSync(elevPath);
            } catch (err) {
                console.error('Error cleaning up elev file:', err);
            }

            if (code !== 0) {
                console.error('Python script error:', errorString);
                return reject(new Error(`Python script failed: ${errorString}`));
            }

            try {
                const results = JSON.parse(dataString);
                
                const testResult = new TestResult({
                    testTitle: testTitle,
                    studentName: results.student_name || {
                        name: '',
                        confidence: 0,
                        success: false
                    },
                    correctAnswers: results.correct_answers,
                    totalQuestions: results.total_questions,
                    baremMatrix: results.barem_matrix,
                    elevMatrix: results.elev_matrix,
                    details: results.details,
                    resultImage: results.result_image,
                    processingTime: 0
                });

                const savedResult = await testResult.save();
                
                resolve({
                    success: true,
                    savedId: savedResult._id,
                    studentName: results.student_name?.name || 'Nu s-a detectat',
                    correctAnswers: results.correct_answers,
                    totalQuestions: results.total_questions,
                    ...results
                });
            } catch (err) {
                console.error('Error parsing Python output or saving to DB:', err);
                reject(new Error(`Error processing results: ${err.message}`));
            }
        });
    });
};

// Single test endpoint (existing)
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
        const testTitle = req.body.testTitle || 'Test Grilă';

        const result = await processSingleTest(baremPath, elevPath, testTitle);
        
        // Clean up barem file
        try {
            fs.unlinkSync(baremPath);
        } catch (err) {
            console.error('Error cleaning up barem file:', err);
        }

        const processingTime = Date.now() - startTime;
        
        // Update processing time in database
        await TestResult.findByIdAndUpdate(result.savedId, { processingTime });

        const response = {
            timestamp: new Date().toISOString(),
            processingTime: processingTime,
            ...result
        };

        res.json(response);
    } catch (error) {
        console.error('Error in grading endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.post('/grade-batch', upload.fields([
    { name: 'barem', maxCount: 1 },
    { name: 'students', maxCount: 30 }
]), async (req, res) => {
    const startTime = Date.now();
    
    try {
        if (!req.files || !req.files.barem || !req.files.students) {
            return res.status(400).json({
                error: 'Barem image and at least one student image are required'
            });
        }

        const baremPath = req.files.barem[0].path;
        const studentFiles = req.files.students;
        const testTitle = req.body.testTitle || 'Test Grilă - Procesare în Lot';

        console.log(`Processing batch of ${studentFiles.length} tests with barem: ${baremPath}`);

        // Process all tests in parallel
        const processingPromises = studentFiles.map(async (studentFile, index) => {
            try {
                console.log(`Processing test ${index + 1}/${studentFiles.length}: ${studentFile.filename}`);
                const result = await processSingleTest(baremPath, studentFile.path, `${testTitle} - Test ${index + 1}`);
                return {
                    index: index + 1,
                    filename: studentFile.originalname,
                    ...result
                };
            } catch (error) {
                console.error(`Error processing test ${index + 1}:`, error);
                return {
                    index: index + 1,
                    filename: studentFile.originalname,
                    success: false,
                    error: error.message
                };
            }
        });

        // Wait for all tests to complete
        const results = await Promise.allSettled(processingPromises);
        
        // Clean up barem file
        try {
            fs.unlinkSync(baremPath);
        } catch (err) {
            console.error('Error cleaning up barem file:', err);
        }

        const processingTime = Date.now() - startTime;

        // Separate successful and failed results
        const successfulResults = [];
        const failedResults = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                if (result.value.success) {
                    successfulResults.push(result.value);
                } else {
                    failedResults.push(result.value);
                }
            } else {
                failedResults.push({
                    index: index + 1,
                    filename: studentFiles[index]?.originalname || 'Unknown',
                    success: false,
                    error: result.reason?.message || 'Unknown error'
                });
            }
        });

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            processingTime: processingTime,
            summary: {
                totalTests: studentFiles.length,
                successful: successfulResults.length,
                failed: failedResults.length,
                successRate: ((successfulResults.length / studentFiles.length) * 100).toFixed(1) + '%'
            },
            results: successfulResults,
            errors: failedResults
        };

        res.json(response);
    } catch (error) {
        console.error('Error in batch grading endpoint:', error);
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