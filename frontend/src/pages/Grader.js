import React, { useState } from 'react';
import { Upload, Eye, X, Image as ImageIcon, Users, Award, Loader, CheckCircle2, XCircle, FileText, RotateCcw, Package, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Grader = () => {
    const [correctAnswersImage, setCorrectAnswersImage] = useState(null);
    const [studentAnswersImage, setStudentAnswersImage] = useState(null);
    const [studentAnswersImages, setStudentAnswersImages] = useState([]); // NEW: For batch processing
    const [correctAnswersPreview, setCorrectAnswersPreview] = useState(null);
    const [studentAnswersPreview, setStudentAnswersPreview] = useState(null);
    const [testTitle, setTestTitle] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [gradingResults, setGradingResults] = useState(null);
    const [batchResults, setBatchResults] = useState(null); // NEW: For batch results
    const [isBatchMode, setIsBatchMode] = useState(false); // NEW: Toggle between single/batch
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const MAX_BATCH_FILES = 30; // Maximum number of files allowed

    const handleImageUpload = (file, type) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (type === 'correct') {
                    setCorrectAnswersImage(file);
                    setCorrectAnswersPreview(e.target.result);
                } else {
                    setStudentAnswersImage(file);
                    setStudentAnswersPreview(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // NEW: Handle multiple student files upload
    const handleMultipleStudentUpload = (files) => {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        setStudentAnswersImages(imageFiles);
    };

    // NEW: Handle adding more files to existing batch
    const handleAddMoreFiles = (files) => {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        const currentCount = studentAnswersImages.length;
        const remainingSlots = MAX_BATCH_FILES - currentCount;
        
        if (imageFiles.length > remainingSlots) {
            setError(`Poți adăuga maximum ${remainingSlots} fișiere suplimentare. Ai încercat să adaugi ${imageFiles.length} fișiere.`);
            return;
        }

        // Check for duplicate files
        const existingNames = studentAnswersImages.map(file => file.name);
        const newFiles = imageFiles.filter(file => !existingNames.includes(file.name));
        
        if (newFiles.length !== imageFiles.length) {
            setError(`Unele fișiere au fost ignorate deoarece există deja în listă.`);
        }

        setStudentAnswersImages(prev => [...prev, ...newFiles]);
        setError(null); // Clear error if successful
    };

    // NEW: Remove individual file from batch
    const removeFileFromBatch = (indexToRemove) => {
        setStudentAnswersImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const clearImage = (type) => {
        if (type === 'correct') {
            setCorrectAnswersImage(null);
            setCorrectAnswersPreview(null);
        } else {
            setStudentAnswersImage(null);
            setStudentAnswersPreview(null);
            setStudentAnswersImages([]);
        }
        setGradingResults(null);
        setBatchResults(null);
        setError(null);
    };

    const resetAll = () => {
        setCorrectAnswersImage(null);
        setStudentAnswersImage(null);
        setStudentAnswersImages([]);
        setCorrectAnswersPreview(null);
        setStudentAnswersPreview(null);
        setTestTitle('');
        setGradingResults(null);
        setBatchResults(null);
        setError(null);
        setIsPreviewMode(false);
        setIsBatchMode(false);
    };

    // Existing single test grading
    const handleGrading = async () => {
        if (!correctAnswersImage || !studentAnswersImage) {
            setError('Vă rugăm să încărcați ambele imagini');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('barem', correctAnswersImage);
            formData.append('elev', studentAnswersImage);
            formData.append('testTitle', testTitle || 'Test Grilă');

            const response = await fetch(`${process.env.REACT_APP_API}/api/grading/grade`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Eroare la procesarea imaginilor');
            }

            console.log(data);
            setGradingResults(data);
            setIsPreviewMode(true);
        } catch (err) {
            setError(err.message);
            console.error('Grading error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Batch grading function
    const handleBatchGrading = async () => {
        if (!correctAnswersImage || studentAnswersImages.length === 0) {
            setError('Vă rugăm să încărcați baremul și cel puțin un test de elev');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('barem', correctAnswersImage);
            formData.append('testTitle', testTitle || 'Test Grilă - Procesare în Lot');
            
            // Add all student images
            studentAnswersImages.forEach((file) => {
                formData.append('students', file);
            });

            const response = await fetch(`${process.env.REACT_APP_API}/api/grading/grade-batch`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Eroare la procesarea imaginilor');
            }

            console.log(data);
            setBatchResults(data);
            setIsPreviewMode(true);
        } catch (err) {
            setError(err.message);
            console.error('Batch grading error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Award className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Evaluator Teste Grilă
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    Corectare automată prin analiză vizuală
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Link
                                to="/teste"
                                className="inline-flex items-center px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Vezi Toate Testele
                            </Link>
                            
                            {(correctAnswersImage || studentAnswersImage || studentAnswersImages.length > 0 || gradingResults || batchResults) && (
                                <button
                                    onClick={resetAll}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset
                                </button>
                            )}
                            
                            {(gradingResults || batchResults) && (
                                <button
                                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {isPreviewMode ? 'Înapoi la Upload' : 'Vezi Rezultate'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Alert */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                        <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-red-400 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">
                                    A apărut o eroare
                                </h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {!isPreviewMode ? (
                    /* Upload Section */
                    <div className="space-y-8">
                        {/* Mode Toggle */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-700">Mod de procesare:</span>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setIsBatchMode(false)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                !isBatchMode
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            <Users className="h-4 w-4 mr-2 inline" />
                                            Un singur test
                                        </button>
                                        <button
                                            onClick={() => setIsBatchMode(true)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                isBatchMode
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            <Package className="h-4 w-4 mr-2 inline" />
                                            Procesare în lot
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Info Card */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center">
                                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Informații Test
                                    </h2>
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                <div className="max-w-md">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Titlu Test (opțional)
                                    </label>
                                    <input
                                        type="text"
                                        value={testTitle}
                                        onChange={(e) => setTestTitle(e.target.value)}
                                        placeholder={isBatchMode ? "Ex: Test Chimie - Clasa a XI-a" : "Ex: Test Chimie - Capitolul 5"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upload Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Answer Key Upload */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Barem (Răspunsuri Corecte)
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {!correctAnswersPreview ? (
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-200">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-4 font-medium">
                                                Încarcă imaginea cu răspunsurile corecte
                                            </p>
                                            <p className="text-gray-500 text-sm mb-4">
                                                Formatul acceptat: JPG, PNG, JPEG
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e.target.files[0], 'correct')}
                                                className="hidden"
                                                id="correct-upload"
                                            />
                                            <label
                                                htmlFor="correct-upload"
                                                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors font-medium"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Selectează Fișier
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <img
                                                    src={correctAnswersPreview}
                                                    alt="Răspunsuri corecte"
                                                    className="w-full rounded-lg shadow-sm border border-gray-200"
                                                />
                                                <button
                                                    onClick={() => clearImage('correct')}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center text-sm text-green-700 bg-green-50 rounded-lg p-3">
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Barem încărcat cu succes
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Student Answers Upload */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                            {isBatchMode ? <Package className="h-5 w-5 text-blue-600" /> : <Users className="h-5 w-5 text-blue-600" />}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {isBatchMode ? 'Răspunsuri Elevi (Lot)' : 'Răspunsuri Elev'}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {(!studentAnswersPreview && studentAnswersImages.length === 0) ? (
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                                            {isBatchMode ? <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" /> : <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
                                            <p className="text-gray-600 mb-4 font-medium">
                                                {isBatchMode ? 'Încarcă imaginile cu răspunsurile elevilor' : 'Încarcă imaginea cu răspunsurile elevului'}
                                            </p>
                                            <p className="text-gray-500 text-sm mb-4">
                                                Formatul acceptat: JPG, PNG, JPEG
                                                {isBatchMode && ` (maximum ${MAX_BATCH_FILES} de fișiere)`}
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple={isBatchMode}
                                                onChange={(e) => {
                                                    if (isBatchMode) {
                                                        handleMultipleStudentUpload(e.target.files);
                                                    } else {
                                                        handleImageUpload(e.target.files[0], 'student');
                                                    }
                                                }}
                                                className="hidden"
                                                id="student-upload"
                                            />
                                            <label
                                                htmlFor="student-upload"
                                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {isBatchMode ? 'Selectează Fișiere' : 'Selectează Fișier'}
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Single image preview */}
                                            {!isBatchMode && studentAnswersPreview && (
                                                <div className="relative group">
                                                    <img
                                                        src={studentAnswersPreview}
                                                        alt="Răspunsuri elev"
                                                        className="w-full rounded-lg shadow-sm border border-gray-200"
                                                    />
                                                    <button
                                                        onClick={() => clearImage('student')}
                                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {/* Multiple images list */}
                                            {isBatchMode && studentAnswersImages.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {studentAnswersImages.length} / {MAX_BATCH_FILES} fișier(e) selectat(e)
                                                        </span>
                                                        <button
                                                            onClick={() => clearImage('student')}
                                                            className="text-sm text-red-600 hover:text-red-800"
                                                        >
                                                            Șterge tot
                                                        </button>
                                                    </div>
                                                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                                        {studentAnswersImages.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between text-sm text-gray-600 py-1">
                                                                <div className="flex items-center">
                                                                    <FileText className="h-4 w-4 mr-2" />
                                                                    {file.name}
                                                                </div>
                                                                <button
                                                                    onClick={() => removeFileFromBatch(index)}
                                                                    className="text-red-500 hover:text-red-700 p-1"
                                                                    title="Șterge fișierul"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Add more files button */}
                                                    {studentAnswersImages.length < MAX_BATCH_FILES && (
                                                        <div className="mt-3">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                onChange={(e) => handleAddMoreFiles(e.target.files)}
                                                                className="hidden"
                                                                id="add-more-files"
                                                            />
                                                            <label
                                                                htmlFor="add-more-files"
                                                                className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors text-sm font-medium"
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Adaugă mai multe fișiere ({MAX_BATCH_FILES - studentAnswersImages.length} locuri rămase)
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                {isBatchMode 
                                                    ? `${studentAnswersImages.length} fișier(e) încărcat(e) cu succes`
                                                    : 'Răspunsuri încărcate cu succes'
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {correctAnswersImage && (isBatchMode ? studentAnswersImages.length > 0 : studentAnswersImage) && (
                            <div className="flex justify-center">
                                <button
                                    onClick={isBatchMode ? handleBatchGrading : handleGrading}
                                    disabled={isLoading}
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="animate-spin h-6 w-6 mr-3" />
                                            {isBatchMode ? `Se procesează ${studentAnswersImages.length} teste...` : 'Se procesează...'}
                                        </>
                                    ) : (
                                        <>
                                            <Award className="h-6 w-6 mr-3" />
                                            {isBatchMode ? `Evaluează ${studentAnswersImages.length} Teste` : 'Începe Evaluarea'}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Results Section - Keep existing results display code */
                    <div className="space-y-8">
                        {/* Single Test Results */}
                        {gradingResults && (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                                                    <Users className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Nume Elev</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {gradingResults.student_name?.name || 'Nu s-a detectat'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-green-100 rounded-xl mr-4">
                                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Răspunsuri Corecte</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {gradingResults.correct_answers}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-purple-100 rounded-xl mr-4">
                                                    <FileText className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Total Întrebări</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {gradingResults.total_questions}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Result Image */}
                                {gradingResults.result_image && (
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Rezultat Vizual
                                            </h3>
                                        </div>
                                        <div className="p-6">
                                            <img
                                                src={gradingResults.result_image}
                                                alt="Rezultate vizuale"
                                                className="w-full rounded-lg shadow-sm border border-gray-200"
                                            />
                                            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                                                    Răspuns corect
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                                                    Răspuns greșit
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Detailed Results */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Detalii pe Întrebări
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {gradingResults.details?.map((detail, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                                                        detail.status === 'CORRECT'
                                                            ? 'border-green-200 bg-green-50 text-green-800'
                                                            : 'border-red-200 bg-red-50 text-red-800'
                                                    }`}
                                                >
                                                    <div className="font-bold text-lg">
                                                        {detail.question}
                                                    </div>
                                                    <div className="text-2xl mt-1">
                                                        {detail.status === 'CORRECT' ? '✅' : '❌'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Batch Results */}
                        {batchResults && (
                            <>
                                {/* Batch Summary */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Sumar Procesare în Lot
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-blue-600">
                                                    {batchResults.summary.totalTests}
                                                </div>
                                                <div className="text-sm text-gray-500">Total Teste</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-green-600">
                                                    {batchResults.summary.successful}
                                                </div>
                                                <div className="text-sm text-gray-500">Procesate cu Succes</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-red-600">
                                                    {batchResults.summary.failed}
                                                </div>
                                                <div className="text-sm text-gray-500">Eșuate</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-purple-600">
                                                    {batchResults.summary.successRate}
                                                </div>
                                                <div className="text-sm text-gray-500">Rata de Succes</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Batch Results List */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Rezultate Individuale
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {batchResults.results.map((result, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                                                                    {result.index}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">
                                                                        {result.studentName || 'Nu s-a detectat'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {result.filename}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-gray-900">
                                                                    {result.correctAnswers}/{result.totalQuestions}
                                                                </div>
                                                            </div>
                                                            <div className="w-6 h-6">
                                                                {result.success ? (
                                                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                                ) : (
                                                                    <XCircle className="w-6 h-6 text-red-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Errors section */}
                                        {batchResults.errors.length > 0 && (
                                            <div className="mt-8">
                                                <h4 className="text-lg font-semibold text-red-800 mb-4">
                                                    Teste Eșuate ({batchResults.errors.length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {batchResults.errors.map((error, index) => (
                                                        <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                                                                        {error.index}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-red-900">
                                                                            {error.filename}
                                                                        </div>
                                                                        <div className="text-sm text-red-700">
                                                                            {error.error}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <XCircle className="w-6 h-6 text-red-500" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Grader;