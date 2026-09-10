import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calculator, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Store, 
  Milk, 
  Scissors, 
  Truck, 
  SunMedium, 
  Sprout,
  Landmark,
  BadgePercent
} from 'lucide-react';

const Home = () => {
  const { lang } = useLanguage();

  const businessCategories = [
    {
      id: 'dairy',
      name: 'डेयरी व पशुपालन',
      nameEn: 'Dairy & Animal Husbandry',
      icon: Milk,
      range: '₹50,000 - ₹15,00,000',
      scheme: 'Micro Finance / Term Loan',
      color: 'border-blue-300 bg-blue-50/50'
    },
    {
      id: 'grocery',
      name: 'किराना व रिटेल दुकान',
      nameEn: 'Grocery & Retail Store',
      icon: Store,
      range: '₹50,000 - ₹5,00,000',
      scheme: 'Laghu Vyavasay Yojana',
      color: 'border-amber-300 bg-amber-50/50'
    },
    {
      id: 'tailoring',
      name: 'सिलाई व बुटीक (महिला विशेष)',
      nameEn: 'Tailoring & Boutique',
      icon: Scissors,
      range: '₹20,000 - ₹1,40,000',
      scheme: 'Mahila Samriddhi Yojana (4% Rate)',
      color: 'border-pink-300 bg-pink-50/50'
    },
    {
      id: 'transport',
      name: 'ई-रिक्शा व ट्रांसपोर्ट',
      nameEn: 'E-Rickshaw & Transport',
      icon: Truck,
      range: '₹1,00,000 - ₹10,00,000',
      scheme: 'Green Business / Term Loan',
      color: 'border-emerald-300 bg-emerald-50/50'
    },
    {
      id: 'green',
      name: 'सोलर व हरित उद्यम',
      nameEn: 'Solar & Green Ventures',
      icon: SunMedium,
      range: '₹1,00,000 - ₹30,00,000',
      scheme: 'Green Business Scheme',
      color: 'border-teal-300 bg-teal-50/50'
    },
    {
      id: 'agri',
      name: 'कृषि प्रसंस्करण व मिल',
      nameEn: 'Agri Processing & Flour Mill',
      icon: Sprout,
      range: '₹5,00,000 - ₹25,00,000',
      scheme: 'Term Loan Tier 1 / Tier 2',
      color: 'border-indigo-300 bg-indigo-50/50'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section (Government Portal Style) */}
      <section className="bg-gradient-to-b from-white to-[#F5F7FA] border-b border-[#D9D9D9] py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center space-x-2 bg-blue-100/80 border border-[#0B3D91]/20 text-[#0B3D91] px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold">
            <Landmark className="w-4 h-4 text-[#0B3D91]" />
            <span>
              {lang === 'hi'
                ? 'स्मार्ट इंडिया हैकथॉन 2026 — राष्ट्रीय वित्तीय समावेशन'
                : 'Smart India Hackathon 2026 — National Financial Inclusion'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B3D91] tracking-tight leading-tight">
            {lang === 'hi' ? (
              <>
                अपने ग्रामीण व्यवसाय के लिए सही <span className="text-[#FF9933]">सरकारी लोन</span> व मार्जिन मनी जानें
              </>
            ) : (
              <>
                Find the Right <span className="text-[#FF9933]">Govt Concessional Loan</span> & Margin Structure for Your Business
              </>
            )}
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {lang === 'hi'
              ? 'बिना किसी दलाल या बिचौलिए के—अपनी पूंजी और व्यवसाय के अनुसार सही रियायती सरकारी योजना, 10% मार्जिन मनी, मासिक EMI और शुद्ध मुनाफे की सटीक गणना प्राप्त करें।'
              : 'Zero middlemen, zero guesswork. Match your business to verified concessional government schemes (NSFDC / MoSJE) with 100% deterministic margin money, EMI, and business viability projections.'}
          </p>

          {/* Primary CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/advisory"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0B3D91] hover:bg-[#082d6b] text-white font-bold rounded-md shadow-md flex items-center justify-center space-x-2 text-sm sm:text-base transition-all hover:scale-[1.02]"
            >
              <span>{lang === 'hi' ? 'अपनी योजना व लोन स्ट्रक्चर चेक करें' : 'Check Loan Structure Now'}</span>
              <ArrowRight className="w-4 h-4 text-[#FF9933]" />
            </Link>

            <Link
              to="/calculator"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#FF9933] hover:bg-[#f08a22] text-black font-bold rounded-md shadow-md flex items-center justify-center space-x-2 text-sm sm:text-base transition-all hover:scale-[1.02]"
            >
              <Calculator className="w-4 h-4" />
              <span>{lang === 'hi' ? 'ईएमआई व सब्सिडी कैलकुलेटर' : 'EMI & Subsidy Calculator'}</span>
            </Link>

            <Link
              to="/schemes"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-[#0B3D91] font-bold rounded-md border border-[#0B3D91] flex items-center justify-center space-x-2 text-sm sm:text-base transition-colors"
            >
              <span>{lang === 'hi' ? 'सभी सरकारी योजनाएं' : 'Explore All Schemes'}</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#138808] flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-800">
                {lang === 'hi' ? '10% मार्जिन मनी' : '10% Margin Money'}
              </span>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#138808] flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-800">
                {lang === 'hi' ? '4% - 8% रियायती ब्याज' : '4% - 8% Low Interest'}
              </span>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#138808] flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-800">
                {lang === 'hi' ? 'महिला उद्यमियों को 1% छूट' : '1% Women Rebate'}
              </span>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#138808] flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-800">
                {lang === 'hi' ? '3-9 माह मोरेटोरियम' : '3-9 Mo. Moratorium'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            {lang === 'hi' ? 'यह पोर्टल आपकी मदद कैसे करता है?' : 'How Rural Advisor Helps You'}
          </h2>
          <p className="text-sm text-slate-600 mt-1.5">
            {lang === 'hi'
              ? 'ग्रामीण उद्यमियों के लिए 4 सबसे बड़े फायदे'
              : '4 Core Pillars Built for Rural Micro-Entrepreneurs'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-md bg-blue-100 text-[#0B3D91] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-[#1A1A1A]">
              {lang === 'hi' ? 'सटीक योजना चयन' : 'Scheme Matching'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'hi'
                ? 'आपके व्यवसाय और निवेश बजट के अनुसार सही NSFDC / सरकारी योजना की तत्काल पहचान।'
                : 'Instantly matches your budget and trade to official concessional schemes from the database.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-md bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-[#1A1A1A]">
              {lang === 'hi' ? '100% सटीक लोन गणित' : 'Exact Loan Structuring'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'hi'
                ? 'मार्जिन मनी (5-10%), सरकारी लोन शेयर (90-95%), ब्याज और मासिक किश्त (EMI) का सही ब्रेकडाउन।'
                : 'Deterministic calculation of your own contribution, loan share, and repayment schedule.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-md bg-emerald-100 text-[#138808] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-[#1A1A1A]">
              {lang === 'hi' ? 'व्यवहार्यता व मुनाफा' : 'Viability Assessment'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'hi'
                ? 'मासिक खर्च, बिक्री और EMI के बाद शुद्ध बचत का वास्तविक अनुमान ताकि व्यवसाय कभी घाटे में न जाए।'
                : 'Projected operating costs, monthly revenues, and net profit after EMI to ensure loan safety.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#D9D9D9] shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-md bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-base text-[#1A1A1A]">
              {lang === 'hi' ? 'आसान स्थानीय भाषा' : 'Plain Language Guide'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'hi'
                ? 'बिना किसी जटिल बैंकिंग शब्दों के, हिंदी और सरल अंग्रेजी में पूर्ण कदम-दर-कदम मार्गदर्शन।'
                : 'Clear, encouraging bilingual narrative explaining what to do next without confusing jargon.'}
            </p>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
              {lang === 'hi' ? 'लोकप्रिय ग्रामीण व्यवसाय क्षेत्र' : 'Popular Rural Enterprise Sectors'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'इनमें से किसी भी व्यवसाय के लिए सरकारी रियायती लोन उपलब्ध है' : 'Eligible for concessional finance under NSFDC & Ministry schemes'}
            </p>
          </div>
          <Link
            to="/advisory"
            className="text-xs font-bold text-[#0B3D91] hover:underline flex items-center space-x-1"
          >
            <span>{lang === 'hi' ? 'अपना व्यवसाय चुनें' : 'Select Your Business'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className={`p-4 rounded-lg border ${cat.color} space-y-2 hover:shadow-sm transition-all`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[#0B3D91]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1A1A1A]">
                      {lang === 'hi' ? cat.name : cat.nameEn}
                    </h3>
                    <span className="text-[11px] text-slate-600 font-medium">
                      {cat.range}
                    </span>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">
                    {lang === 'hi' ? 'उपयुक्त योजना:' : 'Scheme:'}
                  </span>
                  <span className="font-bold text-[#0B3D91] text-[11px]">
                    {cat.scheme}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
