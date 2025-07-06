import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import Navbar from '../Navbar/Navbar';
import BeatLoader from "react-spinners/BeatLoader";

export default function BrailleAnalytics() {
    const navigate = useNavigate();
    const [brailleResults, setBrailleResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overviewChart, setOverviewChart] = useState(null);
    const [difficultyChart, setDifficultyChart] = useState(null);
    const [uniqueStudents, setUniqueStudents] = useState([]);

    useEffect(() => {
        fetchBrailleResults();
        return () => {
            if (overviewChart) overviewChart.destroy();
            if (difficultyChart) difficultyChart.destroy();
        };
    }, []);

    const fetchBrailleResults = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fetchBrailleResults');
            const data = await response.json();
            setBrailleResults(data.data || []);
            
            // Extract unique students with their latest session data
            const students = {};
            (data.data || []).forEach(result => {
                const studentName = result.studentName;
                if (!students[studentName] || new Date(result.sessionDate) > new Date(students[studentName].sessionDate)) {
                    students[studentName] = result;
                }
            });
            
            setUniqueStudents(Object.values(students));
            setLoading(false);
            
            // Create charts after data is loaded
            setTimeout(() => {
                createOverviewChart(data.data || []);
                createStudentProgressChart(data.data || []);
            }, 100);
        } catch (error) {
            console.error('Error fetching Braille results:', error);
            setLoading(false);
        }
    };

    const createOverviewChart = (data) => {
        const ctx = document.getElementById('overviewChart');
        if (!ctx || data.length === 0) return;

        if (overviewChart) overviewChart.destroy();

        const studentNames = data.map(result => result.studentName);
        const overallAccuracies = data.map(result => parseFloat(result.overallAccuracy) || 0);
        const totalErrors = data.map(result => parseInt(result.totalErrors) || 0);

        const newChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: studentNames,
                datasets: [
                    {
                        label: 'Overall Accuracy (%)',
                        data: overallAccuracies,
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Total Errors',
                        data: totalErrors,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Student Performance Overview'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Accuracy (%)'
                        },
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Errors'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });

        setOverviewChart(newChart);
    };

    const createStudentProgressChart = (data) => {
        const ctx = document.getElementById('progressChart');
        if (!ctx || data.length === 0) return;

        if (difficultyChart) difficultyChart.destroy();

        const letterAccuracies = data.map(result => parseFloat(result.letterAccuracy) || 0);
        const wordAccuracies = data.map(result => parseFloat(result.wordAccuracy) || 0);
        const studentNames = data.map(result => result.studentName);

        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: studentNames,
                datasets: [
                    {
                        label: 'Letter Training Accuracy (%)',
                        data: letterAccuracies,
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Word Training Accuracy (%)',
                        data: wordAccuracies,
                        borderColor: 'rgba(139, 92, 246, 1)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Training Phase Comparison'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Accuracy (%)'
                        }
                    }
                }
            }
        });

        setDifficultyChart(newChart);
    };

    const getAverageStats = () => {
        if (brailleResults.length === 0) return null;

        const avgOverallAccuracy = brailleResults.reduce((sum, result) => 
            sum + (parseFloat(result.overallAccuracy) || 0), 0) / brailleResults.length;
        
        const avgLetterAccuracy = brailleResults.reduce((sum, result) => 
            sum + (parseFloat(result.letterAccuracy) || 0), 0) / brailleResults.length;
        
        const avgWordAccuracy = brailleResults.reduce((sum, result) => 
            sum + (parseFloat(result.wordAccuracy) || 0), 0) / brailleResults.length;
        
        const totalErrors = brailleResults.reduce((sum, result) => 
            sum + (parseInt(result.totalErrors) || 0), 0);
        
        const completionRate = brailleResults.filter(result => 
            result.sessionComplete === 'Yes').length / brailleResults.length * 100;

        return {
            avgOverallAccuracy: avgOverallAccuracy.toFixed(1),
            avgLetterAccuracy: avgLetterAccuracy.toFixed(1),
            avgWordAccuracy: avgWordAccuracy.toFixed(1),
            totalErrors,
            completionRate: completionRate.toFixed(1)
        };
    };

    const averageStats = getAverageStats();

    const handleStudentClick = (studentName) => {
        // Navigate to Braille results page with student name as parameter
        navigate(`/results-braille?student=${encodeURIComponent(studentName)}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Braille Training Analytics
                    </h1>
                    <p className="text-xl text-gray-600">
                        Administrator Dashboard for Training Results
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <BeatLoader color="#3B82F6" size={15} />
                        <p className="mt-4 text-gray-600">Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Statistics */}
                        {averageStats && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Students</h3>
                                    <p className="text-3xl font-bold text-blue-600">{brailleResults.length}</p>
                                </div>
                                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Avg Accuracy</h3>
                                    <p className="text-3xl font-bold text-green-600">{averageStats.avgOverallAccuracy}%</p>
                                </div>
                                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Letter Accuracy</h3>
                                    <p className="text-3xl font-bold text-purple-600">{averageStats.avgLetterAccuracy}%</p>
                                </div>
                                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Word Accuracy</h3>
                                    <p className="text-3xl font-bold text-indigo-600">{averageStats.avgWordAccuracy}%</p>
                                </div>
                                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Completion Rate</h3>
                                    <p className="text-3xl font-bold text-orange-600">{averageStats.completionRate}%</p>
                                </div>
                            </div>
                        )}

                        {/* Student List */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                            <div className="px-6 py-4 bg-blue-800 text-white">
                                <h2 className="text-xl font-bold">Students List</h2>
                                <p className="text-blue-100 text-sm">Click on a student to view their individual results</p>
                            </div>
                            <div className="p-6">
                                {uniqueStudents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {uniqueStudents.map((student, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleStudentClick(student.studentName)}
                                                className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-4 cursor-pointer transition-all duration-200 transform hover:scale-105"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            {student.studentName}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            Last session: {student.sessionDate}
                                                        </p>
                                                        <div className="mt-2 flex items-center space-x-4">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                parseFloat(student.overallAccuracy) >= 80 ? 'bg-green-100 text-green-800' :
                                                                parseFloat(student.overallAccuracy) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {student.overallAccuracy}% accuracy
                                                            </span>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                student.sessionComplete === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {student.sessionComplete === 'Yes' ? 'Complete' : 'Incomplete'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-blue-600">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No students found.</p>
                                        <p className="text-gray-500 text-sm mt-1">Students will appear here after completing Braille training.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <canvas id="overviewChart" width="400" height="300"></canvas>
                            </div>
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <canvas id="progressChart" width="400" height="300"></canvas>
                            </div>
                        </div>

                        {/* Detailed Results Table */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="px-6 py-4 bg-gray-800 text-white">
                                <h2 className="text-xl font-bold">Detailed Results</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Overall Accuracy
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Letter Accuracy
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Word Accuracy
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Errors
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Time (min)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Complete
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {brailleResults.map((result, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {result.studentName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {result.sessionDate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        parseFloat(result.overallAccuracy) >= 80 ? 'bg-green-100 text-green-800' :
                                                        parseFloat(result.overallAccuracy) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {result.overallAccuracy}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {result.letterAccuracy}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {result.wordAccuracy}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {result.totalErrors}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {result.totalTime}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        result.sessionComplete === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {result.sessionComplete}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {brailleResults.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600">No Braille training results found.</p>
                                <p className="text-gray-500 mt-2">Students need to complete training sessions first.</p>
                            </div>
                        )}
                    </>
                )}

                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Back to Admin Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
