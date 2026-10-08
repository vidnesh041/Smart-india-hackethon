import React from 'react';
import { Sparkles, Compass, Target, AlertTriangle, Users, Tag, Info } from 'lucide-react';

const FeasibilityReportCard = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-indigo-200 rounded-xl shadow-md p-8 text-center animate-pulse">
        <div className="flex justify-center mb-4">
          <Sparkles className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Aapke area ka feasibility analysis taiyaar kiya ja raha hai...</h3>
        <p className="text-slate-500 text-sm mt-1">Fetching Udyam Registration signals & generating hyper-local market advisory...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-indigo-800 to-slate-900 text-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-300" />
            <div>
              <h2 className="text-xl font-extrabold tracking-wide">Card B: Aapki Business Feasibility Report</h2>
              <p className="text-indigo-200 text-xs mt-0.5">Module 1 — Hyper-Local Market Feasibility Strategy</p>
            </div>
          </div>
          <span className="bg-indigo-600/80 text-indigo-100 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-400/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" /> AI-Generated Strategy
          </span>
        </div>
      </div>

      {/* AI Disclaimer Banner */}
      {data.disclaimer && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{data.disclaimer}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* 1. Market Reach */}
        {data.market_reach && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>1. Market Reach & Radius Strategy</span>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{data.market_reach}</p>
          </div>
        )}

        {/* 2. Opportunity Analysis */}
        {data.opportunity_analysis && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>2. Opportunity Analysis</span>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{data.opportunity_analysis}</p>
          </div>
        )}

        {/* 3. SWOT 2x2 Colored Grid */}
        {data.swot && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              3. General Business Analysis (SWOT Grid)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths (Green) */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                <span className="text-emerald-900 font-extrabold text-xs uppercase tracking-wider block mb-2 border-b border-emerald-200 pb-1">
                  🟢 STRENGTHS (मजबूत पक्ष)
                </span>
                <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
                  {data.swot.strengths?.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses (Red) */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <span className="text-red-900 font-extrabold text-xs uppercase tracking-wider block mb-2 border-b border-red-200 pb-1">
                  🔴 WEAKNESSES (कमजोरियां)
                </span>
                <ul className="space-y-1.5 text-xs text-red-950 font-medium">
                  {data.swot.weaknesses?.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities (Blue) */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <span className="text-blue-900 font-extrabold text-xs uppercase tracking-wider block mb-2 border-b border-blue-200 pb-1">
                  🔵 OPPORTUNITIES (अवसर)
                </span>
                <ul className="space-y-1.5 text-xs text-blue-950 font-medium">
                  {data.swot.opportunities?.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats (Amber) */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <span className="text-amber-900 font-extrabold text-xs uppercase tracking-wider block mb-2 border-b border-amber-200 pb-1">
                  🟠 THREATS (जोखिम)
                </span>
                <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                  {data.swot.threats?.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 4. Threats Identification */}
        {data.threats_identification && data.threats_identification.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>4. Local Threats & Bottlenecks</span>
            </div>
            <ul className="space-y-1 text-xs sm:text-sm text-slate-700 list-disc list-inside">
              {data.threats_identification.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 5. Competitor Mapping */}
        {data.competitor_mapping && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Users className="w-4 h-4 text-blue-600" />
                <span>5. Competitor Mapping</span>
              </div>
              <span className="bg-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Source: {data.competitor_mapping.data_source}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="bg-blue-100 text-blue-900 font-black text-xl px-4 py-2 rounded-lg">
                {data.competitor_mapping.estimated_count}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                {data.competitor_mapping.summary}
              </p>
            </div>
          </div>
        )}

        {/* 6. Product Market Value */}
        {data.product_market_value && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <Tag className="w-4 h-4 text-teal-600" />
              <span>6. Product Market Value & Pricing Strategy</span>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{data.product_market_value}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeasibilityReportCard;
