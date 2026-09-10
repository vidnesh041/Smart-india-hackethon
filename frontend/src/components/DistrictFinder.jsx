import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { stateDistrictsData, getDistrictInfo } from '../data/districtDirectory';
import { MapPin, Phone, Building2, Landmark, Compass, CheckCircle2 } from 'lucide-react';

const DistrictFinder = ({ defaultState = "Uttar Pradesh", defaultDistrict = "" }) => {
  const { lang } = useLanguage();
  const [selectedState, setSelectedState] = useState(defaultState || "Uttar Pradesh");
  const [selectedDistrictName, setSelectedDistrictName] = useState(defaultDistrict || "");

  const currentStateData = stateDistrictsData.find(s => s.state === selectedState) || stateDistrictsData[0];
  const info = getDistrictInfo(selectedState, selectedDistrictName);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B3D91] to-[#072a66] p-5 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-xs">
            <MapPin className="w-5 h-5 text-[#FF9933]" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">
              {lang === 'hi' ? 'निकटतम जिला उद्योग केंद्र (DIC) व सरकारी कार्यालय' : 'Nearest District Industries Centre (DIC) & Nodal Office'}
            </h3>
            <p className="text-xs text-blue-100">
              {lang === 'hi' ? 'अपने जिले में प्रत्यक्ष आवेदन व सहायता हेतु अधिकृत केंद्र' : 'Physical submission & field officer assistance centers'}
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block bg-[#138808] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
          {lang === 'hi' ? 'सत्यापित पता' : 'Verified Directory'}
        </span>
      </div>

      {/* Selectors */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/70">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {lang === 'hi' ? 'राज्य चुनें (Select State):' : 'Select State:'}
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrictName("");
              }}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
            >
              {stateDistrictsData.map(s => (
                <option key={s.state} value={s.state}>
                  {lang === 'hi' ? s.stateHi : s.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {lang === 'hi' ? 'जिला चुनें (Select District):' : 'Select District:'}
            </label>
            <select
              value={selectedDistrictName || currentStateData.districts[0]?.name}
              onChange={(e) => setSelectedDistrictName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
            >
              {currentStateData.districts.map(d => (
                <option key={d.name} value={d.name}>
                  {lang === 'hi' ? d.nameHi : d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* District Info Grid */}
      {info && (
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: District Industries Centre (DIC) */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
              <div className="flex items-center space-x-2 text-[#0B3D91]">
                <Building2 className="w-4 h-4 text-[#0B3D91]" />
                <h4 className="font-extrabold text-sm">
                  {lang === 'hi' ? 'जिला उद्योग केंद्र (DIC)' : 'District Industries Centre (DIC)'}
                </h4>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {info.district.dicOffice}
              </p>
              <div className="text-[11px] text-blue-900 bg-white p-2 rounded border border-blue-100 font-mono">
                📞 {info.district.contact}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                👤 {info.district.dicOfficer}
              </div>
            </div>

            {/* Card 2: Khadi & Village Board (KVIB) */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900">
                <Landmark className="w-4 h-4 text-amber-700" />
                <h4 className="font-extrabold text-sm">
                  {lang === 'hi' ? 'खादी एवं ग्रामोद्योग बोर्ड (KVIB / KVIC)' : 'Khadi & Village Industries (KVIB)'}
                </h4>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {info.district.kvibOffice}
              </p>
              <div className="text-[11px] text-amber-900 bg-white p-2 rounded border border-amber-100">
                🏦 <strong>{lang === 'hi' ? 'अग्रणी जिला बैंक:' : 'Lead Bank:'}</strong> {info.district.leadBank}
              </div>
            </div>

          </div>

          {/* State Channelizing Agency Strip */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                {lang === 'hi' ? 'राज्य चैनलाइजिंग एजेंसी (SCA / MoSJE)' : 'State Channelizing Agency (SCA)'}
              </span>
              <h5 className="font-bold text-sm text-slate-900">
                {info.scaName}
              </h5>
              <p className="text-xs text-slate-600">
                {info.scaAddress}
              </p>
            </div>
            <div className="flex-shrink-0 bg-[#0B3D91] text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>{info.helpline}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictFinder;
