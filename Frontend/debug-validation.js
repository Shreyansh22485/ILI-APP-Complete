// Debug script to test Braille validation logic
import { isCorrectPattern, getBraillePattern, BRAILLE_KEY_MAPPING } from './src/utils/brailleMapping.js';

console.log('=== BRAILLE VALIDATION DEBUG ===');

// Test case: Letter 'A' with key 'f'
const testLetter = 'a';
const testKeys = new Set(['f']);

console.log('\n--- Test Case: Letter A ---');
console.log('Target letter:', testLetter);
console.log('Pressed keys:', Array.from(testKeys));
console.log('Expected pattern:', getBraillePattern(testLetter));
console.log('Key mapping for f:', BRAILLE_KEY_MAPPING['f']);

// Step by step validation
const correctPattern = getBraillePattern(testLetter);
console.log('\nStep 1 - Correct pattern:', correctPattern);

const pressedDots = Array.from(testKeys).map(key => BRAILLE_KEY_MAPPING[key]).filter(dot => dot);
console.log('Step 2 - Pressed dots:', pressedDots);

const sortedPressed = pressedDots.sort((a, b) => a - b);
const sortedCorrect = [...correctPattern].sort((a, b) => a - b);
console.log('Step 3 - Sorted pressed:', sortedPressed);
console.log('Step 3 - Sorted correct:', sortedCorrect);

const pressedString = JSON.stringify(sortedPressed);
const correctString = JSON.stringify(sortedCorrect);
console.log('Step 4 - Pressed JSON:', pressedString);
console.log('Step 4 - Correct JSON:', correctString);

const isMatch = pressedString === correctString;
console.log('Step 5 - Match result:', isMatch);

// Call the actual function
const functionResult = isCorrectPattern(testKeys, testLetter);
console.log('Function result:', functionResult);

console.log('\n=== END DEBUG ===');
