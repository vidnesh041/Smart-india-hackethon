import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Info, HeartHandshake } from 'lucide-react';

const Footer = () => {
  const { lang } = useLanguage();

  return (
    <footer className="bg-[#E9EEF5] border-t border-[#D9D9D9] mt-16 text-[#5A5A5A] text-sm">
      {/* Trust Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 border-b border-[#D9D9D9] grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#0B3D91] text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#1A1A1A]">
              {lang === 'hi' ? '100% सटीक गणित' : '100% Accurate Math'}
            </h4>
            <p className="text-xs">
              {lang === 'hi' ? 'सरकारी नियमों के आधार पर निश्चित गणना' : 'Deterministic calculation per govt rules'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#138808] text-white flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#1A1A1A]">
              {lang === 'hi' ? 'दलालों से मुक्ति' : 'Zero Middleman Dependency'}
            </h4>
            <p className="text-xs">
              {lang === 'hi' ? 'सीधे सरकारी योजनाओं की पारदर्शी जानकारी' : 'Direct, transparent scheme information'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#FF9933] text-black flex items-center justify-center font-bold">
            AI
          </div>
          <div>
            <h4 className="font-bold text-[#1A1A1A]">
              {lang === 'hi' ? 'सरल भाषा में सलाह' : 'Plain Language Guidance'}
            </h4>
            <p className="text-xs">
              {lang === 'hi' ? 'बिना किसी जटिल बैंकिंग शब्दों के' : 'Easy to understand without financial jargon'}
            </p>
          </div>
        </div>
      </div>

      {/* Official Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-center">
        <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-md text-xs sm:text-sm font-medium mb-3">
          <Info className="w-4 h-4 flex-shrink-0 text-amber-700" />
          <span>
            {lang === 'hi'
              ? 'यह एक एआई-सहायक मार्गदर्शन और वित्तीय संरचना कैलकुलेटर है। आवेदन करने से पहले अपने नजदीकी सीएससी केंद्र, जिला उद्योग केंद्र (DIC) या बैंक शाखा से अंतिम विवरण अवश्य सत्यापित करें।'
              : 'This is an AI-assisted guidance and financial structuring calculator. Please verify all final details with your nearest CSC, DIC, or bank branch before applying.'}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Smart India Hackathon 2026 — Problem Statement ID: 26091 | Based on NSFDC & MoSJE Scheme Norms
        </p>
      </div>
    </footer>
  );
};

export default Footer;
