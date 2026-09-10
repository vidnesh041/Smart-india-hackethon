/**
 * Web Speech API Utility for Voice Input
 * Provides speech-to-text functionality for low-literacy users.
 */

export const initSpeechRecognition = (onResult, onError, onEnd, lang = 'hi-IN') => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError && onError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult && onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError && onError(event.error);
  };

  recognition.onend = () => {
    onEnd && onEnd();
  };

  return recognition;
};
