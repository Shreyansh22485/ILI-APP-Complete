import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Chart from "chart.js/auto";
import Navbar from "../Navbar/Navbar";
import BeatLoader from "react-spinners/BeatLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BrailleResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const studentInfo = useSelector((state) => state.studentInfo);
  const brailleTraining = useSelector((state) => state.brailleTraining);
  const [loading, setLoading] = useState(false);
  const [letterChart, setLetterChart] = useState(null);
  const [wordChart, setWordChart] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  
  // Store the real stats for admin view
  const [realLetterStats, setRealLetterStats] = useState(null);
  const [realWordStats, setRealWordStats] = useState(null);
  const [realLetterStatsArray, setRealLetterStatsArray] = useState(null);
  const [realWordStatsArray, setRealWordStatsArray] = useState(null);
  const [deviceComparisonChart, setDeviceComparisonChart] = useState(null);
  const [letterDeviceChart, setLetterDeviceChart] = useState(null);

  // Check if we're viewing a specific student from admin panel
  const urlParams = new URLSearchParams(location.search);
  const selectedStudent = urlParams.get('student');
  useEffect(() => {
    if (selectedStudent) {
      // Admin view - fetch data for specific student
      setIsAdminView(true);
      fetchStudentData(selectedStudent);
    } else {
      // Regular view - use Redux state
      setIsAdminView(false);
      console.log('Braille Training State:', brailleTraining);
      console.log('Letter Training:', brailleTraining.letterTraining);
      console.log('Word Training:', brailleTraining.wordTraining);
      
      if (brailleTraining.letterTraining.completed && brailleTraining.letterTraining.letterStats) {
        createLetterAccuracyChart();
        createDeviceComparisonCharts();
      }
      if (brailleTraining.wordTraining.completed && brailleTraining.wordTraining.wordStats) {
        createWordPerformanceChart();
      }
    }

    return () => {
      if (letterChart) letterChart.destroy();
      if (wordChart) wordChart.destroy();
      if (deviceComparisonChart) deviceComparisonChart.destroy();
      if (letterDeviceChart) letterDeviceChart.destroy();
    };
  }, [brailleTraining, selectedStudent]);

  const fetchStudentData = async (studentName) => {
    setLoading(true);
    try {
      // Fetch main results
      const response = await fetch('http://localhost:5000/api/fetchBrailleResults');
      const data = await response.json();
      
      // Find the latest session for this student
      const studentResults = (data.data || []).filter(result => result.studentName === studentName);
      if (studentResults.length > 0) {
        // Get the most recent session
        const latestResult = studentResults.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate))[0];
        setStudentData(latestResult);
        
        // Fetch detailed letter stats
        const letterStatsResponse = await fetch(`http://localhost:5000/api/fetchStudentLetterStats/${encodeURIComponent(studentName)}`);
        const letterStatsData = await letterStatsResponse.json();
        
        // Fetch detailed word stats
        const wordStatsResponse = await fetch(`http://localhost:5000/api/fetchStudentWordStats/${encodeURIComponent(studentName)}`);
        const wordStatsData = await wordStatsResponse.json();
        
        // Create training data structure with real stats
        const letterStatsFormatted = convertLetterStatsToTrainingFormat(letterStatsData.data || []);
        const wordStatsFormatted = convertWordStatsToTrainingFormat(wordStatsData.data || []);
        
        // Store real stats for use in components
        setRealLetterStats(letterStatsFormatted);
        setRealWordStats(wordStatsFormatted);
        setRealLetterStatsArray(letterStatsData.data || []);
        setRealWordStatsArray(wordStatsData.data || []);
        
        const mockTrainingData = {
          letterTraining: {
            completed: true,
            letterStats: letterStatsFormatted,
            overallStats: {
              accuracy: parseFloat(latestResult.letterAccuracy) || 0,
              totalErrors: parseInt(latestResult.letterErrors) || 0,
              avgTimePerLetter: calculateAvgLetterTime(letterStatsData.data || []),
              totalTime: parseFloat(latestResult.letterTime) * 60000 || 0
            }
          },
          wordTraining: {
            completed: true,
            wordStats: wordStatsFormatted,
            overallStats: {
              accuracy: parseFloat(latestResult.wordAccuracy) || 0,
              totalErrors: parseInt(latestResult.wordErrors) || 0,
              avgTimePerWord: calculateAvgWordTime(wordStatsData.data || []),
              completedWords: wordStatsData.data ? wordStatsData.data.filter(w => w.completed).length : 0,
              totalWords: wordStatsData.data ? wordStatsData.data.length : 0
            }
          },
          sessionData: {
            overallAccuracy: parseFloat(latestResult.overallAccuracy) || 0,
            totalErrors: parseInt(latestResult.totalErrors) || 0,
            totalTime: parseFloat(latestResult.totalTime) * 60000 || 0
          }
        };
        
        // Create charts with real data
        setTimeout(() => {
          createLetterAccuracyChartAdmin(mockTrainingData.letterTraining);
          createWordPerformanceChartAdmin(mockTrainingData.wordTraining);
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load student data');
    }
    setLoading(false);
  };

  const convertLetterStatsToTrainingFormat = (letterStatsArray) => {
    const stats = {};
    letterStatsArray.forEach(stat => {
      stats[stat.letter.toLowerCase()] = {
        attempts: stat.attempts,
        correct: stat.correctAttempts,
        averageTime: stat.averageTime,
        fastestTime: stat.fastestTime,
        slowestTime: stat.slowestTime
      };
    });
    return stats;
  };

  const convertWordStatsToTrainingFormat = (wordStatsArray) => {
    const stats = {};
    wordStatsArray.forEach(stat => {
      stats[stat.word.toLowerCase()] = {
        attempts: stat.attempts,
        completed: stat.completed,
        timeSpent: stat.totalTime,
        errors: Array(stat.errors).fill('error') // Create array with error count
      };
    });
    return stats;
  };

  const calculateAvgLetterTime = (letterStatsArray) => {
    if (letterStatsArray.length === 0) return 2000;
    const totalTime = letterStatsArray.reduce((sum, stat) => sum + stat.averageTime, 0);
    return totalTime / letterStatsArray.length;
  };

  const calculateAvgWordTime = (wordStatsArray) => {
    if (wordStatsArray.length === 0) return 5000;
    const totalTime = wordStatsArray.reduce((sum, stat) => sum + stat.totalTime, 0);
    return totalTime / wordStatsArray.length;
  };

  const createLetterAccuracyChart = () => {
    const ctx = document.getElementById('letterAccuracyChart');
    if (!ctx) return;

    if (letterChart) letterChart.destroy();

    const letterStats = brailleTraining.letterTraining.letterStats || brailleTraining.letterTraining.overallStats?.letterStats;
    if (!letterStats) {
      console.log('No letter stats found for chart');
      return;
    }
    
    const letters = Object.keys(letterStats).sort();
    const accuracies = letters.map(letter => {
      const stats = letterStats[letter];
      // Handle different data structures
      const accuracy = stats.correct && stats.attempts 
        ? ((stats.correct / stats.attempts) * 100).toFixed(1)
        : stats.correctAttempts && stats.attempts
        ? ((stats.correctAttempts / stats.attempts) * 100).toFixed(1)
        : 0;
      return accuracy;
    });

    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: letters.map(l => l.toUpperCase()),
        datasets: [{
          label: 'Accuracy (%)',
          data: accuracies,
          backgroundColor: accuracies.map(acc => acc >= 80 ? '#10B981' : acc >= 60 ? '#F59E0B' : '#EF4444'),
          borderColor: '#374151',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Letter Accuracy Performance'
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
          },
          x: {
            title: {
              display: true,
              text: 'Letters'
            }
          }
        }
      }
    });

    setLetterChart(newChart);
  };

  const createLetterAccuracyChartAdmin = (letterTraining) => {
    const ctx = document.getElementById('letterAccuracyChart');
    if (!ctx) return;

    if (letterChart) letterChart.destroy();

    const letterStats = letterTraining.letterStats;
    if (!letterStats) return;
    
    const letters = Object.keys(letterStats).sort();
    const accuracies = letters.map(letter => {
      const stats = letterStats[letter];
      const accuracy = stats.correct && stats.attempts 
        ? ((stats.correct / stats.attempts) * 100).toFixed(1)
        : 0;
      return accuracy;
    });

    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: letters.map(l => l.toUpperCase()),
        datasets: [{
          label: 'Accuracy (%)',
          data: accuracies,
          backgroundColor: accuracies.map(acc => acc >= 80 ? '#10B981' : acc >= 60 ? '#F59E0B' : '#EF4444'),
          borderColor: '#374151',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Letter Accuracy Performance'
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
          },
          x: {
            title: {
              display: true,
              text: 'Letters'
            }
          }
        }
      }
    });

    setLetterChart(newChart);
  };
  const createWordPerformanceChart = () => {
    const ctx = document.getElementById('wordPerformanceChart');
    if (!ctx) return;

    if (wordChart) wordChart.destroy();

    const wordStats = brailleTraining.wordTraining.wordStats;
    const words = Object.keys(wordStats);
    const times = words.map(word => ((wordStats[word].timeSpent || 0) / 1000).toFixed(1)); // Convert to seconds
    const errors = words.map(word => wordStats[word].errors?.length || 0);

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: words.map(w => w.toUpperCase()),
        datasets: [
          {
            label: 'Time (seconds)',
            data: times,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            yAxisID: 'y'
          },
          {
            label: 'Errors',
            data: errors,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Word Training Performance'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Time (seconds)'
            }
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

    setWordChart(newChart);
  };

  // Device Comparison Charts
  const createDeviceComparisonCharts = () => {
    createOverallDeviceComparisonChart();
    createLetterDeviceUsageChart();
  };

  const createOverallDeviceComparisonChart = () => {
    const ctx = document.getElementById('deviceComparisonChart');
    if (!ctx) return;

    if (deviceComparisonChart) deviceComparisonChart.destroy();

    // Get device usage data from training
    const letterDeviceStats = brailleTraining.letterTraining.deviceUsageStats || {};
    const wordDeviceStats = brailleTraining.wordTraining.deviceUsageStats || {};

    // Calculate totals for letters
    let letterStandardTotal = 0;
    let letterOrbitTotal = 0;
    Object.values(letterDeviceStats).forEach(stats => {
      letterStandardTotal += stats.standardKeyboard || 0;
      letterOrbitTotal += stats.orbitReader || 0;
    });

    // Calculate totals for words
    let wordStandardTotal = 0;
    let wordOrbitTotal = 0;
    Object.values(wordDeviceStats).forEach(stats => {
      wordStandardTotal += stats.standardKeyboard || 0;
      wordOrbitTotal += stats.orbitReader || 0;
    });

    const newChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Standard Keyboard', 'Orbit Reader'],
        datasets: [
          {
            label: 'Letters',
            data: [letterStandardTotal, letterOrbitTotal],
            backgroundColor: ['#3B82F6', '#10B981'],
            borderColor: ['#1E40AF', '#059669'],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Device Usage Distribution'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    setDeviceComparisonChart(newChart);
  };

  const createLetterDeviceUsageChart = () => {
    const ctx = document.getElementById('letterDeviceChart');
    if (!ctx) return;

    if (letterDeviceChart) letterDeviceChart.destroy();

    const deviceStats = brailleTraining.letterTraining.deviceUsageStats || {};
    const letters = Object.keys(deviceStats).sort();
    
    const standardData = letters.map(letter => deviceStats[letter]?.standardKeyboard || 0);
    const orbitData = letters.map(letter => deviceStats[letter]?.orbitReader || 0);

    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: letters.map(l => l.toUpperCase()),
        datasets: [
          {
            label: 'Standard Keyboard',
            data: standardData,
            backgroundColor: '#3B82F6',
            borderColor: '#1E40AF',
            borderWidth: 1
          },
          {
            label: 'Orbit Reader',
            data: orbitData,
            backgroundColor: '#10B981',
            borderColor: '#059669',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Device Usage by Letter'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Successful Attempts'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Letters'
            }
          }
        }
      }
    });

    setLetterDeviceChart(newChart);
  };

  const getDeviceUsageStats = () => {
    const letterDeviceStats = brailleTraining.letterTraining.deviceUsageStats || {};
    const wordDeviceStats = brailleTraining.wordTraining.deviceUsageStats || {};

    // Calculate letter totals
    let letterStandardTotal = 0;
    let letterOrbitTotal = 0;
    Object.values(letterDeviceStats).forEach(stats => {
      letterStandardTotal += stats.standardKeyboard || 0;
      letterOrbitTotal += stats.orbitReader || 0;
    });

    // Calculate word totals
    let wordStandardTotal = 0;
    let wordOrbitTotal = 0;
    Object.values(wordDeviceStats).forEach(stats => {
      wordStandardTotal += stats.standardKeyboard || 0;
      wordOrbitTotal += stats.orbitReader || 0;
    });

    const totalStandard = letterStandardTotal + wordStandardTotal;
    const totalOrbit = letterOrbitTotal + wordOrbitTotal;
    const grandTotal = totalStandard + totalOrbit;

    return {
      letterStandard: letterStandardTotal,
      letterOrbit: letterOrbitTotal,
      wordStandard: wordStandardTotal,
      wordOrbit: wordOrbitTotal,
      totalStandard,
      totalOrbit,
      standardPercentage: grandTotal > 0 ? ((totalStandard / grandTotal) * 100).toFixed(1) : 0,
      orbitPercentage: grandTotal > 0 ? ((totalOrbit / grandTotal) * 100).toFixed(1) : 0
    };
  };

  const createWordPerformanceChartAdmin = (wordTraining) => {
    const ctx = document.getElementById('wordPerformanceChart');
    if (!ctx) return;

    if (wordChart) wordChart.destroy();

    const wordStats = wordTraining.wordStats;
    const words = Object.keys(wordStats);
    const times = words.map(word => ((wordStats[word].timeSpent || 0) / 1000).toFixed(1));
    const errors = words.map(word => wordStats[word].errors?.length || 0);

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: words.map(w => w.toUpperCase()),
        datasets: [
          {
            label: 'Time (seconds)',
            data: times,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            yAxisID: 'y'
          },
          {
            label: 'Errors',
            data: errors,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Word Training Performance'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Time (seconds)'
            }
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

    setWordChart(newChart);
  };

  const handleSaveResults = async () => {
    setLoading(true);
    try {
      // Save main Braille results
      const mainResultsResponse = await fetch('http://localhost:5000/api/addBrailleResults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: studentInfo.name,
          letterTraining: brailleTraining.letterTraining,
          wordTraining: brailleTraining.wordTraining,
          sessionData: brailleTraining.sessionData
        }),
      });

      if (!mainResultsResponse.ok) {
        throw new Error('Failed to save main results');
      }

      // Save detailed letter stats
      if (brailleTraining.letterTraining.letterStats) {
        const letterStatsResponse = await fetch('http://localhost:5000/api/addBrailleLetterStats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentName: studentInfo.name,
            letterStats: brailleTraining.letterTraining.letterStats
          }),
        });

        if (!letterStatsResponse.ok) {
          throw new Error('Failed to save letter stats');
        }
      }

      // Save detailed word stats
      if (brailleTraining.wordTraining.wordStats) {
        const wordStatsResponse = await fetch('http://localhost:5000/api/addBrailleWordStats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentName: studentInfo.name,
            wordStats: brailleTraining.wordTraining.wordStats
          }),
        });

        if (!wordStatsResponse.ok) {
          throw new Error('Failed to save word stats');
        }
      }

      toast.success("Braille training results saved successfully!");
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error("Failed to save results. Please try again.");
    }
    setLoading(false);
  };

  // Handle downloading results as JSON file
  const handleDownloadResults = () => {
    // Create a complete data object with all Braille training results
    const resultsData = {
      studentInfo: {
        name: studentInfo?.name || "Unknown Student",
        timestamp: new Date().toISOString()
      },
      brailleTraining: {
        letterTraining: {
          completed: brailleTraining.letterTraining?.completed || false,
          letterStats: brailleTraining.letterTraining?.letterStats || {},
          overallStats: brailleTraining.letterTraining?.overallStats || {}
        },
        wordTraining: {
          completed: brailleTraining.wordTraining?.completed || false,
          wordStats: brailleTraining.wordTraining?.wordStats || {},
          overallStats: brailleTraining.wordTraining?.overallStats || {}
        },
        sessionData: brailleTraining.sessionData || {}
      },
      analytics: {
        letterDifficulty: getLetterDifficulty(),
        wordDifficulty: getMostDifficultWords(),
        overallAccuracy: brailleTraining.sessionData?.overallAccuracy || 0,
        totalErrors: brailleTraining.sessionData?.totalErrors || 0,
        totalTime: brailleTraining.sessionData?.totalTime || 0
      }
    };

    // Convert to JSON string and create a Blob
    const jsonData = JSON.stringify(resultsData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    
    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `braille_results_${studentInfo?.name || "student"}_${new Date().toISOString().split("T")[0]}.json`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Braille training results downloaded successfully!");
  };

  const getLetterDifficulty = () => {
    const letterStats = isAdminView ? realLetterStats : 
      (brailleTraining.letterTraining.letterStats || brailleTraining.letterTraining.overallStats?.letterStats);
    if (!letterStats) return [];
    
    return Object.keys(letterStats)
      .map(letter => {
        const stats = letterStats[letter];
        // Handle different data structures
        const accuracy = stats.correct && stats.attempts 
          ? (stats.correct / stats.attempts) * 100
          : stats.correctAttempts && stats.attempts
          ? (stats.correctAttempts / stats.attempts) * 100
          : 0;
        
        return {
          letter: letter.toUpperCase(),
          accuracy,
          avgTime: stats.averageTime || stats.avgTime || 0,
          attempts: stats.attempts || 0
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy); // Sort by accuracy (lowest first = most difficult)
  };

  const getMostDifficultWords = () => {
    const wordStats = isAdminView ? realWordStats : brailleTraining.wordTraining.wordStats;
    if (!wordStats) return [];
    
    return Object.keys(wordStats)
      .map(word => ({
        word: word.toUpperCase(),
        accuracy: isAdminView ? 
          (100 - ((wordStats[word].errors?.length || 0) * 10)) : // For admin view
          (100 - ((wordStats[word].errors?.length || 0) * 10)), // For regular view
        errors: wordStats[word].errors?.length || 0,
        time: (wordStats[word].timeSpent || 0) / 1000
      }))
      .sort((a, b) => a.accuracy - b.accuracy || b.errors - a.errors); // Sort by accuracy then errors
  };

  const letterDifficulty = getLetterDifficulty();
  const wordDifficulty = getMostDifficultWords();

  const navigateHome = () => {
    if (isAdminView) {
      navigate('/braille-analytics');
    } else {
      navigate("/");
    }
  };

  // Use appropriate data source based on view type
  const currentStudentName = isAdminView ? selectedStudent : studentInfo.name;
  const currentTrainingData = isAdminView ? 
    (studentData ? {
      letterTraining: {
        completed: true,
        letterStats: realLetterStats || {},
        overallStats: {
          accuracy: parseFloat(studentData.letterAccuracy) || 0,
          totalErrors: parseInt(studentData.letterErrors) || 0,
          avgTimePerLetter: calculateAvgLetterTime(realLetterStatsArray || []),
          totalTime: parseFloat(studentData.letterTime) * 60000 || 0
        }
      },
      wordTraining: {
        completed: true,
        wordStats: realWordStats || {},
        overallStats: {
          accuracy: parseFloat(studentData.wordAccuracy) || 0,
          totalErrors: parseInt(studentData.wordErrors) || 0,
          avgTimePerWord: calculateAvgWordTime(realWordStatsArray || []),
          completedWords: realWordStatsArray ? realWordStatsArray.filter(w => w.completed).length : 0,
          totalWords: realWordStatsArray ? realWordStatsArray.length : 0
        }
      },
      sessionData: {
        overallAccuracy: parseFloat(studentData.overallAccuracy) || 0,
        totalErrors: parseInt(studentData.totalErrors) || 0,
        totalTime: parseFloat(studentData.totalTime) * 60000 || 0
      }
    } : null) : brailleTraining;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Braille Training Results
          </h1>
          <p className="text-xl text-gray-600">
            Performance Analysis for {currentStudentName}
          </p>
          {isAdminView && (
            <div className="mt-2">
              <button
                onClick={() => navigate('/braille-analytics')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Analytics Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Overall Statistics */}
        {(currentTrainingData || loading) && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <BeatLoader color="#3B82F6" size={15} />
                <p className="mt-4 text-gray-600">Loading student results...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Accuracy</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {currentTrainingData.sessionData?.overallAccuracy ? 
                        `${currentTrainingData.sessionData.overallAccuracy.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Errors</h3>
                    <p className="text-3xl font-bold text-red-600">
                      {currentTrainingData.sessionData?.totalErrors || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Training Time</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {currentTrainingData.sessionData?.totalTime ? 
                        `${Math.round(currentTrainingData.sessionData.totalTime / 60000)} min` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Phase Results */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Letter Training Results */}
                  {currentTrainingData.letterTraining.completed && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Letter Training</h2>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accuracy:</span>
                          <span className="font-semibold text-blue-600">
                            {currentTrainingData.letterTraining.overallStats?.accuracy?.toFixed(1) || 'N/A'}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Errors:</span>
                          <span className="font-semibold text-red-600">
                            {currentTrainingData.letterTraining.overallStats?.totalErrors || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Time per Letter:</span>
                          <span className="font-semibold text-green-600">
                            {currentTrainingData.letterTraining.overallStats?.avgTimePerLetter?.toFixed(1) || 'N/A'}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Letters Practiced:</span>
                          <span className="font-semibold">
                            {isAdminView ? '10' : Object.keys(brailleTraining.letterTraining.letterStats || {}).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Word Training Results */}
                  {currentTrainingData.wordTraining.completed && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Word Training</h2>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accuracy:</span>
                          <span className="font-semibold text-blue-600">
                            {currentTrainingData.wordTraining.overallStats?.accuracy?.toFixed(1) || 'N/A'}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Words Completed:</span>
                          <span className="font-semibold text-green-600">
                            {currentTrainingData.wordTraining.overallStats?.completedWords || 0} / {currentTrainingData.wordTraining.overallStats?.totalWords || 10}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Time per Word:</span>
                          <span className="font-semibold text-purple-600">
                            {((currentTrainingData.wordTraining.overallStats?.avgTimePerWord || 0) / 1000).toFixed(1)}s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Errors:</span>
                          <span className="font-semibold text-red-600">
                            {currentTrainingData.wordTraining.overallStats?.totalErrors || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {currentTrainingData.letterTraining.completed && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <canvas id="letterAccuracyChart" width="400" height="300"></canvas>
                    </div>
                  )}
                  
                  {currentTrainingData.wordTraining.completed && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <canvas id="wordPerformanceChart" width="400" height="300"></canvas>
                    </div>
                  )}
                </div>

                {/* Device Usage Comparison Charts */}
                {!isAdminView && currentTrainingData.letterTraining.deviceUsageStats && 
                 Object.keys(currentTrainingData.letterTraining.deviceUsageStats).length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Device Usage Analysis</h2>
                    
                    {(() => {
                      const deviceStats = getDeviceUsageStats();
                      return (
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                          <h3 className="text-xl font-semibold text-gray-700 mb-4">Device Usage Summary</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <p className="text-sm text-gray-600">Standard Keyboard</p>
                              <p className="text-2xl font-bold text-blue-600">{deviceStats.totalStandard}</p>
                              <p className="text-sm text-blue-500">{deviceStats.standardPercentage}% of total</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <p className="text-sm text-gray-600">Orbit Reader</p>
                              <p className="text-2xl font-bold text-green-600">{deviceStats.totalOrbit}</p>
                              <p className="text-sm text-green-500">{deviceStats.orbitPercentage}% of total</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">Letters (Std/Orbit)</p>
                              <p className="text-2xl font-bold text-gray-700">{deviceStats.letterStandard}/{deviceStats.letterOrbit}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">Words (Std/Orbit)</p>
                              <p className="text-2xl font-bold text-gray-700">{deviceStats.wordStandard}/{deviceStats.wordOrbit}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <canvas id="deviceComparisonChart" width="400" height="300"></canvas>
                      </div>
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <canvas id="letterDeviceChart" width="400" height="300"></canvas>
                      </div>
                    </div>
                  </div>
                )}

                {/* Difficulty Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {letterDifficulty.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Most Difficult Letters</h3>
                      <div className="space-y-3">
                        {letterDifficulty.slice(0, 5).map((letter, index) => (
                          <div key={letter.letter} className="flex justify-between items-center">
                            <span className="font-semibold text-lg">{letter.letter}</span>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {letter.accuracy.toFixed(1)}% accuracy
                              </div>
                              <div className="text-xs text-gray-500">
                                {letter.avgTime.toFixed(0)}ms avg
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {wordDifficulty.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Most Difficult Words</h3>
                      <div className="space-y-3">
                        {wordDifficulty.slice(0, 5).map((word, index) => (
                          <div key={word.word} className="flex justify-between items-center">
                            <span className="font-semibold text-lg">{word.word}</span>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {word.accuracy.toFixed(1)}% accuracy
                              </div>
                              <div className="text-xs text-gray-500">
                                {word.errors} errors
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="text-center space-x-4">
                  {!isAdminView && (
                    <>
                      <button
                        onClick={handleSaveResults}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 disabled:opacity-50"
                      >
                        {loading ? <BeatLoader color="#ffffff" size={8} /> : "Save Results"}
                      </button>
                      <button
                        onClick={handleDownloadResults}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                      >
                        Download Results
                      </button>
                    </>
                  )}
                  <button
                    onClick={navigateHome}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                  >
                    {isAdminView ? 'Back to Analytics' : 'Return Home'}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {!currentTrainingData && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No training data available.</p>
            <p className="text-gray-500 mt-2">Complete some Braille training first to see results.</p>
          </div>
        )}

        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
}
