import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { submitAdvisoryRequest } from '../services/api';
import ResultCard from '../components/ResultCard';
import MicButton from '../components/MicButton';
import { 
  Store, 
  Milk, 
  Scissors, 
  Truck, 
  SunMedium, 
  Sprout, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Briefcase,
  AlertTriangle
} from 'lucide-react';

const FormPage = () => {
  const { lang } = useLanguage();
  const location = useLocation();
  const prefilled = location.state?.prefilledScheme;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    business_type: 'Dairy Farm',
    business_title: prefilled ? prefilled.scheme_name : '',
    investment_amount: prefilled?.max_cost ? Math.min(prefilled.max_cost, 200000) : 100000,
    gender: 'General',
    state: prefilled?.state && prefilled.state !== 'Central / All India' ? prefilled.state : 'Uttar Pradesh',
    district: '',
    experience_level: '1-3 years'
  });

  useEffect(() => {
    if (prefilled) {
      setFormData(prev => ({
        ...prev,
        business_title: prefilled.scheme_name,
        investment_amount: prefilled.max_cost ? Math.min(prefilled.max_cost, 200000) : prev.investment_amount,
        state: prefilled.state && prefilled.state !== 'Central / All India' ? prefilled.state : prev.state
      }));
    }
  }, [prefilled]);

  const businessTypes = [
    { id: 'Dairy Farm', name: 'डेयरी व दूध उत्पादन', nameEn: 'Dairy & Milk Farming', icon: Milk },
    { id: 'Grocery / Kirana Store', name: 'किराना व जनरल स्टोर', nameEn: 'Grocery / Kirana Shop', icon: Store },
    { id: 'Tailoring & Boutique', name: 'सिलाई व बुटीक सेंटर', nameEn: 'Tailoring & Boutique', icon: Scissors },
    { id: 'E-Rickshaw / Transport', name: 'ई-रिक्शा व वाहन सेवा', nameEn: 'E-Rickshaw / Transport', icon: Truck },
    { id: 'Solar & Renewable Energy', name: 'सोलर व हरित व्यवसाय', nameEn: 'Solar & Clean Energy', icon: SunMedium },
    { id: 'Agri Processing / Mill', name: 'आटा/तेल मिल व प्रसंस्करण', nameEn: 'Flour/Oil Mill Processing', icon: Sprout },
    { id: 'Handicrafts / Artisan', name: 'हस्तशिल्प व दस्तकारी', nameEn: 'Handicrafts & Artisan', icon: Briefcase },
    { id: 'Other Micro Business', name: 'अन्य छोटा व्यवसाय', nameEn: 'Other Micro Business', icon: Store }
  ];

  const presetAmounts = [
    { label: '₹50,000', value: 50000 },
    { label: '₹1,00,000 (1 लाख)', value: 100000 },
    { label: '₹2,00,000 (2 लाख)', value: 200000 },
    { label: '₹5,00,000 (5 लाख)', value: 500000 },
    { label: '₹10,00,000 (10 लाख)', value: 1000000 },
    { label: '₹20,00,000 (20 लाख)', value: 2000000 }
  ];

  const handleVoiceTranscript = (text) => {
    // Basic heuristic to parse spoken text
    const lower = text.toLowerCase();
    
    // Check business
    if (lower.includes('dairy') || lower.includes('doodh') || lower.includes('गाय') || lower.includes('भैंस') || lower.includes('दूध')) {
      setFormData((prev) => ({ ...prev, business_type: 'Dairy Farm', business_title: text }));
    } else if (lower.includes('dukaan') || lower.includes('kirana') || lower.includes('shop') || lower.includes('दुकान') || lower.includes('किराना')) {
      setFormData((prev) => ({ ...prev, business_type: 'Grocery / Kirana Store', business_title: text }));
    } else if (lower.includes('tailor') || lower.includes('silai') || lower.includes('कपड़ा') || lower.includes('सिलाई')) {
      setFormData((prev) => ({ ...prev, business_type: 'Tailoring & Boutique', business_title: text }));
    } else if (lower.includes('rickshaw') || lower.includes('auto') || lower.includes('रिक्शा')) {
      setFormData((prev) => ({ ...prev, business_type: 'E-Rickshaw / Transport', business_title: text }));
    } else {
      setFormData((prev) => ({ ...prev, business_title: text }));
    }

    // Check numbers in lakh
    const lakhMatch = text.match(/(\d+)\s*(लाख|lakh|lac)/i);
    if (lakhMatch) {
      const val = parseInt(lakhMatch[1], 10) * 100000;
      setFormData((prev) => ({ ...prev, investment_amount: val }));
    } else {
      const numMatch = text.match(/(\d{4,7})/);
      if (numMatch) {
        setFormData((prev) => ({ ...prev, investment_amount: parseInt(numMatch[1], 10) }));
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        business_type: formData.business_type,
        business_title: formData.business_title || formData.business_type,
        investment_amount: Number(formData.investment_amount),
        gender: formData.gender,
        state: formData.state,
        district: formData.district || 'Rural District',
        experience_level: formData.experience_level,
        preferred_language: lang
      };

      const res = await submitAdvisoryRequest(payload);
      setResultData(res);
    } catch (err) {
      console.error('API Advisory Error:', err);
      setError(
        err.response?.data?.detail ||
        (lang === 'hi'
          ? 'सर्वर से संपर्क करने में समस्या आई। कृपया पुनः प्रयास करें।'
          : 'Unable to connect to advisory service. Please check your backend connection.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Estimated Live Margin Money preview (10% standard estimate)
  const estMargin = Math.round(Number(formData.investment_amount || 0) * 0.10);
  const estLoan = Math.round(Number(formData.investment_amount || 0) * 0.90);

  if (resultData) {
    return (
      <div className="py-8 px-4 sm:px-6">
        <ResultCard 
          data={resultData} 
          onReset={() => setResultData(null)}
          userState={formData.state}
          userDistrict={formData.district}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Step Indicator */}
      <div className="bg-white p-4 rounded-lg border border-[#D9D9D9] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= 1 ? 'bg-[#0B3D91] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              1
            </div>
            <span className={`text-xs sm:text-sm font-bold ${step === 1 ? 'text-[#0B3D91]' : 'text-slate-500'}`}>
              {lang === 'hi' ? 'व्यवसाय का प्रकार' : 'Business Idea'}
            </span>
          </div>

          <div className="h-0.5 w-8 sm:w-16 bg-slate-200"></div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= 2 ? 'bg-[#0B3D91] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </div>
            <span className={`text-xs sm:text-sm font-bold ${step === 2 ? 'text-[#0B3D91]' : 'text-slate-500'}`}>
              {lang === 'hi' ? 'निवेश पूंजी (बजट)' : 'Investment Capital'}
            </span>
          </div>

          <div className="h-0.5 w-8 sm:w-16 bg-slate-200"></div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= 3 ? 'bg-[#0B3D91] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </div>
            <span className={`text-xs sm:text-sm font-bold ${step === 3 ? 'text-[#0B3D91]' : 'text-slate-500'}`}>
              {lang === 'hi' ? 'स्थान व अनुभव' : 'Profile & Location'}
            </span>
          </div>
        </div>
      </div>

      {/* Voice Assistant Strip (Optional helper for low-literacy users) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="p-2 bg-[#FF9933]/20 rounded-full text-amber-800">
            <Sparkles className="w-5 h-5 text-[#FF9933]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#1A1A1A]">
              {lang === 'hi' ? 'बोलकर अपनी जानकारी भरें (वैकल्पिक)' : 'Voice Assistant Helper (Optional)'}
            </h4>
            <p className="text-xs text-slate-600">
              {lang === 'hi'
                ? 'उदा: "मुझे 2 लाख का डेयरी फार्म शुरू करना है"'
                : 'e.g. "I want to start a 2 Lakh Dairy business"'}
            </p>
          </div>
        </div>
        <MicButton onTranscript={handleVoiceTranscript} />
      </div>

      {/* Error Message if any */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#D9D9D9] shadow-sm">
        
        {/* STEP 1: Business Category & Idea */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#0B3D91]">
                {lang === 'hi' ? 'चरण 1: आप कौन सा व्यवसाय शुरू या बढ़ाना चाहते हैं?' : 'Step 1: What business do you want to start or expand?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {lang === 'hi' ? 'नीचे दिए गए मुख्य क्षेत्रों में से अपना व्यवसाय चुनें:' : 'Select your primary trade category:'}
              </p>
            </div>

            {/* Category Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {businessTypes.map((b) => {
                const Icon = b.icon;
                const isSelected = formData.business_type === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, business_type: b.id })}
                    className={`p-3.5 rounded-lg border text-left flex flex-col justify-between space-y-2 transition-all ${
                      isSelected
                        ? 'border-[#0B3D91] bg-blue-50/70 ring-2 ring-[#0B3D91]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-2 rounded-md ${isSelected ? 'bg-[#0B3D91] text-white' : 'bg-slate-100 text-[#0B3D91]'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0B3D91]" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#1A1A1A] block">
                        {lang === 'hi' ? b.name : b.nameEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Specific Business Title / Short Description */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                {lang === 'hi' ? 'व्यवसाय का संक्षिप्त विवरण या नाम (वैकल्पिक)' : 'Specific Business Details or Title (Optional)'}
              </label>
              <input
                type="text"
                value={formData.business_title}
                onChange={(e) => setFormData({ ...formData, business_title: e.target.value })}
                placeholder={lang === 'hi' ? 'उदा: 4 गायों का मिनी डेयरी फार्म, सिलाई सेंटर, किराना स्टोर...' : 'e.g., 4 Cows Dairy Unit, Stitching Shop, Rice Mill...'}
                className="w-full p-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              />
            </div>

            {/* Next Action */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-[#0B3D91] hover:bg-[#072a66] text-white font-bold rounded-md flex items-center space-x-2 text-sm transition-colors"
              >
                <span>{lang === 'hi' ? 'अगला: निवेश पूंजी चुनें' : 'Next: Investment Amount'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Investment Amount & Capital Structuring */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#0B3D91]">
                {lang === 'hi' ? 'चरण 2: आपको व्यवसाय के लिए कुल कितनी पूंजी चाहिए?' : 'Step 2: How much total capital do you need?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {lang === 'hi' ? 'इसमें मशीनरी, कच्चा माल और दुकान/शेड का पूरा खर्च शामिल करें' : 'Include machinery, working capital, and setup costs'}
              </p>
            </div>

            {/* Preset Amount Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                {lang === 'hi' ? 'त्वरित बजट विकल्प:' : 'Quick Capital Presets:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {presetAmounts.map((p) => {
                  const isSelected = Number(formData.investment_amount) === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, investment_amount: p.value })}
                      className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold border transition-colors ${
                        isSelected
                          ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input Box */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                {lang === 'hi' ? 'या अपनी इच्छित राशि दर्ज करें (₹ में):' : 'Or Enter Custom Project Cost (in ₹):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="10000"
                  max="5000000"
                  step="5000"
                  value={formData.investment_amount}
                  onChange={(e) => setFormData({ ...formData, investment_amount: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-md text-base font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
            </div>

            {/* Live Instant Preview Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>{lang === 'hi' ? 'अनुमानित मार्जिन मनी (आपकी हिस्सेदारी ~10%):' : 'Estimated Margin Money (Your Share ~10%):'}</span>
                <span className="font-bold text-amber-900 text-sm">₹{estMargin.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>{lang === 'hi' ? 'अनुमानित सरकारी रियायती लोन (~90%):' : 'Estimated Govt Concessional Loan (~90%):'}</span>
                <span className="font-bold text-[#0B3D91] text-sm">₹{estLoan.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-md flex items-center space-x-1.5 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'hi' ? 'पीछे' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-[#0B3D91] hover:bg-[#072a66] text-white font-bold rounded-md flex items-center space-x-2 text-sm transition-colors"
              >
                <span>{lang === 'hi' ? 'अगला: प्रोफाइल व स्थान' : 'Next: Profile & Location'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Profile, Gender (Subsidy Check) & Location */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#0B3D91]">
                {lang === 'hi' ? 'चरण 3: अपनी प्रोफाइल और स्थान विवरण बताएं' : 'Step 3: Tell us your profile and location'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {lang === 'hi' ? 'महिला उद्यमियों को सरकारी योजनाओं में 1% अतिरिक्त ब्याज छूट मिलती है' : 'Women beneficiaries receive special 1% interest concessions'}
              </p>
            </div>

            {/* Gender / Beneficiary Type (Critical for Mahila Samriddhi 4% and 1% rebate) */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                {lang === 'hi' ? 'आवेदक की श्रेणी (Gender / Category):' : 'Applicant Gender / Category:'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'General', label: 'पुरुष / सामान्य', labelEn: 'Male / General' },
                  { id: 'Female', label: 'महिला (1% छूट पात्र)', labelEn: 'Female (1% Rebate)' },
                  { id: 'Other', label: 'अन्य / SHG समूह', labelEn: 'Other / SHG Group' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g.id })}
                    className={`py-3 px-3 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                      formData.gender === g.id
                        ? 'bg-[#0B3D91] text-white border-[#0B3D91] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'hi' ? g.label : g.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                {lang === 'hi' ? 'इस कार्य में आपका अनुभव कितना है?' : 'Experience in this business/trade:'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['New', '1-3 years', '3+ years'].map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setFormData({ ...formData, experience_level: exp })}
                    className={`py-2.5 px-3 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                      formData.experience_level === exp
                        ? 'bg-[#138808] text-white border-[#138808]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {exp === 'New' ? (lang === 'hi' ? 'नया व्यवसाय (0 वर्ष)' : 'New Venture') :
                     exp === '1-3 years' ? (lang === 'hi' ? '1 से 3 वर्ष का अनुभव' : '1-3 Years') :
                     (lang === 'hi' ? '3+ वर्ष का अनुभव' : '3+ Years')}
                  </button>
                ))}
              </div>
            </div>

            {/* State & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase">
                  {lang === 'hi' ? 'राज्य (State):' : 'State:'}
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Uttar Pradesh, Bihar, Rajasthan..."
                  className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase">
                  {lang === 'hi' ? 'जिला / ब्लॉक (District / Block):' : 'District / Block:'}
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder={lang === 'hi' ? 'उदा: वाराणसी, पटना, जयपुर...' : 'e.g. Varanasi, Patna, Jaipur...'}
                  className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-md flex items-center space-x-1.5 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'hi' ? 'पीछे' : 'Back'}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-[#138808] hover:bg-[#0f6e06] text-white font-bold rounded-md flex items-center space-x-2 text-base shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{lang === 'hi' ? 'योजना और लोन संरचना तैयार हो रही है...' : 'Calculating Loan Structure...'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'hi' ? 'योजना व वित्तीय रिपोर्ट देखें' : 'Generate Advisory Report'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default FormPage;
