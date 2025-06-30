// Debug script for letter 'A' validation issue
// Manual import of the functions since we're using ES6 modules

// Braille key mapping
const BRAILLE_KEY_MAPPING = {
  'f': 1, 'd': 2, 's': 3, 'a': 4,
  'j': 5, 'k': 6, 'l': 7, ';': 8
};

// Braille alphabet
const BRAILLE_ALPHABET = {
  'a': [1],
  'b': [1, 2],
  'c': [1, 4],
  'd': [1, 4, 5],
  'e': [1, 5],
  // ... other letters
};

// Functions from brailleMapping.js
const getBraillePattern = (letter) => {
  return BRAILLE_ALPHABET[letter.toLowerCase()] || [];
};

const isCorrectPattern = (pressedKeys, targetLetter) => {
  const correctPattern = getBraillePattern(targetLetter);
  
  // Convert physical keys to Braille dot numbers
  const pressedDots = Array.from(pressedKeys).map(key => BRAILLE_KEY_MAPPING[key]).filter(dot => dot);
  const sortedPressed = pressedDots.sort((a, b) => a - b);
  const sortedCorrect = [...correctPattern].sort((a, b) => a - b);
  
  return JSON.stringify(sortedPressed) === JSON.stringify(sortedCorrect);
};

const keysToDots = (keys) => {
  return Array.from(keys).map(key => BRAILLE_KEY_MAPPING[key]).filter(dot => dot).sort((a, b) => a - b);
};

console.log('=== DEBUGGING LETTER A VALIDATION ===\n');

// Test data
const letter = 'a';
const pressedKey = 'f';
const pressedKeysSet = new Set([pressedKey]);

console.log('1. BRAILLE_KEY_MAPPING:');
console.log(BRAILLE_KEY_MAPPING);
console.log();

console.log('2. BRAILLE_ALPHABET for letter A:');
console.log(`Letter '${letter}':`, BRAILLE_ALPHABET[letter]);
console.log();

console.log('3. getBraillePattern for letter A:');
const correctPattern = getBraillePattern(letter);
console.log(`getBraillePattern('${letter}'):`, correctPattern);
console.log();

console.log('4. Key mapping for pressed key:');
console.log(`Key '${pressedKey}' maps to dot:`, BRAILLE_KEY_MAPPING[pressedKey]);
console.log();

console.log('5. Converting pressed keys to dots:');
const pressedDots = Array.from(pressedKeysSet).map(key => BRAILLE_KEY_MAPPING[key]).filter(dot => dot);
console.log(`Pressed keys:`, Array.from(pressedKeysSet));
console.log(`Pressed dots:`, pressedDots);
console.log(`Sorted pressed dots:`, pressedDots.sort((a, b) => a - b));
console.log();

console.log('6. Expected pattern vs actual:');
const sortedPressed = pressedDots.sort((a, b) => a - b);
const sortedCorrect = [...correctPattern].sort((a, b) => a - b);
console.log(`Expected (sorted):`, sortedCorrect);
console.log(`Actual (sorted):`, sortedPressed);
console.log();

console.log('7. JSON comparison:');
console.log(`JSON.stringify(sortedPressed):`, JSON.stringify(sortedPressed));
console.log(`JSON.stringify(sortedCorrect):`, JSON.stringify(sortedCorrect));
console.log(`Are they equal?:`, JSON.stringify(sortedPressed) === JSON.stringify(sortedCorrect));
console.log();

console.log('8. Testing isCorrectPattern function:');
const result = isCorrectPattern(pressedKeysSet, letter);
console.log(`isCorrectPattern(Set(['${pressedKey}']), '${letter}'):`, result);
console.log();

console.log('9. Testing keysToDots function:');
const convertedDots = keysToDots(pressedKeysSet);
console.log(`keysToDots(Set(['${pressedKey}']):`, convertedDots);
console.log();

console.log('=== STEP-BY-STEP VALIDATION ===');
console.log('Step 1: Get correct pattern for letter A');
console.log('  - getBraillePattern("a") =', getBraillePattern('a'));

console.log('Step 2: Convert pressed keys to dots');
console.log(`  - Pressed keys: ['${pressedKey}']`);
console.log(`  - Key '${pressedKey}' -> dot`, BRAILLE_KEY_MAPPING[pressedKey]);
console.log('  - Filtered dots:', pressedDots);

console.log('Step 3: Sort both arrays');
console.log('  - Sorted correct:', sortedCorrect);
console.log('  - Sorted pressed:', sortedPressed);

console.log('Step 4: Compare as JSON strings');
console.log('  - Correct JSON:', JSON.stringify(sortedCorrect));
console.log('  - Pressed JSON:', JSON.stringify(sortedPressed));
console.log('  - Match?:', JSON.stringify(sortedPressed) === JSON.stringify(sortedCorrect));
