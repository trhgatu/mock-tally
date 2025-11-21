

import React, { useState, useMemo } from 'react';
import { RefreshCw, Settings, Calculator, X, Truck, Check, MousePointerClick, History, MapPin, Lock, Unlock, Search } from 'lucide-react';
import { TallyRecord, TallyConfig, TallyMethod } from '../types';
import { MOCK_HOLDS, CARGO_TYPES, MOCK_VEHICLES } from '../constants';

interface MainGridProps {
  records: TallyRecord[];
  activeHoldId: string;
  operationMode: string;
  onAddRecord: (config: TallyConfig) => void;
  onUpdateRecord: (id: string, field: keyof TallyRecord, value: any) => void;
  onSelectHold: (id: string) => void;
  onRefresh: () => void;
}

// Helper to translate method
const getMethodLabel = (m: TallyMethod) => {
  switch(m) {
    case 'AVERAGE': return 'Trung bình';
    case 'STANDARD': return 'Quy cách';
    case 'MARK': return 'Mark';
    case 'ID': return 'Mã ID';
    case 'SCALE': return 'Cân';
    case 'MANUAL': return 'Nhập tay';
    case 'UNSPECIFIED': return 'Chọn';
    default: return m;
  }
}

export const MainGrid: React.FC<MainGridProps> = ({ records, activeHoldId, operationMode, onUpdateRecord, onRefresh }) => {
  
  // Filter records based on current Operation Mode AND Active Hold
  const displayedRecords = records.filter(r => r.operationMode === operationMode && r.holdId === activeHoldId);

  // Visibility Logic - strict string matching based on user request
  const isDirect = operationMode.includes('giao thẳng') || operationMode.includes('Tàu -> xe'); // Show BL, Hide Yard
  const isYard = operationMode.includes('Nhập bãi');     // Show Yard, Hide BL

  // Popup State for Tally Method
  const [popupRecordId, setPopupRecordId] = useState<string | null>(null);
  const [tempMethod, setTempMethod] = useState<TallyMethod>('AVERAGE');
  const [tempUnitWeight, setTempUnitWeight] = useState<number>(0);

  // Popup State for Vehicle Selection (Yard Mode)
  const [vehiclePopupRecordId, setVehiclePopupRecordId] = useState<string | null>(null);
  const [vehicleColumnType, setVehicleColumnType] = useState<'TRUCK' | 'TRAILER'>('TRUCK');
  const [selectedVehicleString, setSelectedVehicleString] = useState<string>('');
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState<string>('');

  // Popup State for Location History
  const [historyLocation, setHistoryLocation] = useState<string | null>(null);

  // Calculation Logic
  const calculateNet = (record: TallyRecord) => {
    if (record.tallyMethod === 'UNSPECIFIED') return 0;
    
    if (record.tallyMethod === 'AVERAGE' || record.tallyMethod === 'STANDARD' || record.tallyMethod === 'MARK') {
       const packs = record.packs || 0;
       const pcs = record.pcs || 0;
       const loose = record.loose || 0;
       const unit = record.unitWeight || 0; // Unit is now in Tons
       
       const multiplier = packs > 0 ? packs : 1;
       const qty = pcs > 0 ? pcs : 0;
       
       // New Calculation: Unit is TON. 
       // Weight = (Packs * Pcs * Unit) + (Loose * Unit?)
       // Keeping simple: (Multiplier * Pcs * Unit)
       const weight = (multiplier * qty * unit);
       return parseFloat(weight.toFixed(3));
    }
    return record.net;
  };

  const handleValueChange = (id: string, field: keyof TallyRecord, value: any) => {
    // Do not allow editing if confirmed
    const record = records.find(r => r.id === id);
    if (record && record.confirmed) return;

    onUpdateRecord(id, field, value);
    
    // Trigger auto-calc
    if (!record) return;
    
    const nextRecord = { ...record, [field]: value };
    
    if (field === 'packs' || field === 'pcs' || field === 'unitWeight' || field === 'tallyMethod') {
      if (nextRecord.tallyMethod !== 'MANUAL' && nextRecord.tallyMethod !== 'SCALE' && nextRecord.tallyMethod !== 'UNSPECIFIED') {
        const newNet = calculateNet(nextRecord);
        if (newNet !== nextRecord.net) {
           onUpdateRecord(id, 'net', newNet);
        }
      }
    }
  };

  const toggleConfirmRecord = (id: string, currentStatus: boolean) => {
    onUpdateRecord(id, 'confirmed', !currentStatus);
  };

  const openMethodPopup = (record: TallyRecord) => {
    if (record.confirmed) return;
    setPopupRecordId(record.id);
    // If UNSPECIFIED, default to AVERAGE for better UX so user can just click Apply
    setTempMethod(record.tallyMethod === 'UNSPECIFIED' ? 'AVERAGE' : record.tallyMethod);
    setTempUnitWeight(record.unitWeight);
  };

  const saveMethodPopup = () => {
    if (popupRecordId) {
      onUpdateRecord(popupRecordId, 'tallyMethod', tempMethod);
      onUpdateRecord(popupRecordId, 'unitWeight', tempUnitWeight);
      
      // Force recalc
      const record = records.find(r => r.id === popupRecordId);
      if (record) {
         const nextRecord = { ...record, tallyMethod: tempMethod, unitWeight: tempUnitWeight };
         const newNet = calculateNet(nextRecord);
         onUpdateRecord(popupRecordId, 'net', newNet);
      }
      setPopupRecordId(null);
    }
  };

  const openVehiclePopup = (record: TallyRecord, type: 'TRUCK' | 'TRAILER') => {
    if (record.confirmed) return;
    // Allow popup for any mode if it's unconfirmed
    setVehiclePopupRecordId(record.id);
    setVehicleColumnType(type);
    setSelectedVehicleString(''); // Reset selection when opening
    setVehicleSearchTerm(''); // Reset search
  };

  const saveVehiclePopup = () => {
    if (vehiclePopupRecordId && selectedVehicleString) {
      if (vehicleColumnType === 'TRUCK') {
        onUpdateRecord(vehiclePopupRecordId, 'truckNo', selectedVehicleString);
      } else {
        onUpdateRecord(vehiclePopupRecordId, 'trailerNo', selectedVehicleString);
      }
      setVehiclePopupRecordId(null);
      setSelectedVehicleString('');
    }
  };

  // Get History Records for a specific location
  const locationHistoryRecords = useMemo(() => {
    if (!historyLocation) return [];
    return records.filter(r => 
      r.yardLocation === historyLocation && 
      r.operationMode === operationMode &&
      r.holdId === activeHoldId &&
      r.confirmed // Only show confirmed records in history stats? Or all? Usually history implies done.
    );
  }, [historyLocation, records, operationMode, activeHoldId]);

  const historyTotals = useMemo(() => {
    return locationHistoryRecords.reduce((acc, curr) => ({
      packs: acc.packs + (curr.packs || 0),
      pcs: acc.pcs + (curr.pcs || 0),
      loose: acc.loose + (curr.loose || 0),
      net: acc.net + (curr.net || 0)
    }), { packs: 0, pcs: 0, loose: 0, net: 0 });
  }, [locationHistoryRecords]);

  const filteredVehicles = useMemo(() => {
    if (!vehicleSearchTerm) return MOCK_VEHICLES;
    const lower = vehicleSearchTerm.toLowerCase();
    return MOCK_VEHICLES.filter(v => 
      v.truck.toLowerCase().includes(lower) || 
      v.trailer.toLowerCase().includes(lower)
    );
  }, [vehicleSearchTerm]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 relative">
      
      {/* METHOD CONFIG POPUP MODAL */}
      {popupRecordId && (
        <div className="absolute inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-[350px] animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2"><Settings className="w-4 h-4"/> Cấu hình Cách thức</h3>
              <button onClick={() => setPopupRecordId(null)} className="hover:bg-blue-700 p-1 rounded"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Chọn cách thức kiểm đếm</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['AVERAGE', 'STANDARD', 'MARK', 'ID', 'SCALE', 'MANUAL'] as TallyMethod[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setTempMethod(m)}
                      className={`text-xs py-2 px-2 rounded border font-medium transition-all ${
                        tempMethod === m 
                        ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {getMethodLabel(m)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit Weight Input for Calculation Methods */}
              {(tempMethod === 'AVERAGE' || tempMethod === 'STANDARD' || tempMethod === 'MARK') && (
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                   <label className="block text-xs font-bold text-slate-700 mb-1 uppercase flex items-center gap-1">
                     <Calculator className="w-3 h-3"/> Trọng lượng đơn vị (Tấn)
                   </label>
                   <input 
                    type="number" 
                    value={tempUnitWeight}
                    onChange={(e) => setTempUnitWeight(parseFloat(e.target.value))}
                    className="w-full text-sm font-bold text-right p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                   <div className="text-[10px] text-slate-500 mt-1 text-right italic">
                     Net = Kiện x PCS x Đơn trọng (Tấn)
                   </div>
                </div>
              )}
              
              <button 
                onClick={saveMethodPopup}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm shadow-sm"
              >
                ÁP DỤNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE SELECTION POPUP MODAL */}
      {vehiclePopupRecordId && (
        <div className="absolute inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-[400px] flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
            <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Truck className="w-4 h-4"/> Chọn {vehicleColumnType === 'TRUCK' ? 'Số Xe' : 'Số Mooc'}
                </h3>
                <span className="text-[10px] opacity-80">Hướng: {operationMode}</span>
              </div>
              <button onClick={() => setVehiclePopupRecordId(null)} className="hover:bg-green-700 p-1 rounded"><X className="w-4 h-4"/></button>
            </div>
            
            {/* Search Bar */}
            <div className="p-3 bg-slate-100 border-b border-slate-200">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="text" 
                    autoFocus
                    value={vehicleSearchTerm}
                    onChange={(e) => setVehicleSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm xe hoặc mooc..." 
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded shadow-sm focus:ring-1 focus:ring-green-500 outline-none"
                  />
               </div>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
               <div className="text-xs text-slate-500 mb-2 font-medium uppercase">
                 Danh sách {vehicleColumnType === 'TRUCK' ? 'Xe' : 'Mooc'} ({filteredVehicles.length})
               </div>
               <div className="space-y-2">
                  {/* Filter relevant items from MOCK_VEHICLES */}
                  {filteredVehicles.map((v, idx) => {
                    const displayValue = vehicleColumnType === 'TRUCK' ? v.truck : v.trailer;
                    return (
                      <div 
                        key={idx}
                        onClick={() => setSelectedVehicleString(displayValue)}
                        className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedVehicleString === displayValue 
                          ? 'bg-green-50 border-green-500 ring-1 ring-green-500 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-green-300 hover:bg-white'
                        }`}
                      >
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-500 w-10">
                              {vehicleColumnType === 'TRUCK' ? 'Xe:' : 'Mooc:'}
                            </span>
                            <span className="font-bold text-slate-800 text-sm">{displayValue}</span>
                         </div>
                         {selectedVehicleString === displayValue && (
                           <div className="bg-green-600 text-white p-1 rounded-full">
                             <Check className="w-3 h-3"/>
                           </div>
                         )}
                      </div>
                    );
                  })}
                  {filteredVehicles.length === 0 && (
                    <div className="text-center py-4 text-slate-400 italic text-sm">
                      Không tìm thấy kết quả nào.
                    </div>
                  )}
               </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg shrink-0">
               <button 
                onClick={saveVehiclePopup}
                disabled={!selectedVehicleString}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded shadow-sm flex justify-center items-center gap-2 transition-colors"
              >
                {selectedVehicleString ? (
                  <>
                    <Check className="w-4 h-4" /> XÁC NHẬN ({selectedVehicleString})
                  </>
                ) : 'VUI LÒNG CHỌN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCATION HISTORY POPUP */}
      {historyLocation && (
        <div className="absolute inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-[600px] flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center shrink-0">
               <div className="flex flex-col">
                 <h3 className="text-sm font-bold flex items-center gap-2">
                   <History className="w-4 h-4"/> Lịch sử tại {historyLocation}
                 </h3>
                 <span className="text-[10px] opacity-80">Hầm: {MOCK_HOLDS.find(h => h.id === activeHoldId)?.name} | {operationMode}</span>
               </div>
               <button onClick={() => setHistoryLocation(null)} className="hover:bg-indigo-700 p-1 rounded"><X className="w-4 h-4"/></button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-indigo-50 border-b border-indigo-100">
               <div className="bg-white p-2 rounded border border-indigo-100 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase">Tổng Kiện</span>
                  <span className="font-bold text-indigo-700">{historyTotals.packs}</span>
               </div>
               <div className="bg-white p-2 rounded border border-indigo-100 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase">Tổng PCS</span>
                  <span className="font-bold text-indigo-700">{historyTotals.pcs.toLocaleString()}</span>
               </div>
               <div className="bg-white p-2 rounded border border-indigo-100 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase">Tổng Rời</span>
                  <span className="font-bold text-indigo-700">{historyTotals.loose.toLocaleString()}</span>
               </div>
               <div className="bg-white p-2 rounded border border-indigo-100 flex flex-col items-center shadow-sm">
                  <span className="text-[10px] text-slate-500 uppercase">Tổng KL (Tấn)</span>
                  <span className="font-bold text-indigo-700">{historyTotals.net.toFixed(3)}</span>
               </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-auto custom-scrollbar p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-500 sticky top-0">
                  <tr>
                    <th className="p-2 border-b">Giờ</th>
                    <th className="p-2 border-b">Số xe</th>
                    <th className="p-2 border-b">Số mooc</th>
                    <th className="p-2 border-b text-right">Kiện</th>
                    <th className="p-2 border-b text-right">PCS</th>
                    <th className="p-2 border-b text-right">Rời</th>
                    <th className="p-2 border-b text-right font-bold">T.Lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {locationHistoryRecords.map((r, idx) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-indigo-50">
                       <td className="p-2 text-slate-500">{r.timestamp}</td>
                       <td className="p-2 font-bold text-slate-700">{r.truckNo}</td>
                       <td className="p-2 text-slate-600">{r.trailerNo}</td>
                       <td className="p-2 text-right">{r.packs}</td>
                       <td className="p-2 text-right">{r.pcs}</td>
                       <td className="p-2 text-right">{r.loose}</td>
                       <td className="p-2 text-right font-bold text-indigo-700">{r.net}</td>
                    </tr>
                  ))}
                  {locationHistoryRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-4 text-slate-400 italic">Chưa có dữ liệu xác nhận cho vị trí này.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ACTION TOOLBAR */}
      <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase">
               Chi tiết hàng hóa: <span className="text-blue-700">{operationMode}</span>
            </h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                  Hầm: {MOCK_HOLDS.find(h => h.id === activeHoldId)?.name}
               </span>
               <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                  {displayedRecords.length} dòng
               </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onRefresh}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1 font-medium text-xs transition-all" 
              title="Tải lại dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Tải lại</span>
            </button>
          </div>
      </div>

      {/* DATA TABLE */}
      <div className="flex-1 overflow-auto custom-scrollbar relative bg-slate-50">
        <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
          <thead className="text-xs text-slate-500 uppercase bg-slate-100 sticky top-0 z-10 shadow-sm">
            <tr>
              {isDirect && <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[120px] text-blue-700">Số vận đơn</th>}
              {isYard && <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[140px] text-blue-700">Vị trí bãi</th>}
              
              <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[90px]">Cách thức</th>
              <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[70px]">Hầm</th>
              <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[100px]">Loại hàng</th>
              
              {/* Vehicle Columns - Always visible, behavior changes based on state */}
              <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[120px] text-center">Số xe</th>
              <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[120px] text-center">Số mooc</th>
              
              <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[60px] text-center">Kiện</th>
              <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[80px] text-center">PCS</th>
              <th className="p-3 font-bold border-b border-r border-slate-200 min-w-[80px] text-center">Rời</th>
              
              <th className="p-3 font-bold border-b border-r border-slate-200 w-[110px] bg-blue-100 text-blue-800 text-right">Trọng lượng</th>
              <th className="p-3 font-bold border-b border-slate-200 w-[90px] text-center">Xác nhận</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {displayedRecords.map(record => {
               // Dynamic class for read-only state
               const rowClass = record.confirmed ? "bg-slate-50 opacity-90" : "hover:bg-blue-50";
               const inputClass = record.confirmed ? "cursor-not-allowed text-slate-500" : "text-slate-700";

               return (
              <tr key={record.id} className={`border-b border-slate-100 transition-colors group ${rowClass}`}>
                
                {/* 1. Identifier (BL or Yard) */}
                {isDirect && (
                  <td className="p-2 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <Settings className="w-3 h-3 text-slate-300" />
                      <input 
                          type="text" 
                          readOnly={record.confirmed}
                          value={record.billOfLading} 
                          onChange={(e) => handleValueChange(record.id, 'billOfLading', e.target.value)}
                          className={`w-full bg-transparent outline-none font-bold ${inputClass}`}
                        />
                    </div>
                  </td>
                )}
                {isYard && (
                   <td className="p-2 border-r border-slate-100">
                      <div className="flex items-center gap-2 group/yard">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        <input 
                          type="text" 
                          readOnly={record.confirmed}
                          value={record.yardLocation} 
                          onChange={(e) => handleValueChange(record.id, 'yardLocation', e.target.value)}
                          className={`w-full bg-transparent outline-none font-medium ${inputClass}`}
                          placeholder="Nhập vị trí..."
                        />
                        {/* History Button - Only shows if there is a value */}
                        {record.yardLocation && (
                          <button 
                            onClick={() => setHistoryLocation(record.yardLocation)}
                            className="p-1 rounded hover:bg-indigo-100 text-indigo-600 opacity-0 group-hover/yard:opacity-100 transition-opacity"
                            title="Xem lịch sử vị trí này"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                  </td>
                )}

                {/* 2. Method */}
                <td className="p-2 border-r border-slate-100 cursor-pointer" onClick={() => openMethodPopup(record)}>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase flex items-center justify-center gap-1 ${
                    record.tallyMethod === 'SCALE' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    record.tallyMethod === 'MANUAL' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                    record.tallyMethod === 'UNSPECIFIED' ? 'bg-white border-dashed border-slate-300 text-slate-400 italic' :
                    'bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}>
                    {record.tallyMethod === 'UNSPECIFIED' && <MousePointerClick className="w-3 h-3" />}
                    {getMethodLabel(record.tallyMethod)}
                  </span>
                </td>

                {/* 3. Hold */}
                <td className="p-2 border-r border-slate-100 text-center text-slate-600 font-medium">
                   {MOCK_HOLDS.find(h => h.id === record.holdId)?.name}
                </td>

                {/* 4. Cargo Name */}
                 <td className="p-2 border-r border-slate-100">
                   <select 
                    disabled={record.confirmed}
                    value={record.cargoName}
                    onChange={(e) => handleValueChange(record.id, 'cargoName', e.target.value)}
                    className={`w-full bg-transparent outline-none text-xs ${inputClass}`}
                  >
                    {CARGO_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>

                {/* 5. Truck No - Always use Picker when unconfirmed */}
                <td className="p-2 border-r border-slate-100">
                    <div 
                      onClick={() => openVehiclePopup(record, 'TRUCK')} 
                      className={`w-full text-center py-1.5 rounded border flex items-center justify-center gap-2 transition-colors ${
                        record.confirmed 
                         ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                         : 'cursor-pointer bg-white border-slate-200 hover:border-blue-300 shadow-sm' 
                      }`}
                    >
                       {record.truckNo ? (
                         <span className={`font-bold ${inputClass}`}>{record.truckNo}</span>
                       ) : (
                         <span className="text-slate-400 italic text-xs flex items-center gap-1">
                            <MousePointerClick className="w-3 h-3"/> Chọn
                         </span>
                       )}
                    </div>
                </td>

                 {/* 6. Trailer No - Always use Picker when unconfirmed */}
                 <td className="p-2 border-r border-slate-100">
                    <div 
                      onClick={() => openVehiclePopup(record, 'TRAILER')} 
                      className={`w-full text-center py-1.5 rounded border flex items-center justify-center gap-2 transition-colors ${
                        record.confirmed
                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'cursor-pointer bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                      }`}
                    >
                       {record.trailerNo ? (
                         <span className={`text-xs ${inputClass}`}>{record.trailerNo}</span>
                       ) : (
                         <span className="text-slate-400 italic text-xs flex items-center gap-1">
                            <MousePointerClick className="w-3 h-3"/> Chọn
                         </span>
                       )}
                    </div>
                </td>

                {/* 7. Packs (Kiện) */}
                <td className="p-2 border-r border-slate-100">
                  <input 
                    type="number" 
                    readOnly={record.confirmed}
                    value={record.packs} 
                    onChange={(e) => handleValueChange(record.id, 'packs', parseFloat(e.target.value))}
                    className={`w-full bg-transparent outline-none text-center ${inputClass}`}
                  />
                </td>

                {/* 8. PCS */}
                <td className="p-2 border-r border-slate-100">
                  <input 
                    type="number" 
                    readOnly={record.confirmed}
                    value={record.pcs} 
                    onChange={(e) => handleValueChange(record.id, 'pcs', parseFloat(e.target.value))}
                    className={`w-full bg-transparent outline-none text-center font-medium ${inputClass}`}
                  />
                </td>

                {/* 9. Loose (Rời) */}
                <td className="p-2 border-r border-slate-100">
                  <input 
                    type="number" 
                    readOnly={record.confirmed}
                    value={record.loose} 
                    onChange={(e) => handleValueChange(record.id, 'loose', parseFloat(e.target.value))}
                    className={`w-full bg-transparent outline-none text-center font-medium ${inputClass}`}
                  />
                </td>

                {/* 10. Net Weight (Auto-calc or Manual) */}
                <td className="p-2 border-r border-slate-100 bg-blue-50">
                   <input 
                    type="number" 
                    readOnly={record.confirmed || (record.tallyMethod !== 'MANUAL' && record.tallyMethod !== 'SCALE')}
                    value={record.net} 
                    onChange={(e) => handleValueChange(record.id, 'net', parseFloat(e.target.value))}
                    className={`w-full bg-transparent outline-none text-right font-bold px-2 ${
                      (record.tallyMethod !== 'MANUAL' && record.tallyMethod !== 'SCALE') || record.confirmed
                      ? 'text-blue-800 opacity-80' 
                      : 'text-slate-800'
                    }`} 
                  />
                </td>

                {/* 11. Confirmation Column */}
                <td className="p-2 text-center">
                   {record.confirmed ? (
                     <button
                       onClick={() => toggleConfirmRecord(record.id, true)}
                       className="flex justify-center items-center text-green-600 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-colors w-full group/btn"
                       title="Đã khóa. Nhấn để mở khóa và chỉnh sửa."
                     >
                        <Lock className="w-4 h-4 group-hover/btn:hidden" />
                        <Unlock className="w-4 h-4 hidden group-hover/btn:block" />
                     </button>
                   ) : (
                     <button 
                       onClick={() => toggleConfirmRecord(record.id, false)}
                       className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1.5 rounded flex items-center gap-1 justify-center w-full shadow-sm transition-all"
                     >
                        XÁC NHẬN
                     </button>
                   )}
                </td>

              </tr>
            )})}
            {displayedRecords.length === 0 && (
               <tr>
                 <td colSpan={12} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                       <Truck className="w-10 h-10 opacity-20" />
                       <p className="text-sm italic">Không có dữ liệu cho "{operationMode}" tại Hầm {activeHoldId}.</p>
                       <p className="text-xs opacity-60">Vui lòng thử chọn Hầm khác hoặc đổi hướng làm hàng.</p>
                    </div>
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};