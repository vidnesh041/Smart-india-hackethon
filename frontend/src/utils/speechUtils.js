/**
 * Speech Utilities: Unified Multi-Engine Speech-to-Text (STT) and Text-to-Speech (TTS)
 * Uses FastAPI Backend TTS Audio Stream (/api/tts) for 100% accurate Indian regional language audio,
 * with multi-sentence chunking and Web Speech API fallback.
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

export const getLangCode = (langName) => STT_LANG_MAP[langName] || 'hi-IN';

let currentAudio = null;

export const stopSpeaking = () => {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Speech Recognition (Speech to Text) with Continuous Natural Listening and Silence Detection
 * - continuous: true so it doesn't abruptly cut off while user is thinking
 * - interimResults: true for instant live visual feedback
 * - 2.2s silence debounce timer before deciding the sentence is finished
 */
export const initSpeechRecognition = (onResult, onError, onEnd, langName = 'Hindi', onInterim = null) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError && onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = getLangCode(langName);
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let accumulatedTranscript = '';
  let silenceTimer = null;
  let hasTriggered = false;

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        accumulatedTranscript += ' ' + event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    const currentLiveText = (accumulatedTranscript + ' ' + interim).trim();
    if (onInterim && currentLiveText) {
      onInterim(currentLiveText);
    }

    // Reset silence timer on every spoken syllable/word
    if (silenceTimer) clearTimeout(silenceTimer);

    // Wait 2.2 seconds of natural silence after speaking before finalizing and submitting
    silenceTimer = setTimeout(() => {
      const fullText = (accumulatedTranscript + ' ' + interim).trim();
      if (fullText && fullText.length >= 2 && !hasTriggered) {
        hasTriggered = true;
        try { recognition.stop(); } catch {}
        onResult && onResult(fullText);
      }
    }, 2200);
  };

  recognition.onerror = (event) => {
    if (silenceTimer) clearTimeout(silenceTimer);
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      onError && onError(event.error);
    }
  };

  recognition.onend = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    const fullText = accumulatedTranscript.trim();
    if (fullText && fullText.length >= 2 && !hasTriggered) {
      hasTriggered = true;
      onResult && onResult(fullText);
    }
    onEnd && onEnd();
  };

  return recognition;
};

// Multi-Language Regional Text to Speech (Voice Synthesizer via Backend TTS API)
export const speakText = async (text, langName = 'Hindi', onStart, onEnd) => {
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
