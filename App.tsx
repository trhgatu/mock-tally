

import React, { useState } from 'react';
import { Header } from './components/Header';
import { MainGrid } from './components/MainGrid';
import { 
  INITIAL_TALLY_RECORDS, OPERATION_MODES, MOCK_HOLDS, MOCK_VESSELS
} from './constants';
import { ShiftState, TallyRecord, TallyConfig } from './types';

export default function App() {
  // Set default to DISCHARGING to avoid "IDLE/Chờ lệnh"
  const [shiftState, setShiftState] = useState<ShiftState>(ShiftState.DISCHARGING);
  
  // Defaults
  const [operationMode, setOperationMode] = useState(OPERATION_MODES[0].options[0]); // "Nhập bãi"
  const [activeHoldId, setActiveHoldId] = useState('H1');
  
  const [records, setRecords] = useState<TallyRecord[]>(INITIAL_TALLY_RECORDS);
  const [vesselInfo, setVesselInfo] = useState(MOCK_VESSELS[0]);

  // Shift Time Tracking
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const handleStartShift = () => {
    setShiftState(ShiftState.DISCHARGING);
    const now = new Date();
    setStartTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleEndShift = () => {
    setShiftState(ShiftState.COMPLETED);
    const now = new Date();
    setEndTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleRefresh = () => {
    // Simulate fetching latest data from backend by resetting to initial state or fetching logic
    // In a real app, this would be an API call.
    // Here we just refresh the list to simulate a reload.
    setRecords([...INITIAL_TALLY_RECORDS]);
  };

  const handleAddRecord = (config: TallyConfig) => {
    const newRecord: TallyRecord = {
      id: `T${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      
      // New Fields
      billOfLading: config.billOfLading || '',
      tallyMethod: 'UNSPECIFIED',
      unitWeight: 0.05, // default 0.05 Ton (50kg)
      packs: 0,
      pcs: 0,
      loose: 0,
      yardLocation: config.yardLocation || '',
      truckNo: '',
      trailerNo: '',

      // Apply context from config
      holdId: config.holdId,
      cargoName: config.cargoName,
      operationMode: config.operationMode,
      shoreCrane: config.shoreCrane,
      holdForklift: config.holdForklift,
      craneForklift: config.craneForklift,
      workerTeam: config.workerTeam,
      
      net: 0,
      type: config.operationMode.includes('Xuất') ? 'LOAD' : 'DISCHARGE',
      confirmed: false,
      notes: ''
    };
    setRecords([newRecord, ...records]);
  };

  const handleUpdateRecord = (id: string, field: keyof TallyRecord, value: any) => {
    setRecords(records.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 text-slate-800 overflow-hidden">
      {/* 1. HEADER */}
      <Header 
        vesselInfo={vesselInfo}
        shiftState={shiftState}
        operationMode={operationMode}
        activeHoldId={activeHoldId}
        holds={MOCK_HOLDS}
        startTime={startTime}
        endTime={endTime}
        onVesselChange={setVesselInfo}
        onOperationModeChange={setOperationMode}
        onHoldChange={setActiveHoldId}
        onStartShift={handleStartShift}
        onEndShift={handleEndShift}
      />

      {/* 2. MAIN CONTENT - Full width, no sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-2 overflow-hidden bg-slate-100 flex flex-col">
           <MainGrid 
             records={records} 
             activeHoldId={activeHoldId}
             operationMode={operationMode}
             onAddRecord={handleAddRecord}
             onUpdateRecord={handleUpdateRecord}
             onSelectHold={setActiveHoldId}
             onRefresh={handleRefresh}
           />
        </main>
      </div>
    </div>
  );
}