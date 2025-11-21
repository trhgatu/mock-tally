
import React from 'react';
import { Box, Layers } from 'lucide-react';
import { Hold } from '../types';
import { CARGO_TYPES } from '../constants';

interface CargoPanelProps {
  activeHoldId: string;
  holds: Hold[];
  onSelectHold: (id: string) => void;
}

export const CargoPanel: React.FC<CargoPanelProps> = ({ activeHoldId, holds, onSelectHold }) => {
  return (
    <div className="flex flex-col gap-3 h-full">
      
      {/* 1. Cargo Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden shrink-0">
        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-2">
          <Box className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-bold text-slate-700 uppercase">Thông tin hàng hóa</h3>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="label-xs">Tên hàng</label>
              <select className="input-sm">
                {CARGO_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Mã nội bộ</label>
              <input type="text" className="input-sm" defaultValue="CGO-2025-X" />
            </div>
            <div>
              <label className="label-xs">Loại hàng</label>
              <select className="input-sm">
                <option>Hàng rời</option>
                <option>Hàng bao</option>
                <option>Container</option>
              </select>
            </div>
            <div>
              <label className="label-xs">Nghiệp vụ</label>
              <select className="input-sm text-green-700 font-semibold">
                <option>Nhập khẩu (Import)</option>
                <option>Xuất khẩu (Export)</option>
                <option>Trung chuyển</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2">
             <h4 className="text-[10px] font-bold text-slate-500 mb-1 uppercase">Sản lượng Kế hoạch (QPlan)</h4>
             <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                   <input type="number" defaultValue={25000} className="input-sm font-mono text-right pr-8" />
                   <span className="absolute right-2 top-1.5 text-xs text-slate-400">MT</span>
                </div>
                <div className="relative">
                   <input type="number" defaultValue={10} className="input-sm font-mono text-right pr-8" />
                   <span className="absolute right-2 top-1.5 text-xs text-slate-400">%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Hold Structure Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-[200px]">
        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
             <Layers className="w-4 h-4 text-slate-600" />
             <h3 className="text-xs font-bold text-slate-700 uppercase">Danh sách hầm</h3>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 font-medium">Hầm</th>
                <th className="px-2 py-2 font-medium text-right">Kế hoạch</th>
                <th className="px-2 py-2 font-medium text-center">T.Thái</th>
              </tr>
            </thead>
            <tbody>
              {holds.map(hold => {
                const isActive = hold.id === activeHoldId;
                return (
                  <tr 
                    key={hold.id} 
                    onClick={() => onSelectHold(hold.id)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-3 py-2 font-medium text-slate-800">{hold.name}</td>
                    <td className="px-2 py-2 text-right font-mono text-slate-600">{hold.planned.toLocaleString()}</td>
                    <td className="px-2 py-2 text-center">
                       <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                         hold.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                         hold.status === 'Done' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                         'bg-yellow-50 text-yellow-700 border-yellow-200'
                       }`}>
                         {hold.status === 'Active' ? 'Đang làm' : hold.status === 'Done' ? 'Xong' : 'Chờ'}
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .label-xs { display: block; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
        .input-sm { width: 100%; font-size: 0.875rem; background-color: #fff; border: 1px solid #cbd5e1; border-radius: 0.25rem; padding: 0.25rem 0.5rem; outline: none; }
        .input-sm:focus { border-color: #3b82f6; ring: 1px solid #3b82f6; }
      `}</style>
    </div>
  );
};
