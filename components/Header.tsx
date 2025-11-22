import React from 'react';
import { Ship, Play, Square, Anchor, ArrowRightLeft, Layers, Clock } from 'lucide-react';
import { ShiftState, VesselInfo, Hold } from '../types';
import { OPERATION_MODES, MOCK_VESSELS } from '../constants';

interface HeaderProps {
  vesselInfo: VesselInfo;
  shiftState: ShiftState;
  operationMode: string;
  activeHoldId: string;
  holds: Hold[];
  startTime: string | null;
  endTime: string | null;
  elapsedTimeFormatted: string;
  onVesselChange: (vessel: VesselInfo) => void;
  onOperationModeChange: (mode: string) => void;
  onHoldChange: (holdId: string) => void;
  onStartShift: () => void;
  onEndShift: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  vesselInfo, shiftState, operationMode, activeHoldId, holds,
  startTime, endTime, elapsedTimeFormatted,
  onVesselChange, onOperationModeChange, onHoldChange, onStartShift, onEndShift
}) => {

  const handleVesselSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = MOCK_VESSELS.find(v => v.name === e.target.value);
    if (selected) onVesselChange(selected);
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm px-4 py-2">
      <div className="grid grid-cols-12 gap-4 items-start">

        {/* Group 1: Vessel Info & Operation Mode */}
        <div className="col-span-6 border-r border-slate-200 pr-4">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold uppercase text-xs tracking-wider">
            <Ship className="w-4 h-4" />
            Thông Tin Tàu & Hướng Làm Hàng
          </div>

          <div className="flex flex-col gap-3">
            {/* Row 1: Vessel Selection */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <label className="block text-[10px] text-slate-500 uppercase mb-0.5">Chọn Tàu / Sà lan</label>
                <select
                  value={vesselInfo.name}
                  onChange={handleVesselSelect}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-300 rounded px-2 py-1.5"
                >
                  {MOCK_VESSELS.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-3">
                <label className="block text-[10px] text-slate-500 uppercase mb-0.5">Số chuyến</label>
                <input
                  type="text"
                  value={vesselInfo.voyageNo}
                  readOnly
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-500"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-[10px] text-slate-500 uppercase mb-0.5">IMO</label>
                <input
                  type="text"
                  value={vesselInfo.imo}
                  readOnly
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-500"
                />
              </div>
            </div>

            {/* Row 2: Operation Mode & Hold Selection */}
            <div className="grid grid-cols-12 gap-2 bg-blue-50 p-2 rounded border border-blue-100">

              <div className="col-span-8 border-r border-blue-200 pr-2">
                <label className="block text-[10px] text-blue-600 font-bold uppercase flex items-center gap-1 mb-0.5">
                  <ArrowRightLeft className="w-3 h-3" /> Hướng làm hàng
                </label>
                <select
                  value={operationMode}
                  onChange={(e) => onOperationModeChange(e.target.value)}
                  className="w-full text-sm font-bold text-blue-800 bg-white border border-blue-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {OPERATION_MODES.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="col-span-4 pl-1">
                <label className="block text-[10px] text-blue-600 font-bold uppercase flex items-center gap-1 mb-0.5">
                  <Layers className="w-3 h-3" /> Chọn Hầm
                </label>
                <select
                  value={activeHoldId}
                  onChange={(e) => onHoldChange(e.target.value)}
                  className="w-full text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                >
                  {holds.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Group 2: Shift Plan Info */}
        <div className="col-span-4 border-r border-slate-200 pr-4 px-4">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold uppercase text-xs tracking-wider">
            <Anchor className="w-4 h-4" />
            Kế Hoạch Ca
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-0.5">Dự kiến Bắt đầu</label>
                <input type="datetime-local" className="w-full text-sm bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-500" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-0.5">Dự kiến Kết thúc</label>
                <input type="datetime-local" className="w-full text-sm bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-0.5">Loại ca</label>
              <select className="w-full text-sm bg-white border border-slate-300 rounded px-2 py-1.5">
                <option>Ca 1 (06:00 - 14:00)</option>
                <option>Ca 2 (14:00 - 22:00)</option>
                <option>Ca 3 (22:00 - 06:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Group 3: Controls & Timer */}
        <div className="col-span-2 flex flex-col gap-2 justify-end h-full">

          <div className="mb-1">
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Thời gian ca làm việc
            </label>

            {/* REALTIME TIMER */}
            <div className="bg-slate-800 text-white text-center py-1.5 rounded text-xs font-mono font-bold tracking-wide border border-slate-600 shadow-inner">
              {elapsedTimeFormatted}
            </div>

            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-700 text-white p-1.5 rounded text-center shadow-inner">
                <div className="uppercase text-[9px] text-slate-400">Bắt đầu</div>
                <div className="font-bold">{startTime || '--:--:--'}</div>
              </div>

              <div className="bg-slate-700 text-white p-1.5 rounded text-center shadow-inner">
                <div className="uppercase text-[9px] text-slate-400">Kết thúc</div>
                <div className="font-bold">{endTime || '--:--:--'}</div>
              </div>
            </div>


          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-auto pt-1">
            <button
              onClick={onStartShift}
              disabled={
                shiftState !== ShiftState.IDLE &&
                shiftState !== ShiftState.PAUSED &&
                shiftState !== ShiftState.COMPLETED &&
                shiftState !== ShiftState.DISCHARGING
              }
              className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded shadow-sm font-bold text-xs uppercase transition-colors"
            >
              <Play className="w-3 h-3" /> Bắt đầu
            </button>

            <button
              onClick={onEndShift}
              className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded shadow-sm font-bold text-xs uppercase transition-colors"
            >
              <Square className="w-3 h-3" /> Kết thúc
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
