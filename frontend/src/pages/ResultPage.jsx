import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import FinancialRoadmapCard from '../components/FinancialRoadmapCard';
import FeasibilityReportCard from '../components/FeasibilityReportCard';
import { getFinancialPlan, getFeasibilityReport } from '../services/api';

const ResultPage = () => {
  const locationState = useLocation().state;
  const navigate = useNavigate();

  const [financialData, setFinancialData] = useState(null);
  const [feasibilityData, setFeasibilityData] = useState(null);
  
  const [isFinancialLoading, setIsFinancialLoading] = useState(true);
  const [isFeasibilityLoading, setIsFeasibilityLoading] = useState(true);

  const [financialError, setFinancialError] = useState(null);
  const [feasibilityError, setFeasibilityError] = useState(null);

  const marginCapital = locationState?.available_margin_capital || 100000;
  const userLocation = locationState?.location || 'Rural Block';
  const category = locationState?.business_category || 'Dairy & Livestock Farming';

  useEffect(() => {
    if (!locationState || !locationState.available_margin_capital) {
      // If user navigated directly without state, redirect to input page
      // navigate('/');
    }

    // 1. Fetch Module 2 Financial Plan (Fast, Deterministic)
    setIsFinancialLoading(true);
    getFinancialPlan({
      available_margin_capital: marginCapital,
      location: userLocation,
      business_category: category
    })
      .then((res) => {
        setFinancialData(res);
        setIsFinancialLoading(false);

        // 2. Fetch Module 1 Feasibility Report using calculated Project Cost
        if (res && res.project_cost && !res.out_of_scope) {
          setIsFeasibilityLoading(true);
          getFeasibilityReport({
            location: userLocation,
            business_category: category,
            project_cost: res.project_cost
          })
            .then((fRes) => {
              setFeasibilityData(fRes);
              setIsFeasibilityLoading(false);
            })
            .catch((err) => {
              console.error('Feasibility report error:', err);
              setFeasibilityError('Feasibility report service temporarily unavailable.');
              setIsFeasibilityLoading(false);
            });
        } else {
          setIsFeasibilityLoading(false);
        }
      })
      .catch((err) => {
        console.error('Financial plan error:', err);
        setFinancialError('Unable to generate financial roadmap.');
        setIsFinancialLoading(false);
        setIsFeasibilityLoading(false);
      });
  }, [marginCapital, userLocation, category]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      {/* Top Header Navbar */}
      <div className="bg-slate-900 text-white py-4 px-4 sm:px-8 border-b border-slate-800 sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Naya Calculation Karein</span>
          </button>
          <div className="text-right">
            <span className="text-[11px] text-emerald-400 font-semibold block uppercase tracking-wider">SIH 2026 PS 26091</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100">Dual-Module Enterprise Advisory</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* User Query Context Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Aapke Input Parameters:</span>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm font-bold text-slate-800">
              <span>Margin Capital: <span className="text-emerald-700">₹{marginCapital?.toLocaleString('en-IN')}</span></span>
              <span>Location: <span className="text-slate-900">{userLocation}</span></span>
              <span>Category: <span className="text-indigo-700">{category}</span></span>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Analysis
          </button>
        </div>

        {/* SECTION A: CARD A — FINANCIAL ROADMAP (MODULE 2) */}
        {isFinancialLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center animate-pulse shadow-sm">
            <div className="inline-block p-3 bg-emerald-100 text-emerald-700 rounded-full mb-3">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Calculating Upward Financial Roadmap...</h3>
            <p className="text-xs text-slate-500 mt-1">Margin ÷ 10% → Total Project Cost → 90% Govt Loan Amount</p>
          </div>
        ) : financialError ? (
          <div className="bg-red-50 border border-red-200 text-red-900 p-5 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Financial Engine Connection Error</h4>
              <p className="text-xs mt-0.5">{financialError}</p>
            </div>
          </div>
        ) : (
          <FinancialRoadmapCard data={financialData} />
        )}

        {/* SECTION B: CARD B — FEASIBILITY REPORT (MODULE 1) */}
        {financialData && !financialData.out_of_scope && (
          <div>
            <FeasibilityReportCard data={feasibilityData} isLoading={isFeasibilityLoading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
