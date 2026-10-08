import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Wallet, Briefcase, Sparkles, ArrowRight, MessageSquareText, FileText } from 'lucide-react';
import ChatbotWidget from '../components/ChatbotWidget';
import MicButton from '../components/MicButton';

const CATEGORIES = [
  'Dairy & Livestock Farming',
  'Retail & Grocery Shop',
  'Textiles, Garments & Tailoring',
  'Electrical & Mobile Repair Workshop',
  'Agro Processing & Flour Mill',
  'E-Rickshaw & Commercial Transport',
  'Handicrafts & Artisans',
  'Beauty Parlour & Wellness',
  'Other Micro Business'
];

const InputPage = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state;
  const prefilled = locationState?.prefilledScheme;

  const [activeTab, setActiveTab] = useState(prefilled || locationState?.category ? 'form' : 'chat');
  const [location, setLocation] = useState(
    prefilled?.state && prefilled.state !== 'Central / All India'
      ? prefilled.state
      : (locationState?.location || '')
  );
  const [marginCapital, setMarginCapital] = useState(
    prefilled?.max_cost
      ? String(Math.round(prefilled.max_cost * 0.1))
      : (locationState?.available_margin_capital ? String(locationState.available_margin_capital) : '')
  );
  const [category, setCategory] = useState(
    locationState?.category && CATEGORIES.includes(locationState.category)
      ? locationState.category
      : CATEGORIES[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefilled) {
      setActiveTab('form');
      if (prefilled.state && prefilled.state !== 'Central / All India') {
        setLocation(prefilled.state);
      }
      if (prefilled.max_cost) {
        setMarginCapital(String(Math.round(prefilled.max_cost * 0.1)));
      }
    } else if (locationState?.category) {
      setActiveTab('form');
      const matched = CATEGORIES.find(c => c.toLowerCase().includes(locationState.category.toLowerCase()));
      if (matched) setCategory(matched);
    }
  }, [locationState, prefilled]);

  const handleVoiceInput = (text) => {
    if (!text) return;
    const numMatch = text.match(/\d+[\d,.]*/);
    if (numMatch && !marginCapital) {
      const numStr = numMatch[0].replace(/,/g, '');
      setMarginCapital(numStr);
    } else if (!location) {
      setLocation(text);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!marginCapital || parseFloat(marginCapital) <= 0) {
      alert('Kripya apna available margin capital darj karein (positive number).');
      return;
    }

    setIsSubmitting(true);
    navigate('/result', {
      state: {
        available_margin_capital: parseFloat(marginCapital),
        location: location || 'Rural District',
        business_category: category
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between pb-12">
      <div className="max-w-4xl mx-auto px-4 py-6 w-full">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600/60 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30">
                  SIH 2026 Problem Statement 26091
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Gemini AI Powered
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                Local Advisor — AI Business Advisor
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-xl">
                Apna business idea aur 10% Margin Capital batayein. Gemini AI aapko complete Financial Roadmap, 90% Govt Loan, aur SWOT Analysis samjhaega.
              </p>
            </div>

            {/* Mode Selector Buttons */}
            <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-sm border border-white/20 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'chat'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <MessageSquareText className="w-4 h-4" />
                <span>Local Advisor</span>
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'form'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Quick Form</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tab View */}
        {activeTab === 'chat' ? (
          <div>
            <ChatbotWidget />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900">3-Field Quick Financial Roadmap Form</h2>
              <MicButton onTranscript={handleVoiceInput} size="sm" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Field 1: Location */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  1. Geographic Location (गंतव्य स्थान)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Shirur Block, Pune District, Maharashtra"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Field 2: Margin Capital */}
              <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200">
                <label className="block text-sm font-extrabold text-emerald-950 mb-1 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  2. Available Margin Capital (आपकी मार्जिन राशि) *
                </label>
                <p className="text-xs text-emerald-800 font-semibold mb-2">
                  *Yeh woh raashi hai jo aapke paas already hai (project cost ka 10%)
                </p>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={marginCapital}
                    onChange={(e) => setMarginCapital(e.target.value)}
                    placeholder="100000"
                    className="w-full pl-9 pr-4 py-3.5 border-2 border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-600 font-black text-lg text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Field 3: Business Category */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  3. Proposed Business Category (व्यवसाय श्रेणी)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium bg-white"
                >
                  {CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-base"
              >
                {isSubmitting ? <span>Calculating...</span> : (
                  <>
                    <span>Financial Roadmap & Feasibility Report Dekhein</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPage;
