import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Award, 
  CheckCircle2, 
  IndianRupee, 
  Percent, 
  Calendar, 
  Clock, 
  TrendingUp, 
  FileDown, 
  RotateCcw, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Landmark,
  Layers,
  Volume2,
  VolumeX,
  MapPin
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { speakText, stopSpeaking } from '../utils/speechUtils';
import DistrictFinder from './DistrictFinder';

const ResultCard = ({ data, onReset, userState = "Uttar Pradesh", userDistrict = "" }) => {
  const { lang } = useLanguage();
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showBusinessPlan, setShowBusinessPlan] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clean up any speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!data) return null;

  const {
    matched_scheme,
    alternate_schemes,
    loan_structure,
    business_viability,
    ai_advisory_text,
    ai_advisory_text_hi,
    business_action_plan,
    business_action_plan_hi,
    application_steps,
    application_steps_hi,
    disclaimer
  } = data;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rural_Advisory_${matched_scheme.scheme_name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Could not export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const narrative = lang === 'hi' ? (ai_advisory_text_hi || ai_advisory_text) : ai_advisory_text;
  const actionPlan = lang === 'hi' ? business_action_plan_hi : business_action_plan;
  const appSteps = lang === 'hi' ? application_steps_hi : application_steps;

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const textToSpeak = `${matched_scheme.scheme_name}. ${narrative}`;
      speakText(
        textToSpeak,
        lang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D9D9D9] shadow-sm">
        <div className="flex items-center space-x-2 text-[#0B3D91]">
          <Award className="w-6 h-6 text-[#138808]" />
          <span className="font-bold text-base sm:text-lg">
            {lang === 'hi' ? 'आपकी व्यक्तिगत सरकारी वित्तीय रिपोर्ट तैयार है' : 'Personalized Govt Financial Advisory Ready'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Text to Speech Voice Button */}
          <button
            onClick={toggleSpeech}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
              isSpeaking
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
            }`}
            title="Listen to advice"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
            <span>{isSpeaking ? (lang === 'hi' ? 'आवाज रोकें' : 'Stop Audio') : (lang === 'hi' ? 'सलाह सुनें' : 'Listen Advice')}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === 'hi' ? 'नया फॉर्म भरें' : 'Start Over'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#0B3D91] hover:bg-[#072a66] rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 text-[#FF9933]" />
            <span>{isExporting ? (lang === 'hi' ? 'डाउनलोड हो रहा है...' : 'Exporting...') : (lang === 'hi' ? 'PDF डाउनलोड करें' : 'Download PDF')}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div ref={reportRef} className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#0B3D91] shadow-md space-y-6">
        
        {/* Certificate Style Header */}
        <div className="border-b-2 border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-[#0B3D91] border border-blue-200 px-2.5 py-1 rounded text-xs font-bold mb-2">
              <Landmark className="w-3.5 h-3.5" />
              <span>{matched_scheme.agency}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3D91]">
              {lang === 'hi' ? matched_scheme.scheme_name_hi : matched_scheme.scheme_name}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'hi' ? matched_scheme.description_hi : matched_scheme.description}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-center flex-shrink-0">
            <div className="flex items-center justify-center space-x-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#138808]" />
              <span>{lang === 'hi' ? 'सत्यापित योजना' : 'Matched Scheme'}</span>
            </div>
            <div className="text-2xl font-black text-emerald-800 mt-0.5">
              {loan_structure.effective_interest_rate}% <span className="text-xs font-normal text-slate-600">p.a.</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {loan_structure.interest_rebate_applied > 0 
                ? (lang === 'hi' ? 'महिला छूट लागू' : 'Women Rebate Applied') 
                : (lang === 'hi' ? 'रियायती ब्याज दर' : 'Concessional Rate')}
            </div>
          </div>
        </div>

        {/* 4-Stat Numbers Grid (100% Deterministic Calculations) */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {lang === 'hi' ? 'लोन संरचना विवरण (100% सटीक गणित)' : 'Financial Structuring Breakdown (Exact Math)'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat 1: Total Project Cost */}
            <div className="bg-[#F5F7FA] border border-[#D9D9D9] p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
                <span>{lang === 'hi' ? 'कुल प्रोजेक्ट लागत' : 'Total Project Cost'}</span>
                <IndianRupee className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-extrabold text-[#1A1A1A]">
                ₹{loan_structure.total_project_cost.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {lang === 'hi' ? 'व्यवसाय शुरू करने का पूरा बजट' : 'Total capital required'}
              </p>
            </div>

            {/* Stat 2: Margin Money */}
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1">
                <span>{lang === 'hi' ? 'मार्जिन मनी (आपकी जेब से)' : 'Margin Money (Your Share)'}</span>
                <span className="bg-[#FF9933] text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  {loan_structure.margin_percent}%
                </span>
              </div>
              <div className="text-2xl font-black text-amber-950">
                ₹{loan_structure.margin_money.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-amber-800 mt-1 font-medium">
                {lang === 'hi' ? 'केवल इतना आपको खुद लगाना है' : 'Upfront contribution required'}
              </p>
            </div>

            {/* Stat 3: Govt Loan Amount */}
            <div className="bg-blue-50 border border-blue-300 p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-blue-900 font-bold mb-1">
                <span>{lang === 'hi' ? 'सरकारी रियायती लोन' : 'Govt Concessional Loan'}</span>
                <span className="bg-[#0B3D91] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  {loan_structure.loan_percent}%
                </span>
              </div>
              <div className="text-2xl font-black text-[#0B3D91]">
                ₹{loan_structure.loan_amount.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-blue-800 mt-1 font-medium">
                {lang === 'hi' ? 'सरकार / बैंक द्वारा स्वीकृत ऋण' : 'Funded by SCA / Govt Scheme'}
              </p>
            </div>

            {/* Stat 4: Monthly EMI */}
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
                <span>{lang === 'hi' ? 'मासिक किश्त (EMI)' : 'Monthly EMI'}</span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  {loan_structure.tenure_years} {lang === 'hi' ? 'वर्ष' : 'Yrs'}
                </span>
              </div>
              <div className="text-2xl font-black text-[#138808]">
                ₹{loan_structure.monthly_emi.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 font-medium">
                {lang === 'hi' ? `${loan_structure.moratorium_months} माह मोरेटोरियम (छूट) के बाद` : `After ${loan_structure.moratorium_months} months moratorium`}
              </p>
            </div>

          </div>
        </div>

        {/* Business Viability & Net Profit Summary */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 p-5 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#138808]" />
              <h3 className="font-bold text-base sm:text-lg text-emerald-950">
                {lang === 'hi' ? 'व्यवसाय व्यवहार्यता व मुनाफा अनुमान' : 'Business Viability & Projected Profitability'}
              </h3>
            </div>
            <div className="inline-flex items-center space-x-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? `व्यवहार्यता स्कोर: ${business_viability.viability_score}/100` : `Viability Score: ${business_viability.viability_score}/100`}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <span className="text-xs text-slate-500 font-medium">
                {lang === 'hi' ? 'अनुमानित मासिक बिक्री' : 'Est. Monthly Revenue'}
              </span>
              <div className="text-lg font-bold text-slate-800">
                ₹{business_viability.estimated_monthly_revenue.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <span className="text-xs text-slate-500 font-medium">
                {lang === 'hi' ? 'अनुमानित मासिक खर्च (कच्चा माल/मेंटेनेंस)' : 'Est. Monthly Operating Cost'}
              </span>
              <div className="text-lg font-bold text-slate-800">
                ₹{business_viability.estimated_monthly_expense.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border-2 border-emerald-500 bg-emerald-50/50">
              <span className="text-xs text-emerald-800 font-bold">
                {lang === 'hi' ? 'EMI के बाद शुद्ध मासिक बचत' : 'Net Monthly Profit After EMI'}
              </span>
              <div className="text-xl font-extrabold text-[#138808]">
                ₹{business_viability.estimated_net_monthly_profit.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-emerald-900 font-medium bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200">
            {lang === 'hi' ? business_viability.viability_note_hi : business_viability.viability_note}
          </p>
        </div>

        {/* AI Advisory Narrative (Bilingual Plain-Language Guidance) */}
        <div className="bg-slate-50 border border-slate-300 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#FF9933]" />
              <h3 className="font-bold text-base text-[#1A1A1A]">
                {lang === 'hi' ? 'सरल भाषा में वित्तीय सलाह व मार्गदर्शन' : 'Plain Language Financial Advisory Guide'}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleSpeech}
                className="p-1.5 bg-white hover:bg-slate-100 text-[#0B3D91] rounded-md border border-slate-300 flex items-center space-x-1 text-xs font-semibold"
                title="Read aloud"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-600" /> : <Volume2 className="w-3.5 h-3.5 text-[#0B3D91]" />}
                <span>{isSpeaking ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'सुने' : 'Listen')}</span>
              </button>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2 py-0.5 rounded">
                AI-ASSISTED
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-700 space-y-2 whitespace-pre-line leading-relaxed">
            {narrative}
          </div>
        </div>

        {/* Expandable Action Plan & Required Documents */}
        <div className="border border-[#D9D9D9] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowBusinessPlan(!showBusinessPlan)}
            className="w-full bg-[#F5F7FA] hover:bg-slate-200 px-4 py-3 text-left font-bold text-sm text-[#0B3D91] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#FF9933]" />
              <span>
                {lang === 'hi' ? 'बिजनेस एक्शन प्लान एवं आवेदन के चरण' : 'Business Action Plan & Application Steps'}
              </span>
            </div>
            {showBusinessPlan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showBusinessPlan && (
            <div className="p-5 space-y-5 bg-white border-t border-[#D9D9D9]">
              {/* Action Plan */}
              <div>
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2.5">
                  {lang === 'hi' ? 'व्यवसाय सफलता के लिए 4 मुख्य कदम' : '4 Key Steps for Business Success'}
                </h4>
                <ul className="space-y-2">
                  {actionPlan && actionPlan.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-[#0B3D91] font-bold text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Application Steps */}
              <div>
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2.5">
                  {lang === 'hi' ? 'आवेदन कैसे करें (बैंक / SCA प्रक्रिया)' : 'How to Apply (SCA / Bank Procedure)'}
                </h4>
                <ul className="space-y-2">
                  {appSteps && appSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#138808] flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-lg">
                <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider mb-1">
                  {lang === 'hi' ? 'आवश्यक दस्तावेज (Documents Required)' : 'Documents Required'}
                </h4>
                <p className="text-xs text-amber-950 font-medium">
                  {matched_scheme.documents_required}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
          {disclaimer}
        </div>

      </div>

      {/* Embedded Hyper-Local District Office Finder */}
      <DistrictFinder defaultState={userState} defaultDistrict={userDistrict} />

      {/* Alternate Schemes Recommendation (if any) */}
      {alternate_schemes && alternate_schemes.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-[#D9D9D9] shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-3">
            {lang === 'hi' ? 'अन्य संभावित सरकारी विकल्प (Other Qualifying Options)' : 'Other Qualifying Government Options'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alternate_schemes.map((alt) => (
              <div key={alt.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <h4 className="font-bold text-sm text-[#0B3D91]">
                  {lang === 'hi' ? alt.scheme_name_hi : alt.scheme_name}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {alt.agency} • {alt.interest_rate}% {lang === 'hi' ? 'ब्याज' : 'Interest'} • {alt.margin_percent}% {lang === 'hi' ? 'मार्जिन' : 'Margin'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;

