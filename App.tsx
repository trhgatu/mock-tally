import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { MainGrid } from './components/MainGrid';
import {
  INITIAL_TALLY_RECORDS, OPERATION_MODES, MOCK_HOLDS, MOCK_VESSELS
} from './constants';
import { ShiftState, TallyRecord, TallyConfig } from './types';

// Format seconds → HH:MM:SS
const formatDuration = (sec: number): string => {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function App() {
  // Default shift state
  const [shiftState, setShiftState] = useState<ShiftState>(ShiftState.DISCHARGING);

  // Defaults
  const [operationMode, setOperationMode] = useState(OPERATION_MODES[0].options[0]);
  const [activeHoldId, setActiveHoldId] = useState('H1');

  const [records, setRecords] = useState<TallyRecord[]>(INITIAL_TALLY_RECORDS);
  const [vesselInfo, setVesselInfo] = useState(MOCK_VESSELS[0]);

  // Shift Time Tracking
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start shift
  const handleStartShift = () => {
    setShiftState(ShiftState.DISCHARGING);

    const now = new Date();
    setStartTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setEndTime(null);
    setElapsedSeconds(0);

    // Clear old interval if exists
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  // End shift
  const handleEndShift = () => {
    setShiftState(ShiftState.COMPLETED);

    const now = new Date();
    setEndTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup interval khi unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleRefresh = () => {
    setRecords([...INITIAL_TALLY_RECORDS]);
  };

  const handleAddRecord = (config: TallyConfig) => {
    const newRecord: TallyRecord = {
      id: `T${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false, hour: '2-digit', minute: '2-digit' }),

      billOfLading: config.billOfLading || '',
      tallyMethod: 'UNSPECIFIED',
      unitWeight: 0.05,
      packs: 0,
      pcs: 0,
      loose: 0,
      yardLocation: config.yardLocation || '',
      truckNo: '',
      trailerNo: '',

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
      {/* HEADER */}
      <Header
        vesselInfo={vesselInfo}
        shiftState={shiftState}
        operationMode={operationMode}
        activeHoldId={activeHoldId}
        holds={MOCK_HOLDS}
        startTime={startTime}
        endTime={endTime}
        elapsedTimeFormatted={formatDuration(elapsedSeconds)}
        onVesselChange={setVesselInfo}
        onOperationModeChange={setOperationMode}
        onHoldChange={setActiveHoldId}
        onStartShift={handleStartShift}
        onEndShift={handleEndShift}
      />

      {/* MAIN */}
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
