/**
 * Speech Utilities: Unified Speech-to-Text (STT) and Text-to-Speech (TTS)
 * Native Web Speech API integration with Hindi and English voice selection.
 */

// Speech Recognition (Speech to Text)
export const initSpeechRecognition = (onResult, onError, onEnd, lang = 'hi-IN') => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError && onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
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

// Text to Speech (Voice Readout)
export const speakText = (text, lang = 'hi-IN', onStart, onEnd) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return false;
  }

  // Stop any ongoing speech first
  window.speechSynthesis.cancel();

  // Strip markdown or bullet formatting for clean speech
  const cleanText = text
    .replace(/[#*_`~[\]()]/g, '')
    .replace(/₹/g, ' रुपये ')
    .replace(/%/g, ' प्रतिशत ')
    .trim();

  if (!cleanText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = 0.92; // Slightly slower for better clarity
  utterance.pitch = 1.0;

  // Try to select an authentic Hindi/Indian voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => 
    (lang === 'hi' && (v.lang === 'hi-IN' || v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('heera'))) ||
    (lang !== 'hi' && (v.lang === 'en-IN' || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('veena')))
  );

  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = (e) => {
    console.error('Speech synthesis error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return true;
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
