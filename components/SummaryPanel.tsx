
import React from 'react';
import { Hold, TallyRecord } from '../types';
import { FileText } from 'lucide-react';

interface SummaryPanelProps {
  holds: Hold[];
  records: TallyRecord[];
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ holds, records }) => {
  
  // Calculate simple stats
  const totalShiftTonnage = records.reduce((acc, curr) => acc + curr.net, 0);
  const manifestTotal = holds.reduce((acc, h) => acc + h.planned, 0);
  const totalCompleted = holds.reduce((acc, h) => acc + h.completed, 0) + totalShiftTonnage; // Current + previous
  
  return (
    <div className="flex flex-col gap-3 h-full">
      
      {/* Manifest Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 shrink-0">
         <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
           <FileText className="w-3 h-3" /> Đối chiếu Manifest
         </div>
         <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
               <span className="text-slate-500">Số lượng Manifest</span>
               <span className="font-mono font-bold">{manifestTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
               <span className="text-slate-500">Giám định mớn (Draft)</span>
               <span className="font-mono font-bold">{(manifestTotal * 0.98).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pb-1">
               <span className="text-slate-500">Tổng kiểm đếm</span>
               <span className="font-mono font-bold text-blue-600">{totalCompleted.toLocaleString()}</span>
            </div>
            <div className="bg-yellow-50 text-yellow-800 p-1.5 rounded text-center font-medium border border-yellow-200 mt-2">
               Chênh lệch: -{(manifestTotal - totalCompleted).toLocaleString()} tấn
            </div>
         </div>
      </div>
    </div>
  );
};
