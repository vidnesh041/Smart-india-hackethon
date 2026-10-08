import React, { useState } from 'react';
import { Landmark, TrendingUp, Calendar, ShieldCheck, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const FinancialRoadmapCard = ({ data }) => {
  const [showSchedule, setShowSchedule] = useState(false);

  if (!data) return null;

  if (data.out_of_scope) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 text-amber-800 mb-3">
          <AlertTriangle className="w-7 h-7 text-amber-600 flex-shrink-0" />
          <h3 className="text-xl font-bold">Project Out of Scope (₹50 Lakh Limit Exceeded)</h3>
        </div>
        <p className="text-amber-900 leading-relaxed font-medium">
          {data.message}
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm bg-white p-4 rounded-lg border border-amber-200">
          <div>
            <span className="text-slate-500 block text-xs">Your Available Margin (10%):</span>
            <span className="font-bold text-slate-800">₹{data.margin_capital?.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Total Project Cost:</span>
            <span className="font-bold text-slate-800">₹{data.project_cost?.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Loan Required (90%):</span>
            <span className="font-bold text-slate-800">₹{data.loan_amount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Landmark className="w-7 h-7 text-emerald-300" />
            <div>
              <h2 className="text-xl font-extrabold tracking-wide">Card A: Aapka Financial Roadmap</h2>
              <p className="text-emerald-100 text-xs mt-0.5">Module 2 — Deterministic Concessional Loan Structure</p>
            </div>
          </div>
          <span className="bg-emerald-600/80 text-emerald-50 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-400/30">
            Pure Python Calculation
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stat Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-xs font-medium block uppercase tracking-wider">Your Margin (10%)</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              ₹{data.margin_capital?.toLocaleString('en-IN')}
            </span>
            <span className="text-emerald-700 text-[11px] font-medium mt-1 block">✓ Cash Provided by You</span>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <span className="text-emerald-800 text-xs font-semibold block uppercase tracking-wider">Total Project Cost</span>
            <span className="text-xl font-black text-emerald-900 mt-1 block">
              ₹{data.project_cost?.toLocaleString('en-IN')}
            </span>
            <span className="text-emerald-700 text-[11px] font-medium mt-1 block">Margin ÷ 10%</span>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <span className="text-blue-800 text-xs font-semibold block uppercase tracking-wider">Govt Loan Amount (90%)</span>
            <span className="text-xl font-black text-blue-900 mt-1 block">
              ₹{data.loan_amount?.toLocaleString('en-IN')}
            </span>
            <span className="text-blue-700 text-[11px] font-medium mt-1 block">Project Cost × 90%</span>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <span className="text-purple-800 text-xs font-semibold block uppercase tracking-wider">Scheme Matched</span>
            <span className="text-base font-bold text-purple-900 mt-1 block truncate">
              {data.scheme_selected}
            </span>
            <span className="text-purple-700 text-[11px] font-medium mt-1 block">Auto-Selected by Budget</span>
          </div>
        </div>

        {/* Scheme Financial Parameters */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="border-r border-slate-200 last:border-0 pr-3">
            <span className="text-xs text-slate-500 font-medium uppercase block">Interest Rate</span>
            <span className="text-lg font-bold text-slate-800 mt-0.5 block">{data.interest_rate}% p.a.</span>
            <span className="text-[11px] text-slate-500">Concessional Rate</span>
          </div>

          <div className="border-r border-slate-200 last:border-0 px-3">
            <span className="text-xs text-slate-500 font-medium uppercase block">Loan Tenure</span>
            <span className="text-lg font-bold text-slate-800 mt-0.5 block">{data.tenure_years} Years</span>
            <span className="text-[11px] text-slate-500">{data.tenure_years * 4} Quarters Total</span>
          </div>

          <div className="pl-3">
            <span className="text-xs text-slate-500 font-medium uppercase block">Moratorium Period</span>
            <span className="text-lg font-bold text-emerald-700 mt-0.5 block">{data.moratorium_months} Months</span>
            <span className="text-[11px] text-emerald-600 font-medium">No EMI Due in this window</span>
          </div>
        </div>

        {/* Moratorium & Working Capital Note */}
        {data.estimated_working_capital_during_moratorium && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-xs text-teal-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Moratorium & Working Capital Support:</p>
              <p className="mt-0.5 text-teal-800">
                During your initial {data.moratorium_months}-month moratorium period, zero principal repayment is due.
                Recommended working capital buffer: <strong>₹{data.estimated_working_capital_during_moratorium?.toLocaleString('en-IN')}</strong> to comfortably run operations before repayment starts.
              </p>
            </div>
          </div>
        )}

        {/* Repayment Schedule Accordion */}
        {data.repayment_schedule && data.repayment_schedule.length > 0 && (
          <div>
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-lg text-sm font-bold text-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                Quarterly Repayment Schedule ({data.repayment_schedule.length} Quarters)
              </span>
              {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSchedule && (
              <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-100 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Quarter</th>
                      <th className="px-3 py-2">Amount Due</th>
                      <th className="px-3 py-2">Principal</th>
                      <th className="px-3 py-2">Interest</th>
                      <th className="px-3 py-2">Remaining Balance</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {data.repayment_schedule.map((entry) => (
                      <tr key={entry.quarter} className={entry.is_moratorium ? 'bg-emerald-50/60 font-medium' : ''}>
                        <td className="px-3 py-2 font-semibold text-slate-700">Q{entry.quarter}</td>
                        <td className="px-3 py-2 font-bold text-slate-900">
                          {entry.amount_due > 0 ? `₹${entry.amount_due.toLocaleString('en-IN')}` : '₹0'}
                        </td>
                        <td className="px-3 py-2 text-slate-600">₹{entry.principal_payment.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-slate-600">₹{entry.interest_payment.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">₹{entry.remaining_balance.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2">
                          {entry.is_moratorium ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              Moratorium
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">{entry.note}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialRoadmapCard;
