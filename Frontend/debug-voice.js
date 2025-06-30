// Test the speakWordInstruction method
class VoiceInstructor {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window;
  }

  speak(text, options = {}) {
    console.log('Speaking:', text);
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported');
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Cancel any ongoing speech
      this.synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      
      // Event handlers
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      this.synth.speak(utterance);
    });
  }

  async speakWordInstruction(word) {
    const message = `Now type the word: ${word.toUpperCase().split('').join(' ')}`;
    console.log('Word instruction message:', message);
    await this.speak(message);
  }
}

// Test with a sample word
const voice = new VoiceInstructor();
const testWord = 'cat';

console.log('Testing speakWordInstruction with word:', testWord);
console.log('Expected message: "Now type the word: C A T"');

// Test the message generation
const message = `Now type the word: ${testWord.toUpperCase().split('').join(' ')}`;
console.log('Generated message:', message);

// Test the method
voice.speakWordInstruction(testWord);
