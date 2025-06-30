import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateLectureInfo } from '../../redux/actions';
import { BRAILLE_ALPHABET, dotsToKeys, getVoiceInstruction } from '../../utils/brailleMapping';
import { VoiceInstructor } from '../../utils/voiceInstructor';

const BrailleLecture = ({ onCompletion }) => {
  const dispatch = useDispatch();
  const [voiceInstructor] = useState(new VoiceInstructor());
  
  // Lecture state
  const [lectureStarted, setLectureStarted] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState('automatic'); // 'automatic' or 'manual'
  
  // Analytics
  const [startTime, setStartTime] = useState(null);
  const [letterTimes, setLetterTimes] = useState([]);
  const [currentLetterStartTime, setCurrentLetterStartTime] = useState(null);
  
  // Get first 10 letters for teaching
  const letters = Object.keys(BRAILLE_ALPHABET).slice(0, 10);
  
  useEffect(() => {
    return () => {
      voiceInstructor.stop();
    };
  }, []);

  const startLecture = async () => {
    setLectureStarted(true);
    setStartTime(Date.now());
    setCurrentLetterStartTime(Date.now());
    
    await voiceInstructor.speakInstruction(
      "Welcome to the Braille alphabet lecture. You will learn the keyboard patterns for the first 10 letters of the alphabet. " +
      "Each letter has a unique pattern using the 8-key Braille keyboard. Listen carefully to each pattern."
    );
    
    setTimeout(() => {
      startLetter(0);
    }, 2000);
  };

  const startLetter = async (index) => {
    if (index >= letters.length) {
      completeLecture();
      return;
    }

    setCurrentLetterIndex(index);
    setCurrentLetterStartTime(Date.now());
    setIsPlaying(true);
    
    const letter = letters[index];
    const pattern = BRAILLE_ALPHABET[letter];
    const physicalKeys = dotsToKeys(pattern);
    
    // Speak the letter instruction
    const instruction = getVoiceInstruction(letter);
    await voiceInstructor.speakInstruction(instruction);
    
    // Additional explanation
    const keyDescription = physicalKeys.map(key => key === ';' ? 'semicolon' : key.toUpperCase()).join(', ');
    await voiceInstructor.speakInstruction(
      `The pattern for ${letter.toUpperCase()} uses ${physicalKeys.length} ${physicalKeys.length === 1 ? 'key' : 'keys'}: ${keyDescription}. ` +
      `Remember this pattern.`
    );
    
    setIsPlaying(false);
  };

  const nextLetter = () => {
    // Record time spent on current letter
    if (currentLetterStartTime) {
      const timeSpent = Date.now() - currentLetterStartTime;
      setLetterTimes(prev => [...prev, {
        letter: letters[currentLetterIndex],
        timeSpent
      }]);
    }
    
    const nextIndex = currentLetterIndex + 1;
    if (nextIndex < letters.length) {
      startLetter(nextIndex);
    } else {
      completeLecture();
    }
  };

  const previousLetter = () => {
    const prevIndex = currentLetterIndex - 1;
    if (prevIndex >= 0) {
      startLetter(prevIndex);
    }
  };

  const replayLetter = () => {
    startLetter(currentLetterIndex);
  };

  const completeLecture = async () => {
    const totalTime = Date.now() - startTime;
    
    await voiceInstructor.speakInstruction(
      "You have completed the Braille alphabet lecture. You learned the keyboard patterns for 10 letters. " +
      "Now you can proceed to the training phase where you will practice typing these patterns."
    );

    // Dispatch lecture results
    dispatch(updateLectureInfo({
      completed: true,
      totalTime,
      letterTimes,
      lettersLearned: letters,
      completedAt: new Date().toISOString()
    }));

    setTimeout(() => {
      if (onCompletion) onCompletion();
    }, 3000);
  };

  const renderKeyboardPattern = (letter) => {
    const pattern = BRAILLE_ALPHABET[letter] || [];
    const physicalKeys = dotsToKeys(pattern);
    
    return (
      <div className="braille-pattern-display bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Letter {letter.toUpperCase()} - Pattern
        </h3>
        
        {/* Braille dot representation */}
        <div className="braille-dots grid grid-cols-2 gap-2 max-w-20 mx-auto mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(dot => (
            <div
              key={dot}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                pattern.includes(dot)
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-gray-200 border-gray-300 text-gray-400'
              }`}
            >
              {dot}
            </div>
          ))}
        </div>
        
        {/* Physical keyboard representation */}
        <div className="keyboard-layout">
          <h4 className="text-lg font-medium mb-3 text-center">Physical Keys</h4>
          
          {/* Top row: F D S A */}
          <div className="flex justify-center mb-2 space-x-2">
            {['f', 'd', 's', 'a'].map(key => (
              <div
                key={key}
                className={`w-12 h-12 rounded border-2 flex items-center justify-center font-bold text-lg ${
                  physicalKeys.includes(key)
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}
              >
                {key.toUpperCase()}
              </div>
            ))}
          </div>
          
          {/* Bottom row: J K L ; */}
          <div className="flex justify-center space-x-2">
            {['j', 'k', 'l', ';'].map(key => (
              <div
                key={key}
                className={`w-12 h-12 rounded border-2 flex items-center justify-center font-bold text-lg ${
                  physicalKeys.includes(key)
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}
              >
                {key === ';' ? ';' : key.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-center mt-4 text-gray-600">
          Green keys show the pattern for letter {letter.toUpperCase()}
        </p>
      </div>
    );
  };

  if (!lectureStarted) {
    return (
      <div className="braille-lecture-intro p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Braille Keyboard Learning Lecture
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Learn the keyboard patterns for Braille letters
          </p>
          <p className="text-lg text-gray-700 mb-8">
            This lecture will teach you the keyboard patterns for the first 10 letters of the alphabet. 
            Each letter has a unique pattern using 8 keys on your keyboard. 
            Listen to the voice instructions and observe the visual patterns.
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Keyboard Layout</h2>
          <p className="mb-4">The Braille keyboard uses these 8 keys:</p>
          
          <div className="keyboard-demo">
            <div className="flex justify-center mb-2 space-x-2">
              <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded flex items-center justify-center font-bold">F</div>
              <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded flex items-center justify-center font-bold">D</div>
              <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded flex items-center justify-center font-bold">S</div>
              <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded flex items-center justify-center font-bold">A</div>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded flex items-center justify-center font-bold">J</div>
              <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded flex items-center justify-center font-bold">K</div>
              <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded flex items-center justify-center font-bold">L</div>
              <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded flex items-center justify-center font-bold">;</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={startLecture}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
          >
            Start Braille Lecture
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="braille-lecture p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Braille Alphabet Lecture
        </h1>
        <p className="text-xl text-gray-600">
          Letter {currentLetterIndex + 1} of {letters.length}
        </p>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentLetterIndex) / letters.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current letter pattern */}
      {currentLetterIndex < letters.length && renderKeyboardPattern(letters[currentLetterIndex])}

      {/* Controls */}
      <div className="controls mt-8 flex justify-center space-x-4">
        <button
          onClick={previousLetter}
          disabled={currentLetterIndex === 0}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Previous
        </button>
        
        <button
          onClick={replayLetter}
          disabled={isPlaying}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          {isPlaying ? 'Playing...' : 'Replay'}
        </button>
        
        <button
          onClick={nextLetter}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          {currentLetterIndex === letters.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>

      {/* Letter list */}
      <div className="letter-progress mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Letters Covered</h3>
        <div className="grid grid-cols-5 gap-2">
          {letters.map((letter, index) => (
            <div
              key={letter}
              className={`text-center p-2 rounded cursor-pointer transition duration-300 ${
                index < currentLetterIndex
                  ? 'bg-green-200 text-green-800'
                  : index === currentLetterIndex
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
              onClick={() => index <= currentLetterIndex && startLetter(index)}
            >
              {letter.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrailleLecture;
