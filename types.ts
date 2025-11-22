

export enum ShiftState {
  LOADING = 'LOADING',
  DISCHARGING = 'DISCHARGING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  IDLE = 'IDLE'
}

export type TallyMethod = 'AVERAGE' | 'STANDARD' | 'MARK' | 'ID' | 'SCALE' | 'MANUAL' | 'UNSPECIFIED';

export interface VesselInfo {
  name: string;
  voyageNo: string;
  imo: string;
}

export interface Hold {
  id: string;
  name: string;
  capacity: number;
  planned: number;
  completed: number;
  status: 'Pending' | 'Active' | 'Done';
}

export interface TallyRecord {
  id: string;
  timestamp: string;
  
  // Identity
  billOfLading: string; // Số vận đơn
  declarationNo: string; // Số tờ khai
  
  // Method & Calc
  tallyMethod: TallyMethod;
  unitWeight: number; // Trọng lượng đơn vị (Tấn)
  packs: number;      // Số kiện
  pcs: number;        // Số lượng (PCS)
  loose: number;      // Số lượng Rời

  // Logistics
  yardLocation: string; // Vị trí bãi
  truckNo: string;      // Số xe
  trailerNo: string;    // Số mooc

  // Context Info
  holdId: string;
  cargoName: string;
  operationMode: string; 
  shoreCrane: string;
  holdForklift: string; 
  craneForklift: string; 
  workerTeam: string; 
  
  // Variable Info
  net: number; // Trọng lượng hàng (MT)
  type: 'LOAD' | 'DISCHARGE' | 'TRANSFER';
  confirmed: boolean; // Trạng thái xác nhận
  notes: string;
}

export interface WeighTicket {
  id: string;
  time: string;
  plateNo: string;
  gross: number;
  tare: number;
  net: number;
  route: string;
  assigned: boolean;
}

export interface LossRecord {
  id: string;
  type: string;
  quantity: number;
  time: string;
  equipment: string;
  notes: string;
}

export interface StopRecord {
  id: string;
  reason: string;
  startTime: string;
  endTime?: string;
  affected: string;
  notes: string;
}

export interface TallyConfig {
  billOfLading: string;
  yardLocation: string;
  holdId: string;
  cargoName: string;
  operationMode: string;
  shoreCrane: string;
  holdForklift: string;
  craneForklift: string;
  workerTeam: string;
}