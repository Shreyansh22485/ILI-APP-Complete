import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updatePreTestInfo } from '../../redux/actions';
import { BRAILLE_ALPHABET, getBraillePattern, isCorrectPattern, BRAILLE_KEYS, BRAILLE_KEY_MAPPING, dotsToKeys } from '../../utils/brailleMapping';
import { VoiceInstructor } from '../../utils/voiceInstructor';
import BeatLoader from "react-spinners/BeatLoader";

const BrailleLetterTraining = ({ onComplete, title }) => {
  // Orbit Reader 40 specific key mapping (based on observed behavior)
  // The Orbit Reader sends the actual Braille character when keys are pressed together
  const ORBIT_READER_LETTER_MAPPING = {
    'a': 'a', // Letter A (dot 1) → sends 'a'
    'b': 'b', // Letter B (dots 1,2) → sends 'b'
    'c': 'c', // Letter C (dots 1,4) → sends 'c'
    'd': 'd', // Letter D (dots 1,4,5) → sends 'd'
    'e': 'e', // Letter E (dots 1,5) → sends 'e'
    'f': 'f', // Letter F (dots 1,2,4) → sends 'f'
    // Add more as we discover the pattern
  };

  // Training phases
  const [currentPhase, setCurrentPhase] = useState('instruction'); // instruction, training, completed
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [keydownEvents, setKeydownEvents] = useState(new Set()); // Track actual keydown events
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  
  // Training data
  const letters = Object.keys(BRAILLE_ALPHABET).slice(0, 3); // Start with first 3 letters
  const [letterStats, setLetterStats] = useState({});
  const [deviceUsageStats, setDeviceUsageStats] = useState({}); // Track which device was used for each letter
  const [startTime, setStartTime] = useState(null);
  const [sessionStartTime] = useState(Date.now());
  
  // Voice instructor
  const voiceInstructor = useRef(new VoiceInstructor());
  const dispatch = useDispatch();
  
  // Ref for the input element to ensure it stays focused
  const brailleInputRef = useRef(null);

  useEffect(() => {
    // Initialize letter stats
    const stats = {};
    const deviceStats = {};
    letters.forEach(letter => {
      stats[letter] = {
        attempts: 0,
        correctAttempts: 0,
        timeSpent: 0,
        errorPatterns: []
      };
      deviceStats[letter] = {
        standardKeyboard: 0,
        orbitReader: 0,
        attempts: []
      };
    });
    setLetterStats(stats);
    setDeviceUsageStats(deviceStats);
    
    // Start the training
    startTraining();
    
    return () => {
      voiceInstructor.current.stop();
    };
  }, []);

  useEffect(() => {
    // Add keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Ensure the input element is focused when training starts
    if (currentPhase === 'training' && brailleInputRef.current) {
      brailleInputRef.current.focus();
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentPhase, currentLetterIndex, isWaitingForInput]);

  const startTraining = async () => {
    setLoadingState(true);
    await voiceInstructor.current.speak("Welcome to Braille keyboard training. We will start by learning individual letters.");
    setCurrentPhase('training');
    setLoadingState(false);
    await presentCurrentLetter();
  };
  const presentCurrentLetter = async () => {
    if (currentLetterIndex >= letters.length) {
      await completeTraining();
      return;
    }

    const letter = letters[currentLetterIndex];
    const pattern = getBraillePattern(letter);
    
    console.log('=== PRESENTING LETTER ===');
    console.log('Current letter index:', currentLetterIndex);
    console.log('Letter:', letter);
    console.log('Pattern:', pattern);
    console.log('========================');
    
    setIsWaitingForInput(false);
    setPressedKeys(new Set());
    setKeydownEvents(new Set()); // Reset keydown events
    
    // Give voice instruction
    const instruction = `Letter ${letter.toUpperCase()}: Press keys ${pattern.join(', ')}`;
    console.log('Voice instruction:', instruction);
    await voiceInstructor.current.speak(instruction);
    
    setIsWaitingForInput(true);
    setStartTime(Date.now());
  };  const handleKeyDown = (event) => {
    if (currentPhase !== 'training' || !isWaitingForInput) return;
    
    const key = event.key;
    console.log('Key down:', key, 'Standard valid key:', BRAILLE_KEYS.includes(key), 'Orbit Reader letter:', ORBIT_READER_LETTER_MAPPING[key] !== undefined);
    
    // Check if it's a standard Braille key OR an Orbit Reader letter
    if (BRAILLE_KEYS.includes(key) || ORBIT_READER_LETTER_MAPPING[key] !== undefined) {
      event.preventDefault();
      
      // Track both pressed keys and keydown events
      setPressedKeys(prev => {
        const newSet = new Set([...prev, key]);
        console.log('Updated pressed keys (keydown):', Array.from(newSet));
        return newSet;
      });
      
      setKeydownEvents(prev => {
        const newSet = new Set([...prev, key]);
        console.log('Updated keydown events:', Array.from(newSet));
        return newSet;
      });
    }
  };

  const handleKeyUp = async (event) => {
    if (currentPhase !== 'training' || !isWaitingForInput) return;
    
    const key = event.key;
    console.log('Key up:', key, 'Standard valid key:', BRAILLE_KEYS.includes(key), 'Orbit Reader letter:', ORBIT_READER_LETTER_MAPPING[key] !== undefined);
    
    // Check if it's a standard Braille key OR Orbit Reader letter OR "Unidentified" (common with screen readers)
    if (BRAILLE_KEYS.includes(key) || ORBIT_READER_LETTER_MAPPING[key] !== undefined || key === "Unidentified") {
      event.preventDefault();
      
      // Use current keydown events for validation
      setTimeout(() => {
        setKeydownEvents(currentEvents => {
          console.log('Current keydown events for validation:', Array.from(currentEvents));
          if (currentEvents.size > 0) {
            validateWithKeydownEvents(currentEvents);
          }
          return currentEvents;
        });
      }, 100);
    }
  };

  const validateWithKeydownEvents = async (keydownEventsToValidate) => {
    const letter = letters[currentLetterIndex];
    const timeTaken = Date.now() - startTime;
    
    // Determine which device was used and validate accordingly
    const actualKeys = Array.from(keydownEventsToValidate);
    let isCorrect = false;
    let deviceUsed = '';
    
    // Check if it's Orbit Reader input (single letter key)
    const expectedOrbitKey = ORBIT_READER_LETTER_MAPPING[letter];
    const isOrbitReaderInput = actualKeys.length === 1 && actualKeys[0] === expectedOrbitKey;
    
    // Check if it's standard Braille keyboard input (multiple dot keys)
    const isStandardInput = actualKeys.every(key => BRAILLE_KEYS.includes(key));
    const expectedPattern = getBraillePattern(letter);
    const isCorrectStandardPattern = isStandardInput && isCorrectPattern(actualKeys, letter);
    
    if (isOrbitReaderInput) {
      isCorrect = true;
      deviceUsed = 'orbitReader';
    } else if (isCorrectStandardPattern) {
      isCorrect = true;
      deviceUsed = 'standardKeyboard';
    } else {
      isCorrect = false;
      // Try to determine which device was intended
      if (actualKeys.length === 1 && ORBIT_READER_LETTER_MAPPING[actualKeys[0]]) {
        deviceUsed = 'orbitReader';
      } else if (isStandardInput) {
        deviceUsed = 'standardKeyboard';
      } else {
        deviceUsed = 'unknown';
      }
    }
    
    // Debug logging
    console.log('=== DEBUGGING DUAL DEVICE VALIDATION ===');
    console.log('Current letter:', letter);
    console.log('Keydown events:', actualKeys);
    console.log('Expected Orbit key:', expectedOrbitKey);
    console.log('Expected standard pattern:', expectedPattern);
    console.log('Is Orbit Reader input:', isOrbitReaderInput);
    console.log('Is standard input:', isStandardInput);
    console.log('Is correct standard pattern:', isCorrectStandardPattern);
    console.log('Device used:', deviceUsed);
    console.log('Validation result:', isCorrect);
    console.log('========================================');
    
    // Update stats
    setLetterStats(prev => {
      const updated = { ...prev };
      updated[letter].attempts += 1;
      updated[letter].timeSpent += timeTaken;
      
      if (isCorrect) {
        updated[letter].correctAttempts += 1;
      } else {
        updated[letter].errorPatterns.push([...keydownEventsToValidate]);
      }
      
      return updated;
    });

    // Update device usage stats
    setDeviceUsageStats(prev => {
      const updated = { ...prev };
      updated[letter].attempts.push({
        device: deviceUsed,
        correct: isCorrect,
        keys: actualKeys,
        timestamp: Date.now()
      });
      
      if (isCorrect) {
        if (deviceUsed === 'standardKeyboard') {
          updated[letter].standardKeyboard += 1;
        } else if (deviceUsed === 'orbitReader') {
          updated[letter].orbitReader += 1;
        }
      }
      
      return updated;
    });

    if (isCorrect) {
      // Correct input
      await voiceInstructor.current.speakSuccess(letter);
      
      // Move to next letter immediately
      const nextIndex = currentLetterIndex + 1;
      setCurrentLetterIndex(nextIndex);
      
      // Wait a moment then present the next letter
      setTimeout(async () => {
        if (nextIndex >= letters.length) {
          await completeTraining();
        } else {
          const nextLetter = letters[nextIndex];
          const nextPattern = getBraillePattern(nextLetter);
          
          console.log('=== MOVING TO NEXT LETTER ===');
          console.log('Next index:', nextIndex);
          console.log('Next letter:', nextLetter);
          console.log('Next pattern:', nextPattern);
          console.log('=============================');
          
          setIsWaitingForInput(false);
          setPressedKeys(new Set());
          setKeydownEvents(new Set()); // Reset keydown events
          
          // Give voice instruction for next letter
          const instruction = `Letter ${nextLetter.toUpperCase()}: Press keys ${nextPattern.join(', ')}`;
          console.log('Next voice instruction:', instruction);
          await voiceInstructor.current.speak(instruction);
          
          setIsWaitingForInput(true);
          setStartTime(Date.now());
        }
      }, 1000);
    } else {
      // Incorrect input
      const correctPattern = getBraillePattern(letter);
      let errorMessage = '';
      
      if (deviceUsed === 'orbitReader') {
        errorMessage = `Incorrect. For letter ${letter.toUpperCase()}, press the key combination for dots ${correctPattern.join(', ')} on your Orbit Reader.`;
      } else if (deviceUsed === 'standardKeyboard') {
        const expectedKeys = dotsToKeys(correctPattern);
        errorMessage = `Incorrect. For letter ${letter.toUpperCase()}, press keys ${expectedKeys.join(', ')} on the standard Braille keyboard.`;
      } else {
        errorMessage = `Incorrect. For letter ${letter.toUpperCase()}, use either Orbit Reader or standard Braille keyboard with pattern ${correctPattern.join(', ')}.`;
      }
      
      await voiceInstructor.current.speak(errorMessage);
      
      // Reset for retry
      setTimeout(() => {
        setPressedKeys(new Set());
        setKeydownEvents(new Set()); // Reset keydown events
        setIsWaitingForInput(true);
        setStartTime(Date.now());
      }, 2000);
    }
  };

  // Helper function to get expected key for a letter based on Orbit Reader mapping
  const getExpectedKeyForLetter = (letter) => {
    return ORBIT_READER_LETTER_MAPPING[letter] || letter;
  };
  const completeTraining = async () => {
    setCurrentPhase('completed');
    setIsWaitingForInput(false);
    
    const totalTime = Math.round((Date.now() - sessionStartTime) / 1000);
    
    // Calculate completion stats
    const totalAttempts = Object.values(letterStats).reduce((sum, stat) => sum + stat.attempts, 0);
    const totalCorrect = Object.values(letterStats).reduce((sum, stat) => sum + stat.correctAttempts, 0);
    const accuracy = Math.round((totalCorrect / totalAttempts) * 100);
    const totalErrors = totalAttempts - totalCorrect;
    const avgTimePerLetter = Object.values(letterStats).reduce((sum, stat) => sum + stat.averageTime, 0) / Object.keys(letterStats).length;
    
    await voiceInstructor.current.speak(`Training completed! You achieved ${accuracy}% accuracy in ${totalTime} seconds.`);
    
    // Create the training data for Braille results
    const trainingData = {
      type: 'letter',
      completed: true,
      totalTime: totalTime * 1000, // Convert to milliseconds
      totalErrors,
      accuracy,
      avgTimePerLetter,
      letterStats,
      deviceUsageStats, // Include device usage statistics
      studentId: 'current_student', // You might want to get this from props
      timestamp: new Date().toISOString()
    };
    
    // Dispatch to Braille training reducer
    dispatch({
      type: 'UPDATE_BRAILLE_TRAINING',
      payload: {
        letterTraining: trainingData,
        currentPhase: 'word'
      }
    });
    
    // Complete the phase
    if (onComplete) {
      onComplete({ totalTime, accuracy, detailedStats: generateDetailedStats() });
    }
  };

  const generateDetailedStats = () => {
    return Object.entries(letterStats).map(([letter, stats]) => {
      const avgTime = stats.timeSpent / Math.max(stats.attempts, 1);
      const accuracy = (stats.correctAttempts / Math.max(stats.attempts, 1)) * 100;
      return `${letter.toUpperCase()}: ${stats.attempts} attempts, ${accuracy.toFixed(1)}% accuracy, ${avgTime.toFixed(0)}ms avg time`;
    }).join(' | ');
  };

  const getCurrentLetterPattern = () => {
    if (currentLetterIndex >= letters.length) return [];
    return getBraillePattern(letters[currentLetterIndex]);
  };

  if (loadingState) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color={"#123abc"} loading={loadingState} size={15} />
      </div>
    );
  }

  if (currentPhase === 'completed') {
    return (
      <div className="mx-auto py-4 px-8 text-center">
        <h2 className="text-2xl font-semibold my-6">Letter Training Completed!</h2>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-lg mb-2">Great job! You've completed the letter training phase.</p>
          <p className="text-sm text-gray-600">Results have been saved. You can now proceed to the next phase.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 px-8">
      {/* Input field for Braille keyboard focus - helps switch from browse to focus mode */}
      <input
        ref={brailleInputRef}
        type="text"
        placeholder="Braille input active - press Braille keys here"
        className="w-full p-3 mb-4 border-2 border-blue-500 rounded-lg text-center font-bold bg-blue-50"
        autoFocus
        tabIndex={0}
        onFocus={() => console.log('Braille input focused')}
        onChange={() => {}} // Prevent text input
        value=""
      />
      
      <h2 className="text-2xl font-semibold my-6">{title || 'Braille Letter Training'}</h2>
      
      {currentPhase === 'training' && (
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{currentLetterIndex + 1} of {letters.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentLetterIndex) / letters.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current letter display */}          {currentLetterIndex < letters.length && (
            <div className="text-center bg-blue-50 p-6 rounded-lg">
              <h3 className="text-4xl font-bold mb-4 text-blue-800">
                {letters[currentLetterIndex].toUpperCase()}
              </h3>
              <p className="text-lg mb-4">
                Press keys: <strong>{getCurrentLetterPattern().join(', ')}</strong>
              </p>
              
              {/* Debug panel */}
              <div className="bg-yellow-100 p-3 rounded-lg mb-4 text-sm text-left max-w-md mx-auto">
                <div className="font-semibold mb-1">Debug Info:</div>
                <div>Current letter: <strong>{letters[currentLetterIndex]}</strong></div>
                <div>Expected dots: <strong>[{getCurrentLetterPattern().join(', ')}]</strong></div>
                <div>Expected key: <strong>{getExpectedKeyForLetter(letters[currentLetterIndex])}</strong></div>
                <div>Pressed keys: <strong>[{Array.from(pressedKeys).join(', ')}]</strong></div>
                <div>Keydown events: <strong>[{Array.from(keydownEvents).join(', ')}]</strong></div>
                <div>Waiting for input: <strong>{isWaitingForInput ? 'Yes' : 'No'}</strong></div>
              </div>
              
              {/* Visual representation of pressed keys */}
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(keyNum => (
                  <div
                    key={keyNum}
                    className={`
                      w-12 h-12 rounded border-2 flex items-center justify-center font-bold
                      ${pressedKeys.has(keyNum.toString()) 
                        ? 'bg-green-500 text-white border-green-600' 
                        : getCurrentLetterPattern().includes(keyNum)
                          ? 'bg-blue-200 border-blue-400 text-blue-800'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    {keyNum}
                  </div>
                ))}
              </div>
              
              {isWaitingForInput && (
                <p className="text-sm text-gray-600 animate-pulse">
                  Listening for your input...
                </p>
              )}
            </div>
          )}

          {/* Letter statistics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Letter Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              {letters.slice(0, currentLetterIndex + 1).map(letter => {
                const stats = letterStats[letter];
                const deviceStats = deviceUsageStats[letter];
                const accuracy = stats ? (stats.correctAttempts / Math.max(stats.attempts, 1)) * 100 : 0;
                const standardCount = deviceStats?.standardKeyboard || 0;
                const orbitCount = deviceStats?.orbitReader || 0;
                
                return (
                  <div key={letter} className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-lg">{letter.toUpperCase()}</div>
                    <div className="text-xs text-gray-600">
                      {accuracy.toFixed(0)}% ({stats?.attempts || 0})
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      📱{orbitCount} 🖮{standardCount}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              📱 = Orbit Reader, 🖮 = Standard Keyboard
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrailleLetterTraining;
