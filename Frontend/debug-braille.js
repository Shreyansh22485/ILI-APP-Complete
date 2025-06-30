// Debug test for Braille validation
import { BRAILLE_ALPHABET, BRAILLE_KEY_MAPPING, isCorrectPattern, getBraillePattern } from './brailleMapping.js';

// Test case: Letter 'A' with key 'f'
console.log('=== Debug Test for Letter A ===');

const letter = 'a';
const pressedKeys = ['f'];  // User pressed 'f' key

console.log('Letter:', letter);
console.log('Pressed keys:', pressedKeys);

// Get expected pattern
const expectedPattern = getBraillePattern(letter);
console.log('Expected Braille pattern (dots):', expectedPattern);

// Convert pressed keys to dots
const pressedDots = pressedKeys.map(key => BRAILLE_KEY_MAPPING[key]);
console.log('Pressed keys converted to dots:', pressedDots);

// Check if correct
const isCorrect = isCorrectPattern(pressedKeys, letter);
console.log('Is correct?', isCorrect);

// Manual check
console.log('Expected dots:', expectedPattern.sort());
console.log('Pressed dots:', pressedDots.sort());
console.log('Should be equal:', JSON.stringify(expectedPattern.sort()) === JSON.stringify(pressedDots.sort()));
