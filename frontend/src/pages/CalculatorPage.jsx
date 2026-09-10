import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

const CalculatorPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  // Calculator State
  const [totalCost, setTotalCost] = useState(200000);
  const [marginPercent, setMarginPercent] = useState(10);
  const [interestRate, setInterestRate] = useState(5.0);
  const [tenureYears, setTenureYears] = useState(5);
  const [moratoriumMonths, setMoratoriumMonths] = useState(6);
  const [isWomenApplicant, setIsWomenApplicant] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);

  // Popular Presets for Quick Selection
  const presets = [
    { label: "PMEGP (Service)", cost: 500000, margin: 10, rate: 8.5, years: 5, mor: 6 },
    { label: "Mudra Shishu", cost: 50000, margin: 5, rate: 7.0, years: 3, mor: 3 },
    { label: "Mudra Kishore", cost: 200000, margin: 10, rate: 6.5, years: 5, mor: 6 },
    { label: "Mahila Samriddhi (NSFDC)", cost: 140000, margin: 5, rate: 4.0, years: 3, mor: 3, women: true },
    { label: "Stand-Up India (SC/ST/Women)", cost: 1000000, margin: 15, rate: 8.0, years: 7, mor: 12 }
  ];

  const applyPreset = (p) => {
    setTotalCost(p.cost);
    setMarginPercent(p.margin);
    setInterestRate(p.rate);
    setTenureYears(p.years);
    setMoratoriumMonths(p.mor);
    if (p.women) setIsWomenApplicant(true);
  };

  // Calculations
  const effectiveRate = isWomenApplicant ? Math.max(1.0, interestRate - 1.0) : interestRate;
  const marginMoney = Math.round(totalCost * (marginPercent / 100.0));
  const loanAmount = totalCost - marginMoney;

  // Monthly EMI Calculation Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const calculateEMI = (principal, annualRate, years) => {
    if (principal <= 0) return 0;
    const monthlyRate = (annualRate / 100.0) / 12.0;
    const totalMonths = years * 12;
    if (monthlyRate === 0) return Math.round(principal / totalMonths);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  };

  const monthlyEMI = calculateEMI(loanAmount, effectiveRate, tenureYears);
  const totalRepayment = monthlyEMI * (tenureYears * 12);
  const totalInterest = Math.max(0, totalRepayment - loanAmount);

  // Generate Year-by-Year Amortization Schedule
  const generateAmortization = () => {
    let balance = loanAmount;
    const schedule = [];
    const monthlyRate = (effectiveRate / 100.0) / 12.0;

    for (let yr = 1; yr <= tenureYears; yr++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestForMonth = balance * monthlyRate;
        const principalForMonth = monthlyEMI - interestForMonth;
        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        balance = Math.max(0, balance - principalForMonth);
      }

      schedule.push({
        year: yr,
        emiPaid: monthlyEMI * 12,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        remainingBalance: Math.round(balance)
      });
    }
    return schedule;
  };

  const amortizationSchedule = generateAmortization();

  // Find schemes with this budget
  const handleFindSchemes = () => {
    navigate('/schemes', {
      state: {
        budgetFilter: totalCost
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B3D91] via-[#072a66] to-[#041a3d] text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 text-[#FF9933] px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
            <Calculator className="w-4 h-4" />
            <span>{lang === 'hi' ? 'स्मार्ट वित्तीय सिमुलेटर' : 'Smart Financial Simulator'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {lang === 'hi' ? 'सरकारी लोन एवं सब्सिडी ईएमआई कैलकुलेटर' : 'Govt Loan & Subsidy EMI Calculator'}
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl">
            {lang === 'hi'
              ? 'बजट, मार्जिन मनी और ब्याज दर को बदलकर अपनी सटीक मासिक किश्त और सरकारी रियायत का हिसाब लगाएं।'
              : 'Simulate your business budget, margin money contribution, and monthly EMI with concessional interest rates.'}
          </p>
        </div>

        <button
          onClick={() => {
            setTotalCost(200000);
            setMarginPercent(10);
            setInterestRate(5.0);
            setTenureYears(5);
            setMoratoriumMonths(6);
            setIsWomenApplicant(false);
          }}
          className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-white/20 transition-all flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'रीसेट करें' : 'Reset Calculator'}</span>
        </button>
      </div>

      {/* Preset Chips */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          {lang === 'hi' ? '⚡ लोकप्रिय सरकारी योजना प्रीसेट:' : '⚡ Popular Govt Scheme Presets:'}
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0B3D91] border border-slate-200 hover:border-blue-300 transition-all flex items-center space-x-1"
            >
              <span>{p.label}</span>
              <span className="text-slate-400 font-normal">({(p.cost / 100000).toFixed(1)}L @ {p.rate}%)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Controls & Sliders (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#0B3D91] flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#FF9933]" />
            <span>{lang === 'hi' ? 'पैरामीटर समायोजित करें' : 'Adjust Loan Parameters'}</span>
          </h2>

          {/* Slider 1: Total Project Cost */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-800">
                {lang === 'hi' ? 'कुल प्रोजेक्ट लागत (Total Project Cost):' : 'Total Project Cost:'}
              </label>
              <div className="flex items-center space-x-1 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                <span className="text-sm font-extrabold text-[#0B3D91]">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ({(totalCost / 100000).toFixed(2)} {lang === 'hi' ? 'लाख' : 'Lakh'})
                </span>
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={totalCost}
              onChange={(e) => setTotalCost(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B3D91]"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹10,000</span>
              <span>₹10 Lakh</span>
              <span>₹25 Lakh</span>
              <span>₹50 Lakh</span>
            </div>
          </div>

          {/* Slider 2: Margin Money % */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-800">
                {lang === 'hi' ? 'मार्जिन मनी (आपकी हिस्सेदारी):' : 'Margin Money (Your Share):'}
              </label>
              <div className="bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg">
                <span className="text-sm font-extrabold text-amber-900">
                  {marginPercent}% (₹{marginMoney.toLocaleString('en-IN')})
                </span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={marginPercent}
              onChange={(e) => setMarginPercent(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF9933]"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>5% (न्यूनतम)</span>
              <span>10% (मानक)</span>
              <span>15%</span>
              <span>25% (अधिकतम)</span>
            </div>
          </div>

          {/* Slider 3: Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-800">
                {lang === 'hi' ? 'ब्याज दर (वार्षिक p.a.):' : 'Annual Interest Rate:'}
              </label>
              <div className="bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-lg">
                <span className="text-sm font-extrabold text-[#138808]">
                  {effectiveRate}% p.a.
                </span>
                {isWomenApplicant && (
                  <span className="text-[10px] text-emerald-700 block font-bold">
                    {lang === 'hi' ? '(-1% महिला छूट लागू)' : '(-1% Rebate)'}
                  </span>
                )}
              </div>
            </div>
            <input
              type="range"
              min="2.0"
              max="14.0"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#138808]"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>2.0% (NSFDC)</span>
              <span>5.0% (रियायती)</span>
              <span>8.5% (PMEGP)</span>
              <span>14.0%</span>
            </div>
          </div>

          {/* Slider 4: Tenure (Years) & Moratorium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {lang === 'hi' ? 'पुनर्भुगतान अवधि (Tenure):' : 'Repayment Tenure:'}
                </label>
                <span className="text-xs font-extrabold text-[#0B3D91] bg-blue-50 px-2 py-0.5 rounded">
                  {tenureYears} {lang === 'hi' ? 'वर्ष' : 'Years'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B3D91]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {lang === 'hi' ? 'मोरेटोरियम (छूट अवधि):' : 'Moratorium Period:'}
                </label>
                <span className="text-xs font-extrabold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                  {moratoriumMonths} {lang === 'hi' ? 'महीने' : 'Months'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="18"
                step="1"
                value={moratoriumMonths}
                onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          </div>

          {/* Women Rebate Toggle Checkbox */}
          <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="womenRebate"
                checked={isWomenApplicant}
                onChange={(e) => setIsWomenApplicant(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
              />
              <label htmlFor="womenRebate" className="text-xs sm:text-sm font-bold text-pink-950 cursor-pointer">
                {lang === 'hi' ? 'महिला लाभार्थी (1% ब्याज छूट लागू करें)' : 'Women Beneficiary (Apply 1% Interest Rebate)'}
              </label>
            </div>
            <span className="text-[11px] font-bold text-pink-700 bg-white px-2 py-0.5 rounded border border-pink-200">
              {lang === 'hi' ? 'विशेष लाभ' : 'Special Rebate'}
            </span>
          </div>

        </div>

        {/* Right Column: Live Output & Financial Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main EMI Card */}
          <div className="bg-gradient-to-br from-[#0B3D91] to-[#072a66] text-white p-6 rounded-2xl shadow-lg border border-[#0f4aab] space-y-4">
            <div className="flex items-center justify-between text-blue-200 text-xs font-bold uppercase tracking-wider">
              <span>{lang === 'hi' ? 'अनुमानित मासिक किश्त' : 'Estimated Monthly Payment'}</span>
              <span className="bg-[#138808] text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                {lang === 'hi' ? 'सटीक गणित' : 'Exact Math'}
              </span>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline space-x-1">
                <span>₹{monthlyEMI.toLocaleString('en-IN')}</span>
                <span className="text-xs sm:text-sm text-blue-200 font-normal">/{lang === 'hi' ? 'माह' : 'month'}</span>
              </div>
              <p className="text-xs text-blue-200 mt-1 font-medium">
                {lang === 'hi'
                  ? `${moratoriumMonths} माह की छूट अवधि (मोरेटोरियम) के बाद शुरू होगी`
                  : `Starts after ${moratoriumMonths} months of moratorium`}
              </p>
            </div>

            {/* Visual Ratio Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-blue-200 font-semibold">
                <span>{lang === 'hi' ? 'मार्जिन (आप)' : 'Margin'}: {marginPercent}%</span>
                <span>{lang === 'hi' ? 'सरकारी लोन' : 'Loan'}: {100 - marginPercent}%</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden flex">
                <div style={{ width: `${marginPercent}%` }} className="bg-[#FF9933] h-full" title="Margin Money"></div>
                <div style={{ width: `${100 - marginPercent}%` }} className="bg-emerald-400 h-full" title="Govt Loan"></div>
              </div>
            </div>

            {/* 3-Stat Breakdown Inside Card */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-400/30">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                <span className="text-[11px] text-blue-200 block font-medium">
                  {lang === 'hi' ? 'सरकारी स्वीकृत ऋण' : 'Govt Loan Amount'}
                </span>
                <span className="text-base font-extrabold text-white">
                  ₹{loanAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                <span className="text-[11px] text-blue-200 block font-medium">
                  {lang === 'hi' ? 'कुल ब्याज (पूरे समय)' : 'Total Interest'}
                </span>
                <span className="text-base font-extrabold text-amber-300">
                  ₹{totalInterest.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Button: Find Schemes */}
            <button
              onClick={handleFindSchemes}
              className="w-full py-3 bg-[#FF9933] hover:bg-[#f08a22] text-black font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md mt-4"
            >
              <span>{lang === 'hi' ? `इस बजट (₹${(totalCost/100000).toFixed(1)}L) की योजनाएं खोजें` : `Explore Schemes for this Budget`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 text-xs text-emerald-900">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-[#138808]" />
              <span>{lang === 'hi' ? 'विशेष सरकारी सहायता' : 'Government Concessional Benefit'}</span>
            </div>
            <p className="leading-relaxed">
              {lang === 'hi'
                ? `इस लोन पर व्यावसायिक बैंकों की तुलना में लगभग ${(12 - effectiveRate).toFixed(1)}% की वार्षिक ब्याज बचत होगी।`
                : `Compared to standard commercial loans, you save approx ${(12 - effectiveRate).toFixed(1)}% annual interest.`}
            </p>
          </div>

        </div>

      </div>

      {/* Amortization Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAmortization(!showAmortization)}
          className="w-full p-5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left font-bold text-sm text-[#0B3D91] transition-colors"
        >
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-[#FF9933]" />
            <span>
              {lang === 'hi' ? 'वर्षवार पुनर्भुगतान विवरण (Yearly Amortization Schedule)' : 'Yearly Amortization Schedule & Repayment Breakdown'}
            </span>
          </div>
          <span className="text-xs bg-[#0B3D91] text-white px-2.5 py-1 rounded-md font-bold">
            {showAmortization ? (lang === 'hi' ? 'छुपाएं' : 'Hide Table') : (lang === 'hi' ? 'तालिका देखें' : 'View Schedule')}
          </span>
        </button>

        {showAmortization && (
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B3D91] text-white">
                  <th className="p-3 font-bold rounded-l">{lang === 'hi' ? 'वर्ष' : 'Year'}</th>
                  <th className="p-3 font-bold">{lang === 'hi' ? 'वार्षिक किश्त (EMI)' : 'Annual EMI'}</th>
                  <th className="p-3 font-bold">{lang === 'hi' ? 'मूलधन भुगतान (Principal)' : 'Principal Paid'}</th>
                  <th className="p-3 font-bold">{lang === 'hi' ? 'ब्याज भुगतान (Interest)' : 'Interest Paid'}</th>
                  <th className="p-3 font-bold rounded-r">{lang === 'hi' ? 'बकाया राशि (Balance)' : 'Ending Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {amortizationSchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-[#0B3D91]">
                      {lang === 'hi' ? `वर्ष ${row.year}` : `Year ${row.year}`}
                    </td>
                    <td className="p-3">₹{row.emiPaid.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-emerald-700 font-bold">₹{row.principalPaid.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-amber-700 font-bold">₹{row.interestPaid.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-slate-800 font-bold">₹{row.remainingBalance.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default CalculatorPage;
