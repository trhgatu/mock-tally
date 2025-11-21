import React, { useState } from 'react';
import { Scale, AlertTriangle, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { WeighTicket, LossRecord, StopRecord } from '../types';

interface BottomPanelProps {
  tickets: WeighTicket[];
  losses: LossRecord[];
  stops: StopRecord[];
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ tickets, losses, stops }) => {
  const [activeTab, setActiveTab] = useState<'WEIGHT' | 'LOSS'>('WEIGHT');

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button 
          onClick={() => setActiveTab('WEIGHT')}
          className={`px-4 py-2 text-xs font-bold uppercase flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'WEIGHT' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
        >
          <Scale className="w-4 h-4" /> Tích hợp cân
        </button>
        <button 
          onClick={() => setActiveTab('LOSS')}
          className={`px-4 py-2 text-xs font-bold uppercase flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'LOSS' ? 'border-red-600 text-red-700 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
        >
          <AlertTriangle className="w-4 h-4" /> Tổn thất & Dừng việc
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-0">
        {activeTab === 'WEIGHT' && (
          <div className="flex flex-col h-full">
             <div className="p-2 bg-slate-50 border-b border-slate-100 flex gap-2">
               <input type="text" placeholder="Tìm biển số..." className="text-xs p-1.5 border border-slate-300 rounded" />
               <select className="text-xs p-1.5 border border-slate-300 rounded"><option>Tất cả trạng thái</option><option>Chưa gán</option></select>
               <div className="flex-1"></div>
               <button className="text-xs bg-slate-800 text-white px-3 py-1 rounded flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Tự động gán</button>
             </div>
             <div className="flex-1 overflow-auto custom-scrollbar">
               <table className="w-full text-left text-xs">
                 <thead className="bg-slate-100 text-slate-500 sticky top-0">
                   <tr>
                     <th className="p-2">Thời gian</th>
                     <th className="p-2">Mã phiếu</th>
                     <th className="p-2">Biển số</th>
                     <th className="p-2 text-right">Tổng (Gross)</th>
                     <th className="p-2 text-right">Bì (Tare)</th>
                     <th className="p-2 text-right font-bold">Hàng (Net)</th>
                     <th className="p-2">Tuyến</th>
                     <th className="p-2 text-center">Thao tác</th>
                   </tr>
                 </thead>
                 <tbody>
                   {tickets.map(t => (
                     <tr key={t.id} className="border-b border-slate-100 hover:bg-blue-50">
                       <td className="p-2 text-slate-600">{t.time}</td>
                       <td className="p-2 font-mono">{t.id}</td>
                       <td className="p-2 font-bold text-slate-700">{t.plateNo}</td>
                       <td className="p-2 text-right">{t.gross.toFixed(2)}</td>
                       <td className="p-2 text-right text-slate-400">{t.tare.toFixed(2)}</td>
                       <td className="p-2 text-right font-bold text-blue-700">{t.net.toFixed(2)}</td>
                       <td className="p-2 truncate max-w-[100px]">{t.route}</td>
                       <td className="p-2 text-center">
                         {!t.assigned && (
                           <button className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 border border-blue-200 flex items-center gap-1 mx-auto">
                             Gán <ArrowRight className="w-3 h-3" />
                           </button>
                         )}
                         {t.assigned && <span className="text-green-600 font-bold">✓</span>}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'LOSS' && (
          <div className="grid grid-cols-2 gap-4 p-3 h-full">
             {/* Losses Column */}
             <div className="border border-slate-200 rounded-lg flex flex-col">
                <div className="bg-red-50 p-2 border-b border-red-100 text-red-800 font-bold text-xs uppercase">Tổn thất đã ghi</div>
                <div className="flex-1 overflow-auto p-2">
                  {losses.length === 0 ? <div className="text-slate-400 text-xs text-center mt-4">Chưa có dữ liệu</div> : (
                    <ul className="space-y-2">
                      {losses.map(l => (
                        <li key={l.id} className="text-xs bg-red-50 border border-red-100 p-2 rounded">
                          <div className="flex justify-between font-bold text-red-700">
                            <span>{l.type}</span>
                            <span>{l.quantity} tấn</span>
                          </div>
                          <div className="text-red-500 mt-1">{l.time} | {l.equipment} | {l.notes}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button className="m-2 text-xs bg-red-600 hover:bg-red-700 text-white py-1.5 rounded shadow-sm">+ Thêm tổn thất</button>
             </div>

             {/* Stops Column */}
             <div className="border border-slate-200 rounded-lg flex flex-col">
                <div className="bg-orange-50 p-2 border-b border-orange-100 text-orange-800 font-bold text-xs uppercase">Dừng việc / Thời gian chết</div>
                <div className="flex-1 overflow-auto p-2">
                   {stops.length === 0 ? <div className="text-slate-400 text-xs text-center mt-4">Chưa có dữ liệu</div> : (
                    <ul className="space-y-2">
                      {stops.map(s => (
                        <li key={s.id} className="text-xs bg-orange-50 border border-orange-100 p-2 rounded">
                          <div className="flex justify-between font-bold text-orange-800">
                            <span>{s.reason}</span>
                            <span>{s.startTime} - {s.endTime || '...'}</span>
                          </div>
                          <div className="text-orange-600 mt-1">{s.affected} | {s.notes}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button className="m-2 text-xs bg-orange-600 hover:bg-orange-700 text-white py-1.5 rounded shadow-sm">+ Thêm dừng việc</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};