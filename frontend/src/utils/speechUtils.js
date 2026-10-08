/**
 * Speech Utilities: Unified Multi-Engine Speech-to-Text (STT) and Text-to-Speech (TTS)
 * Uses FastAPI Backend TTS Audio Stream (/api/tts) for 100% accurate Indian regional language audio,
 * with Web Speech API fallback.
 */

import { fetchAudioTTS } from '../services/api';

const STT_LANG_MAP = {
  Hindi: 'hi-IN',
  English: 'en-IN',
  Marathi: 'mr-IN',
  Hinglish: 'hi-IN',
  Bengali: 'bn-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Gujarati: 'gu-IN'
};

export const getLangCode = (langName) => STT_LANG_MAP[langName] || 'en-IN';

let currentAudio = null;

export const stopSpeaking = () => {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Speech Recognition (Speech to Text)
export const initSpeechRecognition = (onResult, onError, onEnd, langName = 'English') => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError && onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = getLangCode(langName);
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

// Multi-Language Regional Text to Speech (Voice Synthesizer via Backend TTS API)
export const speakText = async (text, langName = 'English', onStart, onEnd) => {
  stopSpeaking();

  const cleanText = text
    .replace(/[#*_`~[\]()]/g, '')
    .replace(/₹/g, ' रुपये ')
    .replace(/%/g, ' प्रतिशत ')
    .replace(/•/g, '')
    .trim();

  if (!cleanText) {
    onEnd && onEnd();
    return false;
  }

  if (onStart) onStart();

  try {
    const audioUrl = await fetchAudioTTS({ text: cleanText, language: langName });
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    audio.onended = () => {
      currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.warn('Backend Audio play error, falling back to Web Speech:', e);
      fallbackWebSpeech(cleanText, langName, onEnd);
    };

    await audio.play();
    return true;
  } catch (err) {
    console.warn('Backend TTS fetch error, falling back to Web Speech:', err);
    fallbackWebSpeech(cleanText, langName, onEnd);
    return false;
  }
};

const fallbackWebSpeech = (cleanText, langName, onEnd) => {
  if (!('speechSynthesis' in window)) {
    onEnd && onEnd();
    return;
  }

  const langCode = getLangCode(langName);
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = langCode;
  utterance.rate = 0.95;

  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => v.lang.startsWith(langCode.substring(0, 2)));
  if (matchingVoice) utterance.voice = matchingVoice;

  utterance.onend = () => onEnd && onEnd();
  utterance.onerror = () => onEnd && onEnd();

  window.speechSynthesis.speak(utterance);
};
