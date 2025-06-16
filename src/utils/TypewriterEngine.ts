
export interface TypingOptions {
  minDelay?: number;
  maxDelay?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export class TypewriterEngine {
  private isTyping = false;
  private isPaused = false;
  private shouldStop = false;
  private currentText = "";
  private currentIndex = 0;

  async startTyping(text: string, options: TypingOptions = {}) {
    const {
      minDelay = 50,
      maxDelay = 150,
      onProgress,
      onComplete,
    } = options;

    this.currentText = text;
    this.currentIndex = 0;
    this.isTyping = true;
    this.isPaused = false;
    this.shouldStop = false;

    console.log("Starting typing simulation...");

    try {
      for (let i = 0; i < text.length; i++) {
        if (this.shouldStop) {
          console.log("Typing stopped by user");
          break;
        }

        while (this.isPaused && !this.shouldStop) {
          await this.sleep(100);
        }

        if (this.shouldStop) break;

        const char = text[i];
        this.currentIndex = i;

        // Simulate human typing with realistic delays
        const delay = this.getRandomDelay(minDelay, maxDelay, char);
        
        // Focus on the active element (if it's an input/textarea)
        const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
        
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          // Simulate typing by updating the input value and firing events
          const currentValue = activeElement.value;
          const newValue = currentValue + char;
          
          // Set the value
          activeElement.value = newValue;
          
          // Fire input events to simulate real typing
          const inputEvent = new Event('input', { bubbles: true });
          activeElement.dispatchEvent(inputEvent);
          
          // Also fire a change event
          const changeEvent = new Event('change', { bubbles: true });
          activeElement.dispatchEvent(changeEvent);
          
          // Move cursor to end
          activeElement.setSelectionRange(newValue.length, newValue.length);
        } else {
          // Fallback: try to use the Clipboard API or document.execCommand
          try {
            await navigator.clipboard.writeText(char);
            document.execCommand('paste');
          } catch (error) {
            console.warn("Could not simulate typing, clipboard access denied");
          }
        }

        // Report progress
        if (onProgress) {
          const progress = Math.round(((i + 1) / text.length) * 100);
          onProgress(progress);
        }

        await this.sleep(delay);
      }

      if (!this.shouldStop && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Typing error:", error);
    } finally {
      this.isTyping = false;
      this.isPaused = false;
    }
  }

  pause() {
    if (this.isTyping) {
      this.isPaused = true;
      console.log("Typing paused");
    }
  }

  resume() {
    if (this.isTyping && this.isPaused) {
      this.isPaused = false;
      console.log("Typing resumed");
    }
  }

  stop() {
    this.shouldStop = true;
    this.isTyping = false;
    this.isPaused = false;
    console.log("Typing stopped");
  }

  private getRandomDelay(min: number, max: number, char: string): number {
    // Add realistic variations based on character type
    let baseDelay = min + Math.random() * (max - min);

    // Longer pauses for punctuation and spaces
    if (char === ' ') {
      baseDelay *= 1.5;
    } else if (/[.!?]/.test(char)) {
      baseDelay *= 2;
    } else if (/[,;:]/.test(char)) {
      baseDelay *= 1.3;
    }

    // Occasionally add longer pauses to simulate thinking
    if (Math.random() < 0.1) {
      baseDelay *= 2;
    }

    return Math.round(baseDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get status() {
    return {
      isTyping: this.isTyping,
      isPaused: this.isPaused,
      progress: this.currentText ? Math.round((this.currentIndex / this.currentText.length) * 100) : 0
    };
  }
}
