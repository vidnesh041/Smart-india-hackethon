import React, { useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { initSpeechRecognition } from '../utils/speechToText';
import { useLanguage } from '../context/LanguageContext';

const MicButton = ({ onTranscript, className = "", size = "md" }) => {
  const { lang } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const startListening = () => {
    setShowTooltip(false);
    const recognition = initSpeechRecognition(
      (text) => {
        setIsListening(false);
        onTranscript && onTranscript(text);
      },
      (err) => {
        setIsListening(false);
        console.warn('Speech recognition fallback:', err);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000);
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
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000);
      }
    } else {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 4000);
    }
  };

  const btnSizes = {
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-14 h-14 text-base"
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={startListening}
        className={`${btnSizes[size] || btnSizes.md} rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-amber-300 ${
          isListening
            ? 'bg-amber-500 text-black animate-pulse scale-105'
            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
        }`}
        title={lang === 'hi' ? 'बोलकर संदेश दर्ज करें' : 'Speak your input'}
      >
        {isListening ? (
          <Loader2 className="w-5 h-5 animate-spin text-black" />
        ) : (
          <Mic className="w-5 h-5 text-amber-300" />
        )}
      </button>

      {showTooltip && (
        <div className="absolute bottom-full mb-2 w-48 bg-slate-800 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-xl text-center z-30 font-medium">
          Mic blocked or unsupported. Please type text directly.
        </div>
      )}
    </div>
  );
};

export default MicButton;
