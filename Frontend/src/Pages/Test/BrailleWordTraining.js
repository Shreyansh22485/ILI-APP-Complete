import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BRAILLE_ALPHABET, getBraillePattern, isCorrectPattern, dotsToKeys, getRandomWord } from '../../utils/brailleMapping';
import { VoiceInstructor } from '../../utils/voiceInstructor';

const BrailleWordTraining = ({ onComplete, studentId }) => {
  const dispatch = useDispatch();
  const [voiceInstructor] = useState(new VoiceInstructor());
  
  // Orbit Reader 40 specific key mapping (same as letter training)
  const ORBIT_READER_LETTER_MAPPING = {
    'a': 'a', // Letter A (dot 1) → sends 'a'
    'b': 'b', // Letter B (dots 1,2) → sends 'b'
    'c': 'c', // Letter C (dots 1,4) → sends 'c'
    'd': 'd', // Letter D (dots 1,4,5) → sends 'd'
    'e': 'e', // Letter E (dots 1,5) → sends 'e'
    'f': 'f', // Letter F (dots 1,2,4) → sends 'f'
    'g': 'g', // Letter G (dots 1,2,4,5) → sends 'g'
    'h': 'h', // Letter H (dots 1,2,5) → sends 'h'
    'i': 'i', // Letter I (dots 2,4) → sends 'i'
    'j': 'j', // Letter J (dots 2,4,5) → sends 'j'
    'k': 'k', // Letter K (dots 1,3) → sends 'k'
    'l': 'l', // Letter L (dots 1,2,3) → sends 'l'
    'm': 'm', // Letter M (dots 1,3,4) → sends 'm'
    'n': 'n', // Letter N (dots 1,3,4,5) → sends 'n'
    'o': 'o', // Letter O (dots 1,3,5) → sends 'o'
    'p': 'p', // Letter P (dots 1,2,3,4) → sends 'p'
    'q': 'q', // Letter Q (dots 1,2,3,4,5) → sends 'q'
    'r': 'r', // Letter R (dots 1,2,3,5) → sends 'r'
    's': 's', // Letter S (dots 2,3,4) → sends 's'
    't': 't', // Letter T (dots 2,3,4,5) → sends 't'
    'u': 'u', // Letter U (dots 1,3,6) → sends 'u'
    'v': 'v', // Letter V (dots 1,2,3,6) → sends 'v'
    'w': 'w', // Letter W (dots 2,4,5,6) → sends 'w'
    'x': 'x', // Letter X (dots 1,3,4,6) → sends 'x'
    'y': 'y', // Letter Y (dots 1,3,4,5,6) → sends 'y'
    'z': 'z'  // Letter Z (dots 1,3,5,6) → sends 'z'
  };
  
  // Training state
  const [currentWord, setCurrentWord] = useState('');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [typedWord, setTypedWord] = useState('');
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [totalWords] = useState(2); // Number of words to practice
    // Input state
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [keydownEvents, setKeydownEvents] = useState(new Set()); // Track actual keydown events
  const [isInputActive, setIsInputActive] = useState(true);
  const [isWaitingForInput, setIsWaitingForInput] = useState(true);
  
  // Analytics
  const [wordStats, setWordStats] = useState({});
  const [deviceUsageStats, setDeviceUsageStats] = useState({}); // Track which device was used for each word/letter
  const [startTime, setStartTime] = useState(null);
  const [letterStartTime, setLetterStartTime] = useState(null);
    // UI state
  const [feedback, setFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);  const [isComplete, setIsComplete] = useState(false);
  const [isStartingWord, setIsStartingWord] = useState(false); // Prevent multiple word starts

  const startNewWord = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isStartingWord) {
      console.log('Word start already in progress, skipping...');
      return;
    }
    
    setIsStartingWord(true);
    
    const word = getRandomWord();
    console.log('=== STARTING NEW WORD ===');
    console.log('Selected word:', word);
    console.log('========================');
      setCurrentWord(word);
    setCurrentLetterIndex(0);
    setTypedWord('');
    setStartTime(Date.now());
    setLetterStartTime(Date.now());
    setFeedback(`Type the word: ${word}`);
    setIsWaitingForInput(true); // Enable input for the new word
    
    // Initialize word stats
    setWordStats(prev => ({
      ...prev,
      [word]: {
        attempts: (prev[word]?.attempts || 0) + 1,
        startTime: Date.now(),
        letterTimes: [],
        errors: [],
        completed: false
      }
    }));
    
    // Initialize device usage stats for this word
    setDeviceUsageStats(prev => ({
      ...prev,
      [word]: {
        letters: {},
        standardKeyboard: 0,
        orbitReader: 0,
        letterAttempts: []
      }
    }));
    
    // Speak the word with proper sequential timing
    const speakInstructions = async () => {
      // Small delay before starting instructions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Speaking word instruction for:', word);
      await voiceInstructor.speakWordInstruction(word);
      console.log('Word instruction completed');
      
      // Wait longer before giving letter instruction to ensure no overlap
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Speaking letter instruction for:', word[0]);
      const firstLetterPattern = getBraillePattern(word[0]);
      await voiceInstructor.speak(`Type the letter ${word[0].toUpperCase()}: Press keys ${firstLetterPattern.join(', ')}`);
      console.log('Letter instruction completed');
      
      // Reset the flag after all instructions are complete
      setIsStartingWord(false);
      console.log('Reset isStartingWord to false');
    };
    
    speakInstructions();  }, [isStartingWord, voiceInstructor]); // Add dependencies to prevent multiple calls

  const completeWord = useCallback(() => {
    // Prevent multiple calls during word completion
    if (isStartingWord) {
      console.log('Word completion blocked - already starting new word');
      return;
    }
    
    const wordEndTime = Date.now();
    const totalWordTime = wordEndTime - startTime;
    
    setWordStats(prev => ({
      ...prev,
      [currentWord]: {
        ...prev[currentWord],
        timeSpent: totalWordTime,
        completed: true
      }
    }));
    
    const newWordsCompleted = wordsCompleted + 1;
    setWordsCompleted(newWordsCompleted);
    setShowSuccess(true);
    
    setFeedback(`Excellent! You completed the word: ${currentWord}`);
    
    // Speak success message and wait for it to complete before starting next word
    const speakSuccessAndContinue = async () => {
      await voiceInstructor.speak(`Excellent! You completed the word ${currentWord}`);
      
      // Wait a bit more after success message completes
      setTimeout(() => {
        setShowSuccess(false);
        if (newWordsCompleted >= totalWords) {
          console.log('Training completed!', newWordsCompleted, 'words finished');
          completeTraining();
        } else {
          console.log('Starting next word after success message completed. Words completed:', newWordsCompleted);
          startNewWord();
        }
      }, 1000); // Additional 1 second pause after success message
    };
    
    speakSuccessAndContinue();
  }, [currentWord, startTime, wordsCompleted, totalWords, isStartingWord, voiceInstructor, startNewWord]);
  // Initialize first word
  useEffect(() => {
    const initializeTraining = async () => {
      await voiceInstructor.speak("Welcome to Braille word training. I will say a word, and you should type each letter using the Braille keyboard.");
      // Wait for welcome message to complete before starting first word
      setTimeout(() => {
        startNewWord();
      }, 1000);
    };
    
    initializeTraining();  }, []); // Remove startNewWord dependency to prevent recreation

  const validateWithKeydownEvents = useCallback(async (keydownEventsToValidate) => {
    const currentLetter = currentWord[currentLetterIndex];
    const timeTaken = Date.now() - letterStartTime;
    
    // Determine which device was used and validate accordingly
    const actualKeys = Array.from(keydownEventsToValidate);
    let isCorrect = false;
    let deviceUsed = '';
    
    // Check if it's Orbit Reader input (single letter key)
    const expectedOrbitKey = ORBIT_READER_LETTER_MAPPING[currentLetter.toLowerCase()];
    const isOrbitReaderInput = actualKeys.length === 1 && actualKeys[0] === expectedOrbitKey;
    
    // Check if it's standard Braille keyboard input (multiple dot keys)
    const brailleKeys = ['f', 'd', 's', 'a', 'j', 'k', 'l', ';'];
    const isStandardInput = actualKeys.every(key => brailleKeys.includes(key));
    const isCorrectStandardPattern = isStandardInput && isCorrectPattern(actualKeys, currentLetter);
    
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
    
    console.log('=== WORD TRAINING DUAL DEVICE DEBUG ===');
    console.log('Current word:', currentWord);
    console.log('Current letter index:', currentLetterIndex);
    console.log('Current letter:', currentLetter);
    console.log('Expected Orbit key:', expectedOrbitKey);
    console.log('Expected standard pattern:', getBraillePattern(currentLetter));
    console.log('Keydown events:', actualKeys);
    console.log('Is Orbit Reader input:', isOrbitReaderInput);
    console.log('Is standard input:', isStandardInput);
    console.log('Is correct standard pattern:', isCorrectStandardPattern);
    console.log('Device used:', deviceUsed);
    console.log('Validation result:', isCorrect);
    console.log('======================================');
    
    if (isCorrect) {
      // Correct letter typed
      const newTypedWord = typedWord + currentLetter;
      setTypedWord(newTypedWord);
      
      // Record timing data
      setWordStats(prev => ({
        ...prev,
        [currentWord]: {
          ...prev[currentWord],
          letterTimes: [...(prev[currentWord]?.letterTimes || []), timeTaken]
        }
      }));

      // Update device usage stats
      setDeviceUsageStats(prev => ({
        ...prev,
        [currentWord]: {
          ...prev[currentWord],
          letterAttempts: [
            ...(prev[currentWord]?.letterAttempts || []),
            {
              letter: currentLetter,
              letterIndex: currentLetterIndex,
              device: deviceUsed,
              correct: true,
              keys: actualKeys,
              timestamp: Date.now()
            }
          ]
        }
      }));

      // Update device counts
      setDeviceUsageStats(prev => ({
        ...prev,
        [currentWord]: {
          ...prev[currentWord],
          [deviceUsed]: (prev[currentWord]?.[deviceUsed] || 0) + 1
        }
      }));
      
      // Clear pressed keys and keydown events after successful input
      setPressedKeys(new Set());
      setKeydownEvents(new Set());
      
      if (currentLetterIndex < currentWord.length - 1) {
        // Move to next letter
        setCurrentLetterIndex(currentLetterIndex + 1);
        setLetterStartTime(Date.now());
        const nextLetter = currentWord[currentLetterIndex + 1];
        const nextLetterPattern = getBraillePattern(nextLetter);
        setFeedback(`Correct! Now type: ${nextLetter.toUpperCase()}`);
        await voiceInstructor.speak(`Correct! Now type the letter ${nextLetter.toUpperCase()}: Press keys ${nextLetterPattern.join(', ')}`);
        
        // Re-enable input for next letter
        setIsWaitingForInput(true);
      } else {
        // Word completed
        completeWord();
      }
    } else {
      // Incorrect pattern
      const expectedPattern = getBraillePattern(currentLetter);
      const errorData = {
        expectedPattern,
        actualKeys: Array.from(keydownEventsToValidate),
        device: deviceUsed,
        timestamp: Date.now(),
        letterIndex: currentLetterIndex
      };
      
      setWordStats(prev => ({
        ...prev,
        [currentWord]: {
          ...prev[currentWord],
          errors: [...(prev[currentWord]?.errors || []), errorData]
        }
      }));

      // Record failed attempt in device usage stats
      setDeviceUsageStats(prev => ({
        ...prev,
        [currentWord]: {
          ...prev[currentWord],
          letterAttempts: [
            ...(prev[currentWord]?.letterAttempts || []),
            {
              letter: currentLetter,
              letterIndex: currentLetterIndex,
              device: deviceUsed,
              correct: false,
              keys: actualKeys,
              timestamp: Date.now()
            }
          ]
        }
      }));
      
      setFeedback(`Incorrect. Try again for letter: ${currentLetter.toUpperCase()}`);
      
      let errorMessage = '';
      if (deviceUsed === 'orbitReader') {
        errorMessage = `Incorrect. For letter ${currentLetter.toUpperCase()}, press the key combination for dots ${expectedPattern.join(', ')} on your Orbit Reader.`;
      } else if (deviceUsed === 'standardKeyboard') {
        const expectedKeys = dotsToKeys(expectedPattern);
        errorMessage = `Incorrect. For letter ${currentLetter.toUpperCase()}, press keys ${expectedKeys.join(', ')} on the standard Braille keyboard.`;
      } else {
        errorMessage = `Incorrect. For letter ${currentLetter.toUpperCase()}, use either Orbit Reader or standard Braille keyboard with pattern ${expectedPattern.join(', ')}.`;
      }
      
      await voiceInstructor.speak(errorMessage);
      
      // Clear pressed keys and keydown events after incorrect input and re-enable input
      setTimeout(() => {
        setPressedKeys(new Set());
        setKeydownEvents(new Set());
        setIsWaitingForInput(true);
      }, 1000);
    }
  }, [currentWord, currentLetterIndex, typedWord, letterStartTime, voiceInstructor, completeWord]);

  const handleKeyDown = useCallback((event) => {
    if (!isInputActive || isComplete || isStartingWord || !isWaitingForInput) return;

    const key = event.key;
    const brailleKeys = ['f', 'd', 's', 'a', 'j', 'k', 'l', ';'];
    
    console.log('Key down:', key, 'Standard valid key:', brailleKeys.includes(key), 'Orbit Reader letter:', ORBIT_READER_LETTER_MAPPING[key] !== undefined);
    
    // Check if it's a standard Braille key OR an Orbit Reader letter
    if (brailleKeys.includes(key) || ORBIT_READER_LETTER_MAPPING[key] !== undefined) {
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
  }, [isInputActive, isComplete, isStartingWord, isWaitingForInput]);
  const handleKeyUp = useCallback((event) => {
    if (!isInputActive || isComplete || isStartingWord || !isWaitingForInput) return;

    const key = event.key;
    const brailleKeys = ['f', 'd', 's', 'a', 'j', 'k', 'l', ';'];
    
    console.log('Key up:', key, 'Standard valid key:', brailleKeys.includes(key), 'Orbit Reader letter:', ORBIT_READER_LETTER_MAPPING[key] !== undefined);
    
    // Check if it's a standard Braille key OR Orbit Reader letter OR "Unidentified" (common with screen readers)
    if (brailleKeys.includes(key) || ORBIT_READER_LETTER_MAPPING[key] !== undefined || key === "Unidentified") {
      event.preventDefault();
      
      // Use current keydown events for validation
      setTimeout(() => {
        setKeydownEvents(currentEvents => {
          console.log('Current keydown events for validation:', Array.from(currentEvents));
          if (currentEvents.size > 0) {
            setIsWaitingForInput(false); // Prevent multiple validations
            validateWithKeydownEvents(currentEvents);
          }
          return currentEvents;
        });
      }, 100);
    }
  }, [isInputActive, isComplete, isStartingWord, isWaitingForInput, validateWithKeydownEvents]);

  const completeTraining = () => {
    setIsComplete(true);
    setIsInputActive(false);
    
    // Calculate overall statistics
    const allWords = Object.keys(wordStats);
    const totalTime = allWords.reduce((sum, word) => sum + (wordStats[word].timeSpent || 0), 0);
    const totalErrors = allWords.reduce((sum, word) => sum + (wordStats[word].errors?.length || 0), 0);
    const averageTimePerWord = totalTime / allWords.length;
    
    const trainingData = {
      type: 'word',
      completed: true,
      totalTime,
      totalErrors,
      averageTimePerWord,
      wordsCompleted: allWords.length,
      wordStats,
      deviceUsageStats, // Include device usage statistics
      studentId,
      timestamp: new Date().toISOString()
    };
    
    dispatch({
      type: 'UPDATE_BRAILLE_TRAINING',
      payload: {
        wordTraining: trainingData,
        currentPhase: 'completed'
      }
    });
      setFeedback(`Training completed! You practiced ${allWords.length} words with ${totalErrors} total errors.`);
    voiceInstructor.speak(`Congratulations! You have completed the Braille word training. You practiced ${allWords.length} words with ${totalErrors} total errors.`);
    
    if (onComplete) {
      setTimeout(() => onComplete(trainingData), 3000);
    }
  };
  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const renderKeyboard = () => {
    const keyLayout = [
      ['f', 'd', 's', 'a'],
      ['j', 'k', 'l', ';']
    ];
    
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-center">Braille Keyboard Layout</h3>
        {keyLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-2 mb-2">
            {row.map((key) => (
              <div
                key={key}
                className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-lg ${
                  pressedKeys.has(key)
                    ? 'bg-blue-500 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {key.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
        <div className="text-sm text-gray-600 text-center mt-2">
          Press the keys simultaneously to form Braille patterns
        </div>
      </div>
    );
  };

  const renderWordProgress = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Word Progress</h3>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl font-bold">{currentWord}</span>
          <span className="text-gray-500">({wordsCompleted + 1}/{totalWords})</span>
        </div>
        <div className="flex space-x-1">
          {currentWord.split('').map((letter, index) => (
            <div
              key={index}
              className={`w-8 h-8 border-2 rounded flex items-center justify-center font-bold ${
                index < currentLetterIndex
                  ? 'bg-green-500 text-white border-green-600'
                  : index === currentLetterIndex
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-400 border-gray-300'
              }`}
            >
              {index < typedWord.length ? typedWord[index].toUpperCase() : letter.toUpperCase()}
            </div>
          ))}
        </div>
        {currentLetterIndex < currentWord.length && (
          <div className="mt-2 text-sm text-gray-600">
            Current letter: <span className="font-bold text-lg text-blue-600">
              {currentWord[currentLetterIndex].toUpperCase()}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderStats = () => {
    const currentWordStats = wordStats[currentWord];
    const currentDeviceStats = deviceUsageStats[currentWord];
    if (!currentWordStats) return null;
    
    const standardCount = currentDeviceStats?.standardKeyboard || 0;
    const orbitCount = currentDeviceStats?.orbitReader || 0;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Current Word Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Attempts:</span>
            <span className="ml-2 font-semibold">{currentWordStats.attempts}</span>
          </div>
          <div>
            <span className="text-gray-600">Errors:</span>
            <span className="ml-2 font-semibold">{currentWordStats.errors?.length || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Letters typed:</span>
            <span className="ml-2 font-semibold">{currentWordStats.letterTimes?.length || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Progress:</span>
            <span className="ml-2 font-semibold">
              {Math.round(((currentWordStats.letterTimes?.length || 0) / currentWord.length) * 100)}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">📱 Orbit Reader:</span>
            <span className="ml-2 font-semibold">{orbitCount}</span>
          </div>
          <div>
            <span className="text-gray-600">🖮 Standard KB:</span>
            <span className="ml-2 font-semibold">{standardCount}</span>
          </div>
        </div>
      </div>
    );
  };

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            🎉 Word Training Completed!
          </h2>
          <p className="text-lg text-green-700 mb-4">
            Congratulations! You have successfully completed the Braille word training.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{wordsCompleted}</div>
              <div className="text-sm text-gray-600">Words Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(wordStats).reduce((sum, word) => sum + (word.errors?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Errors</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(Object.values(wordStats).reduce((sum, word) => sum + (word.timeSpent || 0), 0) / 1000)}s
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                📱 {Object.values(deviceUsageStats).reduce((sum, word) => sum + (word.orbitReader || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Orbit Reader Letters</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                🖮 {Object.values(deviceUsageStats).reduce((sum, word) => sum + (word.standardKeyboard || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Standard Keyboard Letters</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Braille Word Training</h1>
        <p className="text-center text-gray-600">
          Type complete words using Braille patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {renderWordProgress()}
        {renderStats()}
      </div>

      <div className="mb-6">
        {renderKeyboard()}
      </div>

      <div className="bg-white p-4 rounded-lg shadow text-center">
        <div className={`text-lg font-semibold ${
          showSuccess ? 'text-green-600' : 'text-gray-700'
        }`}>
          {feedback}
        </div>
        {showSuccess && (
          <div className="mt-2 text-green-600 text-xl">
            ✓ Excellent work!
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Press the Braille keys simultaneously to form each letter pattern</p>
        <p>Keys: F, D, S, A (left hand) | J, K, L, ; (right hand)</p>
      </div>
    </div>
  );
};

export default BrailleWordTraining;
