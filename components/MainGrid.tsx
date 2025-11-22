import React, { useState, useMemo } from 'react';
import {
  RefreshCw, X, MousePointerClick, History, MapPin, Lock, Unlock
} from 'lucide-react';

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

const getMethodLabel = (m: TallyMethod) => {
  switch (m) {
    case 'AVERAGE': return 'Trung bình';
    case 'STANDARD': return 'Quy cách';
    case 'MARK': return 'Mark';
    case 'ID': return 'Mã ID';
    case 'SCALE': return 'Cân';
    case 'MANUAL': return 'Nhập tay';
    case 'UNSPECIFIED': return 'Chọn';
    default: return m;
  }
};

export const MainGrid: React.FC<MainGridProps> = ({
  records, activeHoldId, operationMode, onUpdateRecord, onRefresh
}) => {

  // Filter based on mode + hold
  const displayedRecords = records.filter(
    r => r.operationMode === operationMode && r.holdId === activeHoldId
  );

  // visibility logic
  const isDirect = operationMode.includes('giao thẳng') || operationMode.includes('Tàu -> xe');
  const isYard = operationMode.includes('Nhập bãi');

  // Vehicle picker popup
  const [vehiclePopupRecordId, setVehiclePopupRecordId] = useState<string | null>(null);
  const [vehicleColumnType, setVehicleColumnType] = useState<'TRUCK' | 'TRAILER'>('TRUCK');
  const [selectedVehicleString, setSelectedVehicleString] = useState('');
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');

  // Yard location history popup
  const [historyLocation, setHistoryLocation] = useState<string | null>(null);

  // filter vehicles
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearchTerm) return MOCK_VEHICLES;
    const term = vehicleSearchTerm.toLowerCase();
    return MOCK_VEHICLES.filter(v =>
      v.truck.toLowerCase().includes(term) ||
      v.trailer.toLowerCase().includes(term)
    );
  }, [vehicleSearchTerm]);

  const handleValueChange = (id: string, field: keyof TallyRecord, value: any) => {
    const record = records.find(r => r.id === id);
    if (record?.confirmed) return;
    onUpdateRecord(id, field, value);
  };

  const toggleConfirmRecord = (id: string, current: boolean) => {
    onUpdateRecord(id, 'confirmed', !current);
  };

  const openVehiclePopup = (record: TallyRecord, type: 'TRUCK' | 'TRAILER') => {
    if (record.confirmed) return;
    setVehiclePopupRecordId(record.id);
    setVehicleColumnType(type);
    setSelectedVehicleString('');
    setVehicleSearchTerm('');
  };

  const saveVehiclePopup = () => {
    if (!vehiclePopupRecordId || !selectedVehicleString) return;

    if (vehicleColumnType === 'TRUCK') {
      onUpdateRecord(vehiclePopupRecordId, 'truckNo', selectedVehicleString);
    } else {
      onUpdateRecord(vehiclePopupRecordId, 'trailerNo', selectedVehicleString);
    }
    setVehiclePopupRecordId(null);
  };

  // location history lists
  const locationHistoryRecords = useMemo(() => {
    if (!historyLocation) return [];
    return records.filter(r =>
      r.yardLocation === historyLocation &&
      r.operationMode === operationMode &&
      r.holdId === activeHoldId &&
      r.confirmed
    );
  }, [historyLocation, records, operationMode, activeHoldId]);

  const historyTotals = useMemo(() => {
    return locationHistoryRecords.reduce((acc, curr) => ({
      packs: acc.packs + (curr.packs || 0),
      pcs: acc.pcs + (curr.pcs || 0),
      loose: acc.loose + (curr.loose || 0)
    }), { packs: 0, pcs: 0, loose: 0 });
  }, [locationHistoryRecords]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 relative">

      {/* VEHICLE SELECT MODAL */}
      {vehiclePopupRecordId && (
        <div className="absolute inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-[400px] max-h-[80vh] flex flex-col">

            <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
              <span className="text-sm font-bold">
                Chọn {vehicleColumnType === 'TRUCK' ? 'Số xe' : 'Số mooc'}
              </span>
              <button onClick={() => setVehiclePopupRecordId(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-100">
              <input
                type="text"
                autoFocus
                placeholder="Tìm kiếm..."
                className="w-full p-2 text-sm border border-slate-300 rounded"
                value={vehicleSearchTerm}
                onChange={e => setVehicleSearchTerm(e.target.value)}
              />
            </div>

            <div className="p-4 overflow-auto space-y-2">
              {filteredVehicles.map((v, i) => {
                const value = vehicleColumnType === 'TRUCK' ? v.truck : v.trailer;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedVehicleString(value)}
                    className={`p-3 border rounded cursor-pointer ${selectedVehicleString === value
                        ? 'border-green-600 bg-green-50'
                        : 'border-slate-200 hover:border-green-400'
                      }`}
                  >
                    <span className="font-bold">{value}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={saveVehiclePopup}
                disabled={!selectedVehicleString}
                className="w-full bg-green-600 text-white py-2 rounded disabled:bg-slate-300"
              >
                Xác nhận
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LOCATION HISTORY MODAL */}
      {historyLocation && (
        <div className="absolute inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-[600px] max-h-[80vh] shadow-xl flex flex-col border border-slate-300">

            <div className="bg-indigo-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
              <span className="text-sm font-bold">
                Lịch sử vị trí — {historyLocation}
              </span>
              <button onClick={() => setHistoryLocation(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-50 border-b border-indigo-200">
              <div className="bg-white rounded p-2 text-center border border-indigo-100">
                <div className="text-[10px] text-slate-500 uppercase">Tổng kiện</div>
                <div className="font-bold text-indigo-700">{historyTotals.packs}</div>
              </div>
              <div className="bg-white rounded p-2 text-center border border-indigo-100">
                <div className="text-[10px] text-slate-500 uppercase">Tổng PCS</div>
                <div className="font-bold text-indigo-700">{historyTotals.pcs}</div>
              </div>
              <div className="bg-white rounded p-2 text-center border border-indigo-100">
                <div className="text-[10px] text-slate-500 uppercase">Tổng rời</div>
                <div className="font-bold text-indigo-700">{historyTotals.loose}</div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-500 sticky top-0">
                  <tr>
                    <th className="p-2 border-b">Giờ</th>
                    <th className="p-2 border-b">Xe</th>
                    <th className="p-2 border-b">Mooc</th>
                    <th className="p-2 border-b">Kiện</th>
                    <th className="p-2 border-b">PCS</th>
                    <th className="p-2 border-b">Rời</th>
                  </tr>
                </thead>
                <tbody>
                  {locationHistoryRecords.map(r => (
                    <tr key={r.id} className="border-b text-slate-700">
                      <td className="p-2">{r.timestamp}</td>
                      <td className="p-2 font-bold">{r.truckNo}</td>
                      <td className="p-2">{r.trailerNo}</td>
                      <td className="p-2 text-right">{r.packs}</td>
                      <td className="p-2 text-right">{r.pcs}</td>
                      <td className="p-2 text-right">{r.loose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="px-4 py-2 border-b flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase">
            Chi tiết hàng hóa — <span className="text-blue-700">{operationMode}</span>
          </h2>

          <span className="text-[10px] px-2 py-0.5 bg-slate-100 border rounded text-slate-500">
            Hầm: {MOCK_HOLDS.find(h => h.id === activeHoldId)?.name}
          </span>

          <span className="text-[10px] px-2 py-0.5 bg-slate-100 border rounded text-slate-500">
            {displayedRecords.length} dòng
          </span>
        </div>

        <button
          onClick={onRefresh}
          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1 text-xs"
        >
          <RefreshCw className="w-4 h-4" />
          Tải lại
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-500 uppercase text-xs sticky top-0">
            <tr>
              {isDirect && (
                <th className="p-3 border-b border-r min-w-[120px]">Số vận đơn</th>
              )}
              {isYard && (
                <th className="p-3 border-b border-r min-w-[140px]">Vị trí bãi</th>
              )}
              <th className="p-3 border-b border-r min-w-[90px]">Cách thức</th>
              <th className="p-3 border-b border-r min-w-[70px]">Hầm</th>
              <th className="p-3 border-b border-r min-w-[100px]">Loại hàng</th>
              <th className="p-3 border-b border-r min-w-[120px] text-center">Số xe</th>
              <th className="p-3 border-b border-r min-w-[120px] text-center">Số mooc</th>
              <th className="p-3 border-b border-r min-w-[60px] text-center">Kiện</th>
              <th className="p-3 border-b border-r min-w-[80px] text-center">PCS</th>
              <th className="p-3 border-b min-w-[80px] text-center">Rời</th>
              <th className="p-3 border-b w-[90px] text-center">Xác nhận</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {displayedRecords.map(record => {
              const inputClass = record.confirmed
                ? 'cursor-not-allowed text-slate-500'
                : 'text-slate-700';

              return (
                <tr key={record.id} className="border-b hover:bg-blue-50">

                  {/* BL / Yard */}
                  {isDirect && (
                    <td className="p-2 border-r">
                      <input
                        type="text"
                        readOnly={record.confirmed}
                        value={record.billOfLading}
                        onChange={e =>
                          handleValueChange(record.id, 'billOfLading', e.target.value)
                        }
                        className={`w-full bg-transparent outline-none font-bold ${inputClass}`}
                      />
                    </td>
                  )}

                  {isYard && (
                    <td className="p-2 border-r">
                      <div className="flex items-center gap-2 group">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        <input
                          type="text"
                          readOnly={record.confirmed}
                          value={record.yardLocation}
                          onChange={e =>
                            handleValueChange(record.id, 'yardLocation', e.target.value)
                          }
                          className={`w-full bg-transparent outline-none ${inputClass}`}
                        />

                        {record.yardLocation && (
                          <button
                            onClick={() => setHistoryLocation(record.yardLocation!)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-indigo-600 rounded hover:bg-indigo-100"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Method — INLINE DROPDOWN */}
                  <td className="p-2 border-r">
                    <select
                      disabled={record.confirmed}
                      value={record.tallyMethod}
                      onChange={(e) =>
                        handleValueChange(record.id, 'tallyMethod', e.target.value as TallyMethod)
                      }
                      className={`w-full bg-white text-xs font-bold px-2 py-1 rounded border outline-none ${record.confirmed
                          ? 'cursor-not-allowed border-slate-200 text-slate-400'
                          : 'border-indigo-300 text-indigo-700'
                        }`}
                    >
                      <option value="UNSPECIFIED">Chọn</option>
                      <option value="AVERAGE">Trung bình</option>
                      <option value="STANDARD">Quy cách</option>
                      <option value="MARK">Mark</option>
                      <option value="ID">Mã ID</option>
                      <option value="SCALE">Cân</option>
                      <option value="MANUAL">Nhập tay</option>
                    </select>
                  </td>

                  {/* Hold */}
                  <td className="p-2 border-r text-center text-slate-600">
                    {MOCK_HOLDS.find(h => h.id === record.holdId)?.name}
                  </td>

                  <td className="p-2 border-r">
                    <div className="text-xs font-bold text-slate-700">
                      {record.cargoName}
                    </div>
                  </td>
                  <td className="p-2 border-r text-center">
                    <div
                      onClick={() => openVehiclePopup(record, 'TRUCK')}
                      className={`px-2 py-1 border rounded cursor-pointer ${record.confirmed
                          ? 'bg-slate-50 cursor-not-allowed border-slate-200'
                          : 'hover:border-blue-400 bg-white border-slate-300'
                        }`}
                    >
                      {record.truckNo || (
                        <span className="text-slate-400 text-xs flex items-center justify-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          Chọn
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Trailer */}
                  <td className="p-2 border-r text-center">
                    <div
                      onClick={() => openVehiclePopup(record, 'TRAILER')}
                      className={`px-2 py-1 border rounded cursor-pointer ${record.confirmed
                          ? 'bg-slate-50 cursor-not-allowed'
                          : 'hover:border-blue-400 bg-white border-slate-300'
                        }`}
                    >
                      {record.trailerNo || (
                        <span className="text-slate-400 text-xs flex items-center justify-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          Chọn
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Packs */}
                  <td className="p-2 border-r">
                    <input
                      type="number"
                      readOnly={record.confirmed}
                      value={record.packs}
                      onChange={e =>
                        handleValueChange(record.id, 'packs', parseFloat(e.target.value))
                      }
                      className={`w-full bg-transparent outline-none text-center ${inputClass}`}
                    />
                  </td>

                  {/* PCS */}
                  <td className="p-2 border-r">
                    <input
                      type="number"
                      readOnly={record.confirmed}
                      value={record.pcs}
                      onChange={e =>
                        handleValueChange(record.id, 'pcs', parseFloat(e.target.value))
                      }
                      className={`w-full bg-transparent outline-none text-center ${inputClass}`}
                    />
                  </td>

                  {/* Loose */}
                  <td className="p-2 border-r">
                    <input
                      type="number"
                      readOnly={record.confirmed}
                      value={record.loose}
                      onChange={e =>
                        handleValueChange(record.id, 'loose', parseFloat(e.target.value))
                      }
                      className={`w-full bg-transparent outline-none text-center ${inputClass}`}
                    />
                  </td>

                  {/* Confirm */}
                  <td className="p-2 text-center">
                    {record.confirmed ? (
                      <button
                        onClick={() => toggleConfirmRecord(record.id, true)}
                        className="text-green-600 hover:text-red-600 hover:bg-red-50 p-1 rounded"
                        title="Mở khóa để chỉnh sửa"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleConfirmRecord(record.id, false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-2 py-1.5 rounded shadow-sm"
                      >
                        Xác nhận
                      </button>
                    )}
                  </td>

                </tr>
              );
            })}

            {displayedRecords.length === 0 && (
              <tr>
                <td colSpan={12} className="p-12 text-center text-slate-400 italic">
                  Không có dữ liệu cho chế độ "{operationMode}" tại Hầm {activeHoldId}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
