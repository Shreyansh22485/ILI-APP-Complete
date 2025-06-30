// Braille 8-key keyboard mapping
// Physical keys: F,D,S,A (top row) and J,K,L,; (bottom row)
// Corresponding to Braille dots: 1,2,3,4,5,6,7,8

export const BRAILLE_KEYS = ['f', 'd', 's', 'a', 'j', 'k', 'l', ';'];
export const BRAILLE_KEY_MAPPING = {
  'f': 1, 'd': 2, 's': 3, 'a': 4,
  'j': 5, 'k': 6, 'l': 7, ';': 8
};

// Braille letter mappings (using standard Braille patterns)
export const BRAILLE_ALPHABET = {
  'a': [1],
  'b': [1, 2],
  'c': [1, 4],
  'd': [1, 4, 5],
  'e': [1, 5],
  'f': [1, 2, 4],
  'g': [1, 2, 4, 5],
  'h': [1, 2, 5],
  'i': [2, 4],
  'j': [2, 4, 5],
  'k': [1, 3],
  'l': [1, 2, 3],
  'm': [1, 3, 4],
  'n': [1, 3, 4, 5],
  'o': [1, 3, 5],
  'p': [1, 2, 3, 4],
  'q': [1, 2, 3, 4, 5],
  'r': [1, 2, 3, 5],
  's': [2, 3, 4],
  't': [2, 3, 4, 5],
  'u': [1, 3, 6],
  'v': [1, 2, 3, 6],
  'w': [2, 4, 5, 6],
  'x': [1, 3, 4, 6],
  'y': [1, 3, 4, 5, 6],
  'z': [1, 3, 5, 6]
};

// Three-letter practice words
export const PRACTICE_WORDS = [
  'cat', 'dog', 'bat', 'rat', 'hat', 'mat', 'sat', 'fat',
  'big', 'pig', 'dig', 'fig', 'jig', 'wig', 'bag', 'tag',
  'run', 'sun', 'fun', 'gun', 'bun', 'hut', 'cut', 'but',
  'box', 'fox', 'six', 'mix', 'fix', 'wax', 'tax', 'max',
  'cup', 'top', 'mop', 'hop', 'pop', 'lap', 'cap', 'gap'
];

// Function to get Braille pattern for a letter
export const getBraillePattern = (letter) => {
  if (!letter || typeof letter !== 'string') {
    console.warn('getBraillePattern: Invalid letter parameter:', letter);
    return [];
  }
  return BRAILLE_ALPHABET[letter.toLowerCase()] || [];
};

// Function to check if pressed keys match a letter's Braille pattern
export const isCorrectPattern = (pressedKeys, targetLetter) => {
  const correctPattern = getBraillePattern(targetLetter);
  
  // Convert physical keys to Braille dot numbers
  const pressedDots = Array.from(pressedKeys).map(key => BRAILLE_KEY_MAPPING[key]).filter(dot => dot);
  const sortedPressed = pressedDots.sort((a, b) => a - b);
  const sortedCorrect = [...correctPattern].sort((a, b) => a - b);
  
  return JSON.stringify(sortedPressed) === JSON.stringify(sortedCorrect);
};

// Function to convert physical keys to Braille dots
export const keysToDots = (keys) => {
  return Array.from(keys).map(key => BRAILLE_KEY_MAPPING[key]).filter(dot => dot).sort((a, b) => a - b);
};

// Function to convert Braille dots to physical keys
export const dotsToKeys = (dots) => {
  if (!dots || !Array.isArray(dots)) {
    console.warn('dotsToKeys: Invalid dots parameter:', dots);
    return [];
  }
  return dots.map(dot => {
    for (const [key, dotNum] of Object.entries(BRAILLE_KEY_MAPPING)) {
      if (dotNum === dot) return key;
    }
    return null;
  }).filter(key => key);
};

// Function to convert Braille pattern to readable format
export const patternToString = (pattern) => {
  return pattern.join(', ');
};

// Function to get voice instruction for a letter
export const getVoiceInstruction = (letter) => {
  const pattern = getBraillePattern(letter);
  if (pattern.length === 0) return `Letter ${letter} not found`;
  
  const physicalKeys = dotsToKeys(pattern);
  const keyText = physicalKeys.length === 1 ? 'key' : 'keys';
  const keyNames = physicalKeys.map(key => key === ';' ? 'semicolon' : key.toUpperCase()).join(', ');
  return `Letter ${letter.toUpperCase()}: Press ${keyText} ${keyNames}`;
};

// Utility function to get a random word from practice words
export const getRandomWord = () => {
  return PRACTICE_WORDS[Math.floor(Math.random() * PRACTICE_WORDS.length)];
};

// Validate Braille pattern (alias for isCorrectPattern for compatibility)
export const validateBraillePattern = (inputKeys, expectedDots) => {
  const inputDots = Array.from(inputKeys).map(key => BRAILLE_KEY_MAPPING[key]).filter(dot => dot).sort((a, b) => a - b);
  const sortedExpected = [...expectedDots].sort((a, b) => a - b);
  return JSON.stringify(inputDots) === JSON.stringify(sortedExpected);
};
