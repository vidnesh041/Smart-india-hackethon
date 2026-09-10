import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, Globe, Sparkles, BookOpen, FileText, Calculator } from 'lucide-react';

const Navbar = () => {
  const { lang, toggleLanguage } = useLanguage();
  const location = useLocation();

  return (
    <header className="bg-[#0B3D91] text-white shadow-md sticky top-0 z-50">
      {/* Top Gov Trust Bar */}
      <div className="bg-[#072a66] py-1 px-4 text-xs flex justify-between items-center text-slate-200 border-b border-[#0f4aab]">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#138808]"></span>
          <span>SIH 2026 Problem Statement ID: 26091</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Ministry of Social Justice & Empowerment (MoSJE) Guidelines</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-[#FF9933] font-medium hidden md:inline">100% Free & Neutral Advisory</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <Link to="/" className="flex items-center space-x-3 text-white hover:opacity-95 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-white text-[#0B3D91] flex items-center justify-center font-bold shadow-inner border-2 border-[#FF9933]">
            <Landmark className="w-6 h-6 text-[#0B3D91]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                {lang === 'hi' ? 'SAMARTH (समर्थ)' : 'SAMARTH AI'}
              </span>
              <span className="bg-[#FF9933] text-black text-[11px] font-bold px-1.5 py-0.5 rounded">
                AI + MATH
              </span>
            </div>
            <p className="text-xs text-blue-100 font-normal">
              {lang === 'hi'
                ? 'ग्रामीण वित्तीय व बिजनेस सलाहकार'
                : 'Rural Business & Financial Advisory'}
            </p>
          </div>
        </Link>

        {/* Action Links & Language Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/schemes"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/schemes'
                ? 'bg-[#072a66] text-[#FF9933] border border-[#FF9933]'
                : 'text-blue-100 hover:bg-[#072a66]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">
              {lang === 'hi' ? 'योजनाएं' : 'Schemes'}
            </span>
          </Link>

          <Link
            to="/calculator"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/calculator'
                ? 'bg-[#072a66] text-[#FF9933] border border-[#FF9933]'
                : 'text-blue-100 hover:bg-[#072a66]'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#FF9933]" />
            <span className="hidden md:inline">
              {lang === 'hi' ? 'कैलकुलेटर' : 'Calculator'}
            </span>
          </Link>

          <Link
            to="/advisory"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm ${
              location.pathname === '/advisory'
                ? 'bg-[#FF9933] text-black'
                : 'bg-white text-[#0B3D91] hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {lang === 'hi' ? 'योजना जाने' : 'Find Scheme'}
            </span>
          </Link>

          {/* Bilingual Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 bg-[#072a66] hover:bg-[#051f4d] text-white px-3 py-1.5 rounded-md text-sm font-medium border border-blue-400 transition-colors"
            title="Toggle Hindi / English"
          >
            <Globe className="w-4 h-4 text-[#FF9933]" />
            <span className="font-semibold">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
