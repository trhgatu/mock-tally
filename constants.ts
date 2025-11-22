






import { Hold, TallyRecord } from "./types";

export const MOCK_HOLDS: Hold[] = [
  { id: 'H1', name: 'Hầm 1', capacity: 5000, planned: 4800, completed: 2100, status: 'Active' },
  { id: 'H2', name: 'Hầm 2', capacity: 5500, planned: 5200, completed: 0, status: 'Pending' },
  { id: 'H3', name: 'Hầm 3', capacity: 5000, planned: 4900, completed: 4900, status: 'Done' },
  { id: 'H4', name: 'Hầm 4', capacity: 4500, planned: 4000, completed: 1200, status: 'Active' },
];

export const MOCK_VESSELS = [
  { name: 'MV. OCEAN GLORY', voyageNo: 'V.2023/09', imo: '9876543' },
  { name: 'MV. PACIFIC STAR', voyageNo: 'V.2023/10', imo: '9123456' },
  { name: 'BARGE HP-5566', voyageNo: 'B.01/10', imo: 'N/A' },
  { name: 'BARGE SG-9988', voyageNo: 'B.02/10', imo: 'N/A' },
  { name: 'MV. VIET THUAN 56', voyageNo: 'VT.56-01', imo: '9988771' },
  { name: 'MV. HAI NAM 88', voyageNo: 'HN.88-02', imo: '9911223' },
  { name: 'BARGE LA-1234', voyageNo: 'LA.12/23', imo: 'N/A' },
];

export const MOCK_VEHICLES = [
  { truck: '15C-123.45', trailer: '15R-001.22' },
  { truck: '15C-222.33', trailer: '15R-002.33' },
  { truck: '15C-333.44', trailer: '15R-003.44' },
  { truck: '15C-444.55', trailer: '15R-004.55' },
  { truck: '15C-555.66', trailer: '15R-005.66' },
  { truck: '15C-666.77', trailer: '15R-006.77' },
  { truck: '15C-777.88', trailer: '15R-007.88' },
  { truck: '15C-888.99', trailer: '15R-008.99' },
  { truck: '15C-999.00', trailer: '15R-009.00' },
  { truck: '15C-101.01', trailer: '15R-010.01' },
  { truck: '29C-567.89', trailer: '29R-111.22' },
  { truck: '14C-321.65', trailer: '14R-333.44' },
  { truck: '16C-987.12', trailer: '16R-555.66' },
];

export const OPERATION_MODES = [
  {
    label: 'Nhập tàu (Discharge)',
    options: [
      'Nhập bãi',
      'Nhập giao thẳng Tàu -> xe',
      'Nhập giao thẳng Tàu -> sà lan'
    ]
  },
  {
    label: 'Xuất tàu (Loading)',
    options: [
      'Xuất thông thường (Bãi -> Tàu)',
      'Xuất giao thẳng (Xe -> Tàu)',
      'Xuất giao thẳng (Sà lan -> Tàu)'
    ]
  }
];

export const INITIAL_TALLY_RECORDS: TallyRecord[] = Array.from({ length: 35 }, (_, i) => {
  // Logic to create mixed data for demonstration
  // Rows 0-12: Direct Delivery (Giao thẳng)
  // Rows 13-24: Yard Import (Nhập bãi)
  const isDirect = i < 15;
  const opMode = isDirect ? 'Nhập giao thẳng Tàu -> xe' : 'Nhập bãi';

  // Distribute across 4 holds
  const holdIndex = i % 4; // 0, 1, 2, 3
  const holdId = `H${holdIndex + 1}`;

  // Unit weight in tons (e.g. 0.05T = 50kg)
  const unitWeight = 0.05;
  const packs = 20 + (i % 5);
  const pcs = 1000 + (i * 10);

  // New Logic: First 10 records are UNCONFIRMED
  const isUnconfirmed = i < 10;

  return {
    id: `T${1000 + i}`,
    timestamp: `08:${10 + i}`,
    // Direct has BL, No Yard. Yard has Yard, No BL.
    billOfLading: isDirect ? `BL-00${200 + i}` : '',
    yardLocation: !isDirect ? `Bãi A${(i % 3) + 1}` : '',

    tallyMethod: isUnconfirmed ? 'UNSPECIFIED' : (isDirect ? 'AVERAGE' : 'STANDARD'),
    unitWeight: unitWeight,
    packs: 0,
    pcs: 0,
    loose: 0,

    // For UNCONFIRMED records: Empty (User must select)
    // For CONFIRMED records: Pre-filled
    truckNo: isUnconfirmed ? '' : (isDirect ? `15C-${100 + i}.88` : ''),
    trailerNo: isUnconfirmed ? '' : (isDirect ? `15R-${800 + i}.99` : ''),

    holdId: holdId,
    cargoName: 'Tole nóng',
    operationMode: opMode,
    shoreCrane: 'Cẩu bờ 01',
    holdForklift: 'Xe nâng 01',
    craneForklift: 'Xe nâng 05',
    workerTeam: 'Tổ 1',
    // Net = Packs * Pcs * Unit (Ton)
    net: parseFloat((packs * pcs * unitWeight).toFixed(3)),
    type: 'DISCHARGE',
    confirmed: !isUnconfirmed, // First 10 are false, rest are true
    notes: ''
  };
});

export const CARGO_TYPES = ['Than', 'Clinker', 'Quặng sắt', 'Ngũ cốc', 'Thép cuộn', 'Container'];
export const OPERATIONS = ['Xếp hàng', 'Dỡ hàng', 'Chuyển tải'];
export const SHORE_CRANES = ['Cẩu bờ 01', 'Cẩu bờ 02', 'Cẩu tàu 1', 'Cẩu tàu 2', 'Cẩu nổi'];
export const FORKLIFTS = ['Không sử dụng', 'Xe nâng 01', 'Xe nâng 02', 'Xe nâng 03', 'Xe nâng 04', 'Xe nâng 05'];
export const WORKER_TEAMS = ['Tổ công nhân 1', 'Tổ công nhân 2', 'Tổ công nhân 3', 'Tổ thuê ngoài'];
export const ROUTES = ['Kho A', 'Kho B', 'Xe tải', 'Sà lan', 'Phễu'];