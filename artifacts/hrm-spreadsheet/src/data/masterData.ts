export type EvalClass = 'A' | 'B' | 'C';

export interface Department {
  id: string;
  code: string;
  name: string;
  manager: string;
  email: string;
  employeeCount: number;
  description: string;
}

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  departmentId: string;
  jobTitle: string;
  joinedDate: string;
  currentClass: EvalClass;
  email: string;
}

export interface Skill {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  category: string;
  weight: number;
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
}

export interface Campaign {
  id: string;
  title: string;
  type: 'Monthly' | 'Quarterly' | 'Bi-Annually' | 'Custom';
  department: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Archived';
  startDate: string;
  endDate: string;
  notes: string;
}

export const DEPARTMENTS: Department[] = [
  { id: 'UPH', code: 'UPH', name: 'Upholstery', manager: 'محمد عبدالله', email: 'upholstery@hrm-dev.sa', employeeCount: 22, description: 'Furniture upholstery and fabric work' },
  { id: 'PNT', code: 'PNT', name: 'Painting', manager: 'أحمد الشمري', email: 'painting@hrm-dev.sa', employeeCount: 18, description: 'Wood painting and finishing' },
  { id: 'NWD', code: 'NWD', name: 'Natural Wood', manager: 'خالد المطيري', email: 'naturalwood@hrm-dev.sa', employeeCount: 16, description: 'Natural wood processing and carpentry' },
  { id: 'ASM', code: 'ASM', name: 'Assembly', manager: 'فهد الدوسري', email: 'assembly@hrm-dev.sa', employeeCount: 20, description: 'Furniture assembly and installation' },
  { id: 'CUT', code: 'CUT', name: 'Cutting', manager: 'سعد العتيبي', email: 'cutting@hrm-dev.sa', employeeCount: 12, description: 'Precision cutting and sawing' },
  { id: 'QC', code: 'QC', name: 'Quality Control', manager: 'عمر الزهراني', email: 'qc@hrm-dev.sa', employeeCount: 10, description: 'Quality inspection and control' },
  { id: 'LOG', code: 'LOG', name: 'Logistics', manager: 'بندر الغامدي', email: 'logistics@hrm-dev.sa', employeeCount: 14, description: 'Warehouse, shipping, and logistics' },
  { id: 'MNT', code: 'MNT', name: 'Maintenance', manager: 'نواف الحربي', email: 'maintenance@hrm-dev.sa', employeeCount: 8, description: 'Machine and facility maintenance' },
  { id: 'ADM', code: 'ADM', name: 'Administration', manager: 'ريم السبيعي', email: 'admin@hrm-dev.sa', employeeCount: 26, description: 'HR, finance, and administration' },
];

export const EMPLOYEES: Employee[] = [
  // Upholstery (22 employees)
  { id: 'E001', code: 'UPH-001', fullName: 'Ahmed Al-Rashidi', departmentId: 'UPH', jobTitle: 'Senior Upholsterer', joinedDate: '2018-03-15', currentClass: 'A', email: 'ahmed.rashidi@hrm-dev.sa' },
  { id: 'E002', code: 'UPH-002', fullName: 'Mohammed Saleh', departmentId: 'UPH', jobTitle: 'Upholsterer', joinedDate: '2019-07-01', currentClass: 'A', email: 'mohammed.saleh@hrm-dev.sa' },
  { id: 'E003', code: 'UPH-003', fullName: 'Abdullah Nasser', departmentId: 'UPH', jobTitle: 'Upholsterer', joinedDate: '2020-01-10', currentClass: 'B', email: 'abdullah.nasser@hrm-dev.sa' },
  { id: 'E004', code: 'UPH-004', fullName: 'Ibrahim Al-Anazi', departmentId: 'UPH', jobTitle: 'Junior Upholsterer', joinedDate: '2021-05-20', currentClass: 'B', email: 'ibrahim.anazi@hrm-dev.sa' },
  { id: 'E005', code: 'UPH-005', fullName: 'Khalid Al-Shehri', departmentId: 'UPH', jobTitle: 'Upholsterer', joinedDate: '2019-11-03', currentClass: 'A', email: 'khalid.shehri@hrm-dev.sa' },
  { id: 'E006', code: 'UPH-006', fullName: 'Omar Farouk', departmentId: 'UPH', jobTitle: 'Fabric Cutter', joinedDate: '2022-02-14', currentClass: 'C', email: 'omar.farouk@hrm-dev.sa' },
  { id: 'E007', code: 'UPH-007', fullName: 'Faisal Al-Mutairi', departmentId: 'UPH', jobTitle: 'Upholsterer', joinedDate: '2018-09-25', currentClass: 'A', email: 'faisal.mutairi@hrm-dev.sa' },
  { id: 'E008', code: 'UPH-008', fullName: 'Sultan Al-Bishi', departmentId: 'UPH', jobTitle: 'Junior Upholsterer', joinedDate: '2023-01-08', currentClass: 'C', email: 'sultan.bishi@hrm-dev.sa' },
  // Painting (18 employees)
  { id: 'E009', code: 'PNT-001', fullName: 'Nawaf Al-Harbi', departmentId: 'PNT', jobTitle: 'Senior Painter', joinedDate: '2017-06-12', currentClass: 'A', email: 'nawaf.harbi@hrm-dev.sa' },
  { id: 'E010', code: 'PNT-002', fullName: 'Saad Al-Otaibi', departmentId: 'PNT', jobTitle: 'Painter', joinedDate: '2019-03-22', currentClass: 'B', email: 'saad.otaibi@hrm-dev.sa' },
  { id: 'E011', code: 'PNT-003', fullName: 'Bandar Al-Ghamdi', departmentId: 'PNT', jobTitle: 'Painter', joinedDate: '2020-08-17', currentClass: 'B', email: 'bandar.ghamdi@hrm-dev.sa' },
  { id: 'E012', code: 'PNT-004', fullName: 'Rashed Al-Dosari', departmentId: 'PNT', jobTitle: 'Junior Painter', joinedDate: '2022-04-05', currentClass: 'C', email: 'rashed.dosari@hrm-dev.sa' },
  { id: 'E013', code: 'PNT-005', fullName: 'Turki Al-Zahrani', departmentId: 'PNT', jobTitle: 'Painter', joinedDate: '2018-12-20', currentClass: 'A', email: 'turki.zahrani@hrm-dev.sa' },
  { id: 'E014', code: 'PNT-006', fullName: 'Majed Al-Qahtani', departmentId: 'PNT', jobTitle: 'Painter', joinedDate: '2021-02-28', currentClass: 'B', email: 'majed.qahtani@hrm-dev.sa' },
  // Natural Wood (16 employees)
  { id: 'E015', code: 'NWD-001', fullName: 'Hamad Al-Subai', departmentId: 'NWD', jobTitle: 'Senior Carpenter', joinedDate: '2016-10-05', currentClass: 'A', email: 'hamad.subai@hrm-dev.sa' },
  { id: 'E016', code: 'NWD-002', fullName: 'Waleed Al-Aqeel', departmentId: 'NWD', jobTitle: 'Carpenter', joinedDate: '2019-05-14', currentClass: 'A', email: 'waleed.aqeel@hrm-dev.sa' },
  { id: 'E017', code: 'NWD-003', fullName: 'Abdulrahman Salem', departmentId: 'NWD', jobTitle: 'Carpenter', joinedDate: '2020-07-30', currentClass: 'B', email: 'abdulrahman.salem@hrm-dev.sa' },
  { id: 'E018', code: 'NWD-004', fullName: 'Yasser Al-Habib', departmentId: 'NWD', jobTitle: 'Junior Carpenter', joinedDate: '2022-11-12', currentClass: 'C', email: 'yasser.habib@hrm-dev.sa' },
  { id: 'E019', code: 'NWD-005', fullName: 'Nasser Al-Fahad', departmentId: 'NWD', jobTitle: 'Carpenter', joinedDate: '2018-04-18', currentClass: 'A', email: 'nasser.fahad@hrm-dev.sa' },
  // Assembly (20 employees)
  { id: 'E020', code: 'ASM-001', fullName: 'Sami Al-Jadaan', departmentId: 'ASM', jobTitle: 'Senior Assembler', joinedDate: '2017-08-22', currentClass: 'A', email: 'sami.jadaan@hrm-dev.sa' },
  { id: 'E021', code: 'ASM-002', fullName: 'Adel Al-Saqer', departmentId: 'ASM', jobTitle: 'Assembler', joinedDate: '2019-01-17', currentClass: 'B', email: 'adel.saqer@hrm-dev.sa' },
  { id: 'E022', code: 'ASM-003', fullName: 'Hani Al-Zubair', departmentId: 'ASM', jobTitle: 'Assembler', joinedDate: '2020-06-09', currentClass: 'B', email: 'hani.zubair@hrm-dev.sa' },
  { id: 'E023', code: 'ASM-004', fullName: 'Talal Al-Malki', departmentId: 'ASM', jobTitle: 'Junior Assembler', joinedDate: '2022-09-03', currentClass: 'C', email: 'talal.malki@hrm-dev.sa' },
  { id: 'E024', code: 'ASM-005', fullName: 'Bassam Al-Khatiri', departmentId: 'ASM', jobTitle: 'Assembler', joinedDate: '2018-07-16', currentClass: 'A', email: 'bassam.khatiri@hrm-dev.sa' },
  // Cutting (12 employees)
  { id: 'E025', code: 'CUT-001', fullName: 'Misfer Al-Shammari', departmentId: 'CUT', jobTitle: 'CNC Operator', joinedDate: '2018-02-27', currentClass: 'A', email: 'misfer.shammari@hrm-dev.sa' },
  { id: 'E026', code: 'CUT-002', fullName: 'Raed Al-Turki', departmentId: 'CUT', jobTitle: 'Cutter', joinedDate: '2020-10-14', currentClass: 'B', email: 'raed.turki@hrm-dev.sa' },
  { id: 'E027', code: 'CUT-003', fullName: 'Walid Al-Rifai', departmentId: 'CUT', jobTitle: 'Junior Cutter', joinedDate: '2023-03-05', currentClass: 'C', email: 'walid.rifai@hrm-dev.sa' },
  { id: 'E028', code: 'CUT-004', fullName: 'Ziad Al-Rasheed', departmentId: 'CUT', jobTitle: 'CNC Operator', joinedDate: '2019-09-21', currentClass: 'A', email: 'ziad.rasheed@hrm-dev.sa' },
  // Quality Control (10 employees)
  { id: 'E029', code: 'QC-001', fullName: 'Emad Al-Qahtani', departmentId: 'QC', jobTitle: 'QC Inspector', joinedDate: '2017-05-08', currentClass: 'A', email: 'emad.qahtani@hrm-dev.sa' },
  { id: 'E030', code: 'QC-002', fullName: 'Fahad Mansour', departmentId: 'QC', jobTitle: 'QC Inspector', joinedDate: '2020-03-11', currentClass: 'B', email: 'fahad.mansour@hrm-dev.sa' },
  { id: 'E031', code: 'QC-003', fullName: 'Khaled Al-Juhani', departmentId: 'QC', jobTitle: 'Junior QC Inspector', joinedDate: '2022-07-19', currentClass: 'B', email: 'khaled.juhani@hrm-dev.sa' },
  // Logistics (14 employees)
  { id: 'E032', code: 'LOG-001', fullName: 'Tarek Al-Buraik', departmentId: 'LOG', jobTitle: 'Warehouse Supervisor', joinedDate: '2016-11-30', currentClass: 'A', email: 'tarek.buraik@hrm-dev.sa' },
  { id: 'E033', code: 'LOG-002', fullName: 'Salem Al-Subaie', departmentId: 'LOG', jobTitle: 'Forklift Operator', joinedDate: '2019-04-07', currentClass: 'B', email: 'salem.subaie@hrm-dev.sa' },
  { id: 'E034', code: 'LOG-003', fullName: 'Musaed Al-Omari', departmentId: 'LOG', jobTitle: 'Delivery Driver', joinedDate: '2021-08-24', currentClass: 'B', email: 'musaed.omari@hrm-dev.sa' },
  { id: 'E035', code: 'LOG-004', fullName: 'Ghazi Al-Shamrani', departmentId: 'LOG', jobTitle: 'Inventory Clerk', joinedDate: '2022-01-17', currentClass: 'C', email: 'ghazi.shamrani@hrm-dev.sa' },
  // Maintenance (8 employees)
  { id: 'E036', code: 'MNT-001', fullName: 'Abdulaziz Al-Osaimi', departmentId: 'MNT', jobTitle: 'Senior Technician', joinedDate: '2015-06-01', currentClass: 'A', email: 'abdulaziz.osaimi@hrm-dev.sa' },
  { id: 'E037', code: 'MNT-002', fullName: 'Sultan Bahamdan', departmentId: 'MNT', jobTitle: 'Maintenance Technician', joinedDate: '2020-02-10', currentClass: 'B', email: 'sultan.bahamdan@hrm-dev.sa' },
  { id: 'E038', code: 'MNT-003', fullName: 'Naif Al-Barqi', departmentId: 'MNT', jobTitle: 'Junior Technician', joinedDate: '2023-05-15', currentClass: 'C', email: 'naif.barqi@hrm-dev.sa' },
  // Administration (26 employees)
  { id: 'E039', code: 'ADM-001', fullName: 'Reem Al-Subai', departmentId: 'ADM', jobTitle: 'HR Manager', joinedDate: '2015-01-15', currentClass: 'A', email: 'reem.subai@hrm-dev.sa' },
  { id: 'E040', code: 'ADM-002', fullName: 'Maha Al-Najdi', departmentId: 'ADM', jobTitle: 'Accountant', joinedDate: '2018-05-20', currentClass: 'A', email: 'maha.najdi@hrm-dev.sa' },
  { id: 'E041', code: 'ADM-003', fullName: 'Sara Al-Dawsari', departmentId: 'ADM', jobTitle: 'HR Coordinator', joinedDate: '2020-09-01', currentClass: 'B', email: 'sara.dawsari@hrm-dev.sa' },
  { id: 'E042', code: 'ADM-004', fullName: 'Nora Al-Aqeel', departmentId: 'ADM', jobTitle: 'Receptionist', joinedDate: '2021-03-14', currentClass: 'B', email: 'nora.aqeel@hrm-dev.sa' },
  { id: 'E043', code: 'ADM-005', fullName: 'Lama Al-Sulami', departmentId: 'ADM', jobTitle: 'Admin Assistant', joinedDate: '2022-06-08', currentClass: 'C', email: 'lama.sulami@hrm-dev.sa' },
  // Additional employees to reach 50+
  { id: 'E044', code: 'UPH-009', fullName: 'Badr Al-Qahtani', departmentId: 'UPH', jobTitle: 'Upholsterer', joinedDate: '2020-04-12', currentClass: 'B', email: 'badr.qahtani@hrm-dev.sa' },
  { id: 'E045', code: 'PNT-007', fullName: 'Salman Al-Ruwaili', departmentId: 'PNT', jobTitle: 'Painter', joinedDate: '2020-11-25', currentClass: 'B', email: 'salman.ruwaili@hrm-dev.sa' },
  { id: 'E046', code: 'NWD-006', fullName: 'Tariq Al-Shehab', departmentId: 'NWD', jobTitle: 'Carpenter', joinedDate: '2021-07-03', currentClass: 'B', email: 'tariq.shehab@hrm-dev.sa' },
  { id: 'E047', code: 'ASM-006', fullName: 'Mutab Al-Harbi', departmentId: 'ASM', jobTitle: 'Assembler', joinedDate: '2021-10-20', currentClass: 'B', email: 'mutab.harbi@hrm-dev.sa' },
  { id: 'E048', code: 'LOG-005', fullName: 'Mansour Al-Utaibi', departmentId: 'LOG', jobTitle: 'Warehouse Clerk', joinedDate: '2022-03-09', currentClass: 'C', email: 'mansour.utaibi@hrm-dev.sa' },
  { id: 'E049', code: 'QC-004', fullName: 'Mazen Al-Harith', departmentId: 'QC', jobTitle: 'QC Inspector', joinedDate: '2021-11-01', currentClass: 'B', email: 'mazen.harith@hrm-dev.sa' },
  { id: 'E050', code: 'CUT-005', fullName: 'Muath Al-Barrak', departmentId: 'CUT', jobTitle: 'Cutter', joinedDate: '2021-06-15', currentClass: 'B', email: 'muath.barrak@hrm-dev.sa' },
  { id: 'E051', code: 'ADM-006', fullName: 'Dina Al-Amri', departmentId: 'ADM', jobTitle: 'Payroll Specialist', joinedDate: '2019-02-18', currentClass: 'A', email: 'dina.amri@hrm-dev.sa' },
  { id: 'E052', code: 'MNT-004', fullName: 'Hossam Al-Zubaidi', departmentId: 'MNT', jobTitle: 'Maintenance Technician', joinedDate: '2020-08-05', currentClass: 'B', email: 'hossam.zubaidi@hrm-dev.sa' },
];

export const SKILLS: Skill[] = [
  // ── Upholstery (9 skills) ────────────────────────────────────────────────
  { id: 'SK-UPH-01', code: 'UPH-01', name: 'Frame Assembly', departmentId: 'UPH', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Ability to assemble upholstery frames correctly' },
  { id: 'SK-UPH-02', code: 'UPH-02', name: 'Seam Stitching', departmentId: 'UPH', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Precision seam stitching and sewing techniques' },
  { id: 'SK-UPH-03', code: 'UPH-03', name: 'Sewing Machine Operation', departmentId: 'UPH', category: 'Equipment', weight: 3, criticality: 'High', description: 'Operation of industrial sewing machines' },
  { id: 'SK-UPH-04', code: 'UPH-04', name: 'Spring Installation', departmentId: 'UPH', category: 'Core Technical', weight: 3, criticality: 'High', description: 'Proper installation of springs and padding' },
  { id: 'SK-UPH-05', code: 'UPH-05', name: 'Fabric Finishing', departmentId: 'UPH', category: 'Quality', weight: 4, criticality: 'Critical', description: 'Professional fabric finishing and trimming' },
  { id: 'SK-UPH-06', code: 'UPH-06', name: 'Material Cutting', departmentId: 'UPH', category: 'Core Technical', weight: 2, criticality: 'Medium', description: 'Accurate cutting of upholstery materials' },
  { id: 'SK-UPH-07', code: 'UPH-07', name: 'Pattern Recognition', departmentId: 'UPH', category: 'Specialized', weight: 3, criticality: 'High', description: 'Matching patterns across fabric panels' },
  { id: 'SK-UPH-08', code: 'UPH-08', name: 'Foam Shaping', departmentId: 'UPH', category: 'Core Technical', weight: 2, criticality: 'Medium', description: 'Cutting and shaping foam padding to specifications' },
  { id: 'SK-UPH-09', code: 'UPH-09', name: 'Safety & 5S', departmentId: 'UPH', category: 'Safety', weight: 2, criticality: 'High', description: 'Workplace safety and 5S housekeeping standards' },

  // ── Painting (8 skills) ──────────────────────────────────────────────────
  { id: 'SK-PNT-01', code: 'PNT-01', name: 'Surface Preparation', departmentId: 'PNT', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Sanding, priming, and surface preparation' },
  { id: 'SK-PNT-02', code: 'PNT-02', name: 'Spray Painting', departmentId: 'PNT', category: 'Core Technical', weight: 5, criticality: 'Critical', description: 'Spray gun operation and even coating application' },
  { id: 'SK-PNT-03', code: 'PNT-03', name: 'Color Mixing', departmentId: 'PNT', category: 'Specialized', weight: 3, criticality: 'High', description: 'Accurate color mixing and matching' },
  { id: 'SK-PNT-04', code: 'PNT-04', name: 'Lacquer Application', departmentId: 'PNT', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Proper application of lacquers and varnishes' },
  { id: 'SK-PNT-05', code: 'PNT-05', name: 'Quality Inspection', departmentId: 'PNT', category: 'Quality', weight: 3, criticality: 'High', description: 'Identifying painting defects and quality issues' },
  { id: 'SK-PNT-06', code: 'PNT-06', name: 'UV Coating Operation', departmentId: 'PNT', category: 'Equipment', weight: 3, criticality: 'High', description: 'Operating UV curing and coating machines' },
  { id: 'SK-PNT-07', code: 'PNT-07', name: 'Paint Booth Safety', departmentId: 'PNT', category: 'Safety', weight: 4, criticality: 'Critical', description: 'Hazardous materials handling and ventilation protocols' },
  { id: 'SK-PNT-08', code: 'PNT-08', name: 'Stain & Glaze Application', departmentId: 'PNT', category: 'Specialized', weight: 3, criticality: 'High', description: 'Wood staining, glazing, and antiquing effects' },

  // ── Natural Wood (8 skills) ──────────────────────────────────────────────
  { id: 'SK-NWD-01', code: 'NWD-01', name: 'Wood Joinery', departmentId: 'NWD', category: 'Core Technical', weight: 5, criticality: 'Critical', description: 'Traditional and modern wood joinery techniques' },
  { id: 'SK-NWD-02', code: 'NWD-02', name: 'CNC Machine Operation', departmentId: 'NWD', category: 'Equipment', weight: 4, criticality: 'Critical', description: 'Operation of CNC routers and machines' },
  { id: 'SK-NWD-03', code: 'NWD-03', name: 'Wood Finishing', departmentId: 'NWD', category: 'Core Technical', weight: 3, criticality: 'High', description: 'Sanding, staining, and finishing wood surfaces' },
  { id: 'SK-NWD-04', code: 'NWD-04', name: 'Blueprint Reading', departmentId: 'NWD', category: 'Technical Knowledge', weight: 3, criticality: 'High', description: 'Reading and interpreting technical drawings' },
  { id: 'SK-NWD-05', code: 'NWD-05', name: 'Hand Tool Proficiency', departmentId: 'NWD', category: 'Core Technical', weight: 3, criticality: 'High', description: 'Chisels, planes, saws, and traditional carpentry hand tools' },
  { id: 'SK-NWD-06', code: 'NWD-06', name: 'Veneer & Inlay Work', departmentId: 'NWD', category: 'Specialized', weight: 4, criticality: 'Critical', description: 'Precision veneer application and decorative inlay techniques' },
  { id: 'SK-NWD-07', code: 'NWD-07', name: 'Wood Species Knowledge', departmentId: 'NWD', category: 'Technical Knowledge', weight: 2, criticality: 'Medium', description: 'Identification and proper handling of various wood species' },
  { id: 'SK-NWD-08', code: 'NWD-08', name: 'Moisture & Defect Assessment', departmentId: 'NWD', category: 'Quality', weight: 3, criticality: 'High', description: 'Using moisture meters and identifying wood defects' },

  // ── Assembly (8 skills) ──────────────────────────────────────────────────
  { id: 'SK-ASM-01', code: 'ASM-01', name: 'Furniture Assembly', departmentId: 'ASM', category: 'Core Technical', weight: 5, criticality: 'Critical', description: 'Complete furniture assembly from components' },
  { id: 'SK-ASM-02', code: 'ASM-02', name: 'Hardware Installation', departmentId: 'ASM', category: 'Core Technical', weight: 3, criticality: 'High', description: 'Hinges, slides, handles and hardware installation' },
  { id: 'SK-ASM-03', code: 'ASM-03', name: 'Quality Checking', departmentId: 'ASM', category: 'Quality', weight: 3, criticality: 'High', description: 'Post-assembly quality verification' },
  { id: 'SK-ASM-04', code: 'ASM-04', name: 'Drawing Interpretation', departmentId: 'ASM', category: 'Technical Knowledge', weight: 3, criticality: 'High', description: 'Reading assembly drawings and exploded views' },
  { id: 'SK-ASM-05', code: 'ASM-05', name: 'Power Tool Operation', departmentId: 'ASM', category: 'Equipment', weight: 3, criticality: 'High', description: 'Drills, impact drivers, and pneumatic assembly tools' },
  { id: 'SK-ASM-06', code: 'ASM-06', name: 'Alignment & Levelling', departmentId: 'ASM', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Ensuring precise alignment and squareness of assembled pieces' },
  { id: 'SK-ASM-07', code: 'ASM-07', name: 'Packing & Protection', departmentId: 'ASM', category: 'Core Technical', weight: 2, criticality: 'Medium', description: 'Protective wrapping and packaging finished furniture' },
  { id: 'SK-ASM-08', code: 'ASM-08', name: 'Safety & PPE Compliance', departmentId: 'ASM', category: 'Safety', weight: 2, criticality: 'High', description: 'Personal protective equipment and workstation safety' },

  // ── Cutting (8 skills) ───────────────────────────────────────────────────
  { id: 'SK-CUT-01', code: 'CUT-01', name: 'Panel Saw Operation', departmentId: 'CUT', category: 'Equipment', weight: 5, criticality: 'Critical', description: 'Safe and accurate panel saw operation' },
  { id: 'SK-CUT-02', code: 'CUT-02', name: 'CNC Programming', departmentId: 'CUT', category: 'Technical Knowledge', weight: 4, criticality: 'Critical', description: 'CNC machine programming and optimization' },
  { id: 'SK-CUT-03', code: 'CUT-03', name: 'Material Optimization', departmentId: 'CUT', category: 'Specialized', weight: 3, criticality: 'High', description: 'Minimizing material waste through optimal cutting plans' },
  { id: 'SK-CUT-04', code: 'CUT-04', name: 'Measurement Accuracy', departmentId: 'CUT', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Precision measuring and marking before cutting' },
  { id: 'SK-CUT-05', code: 'CUT-05', name: 'Edge Banding Setup', departmentId: 'CUT', category: 'Equipment', weight: 3, criticality: 'High', description: 'Setting up and operating edge banding machines' },
  { id: 'SK-CUT-06', code: 'CUT-06', name: 'Blade Maintenance', departmentId: 'CUT', category: 'Equipment', weight: 2, criticality: 'Medium', description: 'Changing and maintaining saw blades and router bits' },
  { id: 'SK-CUT-07', code: 'CUT-07', name: 'Cutting Safety', departmentId: 'CUT', category: 'Safety', weight: 4, criticality: 'Critical', description: 'Machine guarding, push sticks, and cutting station safety' },
  { id: 'SK-CUT-08', code: 'CUT-08', name: 'Job Order Reading', departmentId: 'CUT', category: 'Technical Knowledge', weight: 2, criticality: 'Medium', description: 'Interpreting cut lists and production job orders' },

  // ── Quality Control (8 skills) ───────────────────────────────────────────
  { id: 'SK-QC-01', code: 'QC-01', name: 'Inspection Techniques', departmentId: 'QC', category: 'Core Technical', weight: 5, criticality: 'Critical', description: 'Systematic product inspection procedures' },
  { id: 'SK-QC-02', code: 'QC-02', name: 'Defect Classification', departmentId: 'QC', category: 'Technical Knowledge', weight: 4, criticality: 'Critical', description: 'Identifying and classifying product defects' },
  { id: 'SK-QC-03', code: 'QC-03', name: 'Measurement Tools', departmentId: 'QC', category: 'Equipment', weight: 3, criticality: 'High', description: 'Use of calipers, gauges, and measuring tools' },
  { id: 'SK-QC-04', code: 'QC-04', name: 'ISO Documentation', departmentId: 'QC', category: 'Administrative', weight: 3, criticality: 'High', description: 'Completing inspection reports and NCR forms per ISO standards' },
  { id: 'SK-QC-05', code: 'QC-05', name: 'Statistical Process Control', departmentId: 'QC', category: 'Technical Knowledge', weight: 3, criticality: 'High', description: 'Control charts, AQL sampling, and basic SPC methods' },
  { id: 'SK-QC-06', code: 'QC-06', name: 'Surface Defect Detection', departmentId: 'QC', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Visual and tactile inspection for paint, veneer, and surface defects' },
  { id: 'SK-QC-07', code: 'QC-07', name: 'Corrective Action Process', departmentId: 'QC', category: 'Administrative', weight: 3, criticality: 'High', description: 'Root cause analysis and corrective/preventive action (CAPA)' },
  { id: 'SK-QC-08', code: 'QC-08', name: 'Final Product Audit', departmentId: 'QC', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Conducting pre-shipment final product audits' },

  // ── Logistics (8 skills) ─────────────────────────────────────────────────
  { id: 'SK-LOG-01', code: 'LOG-01', name: 'Inventory Management', departmentId: 'LOG', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Stock counting and inventory control systems' },
  { id: 'SK-LOG-02', code: 'LOG-02', name: 'Forklift Operation', departmentId: 'LOG', category: 'Equipment', weight: 3, criticality: 'High', description: 'Safe operation of forklifts and pallet jacks' },
  { id: 'SK-LOG-03', code: 'LOG-03', name: 'Order Processing', departmentId: 'LOG', category: 'Administrative', weight: 3, criticality: 'High', description: 'Processing delivery orders and documentation' },
  { id: 'SK-LOG-04', code: 'LOG-04', name: 'ERP / WMS System', departmentId: 'LOG', category: 'Computer Skills', weight: 4, criticality: 'Critical', description: 'Using warehouse management systems for stock movements' },
  { id: 'SK-LOG-05', code: 'LOG-05', name: 'Receiving & Inspection', departmentId: 'LOG', category: 'Core Technical', weight: 3, criticality: 'High', description: 'Checking incoming materials against purchase orders' },
  { id: 'SK-LOG-06', code: 'LOG-06', name: 'Delivery Route Planning', departmentId: 'LOG', category: 'Specialized', weight: 2, criticality: 'Medium', description: 'Optimizing delivery routes for time and fuel efficiency' },
  { id: 'SK-LOG-07', code: 'LOG-07', name: 'Load Securing', departmentId: 'LOG', category: 'Safety', weight: 3, criticality: 'High', description: 'Proper strapping and securing of furniture loads' },
  { id: 'SK-LOG-08', code: 'LOG-08', name: 'Hazmat Handling', departmentId: 'LOG', category: 'Safety', weight: 2, criticality: 'Medium', description: 'Handling and storing hazardous materials per regulations' },

  // ── Maintenance (7 skills) ───────────────────────────────────────────────
  { id: 'SK-MNT-01', code: 'MNT-01', name: 'Preventive Maintenance', departmentId: 'MNT', category: 'Core Technical', weight: 5, criticality: 'Critical', description: 'Scheduled maintenance of all factory equipment' },
  { id: 'SK-MNT-02', code: 'MNT-02', name: 'Electrical Repairs', departmentId: 'MNT', category: 'Specialized', weight: 4, criticality: 'Critical', description: 'Basic electrical troubleshooting and repairs' },
  { id: 'SK-MNT-03', code: 'MNT-03', name: 'Pneumatics & Hydraulics', departmentId: 'MNT', category: 'Specialized', weight: 3, criticality: 'High', description: 'Pneumatic and hydraulic system maintenance' },
  { id: 'SK-MNT-04', code: 'MNT-04', name: 'CMMS / Maintenance Records', departmentId: 'MNT', category: 'Administrative', weight: 2, criticality: 'Medium', description: 'Logging work orders and maintenance history in CMMS' },
  { id: 'SK-MNT-05', code: 'MNT-05', name: 'Mechanical Assembly & Fitting', departmentId: 'MNT', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Dismantling, repairing, and reassembling machine components' },
  { id: 'SK-MNT-06', code: 'MNT-06', name: 'Welding & Fabrication', departmentId: 'MNT', category: 'Specialized', weight: 3, criticality: 'High', description: 'Basic MIG/TIG welding and metal fabrication for repairs' },
  { id: 'SK-MNT-07', code: 'MNT-07', name: 'Lockout/Tagout (LOTO)', departmentId: 'MNT', category: 'Safety', weight: 4, criticality: 'Critical', description: 'Isolation and lockout/tagout procedures for energy control' },

  // ── Administration (9 skills) ────────────────────────────────────────────
  { id: 'SK-ADM-01', code: 'ADM-01', name: 'MS Office Suite', departmentId: 'ADM', category: 'Computer Skills', weight: 4, criticality: 'Critical', description: 'Excel, Word, PowerPoint proficiency' },
  { id: 'SK-ADM-02', code: 'ADM-02', name: 'ERP System', departmentId: 'ADM', category: 'Computer Skills', weight: 5, criticality: 'Critical', description: 'ERP system data entry and reporting' },
  { id: 'SK-ADM-03', code: 'ADM-03', name: 'Communication Skills', departmentId: 'ADM', category: 'Soft Skills', weight: 3, criticality: 'High', description: 'Professional verbal and written communication' },
  { id: 'SK-ADM-04', code: 'ADM-04', name: 'Labour Law Knowledge', departmentId: 'ADM', category: 'Regulatory', weight: 3, criticality: 'High', description: 'Saudi Labour Law and employment regulations' },
  { id: 'SK-ADM-05', code: 'ADM-05', name: 'Payroll Processing', departmentId: 'ADM', category: 'Core Technical', weight: 4, criticality: 'Critical', description: 'Payroll calculation, GOSI, and salary processing' },
  { id: 'SK-ADM-06', code: 'ADM-06', name: 'Recruitment & Onboarding', departmentId: 'ADM', category: 'Core Technical', weight: 3, criticality: 'High', description: 'Screening candidates, conducting interviews, onboarding new hires' },
  { id: 'SK-ADM-07', code: 'ADM-07', name: 'Document Control', departmentId: 'ADM', category: 'Administrative', weight: 3, criticality: 'High', description: 'Filing, version control, and document management systems' },
  { id: 'SK-ADM-08', code: 'ADM-08', name: 'Data Analysis & Reporting', departmentId: 'ADM', category: 'Computer Skills', weight: 3, criticality: 'High', description: 'Pivot tables, dashboards, and management reporting in Excel' },
  { id: 'SK-ADM-09', code: 'ADM-09', name: 'Customer Service', departmentId: 'ADM', category: 'Soft Skills', weight: 2, criticality: 'Medium', description: 'Front desk, client communications, and complaint handling' },
];

export const CAMPAIGNS: Campaign[] = [
  { id: 'CAM-001', title: 'Q1 2025 — Upholstery Monthly Evaluation', type: 'Monthly', department: 'Upholstery', status: 'Completed', startDate: '2025-01-01', endDate: '2025-01-31', notes: 'First evaluation of the year' },
  { id: 'CAM-002', title: 'Q1 2025 — All Departments Quarterly', type: 'Quarterly', department: 'All', status: 'Completed', startDate: '2025-01-15', endDate: '2025-03-31', notes: 'Company-wide quarterly evaluation' },
  { id: 'CAM-003', title: 'April 2025 — Painting Monthly', type: 'Monthly', department: 'Painting', status: 'Completed', startDate: '2025-04-01', endDate: '2025-04-30', notes: 'Post-training evaluation' },
  { id: 'CAM-004', title: 'Q2 2025 — Assembly & Cutting', type: 'Quarterly', department: 'Assembly, Cutting', status: 'Active', startDate: '2025-04-01', endDate: '2025-06-30', notes: 'Focus on new hires' },
  { id: 'CAM-005', title: 'H1 2025 — Company-Wide Bi-Annual', type: 'Bi-Annually', department: 'All', status: 'Active', startDate: '2025-01-01', endDate: '2025-06-30', notes: 'Mid-year comprehensive review' },
  { id: 'CAM-006', title: 'May 2025 — Natural Wood Monthly', type: 'Monthly', department: 'Natural Wood', status: 'Draft', startDate: '2025-05-01', endDate: '2025-05-31', notes: 'Pending manager approval' },
];

// Department-scoped slices for use in evaluation sheets
export const UPHOLSTERY_SKILLS = SKILLS.filter(s => s.departmentId === 'UPH');
export const UPHOLSTERY_EMPLOYEES = EMPLOYEES.filter(e => e.departmentId === 'UPH');

export const PAINTING_EMPLOYEES = EMPLOYEES.filter(e => e.departmentId === 'PNT');
export const PAINTING_SKILLS = SKILLS.filter(s => s.departmentId === 'PNT');

export const NATURAL_WOOD_EMPLOYEES = EMPLOYEES.filter(e => e.departmentId === 'NWD');
export const NATURAL_WOOD_SKILLS = SKILLS.filter(s => s.departmentId === 'NWD');

export const ASSEMBLY_EMPLOYEES = EMPLOYEES.filter(e => e.departmentId === 'ASM');
export const ASSEMBLY_SKILLS = SKILLS.filter(s => s.departmentId === 'ASM');

export const CUTTING_EMPLOYEES = EMPLOYEES.filter(e => e.departmentId === 'CUT');
export const CUTTING_SKILLS = SKILLS.filter(s => s.departmentId === 'CUT');

export const QC_EMPLOYEES = EMPLOYEES.filter(e => e.departmentId === 'QC');
export const QC_SKILLS = SKILLS.filter(s => s.departmentId === 'QC');

export const LOGISTICS_EMPLOYEES = EMPLOYEES.filter(e => e.departmentId === 'LOG');
export const LOGISTICS_SKILLS = SKILLS.filter(s => s.departmentId === 'LOG');

export const MAINTENANCE_EMPLOYEES = EMPLOYEES.filter(e => e.departmentId === 'MNT');
export const MAINTENANCE_SKILLS = SKILLS.filter(s => s.departmentId === 'MNT');

export const ADMIN_EMPLOYEES = EMPLOYEES.filter(e => e.departmentId === 'ADM');
export const ADMIN_SKILLS = SKILLS.filter(s => s.departmentId === 'ADM');

export type ScoreMap = Record<string, Record<string, number>>;

export const UPHOLSTERY_SAMPLE_SCORES: ScoreMap = {
  'E001': { 'SK-UPH-01': 4, 'SK-UPH-02': 4, 'SK-UPH-03': 3, 'SK-UPH-04': 4, 'SK-UPH-05': 4, 'SK-UPH-06': 4, 'SK-UPH-07': 3, 'SK-UPH-08': 4, 'SK-UPH-09': 4 },
  'E002': { 'SK-UPH-01': 4, 'SK-UPH-02': 4, 'SK-UPH-03': 4, 'SK-UPH-04': 3, 'SK-UPH-05': 3, 'SK-UPH-06': 4, 'SK-UPH-07': 3, 'SK-UPH-08': 3, 'SK-UPH-09': 4 },
  'E003': { 'SK-UPH-01': 3, 'SK-UPH-02': 3, 'SK-UPH-03': 3, 'SK-UPH-04': 3, 'SK-UPH-05': 2, 'SK-UPH-06': 3, 'SK-UPH-07': 2, 'SK-UPH-08': 3, 'SK-UPH-09': 3 },
  'E004': { 'SK-UPH-01': 2, 'SK-UPH-02': 3, 'SK-UPH-03': 2, 'SK-UPH-04': 2, 'SK-UPH-05': 3, 'SK-UPH-06': 3, 'SK-UPH-07': 2, 'SK-UPH-08': 2, 'SK-UPH-09': 3 },
  'E005': { 'SK-UPH-01': 4, 'SK-UPH-02': 4, 'SK-UPH-03': 4, 'SK-UPH-04': 4, 'SK-UPH-05': 4, 'SK-UPH-06': 3, 'SK-UPH-07': 4, 'SK-UPH-08': 4, 'SK-UPH-09': 4 },
  'E006': { 'SK-UPH-01': 1, 'SK-UPH-02': 2, 'SK-UPH-03': 1, 'SK-UPH-04': 1, 'SK-UPH-05': 2, 'SK-UPH-06': 2, 'SK-UPH-07': 1, 'SK-UPH-08': 1, 'SK-UPH-09': 2 },
  'E007': { 'SK-UPH-01': 4, 'SK-UPH-02': 4, 'SK-UPH-03': 3, 'SK-UPH-04': 4, 'SK-UPH-05': 4, 'SK-UPH-06': 4, 'SK-UPH-07': 3, 'SK-UPH-08': 3, 'SK-UPH-09': 4 },
  'E008': { 'SK-UPH-01': 1, 'SK-UPH-02': 1, 'SK-UPH-03': 2, 'SK-UPH-04': 1, 'SK-UPH-05': 1, 'SK-UPH-06': 2, 'SK-UPH-07': 1, 'SK-UPH-08': 1, 'SK-UPH-09': 2 },
  'E044': { 'SK-UPH-01': 3, 'SK-UPH-02': 2, 'SK-UPH-03': 3, 'SK-UPH-04': 3, 'SK-UPH-05': 2, 'SK-UPH-06': 3, 'SK-UPH-07': 2, 'SK-UPH-08': 2, 'SK-UPH-09': 3 },
};

// Painting — E009(A) E010(B) E011(B) E012(C) E013(A) E014(B) E045(B)
export const PAINTING_SAMPLE_SCORES: ScoreMap = {
  'E009': { 'SK-PNT-01': 4, 'SK-PNT-02': 4, 'SK-PNT-03': 4, 'SK-PNT-04': 4, 'SK-PNT-05': 4, 'SK-PNT-06': 3, 'SK-PNT-07': 4, 'SK-PNT-08': 4 },
  'E010': { 'SK-PNT-01': 3, 'SK-PNT-02': 3, 'SK-PNT-03': 3, 'SK-PNT-04': 3, 'SK-PNT-05': 3, 'SK-PNT-06': 3, 'SK-PNT-07': 3, 'SK-PNT-08': 3 },
  'E011': { 'SK-PNT-01': 3, 'SK-PNT-02': 3, 'SK-PNT-03': 2, 'SK-PNT-04': 3, 'SK-PNT-05': 3, 'SK-PNT-06': 3, 'SK-PNT-07': 2, 'SK-PNT-08': 3 },
  'E012': { 'SK-PNT-01': 2, 'SK-PNT-02': 1, 'SK-PNT-03': 2, 'SK-PNT-04': 1, 'SK-PNT-05': 2, 'SK-PNT-06': 2, 'SK-PNT-07': 2, 'SK-PNT-08': 1 },
  'E013': { 'SK-PNT-01': 4, 'SK-PNT-02': 4, 'SK-PNT-03': 3, 'SK-PNT-04': 4, 'SK-PNT-05': 3, 'SK-PNT-06': 4, 'SK-PNT-07': 4, 'SK-PNT-08': 4 },
  'E014': { 'SK-PNT-01': 3, 'SK-PNT-02': 3, 'SK-PNT-03': 3, 'SK-PNT-04': 2, 'SK-PNT-05': 3, 'SK-PNT-06': 2, 'SK-PNT-07': 3, 'SK-PNT-08': 2 },
  'E045': { 'SK-PNT-01': 2, 'SK-PNT-02': 3, 'SK-PNT-03': 2, 'SK-PNT-04': 3, 'SK-PNT-05': 2, 'SK-PNT-06': 3, 'SK-PNT-07': 2, 'SK-PNT-08': 3 },
};

// Natural Wood — E015(A) E016(A) E017(B) E018(C) E019(A) E046(B)
export const NATURAL_WOOD_SAMPLE_SCORES: ScoreMap = {
  'E015': { 'SK-NWD-01': 4, 'SK-NWD-02': 4, 'SK-NWD-03': 4, 'SK-NWD-04': 4, 'SK-NWD-05': 4, 'SK-NWD-06': 4, 'SK-NWD-07': 4, 'SK-NWD-08': 4 },
  'E016': { 'SK-NWD-01': 4, 'SK-NWD-02': 3, 'SK-NWD-03': 4, 'SK-NWD-04': 4, 'SK-NWD-05': 3, 'SK-NWD-06': 4, 'SK-NWD-07': 4, 'SK-NWD-08': 3 },
  'E017': { 'SK-NWD-01': 3, 'SK-NWD-02': 3, 'SK-NWD-03': 3, 'SK-NWD-04': 3, 'SK-NWD-05': 3, 'SK-NWD-06': 2, 'SK-NWD-07': 3, 'SK-NWD-08': 3 },
  'E018': { 'SK-NWD-01': 1, 'SK-NWD-02': 2, 'SK-NWD-03': 2, 'SK-NWD-04': 2, 'SK-NWD-05': 2, 'SK-NWD-06': 1, 'SK-NWD-07': 2, 'SK-NWD-08': 2 },
  'E019': { 'SK-NWD-01': 4, 'SK-NWD-02': 4, 'SK-NWD-03': 3, 'SK-NWD-04': 3, 'SK-NWD-05': 4, 'SK-NWD-06': 3, 'SK-NWD-07': 4, 'SK-NWD-08': 4 },
  'E046': { 'SK-NWD-01': 3, 'SK-NWD-02': 2, 'SK-NWD-03': 3, 'SK-NWD-04': 3, 'SK-NWD-05': 2, 'SK-NWD-06': 2, 'SK-NWD-07': 3, 'SK-NWD-08': 3 },
};

// Assembly — E020(A) E021(B) E022(B) E023(C) E024(A) E047(B)
export const ASSEMBLY_SAMPLE_SCORES: ScoreMap = {
  'E020': { 'SK-ASM-01': 4, 'SK-ASM-02': 4, 'SK-ASM-03': 4, 'SK-ASM-04': 4, 'SK-ASM-05': 4, 'SK-ASM-06': 4, 'SK-ASM-07': 3, 'SK-ASM-08': 4 },
  'E021': { 'SK-ASM-01': 3, 'SK-ASM-02': 3, 'SK-ASM-03': 3, 'SK-ASM-04': 3, 'SK-ASM-05': 3, 'SK-ASM-06': 3, 'SK-ASM-07': 2, 'SK-ASM-08': 3 },
  'E022': { 'SK-ASM-01': 3, 'SK-ASM-02': 2, 'SK-ASM-03': 3, 'SK-ASM-04': 3, 'SK-ASM-05': 3, 'SK-ASM-06': 2, 'SK-ASM-07': 3, 'SK-ASM-08': 3 },
  'E023': { 'SK-ASM-01': 2, 'SK-ASM-02': 1, 'SK-ASM-03': 2, 'SK-ASM-04': 2, 'SK-ASM-05': 1, 'SK-ASM-06': 1, 'SK-ASM-07': 2, 'SK-ASM-08': 2 },
  'E024': { 'SK-ASM-01': 4, 'SK-ASM-02': 3, 'SK-ASM-03': 4, 'SK-ASM-04': 3, 'SK-ASM-05': 4, 'SK-ASM-06': 4, 'SK-ASM-07': 3, 'SK-ASM-08': 4 },
  'E047': { 'SK-ASM-01': 3, 'SK-ASM-02': 3, 'SK-ASM-03': 2, 'SK-ASM-04': 3, 'SK-ASM-05': 3, 'SK-ASM-06': 2, 'SK-ASM-07': 3, 'SK-ASM-08': 3 },
};

// Cutting — E025(A) E026(B) E027(C) E028(A) E050(B)
export const CUTTING_SAMPLE_SCORES: ScoreMap = {
  'E025': { 'SK-CUT-01': 4, 'SK-CUT-02': 4, 'SK-CUT-03': 4, 'SK-CUT-04': 4, 'SK-CUT-05': 4, 'SK-CUT-06': 3, 'SK-CUT-07': 4, 'SK-CUT-08': 4 },
  'E026': { 'SK-CUT-01': 3, 'SK-CUT-02': 2, 'SK-CUT-03': 3, 'SK-CUT-04': 3, 'SK-CUT-05': 3, 'SK-CUT-06': 3, 'SK-CUT-07': 3, 'SK-CUT-08': 3 },
  'E027': { 'SK-CUT-01': 2, 'SK-CUT-02': 1, 'SK-CUT-03': 2, 'SK-CUT-04': 2, 'SK-CUT-05': 2, 'SK-CUT-06': 2, 'SK-CUT-07': 2, 'SK-CUT-08': 2 },
  'E028': { 'SK-CUT-01': 4, 'SK-CUT-02': 4, 'SK-CUT-03': 3, 'SK-CUT-04': 4, 'SK-CUT-05': 3, 'SK-CUT-06': 4, 'SK-CUT-07': 4, 'SK-CUT-08': 4 },
  'E050': { 'SK-CUT-01': 3, 'SK-CUT-02': 2, 'SK-CUT-03': 3, 'SK-CUT-04': 3, 'SK-CUT-05': 2, 'SK-CUT-06': 2, 'SK-CUT-07': 3, 'SK-CUT-08': 3 },
};

// Quality Control — E029(A) E030(B) E031(B) E049(B)
export const QC_SAMPLE_SCORES: ScoreMap = {
  'E029': { 'SK-QC-01': 4, 'SK-QC-02': 4, 'SK-QC-03': 4, 'SK-QC-04': 4, 'SK-QC-05': 4, 'SK-QC-06': 4, 'SK-QC-07': 4, 'SK-QC-08': 4 },
  'E030': { 'SK-QC-01': 3, 'SK-QC-02': 3, 'SK-QC-03': 3, 'SK-QC-04': 3, 'SK-QC-05': 3, 'SK-QC-06': 3, 'SK-QC-07': 3, 'SK-QC-08': 3 },
  'E031': { 'SK-QC-01': 3, 'SK-QC-02': 2, 'SK-QC-03': 3, 'SK-QC-04': 3, 'SK-QC-05': 2, 'SK-QC-06': 3, 'SK-QC-07': 2, 'SK-QC-08': 3 },
  'E049': { 'SK-QC-01': 3, 'SK-QC-02': 3, 'SK-QC-03': 2, 'SK-QC-04': 3, 'SK-QC-05': 3, 'SK-QC-06': 2, 'SK-QC-07': 3, 'SK-QC-08': 3 },
};

// Logistics — E032(A) E033(B) E034(B) E035(C) E048(C)
export const LOGISTICS_SAMPLE_SCORES: ScoreMap = {
  'E032': { 'SK-LOG-01': 4, 'SK-LOG-02': 4, 'SK-LOG-03': 4, 'SK-LOG-04': 4, 'SK-LOG-05': 4, 'SK-LOG-06': 4, 'SK-LOG-07': 4, 'SK-LOG-08': 3 },
  'E033': { 'SK-LOG-01': 3, 'SK-LOG-02': 4, 'SK-LOG-03': 3, 'SK-LOG-04': 3, 'SK-LOG-05': 3, 'SK-LOG-06': 3, 'SK-LOG-07': 3, 'SK-LOG-08': 3 },
  'E034': { 'SK-LOG-01': 3, 'SK-LOG-02': 2, 'SK-LOG-03': 3, 'SK-LOG-04': 3, 'SK-LOG-05': 3, 'SK-LOG-06': 4, 'SK-LOG-07': 3, 'SK-LOG-08': 2 },
  'E035': { 'SK-LOG-01': 2, 'SK-LOG-02': 1, 'SK-LOG-03': 2, 'SK-LOG-04': 2, 'SK-LOG-05': 2, 'SK-LOG-06': 1, 'SK-LOG-07': 2, 'SK-LOG-08': 2 },
  'E048': { 'SK-LOG-01': 2, 'SK-LOG-02': 2, 'SK-LOG-03': 2, 'SK-LOG-04': 1, 'SK-LOG-05': 2, 'SK-LOG-06': 1, 'SK-LOG-07': 2, 'SK-LOG-08': 1 },
};

// Maintenance — E036(A) E037(B) E038(C) E052(B)
export const MAINTENANCE_SAMPLE_SCORES: ScoreMap = {
  'E036': { 'SK-MNT-01': 4, 'SK-MNT-02': 4, 'SK-MNT-03': 4, 'SK-MNT-04': 4, 'SK-MNT-05': 4, 'SK-MNT-06': 3, 'SK-MNT-07': 4 },
  'E037': { 'SK-MNT-01': 3, 'SK-MNT-02': 3, 'SK-MNT-03': 3, 'SK-MNT-04': 3, 'SK-MNT-05': 3, 'SK-MNT-06': 3, 'SK-MNT-07': 3 },
  'E038': { 'SK-MNT-01': 2, 'SK-MNT-02': 1, 'SK-MNT-03': 2, 'SK-MNT-04': 2, 'SK-MNT-05': 1, 'SK-MNT-06': 1, 'SK-MNT-07': 2 },
  'E052': { 'SK-MNT-01': 3, 'SK-MNT-02': 3, 'SK-MNT-03': 2, 'SK-MNT-04': 3, 'SK-MNT-05': 3, 'SK-MNT-06': 2, 'SK-MNT-07': 3 },
};

// Administration — E039(A) E040(A) E041(B) E042(B) E043(C) E051(A)
export const ADMIN_SAMPLE_SCORES: ScoreMap = {
  'E039': { 'SK-ADM-01': 4, 'SK-ADM-02': 4, 'SK-ADM-03': 4, 'SK-ADM-04': 4, 'SK-ADM-05': 3, 'SK-ADM-06': 4, 'SK-ADM-07': 4, 'SK-ADM-08': 4, 'SK-ADM-09': 3 },
  'E040': { 'SK-ADM-01': 4, 'SK-ADM-02': 4, 'SK-ADM-03': 3, 'SK-ADM-04': 4, 'SK-ADM-05': 4, 'SK-ADM-06': 3, 'SK-ADM-07': 4, 'SK-ADM-08': 4, 'SK-ADM-09': 3 },
  'E041': { 'SK-ADM-01': 3, 'SK-ADM-02': 3, 'SK-ADM-03': 3, 'SK-ADM-04': 3, 'SK-ADM-05': 3, 'SK-ADM-06': 4, 'SK-ADM-07': 3, 'SK-ADM-08': 3, 'SK-ADM-09': 3 },
  'E042': { 'SK-ADM-01': 3, 'SK-ADM-02': 2, 'SK-ADM-03': 3, 'SK-ADM-04': 2, 'SK-ADM-05': 2, 'SK-ADM-06': 2, 'SK-ADM-07': 3, 'SK-ADM-08': 2, 'SK-ADM-09': 4 },
  'E043': { 'SK-ADM-01': 3, 'SK-ADM-02': 1, 'SK-ADM-03': 2, 'SK-ADM-04': 1, 'SK-ADM-05': 1, 'SK-ADM-06': 1, 'SK-ADM-07': 2, 'SK-ADM-08': 1, 'SK-ADM-09': 3 },
  'E051': { 'SK-ADM-01': 4, 'SK-ADM-02': 4, 'SK-ADM-03': 3, 'SK-ADM-04': 3, 'SK-ADM-05': 4, 'SK-ADM-06': 2, 'SK-ADM-07': 3, 'SK-ADM-08': 4, 'SK-ADM-09': 2 },
};
