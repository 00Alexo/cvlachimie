import React, { useState } from 'react';
import { Upload, Eye, X, Image as ImageIcon, Users, Award, Loader, CheckCircle2, XCircle, FileText, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
const Grader = () => {
    const [correctAnswersImage, setCorrectAnswersImage] = useState(null);
    const [studentAnswersImage, setStudentAnswersImage] = useState(null);
    const [correctAnswersPreview, setCorrectAnswersPreview] = useState(null);
    const [studentAnswersPreview, setStudentAnswersPreview] = useState(null);
    const [testTitle, setTestTitle] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [gradingResults, setGradingResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const clearImage = (type) => {
        if (type === 'correct') {
            setCorrectAnswersImage(null);
            setCorrectAnswersPreview(null);
        } else {
            setStudentAnswersImage(null);
            setStudentAnswersPreview(null);
        }
        setGradingResults(null);
        setError(null);
    };

    const resetAll = () => {
        setCorrectAnswersImage(null);
        setStudentAnswersImage(null);
        setCorrectAnswersPreview(null);
        setStudentAnswersPreview(null);
        setTestTitle('');
        setGradingResults(null);
        setError(null);
        setIsPreviewMode(false);
    };

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
            formData.append('testTitle', testTitle || 'Test Grilă'); // Adaugă titlul

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
                            {/* Buton nou pentru vizualizarea tuturor rezultatelor */}
                            <Link
                                to="/teste"
                                className="inline-flex items-center px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Vezi Toate Testele
                            </Link>
                            
                            {(correctAnswersImage || studentAnswersImage || gradingResults) && (
                                <button
                                    onClick={resetAll}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset
                                </button>
                            )}
                            
                            {gradingResults && (
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
                                        placeholder="Ex: Test Chimie - Capitolul 5"
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
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Răspunsuri Elev
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {!studentAnswersPreview ? (
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-4 font-medium">
                                                Încarcă imaginea cu răspunsurile elevului
                                            </p>
                                            <p className="text-gray-500 text-sm mb-4">
                                                Formatul acceptat: JPG, PNG, JPEG
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e.target.files[0], 'student')}
                                                className="hidden"
                                                id="student-upload"
                                            />
                                            <label
                                                htmlFor="student-upload"
                                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Selectează Fișier
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
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
                                            <div className="flex items-center text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Răspunsuri încărcate cu succes
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {correctAnswersImage && studentAnswersImage && (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleGrading}
                                    disabled={isLoading}
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="animate-spin h-6 w-6 mr-3" />
                                            Se procesează...
                                        </>
                                    ) : (
                                        <>
                                            <Award className="h-6 w-6 mr-3" />
                                            Începe Evaluarea
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Results Section */
                    <div className="space-y-8">
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default Grader;