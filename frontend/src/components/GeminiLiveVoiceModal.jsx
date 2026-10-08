import React, { useEffect } from 'react';
import { X, Sparkles, PhoneOff, Globe } from 'lucide-react';
import { stopSpeaking } from '../utils/speechUtils';

const LANGUAGES = [
  { code: 'English', label: '🌐 English' },
  { code: 'Hindi', label: '🇮🇳 Hindi (हिंदी)' },
  { code: 'Marathi', label: '🇮🇳 Marathi (मराठी)' },
  { code: 'Hinglish', label: '🇮🇳 Hinglish' },
  { code: 'Gujarati', label: '🇮🇳 Gujarati (ગુજરાતી)' },
  { code: 'Bengali', label: '🇮🇳 Bengali (বাংলা)' },
  { code: 'Tamil', label: '🇮🇳 Tamil (தமிழ்)' },
  { code: 'Telugu', label: '🇮🇳 Telugu (తెలుగు)' }
];

const GeminiLiveVoiceModal = ({
  isOpen,
  onClose,
  selectedLanguage,
  onLanguageChange,
  voiceStatus, // 'listening' | 'speaking' | 'processing' | 'idle'
  latestUserTranscript,
  latestAiResponse
}) => {
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex flex-col justify-between p-6 text-white animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Local Advisor</span>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-400/30">
                LIVE VOICE
              </span>
            </h2>
            <p className="text-xs text-slate-300">Gemini Live Speech-to-Speech Assistant</p>
          </div>
        </div>

        {/* Top Controls: Language Switcher & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1 text-xs"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-slate-900 font-medium">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
            title="End Live Voice Session"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Central Visualizer & Live Orb Animation */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full my-auto text-center space-y-8">
        
        {/* Gemini Live Soundwave Orb */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Outer Aura Glow */}
          <div
            className={`absolute w-64 h-64 rounded-full blur-3xl transition-all duration-700 ${
              voiceStatus === 'speaking'
                ? 'bg-blue-500/40 scale-125 animate-pulse'
                : voiceStatus === 'listening'
                ? 'bg-emerald-500/40 scale-110 animate-ping'
                : voiceStatus === 'processing'
                ? 'bg-purple-500/40 scale-100 animate-spin'
                : 'bg-blue-600/20 scale-90'
            }`}
          />

          {/* Central Animated Orb */}
          <div
            className={`w-44 h-44 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative border-2 ${
              voiceStatus === 'speaking'
                ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 border-cyan-300 shadow-blue-500/50 scale-105'
                : voiceStatus === 'listening'
                ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 border-emerald-300 shadow-emerald-500/50 scale-110'
                : voiceStatus === 'processing'
                ? 'bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-500 border-purple-300 shadow-purple-500/50 animate-pulse'
                : 'bg-gradient-to-tr from-slate-800 to-slate-900 border-slate-700'
            }`}
          >
            {/* Inner Sound Wave Graphic */}
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 rounded-full bg-white transition-all duration-300 ${voiceStatus === 'speaking' || voiceStatus === 'listening' ? 'h-10 animate-bounce' : 'h-4'}`} />
              <span className={`w-1.5 rounded-full bg-white transition-all duration-300 ${voiceStatus === 'speaking' || voiceStatus === 'listening' ? 'h-16 animate-bounce delay-75' : 'h-7'}`} />
              <span className={`w-1.5 rounded-full bg-white transition-all duration-300 ${voiceStatus === 'speaking' || voiceStatus === 'listening' ? 'h-20 animate-bounce delay-150' : 'h-10'}`} />
              <span className={`w-1.5 rounded-full bg-white transition-all duration-300 ${voiceStatus === 'speaking' || voiceStatus === 'listening' ? 'h-14 animate-bounce delay-100' : 'h-6'}`} />
              <span className={`w-1.5 rounded-full bg-white transition-all duration-300 ${voiceStatus === 'speaking' || voiceStatus === 'listening' ? 'h-8 animate-bounce' : 'h-3'}`} />
            </div>
          </div>
        </div>

        {/* Live Status Text */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black tracking-wide text-white">
            {voiceStatus === 'speaking' && 'Local Advisor is Speaking...'}
            {voiceStatus === 'listening' && 'Listening... Speak Now'}
            {voiceStatus === 'processing' && 'Thinking & Processing...'}
            {voiceStatus === 'idle' && 'Gemini Live Ready'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Language: <span className="text-blue-400 font-bold">{selectedLanguage}</span> — Bharatiya Voice Synthesis Active
          </p>
        </div>

        {/* Dynamic Transcription Card */}
        <div className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-left max-h-40 overflow-y-auto space-y-2 backdrop-blur-md shadow-xl">
          {latestUserTranscript && (
            <div className="text-xs text-indigo-300">
              <strong className="text-slate-400 block text-[10px] uppercase">You said:</strong>
              <p className="font-medium mt-0.5">"{latestUserTranscript}"</p>
            </div>
          )}
          {latestAiResponse && (
            <div className="text-xs text-emerald-300 pt-1 border-t border-slate-800">
              <strong className="text-slate-400 block text-[10px] uppercase">Local Advisor:</strong>
              <p className="font-medium mt-0.5 line-clamp-3">{latestAiResponse}</p>
            </div>
          )}
          {!latestUserTranscript && !latestAiResponse && (
            <p className="text-xs text-slate-400 italic text-center py-2">
              Speak naturally into your microphone. Local Advisor will respond dynamically aloud.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="max-w-md mx-auto w-full pb-6 flex items-center justify-center gap-6">
        <button
          onClick={() => {
            stopSpeaking();
            onClose();
          }}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          title="End Live Voice Session"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

export default GeminiLiveVoiceModal;
