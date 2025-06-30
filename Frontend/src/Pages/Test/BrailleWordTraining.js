import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BRAILLE_ALPHABET, isCorrectPattern, dotsToKeys, getRandomWord } from '../../utils/brailleMapping';
import { VoiceInstructor } from '../../utils/voiceInstructor';

const BrailleWordTraining = ({ onComplete, studentId }) => {
  const dispatch = useDispatch();
  const [voiceInstructor] = useState(new VoiceInstructor());
  
  // Training state
  const [currentWord, setCurrentWord] = useState('');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [typedWord, setTypedWord] = useState('');
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [totalWords] = useState(2); // Number of words to practice
    // Input state
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [isInputActive, setIsInputActive] = useState(true);
  const [isWaitingForInput, setIsWaitingForInput] = useState(true);
  
  // Analytics
  const [wordStats, setWordStats] = useState({});
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
      await voiceInstructor.speak(`Type the letter ${word[0].toUpperCase()}`);
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

  const validateWithKeys = useCallback(async (keysToValidate) => {
    const currentLetter = currentWord[currentLetterIndex];
    const expectedPattern = BRAILLE_ALPHABET[currentLetter.toLowerCase()];
    const expectedKeys = dotsToKeys(expectedPattern);
    
    console.log('=== WORD TRAINING DEBUG ===');
    console.log('Current word:', currentWord);
    console.log('Current letter index:', currentLetterIndex);
    console.log('Current letter:', currentLetter);
    console.log('Expected pattern:', expectedPattern);
    console.log('Expected keys:', expectedKeys);
    console.log('Keys to validate (Set):', keysToValidate);
    console.log('Keys to validate (Array):', Array.from(keysToValidate));
    console.log('==========================');
    
    const letterEndTime = Date.now();
    const letterTime = letterEndTime - letterStartTime;
    
    if (isCorrectPattern(Array.from(keysToValidate), currentLetter)) {
      // Correct letter typed
      const newTypedWord = typedWord + currentLetter;
      setTypedWord(newTypedWord);
      
      // Record timing data
      setWordStats(prev => ({
        ...prev,
        [currentWord]: {
          ...prev[currentWord],
          letterTimes: [...(prev[currentWord]?.letterTimes || []), letterTime]
        }
      }));
      
      // Clear pressed keys after successful input
      setPressedKeys(new Set());
      
      if (currentLetterIndex < currentWord.length - 1) {
        // Move to next letter
        setCurrentLetterIndex(currentLetterIndex + 1);
        setLetterStartTime(Date.now());
        const nextLetter = currentWord[currentLetterIndex + 1];
        setFeedback(`Correct! Now type: ${nextLetter.toUpperCase()}`);
        await voiceInstructor.speak(`Correct! Now type the letter ${nextLetter.toUpperCase()}`);
        
        // Re-enable input for next letter
        setIsWaitingForInput(true);
      } else {
        // Word completed
        completeWord();
      }
    } else {
      // Incorrect pattern
      const errorData = {
        expectedPattern,
        actualKeys: Array.from(keysToValidate),
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
      
      setFeedback(`Incorrect. Try again for letter: ${currentLetter.toUpperCase()}`);
      await voiceInstructor.speak(`Incorrect. The pattern for ${currentLetter.toUpperCase()} is ${expectedKeys.join(', ')}. Try again.`);
      
      // Clear pressed keys after incorrect input and re-enable input
      setTimeout(() => {
        setPressedKeys(new Set());
        setIsWaitingForInput(true);
      }, 1000);
    }
  }, [currentWord, currentLetterIndex, typedWord, letterStartTime, voiceInstructor, completeWord]);

  const handleKeyDown = useCallback((event) => {
    if (!isInputActive || isComplete || isStartingWord || !isWaitingForInput) return;

    const key = event.key.toLowerCase();
    const brailleKeys = ['f', 'd', 's', 'a', 'j', 'k', 'l', ';'];
    
    if (brailleKeys.includes(key)) {
      event.preventDefault();
      setPressedKeys(prev => {
        const newSet = new Set([...prev, key]);
        console.log('Updated pressed keys (keydown):', Array.from(newSet));
        return newSet;
      });
    }
  }, [isInputActive, isComplete, isStartingWord, isWaitingForInput]);
  const handleKeyUp = useCallback((event) => {
    if (!isInputActive || isComplete || isStartingWord || !isWaitingForInput) return;

    const key = event.key.toLowerCase();
    const brailleKeys = ['f', 'd', 's', 'a', 'j', 'k', 'l', ';'];
    
    if (brailleKeys.includes(key)) {
      event.preventDefault();
      
      // For word training, validate immediately using current state
      // Pass the current pressed keys to avoid stale state issues
      setPressedKeys(currentKeys => {
        console.log('Current keys in setState callback:', Array.from(currentKeys));
        
        // Only validate if we're still waiting for input and have keys
        if (isWaitingForInput && currentKeys.size > 0) {
          setIsWaitingForInput(false); // Prevent multiple validations
          setTimeout(() => {
            validateWithKeys(currentKeys);
          }, 200);
        }
          return currentKeys; // Don't change the state, just use it for validation
      });
    }  }, [isInputActive, isComplete, isStartingWord, isWaitingForInput, validateWithKeys]);

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
    if (!currentWordStats) return null;
    
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
