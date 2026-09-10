import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchSchemes, fetchSchemeFilters } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Loader2,
  ArrowRight,
  ExternalLink,
  Search,
  AlertCircle,
  BadgeCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  X,
  FileText,
  CheckCircle2,
  Calendar,
  Percent,
  Coins,
  ShieldCheck,
  Building2,
  MapPin,
  Tag,
  RefreshCw,
  Info
} from 'lucide-react';

const VerificationBadge = ({ status }) => {
  if (status === 'officially_verified' || status === 'auto_verified') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <BadgeCheck className="w-3 h-3 text-emerald-600" /> Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3 text-blue-600" /> Govt. Data
    </span>
  );
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)} Lakh`;
  }
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Modal for Full Scheme Details
const SchemeDetailModal = ({ scheme, lang, onClose, onSelectForLoan }) => {
  if (!scheme) return null;

  const docs = (typeof scheme.documents_required === 'string' && scheme.documents_required.trim())
    ? scheme.documents_required.split(/[,;\n•]+/).map((d) => d.trim()).filter(Boolean)
    : [];

  const eligibilityItems = (typeof scheme.eligibility === 'string' && scheme.eligibility.trim())
    ? scheme.eligibility.split(/[\n•]+/).map((e) => e.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0B3D91] to-[#1e5bb8] text-white p-5 sm:p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/20 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                {scheme.ministry || scheme.agency || 'Government of India'}
              </span>
              {scheme.state && (
                <span className="bg-amber-400 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {scheme.state}
                </span>
              )}
              <VerificationBadge status={scheme.verification_status} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {lang === 'hi' && scheme.scheme_name_hi ? scheme.scheme_name_hi : scheme.scheme_name}
            </h2>
            {scheme.scheme_name_hi && lang !== 'hi' && (
              <p className="text-xs text-blue-100 font-medium">{scheme.scheme_name_hi}</p>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow">
          
          {/* Key Financial Terms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-[#0B3D91]" /> Max Project Limit
              </span>
              <p className="text-lg font-extrabold text-slate-900">{formatCurrency(scheme.max_cost)}</p>
              <span className="text-[10px] text-slate-500">Min: {formatCurrency(scheme.min_cost)}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-emerald-600" /> Interest Rate
              </span>
              <p className="text-lg font-extrabold text-emerald-700">{scheme.interest_rate ?? 5}% p.a.</p>
              {Number(scheme.interest_rebate_women) > 0 && (
                <span className="text-[10px] text-emerald-600 font-semibold">-{scheme.interest_rebate_women}% for Women</span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Margin Money
              </span>
              <p className="text-lg font-extrabold text-amber-900">{scheme.margin_percent ?? 10}%</p>
              <span className="text-[10px] text-slate-500">Govt Share: {scheme.govt_loan_percent ?? 90}%</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Tenure / Repay
              </span>
              <p className="text-lg font-extrabold text-slate-900">{scheme.repayment_years ?? 5} Years</p>
              <span className="text-[10px] text-slate-500">Moratorium: {scheme.moratorium_months ?? 6} mos</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#0B3D91]" />
              {lang === 'hi' ? 'योजना का विवरण' : 'Scheme Description & Objectives'}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-100 p-4 rounded-xl">
              {lang === 'hi' && scheme.description_hi ? scheme.description_hi : (scheme.description || 'Details available under official portal.')}
            </p>
          </div>

          {/* Benefits */}
          {scheme.benefits && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {lang === 'hi' ? 'लाभ और सब्सिडी' : 'Benefits & Subsidies'}
              </h3>
              <div className="text-sm text-slate-700 leading-relaxed bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl whitespace-pre-line">
                {scheme.benefits}
              </div>
            </div>
          )}

          {/* Eligibility Criteria */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              {lang === 'hi' ? 'पात्रता मानदंड' : 'Eligibility Criteria'}
            </h3>
            <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl space-y-2">
              {eligibilityItems.length > 1 ? (
                <ul className="space-y-1.5">
                  {eligibilityItems.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed">
                  {lang === 'hi' && scheme.eligibility_hi ? scheme.eligibility_hi : (scheme.eligibility || 'Open to eligible citizens meeting basic identity criteria.')}
                </p>
              )}
            </div>
          </div>

          {/* Required Documents */}
          {docs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                {lang === 'hi' ? 'आवश्यक दस्तावेज' : 'Required Documents'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {docs.map((doc, idx) => (
                  <span key={idx} className="text-xs bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg font-medium">
                    📄 {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Department & Ministry Info */}
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 flex flex-wrap justify-between gap-2">
            <span><strong>Ministry:</strong> {scheme.ministry || 'Central Government of India'}</span>
            {scheme.department && <span><strong>Department:</strong> {scheme.department}</span>}
            <span><strong>Category:</strong> {scheme.category || 'General'}</span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div>
            {(scheme.official_source_url || scheme.apply_url) && (
              <a
                href={scheme.official_source_url || scheme.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D91] hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'आधिकारिक पोर्टल पर देखें' : 'View on Official Portal (MyScheme.gov.in)'}
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {lang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
            <button
              onClick={() => onSelectForLoan(scheme)}
              className="px-5 py-2.5 bg-[#0B3D91] hover:bg-[#1e5bb8] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>{lang === 'hi' ? 'इस योजना पर लोन बनाएं' : 'Structure Loan for this Scheme'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Scheme Card
const SchemeCard = ({ s, lang, onOpenModal, onSelectForLoan }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5 hover:border-[#0B3D91] hover:shadow-md transition-all flex flex-col justify-between group">
      <div className="space-y-2.5">
        
        {/* Header Badges */}
        <div className="flex items-start gap-2 justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-[#0B3D91] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[170px]" title={s.ministry || s.agency}>
                {s.ministry || s.agency || 'Govt. of India'}
              </span>
              {s.state && s.state !== 'Central / All India' && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {s.state}
                </span>
              )}
            </div>
            <h2
              className="text-sm sm:text-base font-bold text-[#1A1A1A] leading-snug line-clamp-2 group-hover:text-[#0B3D91] transition-colors cursor-pointer"
              onClick={() => onOpenModal(s)}
            >
              {lang === 'hi' && s.scheme_name_hi ? s.scheme_name_hi : s.scheme_name}
            </h2>
          </div>

          <div className="text-right flex-shrink-0 pl-2">
            <span className="text-base sm:text-lg font-black text-[#138808]">{s.interest_rate ?? 5}%</span>
            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Interest p.a.</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {s.category && (
            <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-[200px]" title={s.category}>
              {s.category.split(',')[0].trim()}
            </span>
          )}
          <VerificationBadge status={s.verification_status} />
        </div>

        {/* Description Excerpt */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {lang === 'hi' && s.description_hi ? s.description_hi : (s.description || 'Details available under official portal.')}
        </p>

        {/* Financial Metrics Box */}
        <div className="grid grid-cols-3 gap-1 bg-[#F8FAFC] border border-slate-100 p-2.5 rounded-lg text-center">
          <div>
            <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">Max Limit</span>
            <span className="text-xs font-black text-slate-800">
              {formatCurrency(s.max_cost)}
            </span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">Margin</span>
            <span className="text-xs font-black text-amber-900">{s.margin_percent ?? 10}%</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">Tenure</span>
            <span className="text-xs font-black text-slate-800">{s.repayment_years ?? 5} Yrs</span>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onOpenModal(s)}
          className="flex-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === 'hi' ? 'विवरण देखें' : 'View Details'}</span>
        </button>

        <button
          onClick={() => onSelectForLoan(s)}
          className="py-2 px-3 bg-[#0B3D91] hover:bg-[#1e5bb8] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
        >
          <span>{lang === 'hi' ? 'लोन बनाएं' : 'Apply'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        {s.official_source_url && (
          <a
            href={s.official_source_url}
            target="_blank"
            rel="noopener noreferrer"
            title="Official portal"
            className="p-2 border border-slate-200 hover:border-[#0B3D91] text-slate-400 hover:text-[#0B3D91] rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};

const INVESTMENT_RANGES = [
  { label: 'All Limits', labelHi: 'सभी सीमाएं', min: null, max: null },
  { label: 'Under ₹1 Lakh', labelHi: '₹1 लाख तक (माइक्रो)', min: null, max: 100000 },
  { label: '₹1L – ₹5L', labelHi: '₹1L – ₹5L (लघु)', min: 100000, max: 500000 },
  { label: '₹5L – ₹25L', labelHi: '₹5L – ₹25L (मध्यम)', min: 500000, max: 2500000 },
  { label: '₹25L+', labelHi: '₹25 लाख से अधिक', min: 2500000, max: null },
];

const SchemesPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [data, setData] = useState({ total: 0, page: 1, limit: 12, total_pages: 1, schemes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedRangeIdx, setSelectedRangeIdx] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // Available filter lists
  const [filterOptions, setFilterOptions] = useState({
    states: ['Central / All India'],
    categories: [],
    total_active_schemes: 2705,
  });

  // Modal State
  const [selectedScheme, setSelectedScheme] = useState(null);

  const debounceRef = useRef(null);

  // Load Filter options on mount
  useEffect(() => {
    let isMounted = true;
    const loadFilters = async () => {
      try {
        const filters = await fetchSchemeFilters();
        if (isMounted && filters) {
          setFilterOptions({
            states: Array.isArray(filters.states) ? filters.states : ['Central / All India'],
            categories: Array.isArray(filters.categories) ? filters.categories : [],
            total_active_schemes: filters.total_active_schemes || 2705,
          });
        }
      } catch (e) {
        console.error('Failed to load filter metadata', e);
      }
    };
    loadFilters();
    return () => {
      isMounted = false;
    };
  }, []);

  // Main fetch function
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeRange = INVESTMENT_RANGES[selectedRangeIdx] || INVESTMENT_RANGES[0];
      const result = await fetchSchemes({
        page,
        limit,
        search,
        category: selectedCategory,
        state: selectedState,
        min_cost: activeRange.min,
        max_cost: activeRange.max,
        sort_by: sortBy,
      });
      if (result && Array.isArray(result.schemes)) {
        setData(result);
      } else {
        setData({ total: 0, page: 1, limit, total_pages: 1, schemes: [] });
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
      setError('Could not connect to the schemes database. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedCategory, selectedState, selectedRangeIdx, sortBy]);

  // Debounced search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // Trigger load on filter change
  useEffect(() => {
    load();
  }, [load]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (data.total_pages || 1)) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearch('');
    setSelectedCategory('All');
    setSelectedState('All');
    setSelectedRangeIdx(0);
    setSortBy('');
    setPage(1);
  };

  const handleSelectForLoan = (scheme) => {
    setSelectedScheme(null);
    navigate('/advisory', { state: { prefilledScheme: scheme } });
  };

  const hasActiveFilters =
    Boolean(search) ||
    selectedCategory !== 'All' ||
    selectedState !== 'All' ||
    selectedRangeIdx !== 0 ||
    Boolean(sortBy);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0B3D91] via-[#104eab] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/5 rounded-full pointer-events-none blur-2xl" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-300 border border-white/10">
            <Landmark className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>MyScheme.gov.in & NSFDC Central + State Scheme Repository</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {lang === 'hi' ? 'सरकारी योजना डायरेक्टरी' : 'Government Schemes Directory'}
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
            {lang === 'hi'
              ? 'व्यापार, कृषि, MSME, महिला उद्यमिता और स्वरोजगार के लिए भारत सरकार व राज्य सरकारों की 2,700+ वास्तविक योजनाएं।'
              : 'Explore over 2,700+ live verified central and state government schemes for MSMEs, agriculture, women entrepreneurs, and rural businesses.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
            <span className="bg-white/20 px-3 py-1 rounded-lg text-white">
              🏢 {(filterOptions.total_active_schemes || 2705).toLocaleString()} {lang === 'hi' ? 'कुल योजनाएं' : 'Total Schemes'}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-lg text-white">
              🗺️ 38 {lang === 'hi' ? 'राज्य व केंद्र शासित प्रदेश' : 'States & UTs'}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-lg text-white">
              💰 3% - 8% {lang === 'hi' ? 'रियायती ब्याज दर' : 'Subsidized Interest Rates'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        {/* Row 1: Search and Sorters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                lang === 'hi'
                  ? 'योजना का नाम, मंत्रालय, कीवर्ड या राज्य खोजें...'
                  : 'Search by scheme name, ministry, keyword, or benefits...'
              }
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:bg-white transition-all shadow-inner"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* State Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:bg-white transition-all"
            >
              <option value="All">{lang === 'hi' ? '📍 सभी राज्य / ऑल इंडिया' : '📍 All States / All India'}</option>
              {(filterOptions.states || []).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:bg-white transition-all"
            >
              <option value="">{lang === 'hi' ? '⚡ डिफ़ॉल्ट क्रम' : '⚡ Sort: Recommended'}</option>
              <option value="interest_asc">{lang === 'hi' ? '📉 ब्याज दर: कम से ज्यादा' : '📉 Interest Rate: Low to High'}</option>
              <option value="limit_desc">{lang === 'hi' ? '💰 लोन सीमा: ज्यादा से कम' : '💰 Loan Limit: High to Low'}</option>
              <option value="limit_asc">{lang === 'hi' ? '💵 लोन सीमा: कम से ज्यादा' : '💵 Loan Limit: Low to High'}</option>
              <option value="name_asc">{lang === 'hi' ? '🔤 नाम: A से Z' : '🔤 Name: A to Z'}</option>
            </select>
          </div>

        </div>

        {/* Row 2: Category Selector Pills */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#0B3D91]" />
              {lang === 'hi' ? 'श्रेणी फ़िल्टर' : 'Filter by Category'}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 underline"
              >
                <RefreshCw className="w-3 h-3" /> {lang === 'hi' ? 'फ़िल्टर हटाएं' : 'Reset Filters'}
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#0B3D91] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}
            </button>
            {(filterOptions.categories || []).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0B3D91] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Investment Amount Range Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            {lang === 'hi' ? 'लोन बजट:' : 'Loan Budget:'}
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {INVESTMENT_RANGES.map((range, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedRangeIdx(idx);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  selectedRangeIdx === idx
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lang === 'hi' ? range.labelHi : range.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-bold text-slate-800">
          {!loading && (
            <span>
              {lang === 'hi' ? 'दिखाए जा रहे हैं ' : 'Showing '}
              <span className="text-[#0B3D91] font-black">{(data.schemes || []).length}</span>
              {lang === 'hi' ? ' कुल ' : ' of '}
              <span className="text-slate-900 font-black">{(data.total || 0).toLocaleString()}</span>
              {lang === 'hi' ? ' सरकारी योजनाएं' : ' Government Schemes'}
              {search && <span className="text-slate-500 font-normal ml-1">for "{search}"</span>}
              {selectedState !== 'All' && <span className="text-indigo-600 ml-1">in {selectedState}</span>}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>{lang === 'hi' ? 'प्रति पृष्ठ:' : 'Per page:'}</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border border-slate-300 bg-white rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div className="flex-1">
            <p className="font-bold">Error loading schemes</p>
            <p className="text-xs text-rose-600">{error}</p>
          </div>
          <button
            onClick={load}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#0B3D91]" />
          <span className="text-sm text-slate-700 font-bold">
            {lang === 'hi' ? 'सरकारी योजनाएं लोड हो रही हैं...' : 'Querying real-time scheme repository...'}
          </span>
          <span className="text-xs text-slate-400">Filtering across 2,700+ verified schemes</span>
        </div>
      )}

      {/* Schemes Grid */}
      {!loading && !error && Array.isArray(data.schemes) && data.schemes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.schemes.map((s) => (
            <SchemeCard
              key={s.id}
              s={s}
              lang={lang}
              onOpenModal={(sch) => setSelectedScheme(sch)}
              onSelectForLoan={handleSelectForLoan}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && Array.isArray(data.schemes) && data.schemes.length === 0 && (
        <div className="py-20 text-center space-y-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <IndianRupee className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {lang === 'hi' ? 'कोई योजना नहीं मिली' : 'No schemes match your filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === 'hi'
              ? 'कृपया अपना खोज शब्द बदलें या फ़िल्टर हटाकर सभी योजनाओं को देखें।'
              : 'Try relaxing your search terms, selecting "All States", or resetting budget range.'}
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#0B3D91] text-white rounded-xl text-xs font-bold shadow hover:bg-[#1e5bb8] transition-colors"
          >
            {lang === 'hi' ? 'सभी फ़िल्टर रीसेट करें' : 'Reset All Filters'}
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && data.total_pages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          
          <div className="text-xs text-slate-500 font-medium">
            Page <strong className="text-slate-800">{page}</strong> of{' '}
            <strong className="text-slate-800">{data.total_pages}</strong>
            <span className="text-slate-400 ml-2">({(data.total || 0).toLocaleString()} total schemes)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              First
            </button>

            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number pill */}
            <span className="px-3 py-1 bg-[#0B3D91] text-white text-xs font-bold rounded-lg shadow-sm">
              {page}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === data.total_pages}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handlePageChange(data.total_pages)}
              disabled={page === data.total_pages}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              Last
            </button>
          </div>

        </div>
      )}

      {/* Official Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
        <span className="leading-relaxed">
          {lang === 'hi'
            ? 'सूचना: यह योजना डेटाबेस आधिकारिक सरकारी स्रोतों (MyScheme.gov.in, NSFDC, MSME, MoSJE) से सिंक किया गया है। आवेदन करने से पहले अपने नजदीकी बैंक शाखा या कॉमन सर्विस सेंटर (CSC) से नियम व शर्तें अवश्य सत्यापित करें।'
            : 'Notice: Sourced directly from official Government of India repositories (MyScheme.gov.in, NSFDC, MSME, MoSJE). Final loan disbursement and subsidies are subject to standard bank appraisal and official scheme guidelines.'}
        </span>
      </div>

      {/* Scheme Full Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          lang={lang}
          onClose={() => setSelectedScheme(null)}
          onSelectForLoan={handleSelectForLoan}
        />
      )}

    </div>
  );
};

export default SchemesPage;
