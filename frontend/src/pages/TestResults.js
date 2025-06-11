import React, { useState, useEffect } from 'react';
import { 
    Eye, 
    Trash2, 
    Search, 
    Filter, 
    Calendar, 
    User, 
    FileText, 
    TrendingUp,
    Download,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const TestResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        studentName: '',
        testTitle: '',
        startDate: '',
        endDate: ''
    });
    const [stats, setStats] = useState(null);

    // Fetch results
    const fetchResults = async (page = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                )
            });

            const response = await fetch(`${process.env.REACT_APP_API}/api/grading/results?${queryParams}`);
            const data = await response.json();

            if (data.success) {
                setResults(data.results);
                setPagination(data.pagination);
                setCurrentPage(page);
            } else {
                setError('Eroare la încărcarea rezultatelor');
            }
        } catch (err) {
            setError('Eroare de conexiune');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API}/api/grading/stats`);
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    // View full result
    const viewResult = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API}/api/grading/results/${id}`);
            const data = await response.json();
            
            if (data.success) {
                setSelectedResult(data.result);
                setShowModal(true);
            }
        } catch (err) {
            console.error('Error fetching result details:', err);
        }
    };

    // Delete result
    const deleteResult = async (id) => {
        if (!window.confirm('Sigur doriți să ștergeți acest rezultat?')) return;
        
        try {
            const response = await fetch(`${process.env.REACT_APP_API}/api/grading/results/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchResults(currentPage);
                fetchStats();
            }
        } catch (err) {
            console.error('Error deleting result:', err);
        }
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        fetchResults(1);
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            studentName: '',
            testTitle: '',
            startDate: '',
            endDate: ''
        });
        setTimeout(() => fetchResults(1), 100);
    };

    useEffect(() => {
        fetchResults();
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <FileText className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Rezultate Teste
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    Vizualizează și gestionează toate testele corectate
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => fetchResults(currentPage)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reîmprospătează
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Teste</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <Filter className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Filtre</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nume Elev
                                </label>
                                <input
                                    type="text"
                                    value={filters.studentName}
                                    onChange={(e) => handleFilterChange('studentName', e.target.value)}
                                    placeholder="Caută după nume..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Titlu Test
                                </label>
                                <input
                                    type="text"
                                    value={filters.testTitle}
                                    onChange={(e) => handleFilterChange('testTitle', e.target.value)}
                                    placeholder="Caută după titlu..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de la
                                </label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data până la
                                </label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={applyFilters}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Caută
                            </button>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Șterge Filtrele
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Rezultate Teste ({pagination.totalResults || 0})
                        </h3>
                    </div>
                    
                    {loading ? (
                        <div className="p-8 text-center">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-4" />
                            <p className="text-gray-600">Se încarcă rezultatele...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Nu există rezultate</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Elev
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Test
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Scor
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Data
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acțiuni
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.map((result) => (
                                            <tr key={result.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                                            <User className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {result.studentName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{result.testTitle}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">{result.score}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {result.date} <br/> {result.time}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => viewResult(result.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteResult(result.id)}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Pagina {pagination.currentPage} din {pagination.totalPages}
                                        ({pagination.totalResults} rezultate)
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => fetchResults(currentPage - 1)}
                                            disabled={!pagination.hasPrev}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => fetchResults(currentPage + 1)}
                                            disabled={!pagination.hasNext}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Următor
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal for viewing full result */}
            {showModal && selectedResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Detalii Test - {selectedResult.studentName?.name || 'Nu s-a detectat'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-2"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-blue-600 text-sm font-medium">Test</div>
                                    <div className="text-xl font-bold text-blue-800">
                                        {selectedResult.testTitle}
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-green-600 text-sm font-medium">Scor</div>
                                    <div className="text-xl font-bold text-green-800">
                                        {selectedResult.correctAnswers}/{selectedResult.totalQuestions}
                                    </div>
                                </div>
                            </div>

                            {/* Result Image */}
                            {selectedResult.resultImage && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-3">Imagine cu Rezultate</h4>
                                    <img
                                        src={selectedResult.resultImage}
                                        alt="Rezultate vizuale"
                                        className="w-full rounded-lg border"
                                    />
                                </div>
                            )}

                            {/* Details */}
                            <div>
                                <h4 className="text-lg font-semibold mb-3">Detalii pe Întrebări</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {selectedResult.details?.map((detail, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg border-2 text-center ${
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestResults;