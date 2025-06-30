import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import Navbar from "../Navbar/Navbar";
import BeatLoader from "react-spinners/BeatLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BrailleResults() {
  const navigate = useNavigate();
  const studentInfo = useSelector((state) => state.studentInfo);
  const brailleTraining = useSelector((state) => state.brailleTraining);
  const [loading, setLoading] = useState(false);
  const [letterChart, setLetterChart] = useState(null);
  const [wordChart, setWordChart] = useState(null);
  useEffect(() => {
    console.log('Braille Training State:', brailleTraining);
    console.log('Letter Training:', brailleTraining.letterTraining);
    console.log('Word Training:', brailleTraining.wordTraining);
    
    if (brailleTraining.letterTraining.completed && brailleTraining.letterTraining.letterStats) {
      createLetterAccuracyChart();
    }
    if (brailleTraining.wordTraining.completed && brailleTraining.wordTraining.wordStats) {
      createWordPerformanceChart();
    }

    return () => {
      if (letterChart) letterChart.destroy();
      if (wordChart) wordChart.destroy();
    };
  }, [brailleTraining]);
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
    const letterStats = brailleTraining.letterTraining.letterStats || brailleTraining.letterTraining.overallStats?.letterStats;
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
    if (!brailleTraining.wordTraining.wordStats) return [];
    
    const wordStats = brailleTraining.wordTraining.wordStats;
    return Object.keys(wordStats)
      .map(word => ({
        word: word.toUpperCase(),
        accuracy: 100 - ((wordStats[word].errors?.length || 0) * 10), // Approximate accuracy
        errors: wordStats[word].errors?.length || 0,
        time: (wordStats[word].timeSpent || 0) / 1000
      }))
      .sort((a, b) => a.accuracy - b.accuracy || b.errors - a.errors); // Sort by accuracy then errors
  };

  const letterDifficulty = getLetterDifficulty();
  const wordDifficulty = getMostDifficultWords();

  const navigateHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Braille Training Results
          </h1>
          <p className="text-xl text-gray-600">
            Performance Analysis for {studentInfo.name}
          </p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Accuracy</h3>            <p className="text-3xl font-bold text-blue-600">
              {brailleTraining.sessionData?.overallAccuracy ? 
                `${brailleTraining.sessionData.overallAccuracy.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Errors</h3>            <p className="text-3xl font-bold text-red-600">
              {brailleTraining.sessionData?.totalErrors || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Training Time</h3>            <p className="text-3xl font-bold text-green-600">
              {brailleTraining.sessionData?.totalTime ? 
                `${Math.round(brailleTraining.sessionData.totalTime / 60000)} min` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Phase Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Letter Training Results */}
          {brailleTraining.letterTraining.completed && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Letter Training</h2>
              <div className="space-y-3">                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-semibold text-blue-600">
                    {brailleTraining.letterTraining.overallStats?.accuracy?.toFixed(1) || 'N/A'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Errors:</span>
                  <span className="font-semibold text-red-600">
                    {brailleTraining.letterTraining.overallStats?.totalErrors || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Time per Letter:</span>
                  <span className="font-semibold text-green-600">
                    {brailleTraining.letterTraining.overallStats?.avgTimePerLetter?.toFixed(1) || 'N/A'}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Letters Practiced:</span>
                  <span className="font-semibold">
                    {Object.keys(brailleTraining.letterTraining.letterStats || {}).length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Word Training Results */}
          {brailleTraining.wordTraining.completed && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Word Training</h2>
              <div className="space-y-3">                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-semibold text-blue-600">
                    {brailleTraining.wordTraining.overallStats?.accuracy?.toFixed(1) || 'N/A'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Words Completed:</span>
                  <span className="font-semibold text-green-600">
                    {brailleTraining.wordTraining.overallStats?.completedWords || 0} / {brailleTraining.wordTraining.overallStats?.totalWords || 10}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Time per Word:</span>
                  <span className="font-semibold text-purple-600">
                    {((brailleTraining.wordTraining.overallStats?.avgTimePerWord || 0) / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Errors:</span>
                  <span className="font-semibold text-red-600">
                    {brailleTraining.wordTraining.overallStats?.totalErrors || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {brailleTraining.letterTraining.completed && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <canvas id="letterAccuracyChart" width="400" height="300"></canvas>
            </div>
          )}
          
          {brailleTraining.wordTraining.completed && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <canvas id="wordPerformanceChart" width="400" height="300"></canvas>
            </div>
          )}
        </div>

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
        </div>        {/* Action Buttons */}
        <div className="text-center space-x-4">
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
          <button
            onClick={navigateHome}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            Return Home
          </button>
        </div>

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
