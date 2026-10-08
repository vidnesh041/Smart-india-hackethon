import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Sparkles, RefreshCw, Landmark, ChevronRight, Globe, Volume2, VolumeX, Plus } from 'lucide-react';
import MicButton from './MicButton';
import GeminiLiveVoiceModal from './GeminiLiveVoiceModal';
import { sendChatMessage } from '../services/api';
import { speakText, stopSpeaking, initSpeechRecognition } from '../utils/speechUtils';
import { useLanguage } from '../context/LanguageContext';

const QUICK_PROMPTS = [
  "What is the 90% Govt Loan eligibility for ₹1,00,000 margin capital?",
  "Explain SWOT Analysis for Dairy Farming business.",
  "Which documents are required for loan application?",
  "How to manage working capital during moratorium period?"
];

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

const ChatbotWidget = () => {
  const { lang: globalLang, setLang: setGlobalLang } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(
    globalLang === 'hi' ? 'Hindi' : globalLang === 'en' ? 'English' : (globalLang || 'English')
  );
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: 'Hello! 🙏 I am **Local Advisor** — your AI Rural Business Mentor.\n\nPlease tell me about your business idea, your location, and how much **Margin Capital (10% Cash)** you have available? I will guide you through your complete financial roadmap and SWOT analysis!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Gemini Live Voice Overlay state
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle' | 'speaking' | 'listening' | 'processing'
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const [latestUserTranscript, setLatestUserTranscript] = useState('');
  const [latestAiResponse, setLatestAiResponse] = useState('');

  const messagesEndRef = useRef(null);
  const isLiveModalOpenRef = useRef(isLiveModalOpen);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (globalLang) {
      const normLang = globalLang === 'hi' ? 'Hindi' : globalLang === 'en' ? 'English' : globalLang;
      if (normLang !== selectedLanguage) {
        handleLanguageChange(normLang, false);
      }
    }
  }, [globalLang]);

  useEffect(() => {
    isLiveModalOpenRef.current = isLiveModalOpen;
    if (!isLiveModalOpen) {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setVoiceStatus('idle');
    } else {
      // Start live voice loop
      startHandsFreeListening();
    }
  }, [isLiveModalOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, voiceStatus]);

  function startHandsFreeListening() {
    if (!isLiveModalOpenRef.current) return;
    setVoiceStatus('listening');

    const rec = initSpeechRecognition(
      (transcript) => {
        if (transcript && isLiveModalOpenRef.current) {
          setLatestUserTranscript(transcript);
          handleSendMessage(transcript);
        }
      },
      (err) => {
        console.warn('Voice listening error/timeout:', err);
        if (isLiveModalOpenRef.current) {
          setTimeout(() => startHandsFreeListening(), 1000);
        }
      },
      () => {
        // ended
      },
      selectedLanguage
    );

    if (rec) {
      recognitionRef.current = rec;
      try {
        rec.start();
      } catch (e) {
        console.warn('Speech rec start error:', e);
      }
    }
  };

  async function handleSendMessage(textToSend) {
    const text = textToSend || inputMessage;
    if (!text || (typeof text === 'string' && !text.trim())) return;

    stopSpeaking();
    setSpeakingMsgIdx(null);

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    if (isLiveModalOpenRef.current) setVoiceStatus('processing');

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await sendChatMessage({
        message: text,
        chat_history: historyPayload,
        language: selectedLanguage
      });

      const replyText = res.reply || 'Main aapki baat samajh gaya hun.';
      const botMsg = {
        role: 'model',
        content: replyText,
        financial_plan: res.financial_plan,
        swot: res.swot,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setLatestAiResponse(replyText);

      // If Live Voice Modal is active, trigger Voice Output (TTS) -> then start Listening again
      if (isLiveModalOpenRef.current) {
        setVoiceStatus('speaking');
        speakText(
          replyText,
          selectedLanguage,
          () => setVoiceStatus('speaking'),
          () => {
            if (isLiveModalOpenRef.current) {
              startHandsFreeListening();
            } else {
              setVoiceStatus('idle');
            }
          }
        );
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errText = 'Please check your internet connection. I am ready to help you.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: errText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      if (isLiveModalOpenRef.current) {
        speakText(errText, selectedLanguage, () => setVoiceStatus('speaking'), () => setVoiceStatus('idle'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicTranscript = (text) => {
    if (text) {
      setInputMessage(text);
      handleSendMessage(text);
    }
  };

  const handleToggleSpeakMessage = (index, text) => {
    if (speakingMsgIdx === index) {
      stopSpeaking();
      setSpeakingMsgIdx(null);
    } else {
      stopSpeaking();
      setSpeakingMsgIdx(index);
      speakText(
        text,
        selectedLanguage,
        () => setSpeakingMsgIdx(index),
        () => setSpeakingMsgIdx(null)
      );
    }
  };

  function handleLanguageChange(newLang, updateGlobal = true) {
    const normLang = newLang === 'hi' ? 'Hindi' : newLang === 'en' ? 'English' : newLang;
    setSelectedLanguage(normLang);
    if (updateGlobal && setGlobalLang) {
      setGlobalLang(normLang);
    }
    stopSpeaking();
    setSpeakingMsgIdx(null);

    const greetings = {
      Hindi: "नमस्ते! 🙏 मैं **Local Advisor** हूँ। भाषा को **हिंदी** पर सेट किया गया है। बताएं आपका बिजनेस आईडिया क्या है?",
      Marathi: "नमस्कार! 🙏 मी **Local Advisor** आहे. भाषा **मराठी** मध्ये सेट केली आहे. सांगा तुमचा व्यवसाय काय आहे?",
      English: "Hello! 🙏 I am **Local Advisor**. Language set to **English**. Tell me about your business idea?",
      Hinglish: "Namaste! 🙏 Main **Local Advisor** hun. Language **Hinglish** me set ho gayi hai. Bataiye aapka kya business idea hai?",
      Gujarati: "નમસ્તે! 🙏 હું **Local Advisor** છું. ભાષા **ગુજરાતી** માં સેટ કરવામાં આવી છે. તમારા વ્યવસાય વિચાર વિશે જણાવો?",
      Bengali: "নমস্কার! 🙏 আমি **Local Advisor**। ভাষা **বাংলা** সেট করা হয়েছে। আপনার ব্যবসা সম্পর্কিত ধারণা বলুন?",
      Tamil: "வணக்கம்! 🙏 நான் **Local Advisor**. மொழி **தமிழ்** ஆக அமைக்கப்பட்டுள்ளது. உங்கள் வணிக யோசனை என்ன?",
      Telugu: "నమస్కారం! 🙏 నేను **Local Advisor**. భాష **తెలుగు**కి మార్చబడింది. మీ వ్యాపార ఆలోచన ఏమిటి?"
    };

    const newGreeting = greetings[normLang] || greetings.English;

    // Refresh chat window completely & start new conversation
    setMessages([
      {
        role: 'model',
        content: newGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    if (isLiveModalOpenRef.current) {
      setVoiceStatus('speaking');
      speakText(newGreeting, normLang, () => setVoiceStatus('speaking'), () => startHandsFreeListening());
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setIsLiveModalOpen(false);
    setVoiceStatus('idle');
    setMessages([
      {
        role: 'model',
        content: `Hello! 🙏 I am **Local Advisor** (${selectedLanguage} mode). Please tell me about your business idea or available margin capital?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[700px] max-w-4xl mx-auto text-slate-800">
      {/* Header Bar (Light Emerald/Teal Style) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-4 px-6 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600/80 border border-emerald-400/40 flex items-center justify-center text-emerald-100 font-bold shadow-inner">
            <Bot className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-wide text-white">Local Advisor</h2>
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1 font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Gemini 3.6 AI
              </span>
            </div>
            <p className="text-emerald-100 text-xs mt-0.5">Micro-Entrepreneur Mentor & Scheme Router</p>
          </div>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-sm text-xs transition-colors">
            <Globe className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-1"
              title="Select Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-slate-900 font-medium">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetChat}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            title="Reset Conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Message Feed (Light Background) */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-emerald-700 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-300" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                msg.role === 'user'
                  ? 'bg-indigo-700 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
              }`}
            >
              {/* Audio Listen Button for Model Messages */}
              {msg.role === 'model' && (
                <button
                  onClick={() => handleToggleSpeakMessage(index, msg.content)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 transition-colors shadow-2xs"
                  title="Listen to message voice readout"
                >
                  {speakingMsgIdx === index ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  )}
                </button>
              )}

              {/* Formatted Text Content */}
              <div className="whitespace-pre-line font-medium space-y-2 pr-6">
                {msg.content.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Inline Financial Plan Card */}
              {msg.financial_plan && !msg.financial_plan.out_of_scope && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-slate-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 border-b border-emerald-200 pb-1.5">
                    <Landmark className="w-4 h-4 text-emerald-700" />
                    <span>Calculated Financial Roadmap (Module 2)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <div className="bg-white p-2 rounded border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block">Total Project Cost:</span>
                      <span className="text-emerald-900 font-extrabold text-sm">₹{msg.financial_plan.project_cost?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block">Govt Loan (90%):</span>
                      <span className="text-indigo-900 font-extrabold text-sm">₹{msg.financial_plan.loan_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-900 font-medium bg-emerald-100/70 p-2 rounded flex items-center justify-between">
                    <span>Scheme: <strong>{msg.financial_plan.scheme_selected}</strong></span>
                    <span>{msg.financial_plan.interest_rate}% Interest | {msg.financial_plan.tenure_years} Years</span>
                  </div>
                </div>
              )}

              {/* Inline SWOT Grid */}
              {msg.swot && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900">
                  <span className="text-xs font-bold text-slate-800 block mb-2">📊 SWOT Analysis Quadrants:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-emerald-100/60 p-2 rounded text-emerald-950 font-medium">
                      <strong className="block text-emerald-900">Strengths:</strong>
                      {msg.swot.strengths?.[0] || 'Local market presence'}
                    </div>
                    <div className="bg-red-100/60 p-2 rounded text-red-950 font-medium">
                      <strong className="block text-red-900">Weaknesses:</strong>
                      {msg.swot.weaknesses?.[0] || 'Initial working capital'}
                    </div>
                    <div className="bg-blue-100/60 p-2 rounded text-blue-950 font-medium">
                      <strong className="block text-blue-900">Opportunities:</strong>
                      {msg.swot.opportunities?.[0] || '5-10 km radius demand'}
                    </div>
                    <div className="bg-amber-100/60 p-2 rounded text-amber-950 font-medium">
                      <strong className="block text-amber-900">Threats:</strong>
                      {msg.swot.threats?.[0] || 'Seasonal fluctuations'}
                    </div>
                  </div>
                </div>
              )}

              <span className={`text-[10px] block mt-2 text-right ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 animate-pulse bg-white p-3 rounded-2xl max-w-xs border border-slate-200">
            <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>Local Advisor ({selectedLanguage}) is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-slate-100 px-4 py-2 border-t border-slate-200 overflow-x-auto flex items-center gap-2 text-xs scrollbar-none">
        <span className="text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap">Suggested:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300 font-medium whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs text-[11px]"
          >
            <span>{prompt}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Gemini Pill Input Bar (Light Theme) */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-center">
        <div className="bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-full p-2 px-4 w-full max-w-3xl flex items-center gap-3 shadow-md transition-colors">
          
          {/* Plus Button (+) */}
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
            title="Add Context / Attachment"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Text Input ("Ask Local Advisor") */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Local Advisor..."
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none text-sm font-medium"
          />

          {/* Single Mic Input Button (Green Circle 🎙️) */}
          <MicButton onTranscript={handleMicTranscript} size="sm" />

          {/* Circular Blue Gemini Live Voice Assistant Button (Speech Soundwave Spectrum 📊) */}
          <button
            onClick={() => setIsLiveModalOpen(true)}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all hover:scale-105 group relative"
            title="Launch Gemini Live Speech-to-Speech Assistant"
          >
            {/* Distinctive Soundwave Spectrum Icon */}
            <svg
              className="w-5 h-5 text-white group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 10v4" />
              <path d="M8 7v10" />
              <path d="M12 3v18" />
              <path d="M16 7v10" />
              <path d="M20 10v4" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-white animate-ping" />
          </button>
        </div>
      </div>

      {/* Full-Screen Gemini Live Voice Overlay Modal */}
      <GeminiLiveVoiceModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        voiceStatus={voiceStatus}
        latestUserTranscript={latestUserTranscript}
        latestAiResponse={latestAiResponse}
      />
    </div>
  );
};

export default ChatbotWidget;
