import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../Navbar/Navbar";

export default function TestSelection() {
    const navigate = useNavigate();

    const handleBrailleTraining = () => {
        navigate('/test');
    };

    const handleOriginalTest = () => {
        navigate('/test-original');
    };

    const openLink = () => {
        window.open('https://forms.gle/9mrnrRrHBxqs7tzL9', '_blank');
    };

    return (
        <div className="mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navbar/>
            <div className="flex flex-col items-center justify-center py-20 px-5">
                <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl p-8">
                    <h1 className='text-4xl font-bold text-center text-gray-800 mb-8'>
                        Choose Your Learning Experience
                    </h1>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Braille Training Option */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-6 border-2 border-green-200 hover:border-green-400 transition duration-300">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">🤚</div>
                                <h2 className="text-2xl font-bold text-green-800 mb-4">Braille Keyboard Training</h2>
                                <p className="text-gray-700 mb-4">
                                    Learn to type using the 8-key Braille keyboard system with interactive voice guidance.
                                </p>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <p>✓ Interactive letter-by-letter training</p>
                                <p>✓ Voice instructions and feedback</p>
                                <p>✓ Word formation practice</p>
                                <p>✓ Performance analytics</p>
                                <p>✓ Progress tracking</p>
                            </div>
                            
                            <button
                                onClick={handleBrailleTraining}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 transform hover:scale-105"
                            >
                                Start Braille Training
                            </button>
                        </div>

                        {/* Original Test Option */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition duration-300">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">📚</div>
                                <h2 className="text-2xl font-bold text-blue-800 mb-4">Traditional Learning Test</h2>
                                <p className="text-gray-700 mb-4">
                                    Complete the original pre-test, lecture, and post-test sequence with video recording.
                                </p>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <p>✓ Pre-test assessment (10 questions)</p>
                                <p>✓ Interactive lecture modules</p>
                                <p>✓ Post-test evaluation</p>
                                <p>✓ Video recording capability</p>
                                <p>✓ Comprehensive results analysis</p>
                            </div>
                            
                            <button
                                onClick={handleOriginalTest}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 transform hover:scale-105"
                            >
                                Start Traditional Test
                            </button>
                        </div>
                    </div>

                    {/* Common Instructions */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Before You Begin:</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <p>• Ensure your webcam and microphone are working</p>
                                <p>• Choose a quiet environment for testing</p>
                                <p>• Complete the user details form first</p>
                            </div>
                            <div>
                                <p>• Have a stable internet connection</p>
                                <p>• Allow browser permissions for media access</p>
                                <p>• Set aside adequate time for completion</p>
                            </div>
                        </div>
                    </div>

                    {/* User Details Button */}
                    <div className="text-center">
                        <button
                            onClick={openLink}
                            className="border-2 border-gray-600 bg-white text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-100 hover:border-gray-800 transition duration-300 font-semibold"
                        >
                            📝 Fill User Details Form
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
