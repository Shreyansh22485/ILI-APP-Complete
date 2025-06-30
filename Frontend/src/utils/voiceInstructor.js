// Voice synthesis utilities for Braille training

export class VoiceInstructor {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window;
  }

  speak(text, options = {}) {
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

  async speakInstruction(letter) {
    const instruction = `Press the keys for letter ${letter.toUpperCase()}`;
    await this.speak(instruction);
  }

  async speakSuccess(letter) {
    const message = `Excellent! You correctly typed letter ${letter.toUpperCase()}`;
    await this.speak(message, { pitch: 1.2 });
  }

  async speakError(letter, correctPattern) {
    const keys = correctPattern.join(', ');
    const message = `Incorrect. For letter ${letter.toUpperCase()}, press keys ${keys}. Try again.`;
    await this.speak(message, { rate: 0.8 });
  }

  async speakWordInstruction(word) {
    const message = `Now type the word: ${word.toUpperCase().split('').join(' ')}`;
    await this.speak(message);
  }

  async speakWordSuccess(word, timeTaken) {
    const message = `Perfect! You typed ${word.toUpperCase()} in ${timeTaken} seconds`;
    await this.speak(message, { pitch: 1.2 });
  }

  async speakLetterInWord(letter, position, word) {
    const message = `Type letter ${letter.toUpperCase()}, the ${this.getOrdinal(position + 1)} letter in ${word.toUpperCase()}`;
    await this.speak(message);
  }

  getOrdinal(num) {
    const ordinals = ['first', 'second', 'third', 'fourth', 'fifth'];
    return ordinals[num - 1] || `${num}th`;
  }

  stop() {
    if (this.isSupported) {
      this.synth.cancel();
    }
  }
}
