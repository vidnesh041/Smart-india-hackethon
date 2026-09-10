import React, { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { initSpeechRecognition } from '../utils/speechToText';
import { useLanguage } from '../context/LanguageContext';

const MicButton = ({ onTranscript, className = "" }) => {
  const { lang } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const startListening = () => {
    setErrorMsg(null);
    const recognition = initSpeechRecognition(
      (text) => {
        setIsListening(false);
        onTranscript && onTranscript(text);
      },
      (err) => {
        setIsListening(false);
        setErrorMsg('Mic access failed or not supported.');
        console.error('Speech recognition error:', err);
      },
      () => {
        setIsListening(false);
      },
      lang === 'hi' ? 'hi-IN' : 'en-IN'
    );

    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={startListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-orange-300 ${
          isListening
            ? 'bg-[#FF9933] text-black animate-mic-pulse scale-105'
            : 'bg-[#0B3D91] hover:bg-[#072a66] text-white'
        }`}
        title={lang === 'hi' ? 'बोलकर फॉर्म भरें' : 'Speak to fill details'}
      >
        {isListening ? (
          <Loader2 className="w-6 h-6 animate-spin text-black" />
        ) : (
          <Mic className="w-6 h-6 text-[#FF9933]" />
        )}
      </button>

      <span className="text-xs font-semibold mt-1.5 text-slate-700">
        {isListening
          ? (lang === 'hi' ? 'सुन रहे हैं...' : 'Listening...')
          : (lang === 'hi' ? 'बोलकर भरें' : 'Voice Input')}
      </span>

      {errorMsg && (
        <span className="text-[11px] text-red-600 mt-1 max-w-[160px] text-center">
          {errorMsg}
        </span>
      )}
    </div>
  );
};

export default MicButton;
