export const DEPARTMENTS = [
  { id: 'd1', name: 'Assembly',         shortName: 'Assembly',  code: 'ASM' },
  { id: 'd2', name: 'Upholstery',       shortName: 'Upholst.',  code: 'UPH' },
  { id: 'd3', name: 'Painting',         shortName: 'Painting',  code: 'PNT' },
  { id: 'd4', name: 'Wood Prep',        shortName: 'WoodPrep',  code: 'WDP' },
  { id: 'd5', name: 'Finishing',        shortName: 'Finishing', code: 'FIN' },
  { id: 'd6', name: 'Packing',          shortName: 'Packing',   code: 'PCK' },
  { id: 'd7', name: 'Maintenance',      shortName: 'Maint.',    code: 'MNT' },
  { id: 'd8', name: 'Quality Control',  shortName: 'QC',        code: 'QC'  },
  { id: 'd9', name: 'Cutting',          shortName: 'Cutting',   code: 'CUT' },
];

export const DEPT_PERFORMANCE = [
  { id:'d1', name:'Assembly',        avgPct:79, classA:6,  classB:9,  classC:3, employees:18 },
  { id:'d2', name:'Upholstery',      avgPct:84, classA:8,  classB:6,  classC:1, employees:15 },
  { id:'d3', name:'Painting',        avgPct:71, classA:4,  classB:8,  classC:2, employees:14 },
  { id:'d4', name:'Wood Prep',       avgPct:88, classA:10, classB:5,  classC:1, employees:16 },
  { id:'d5', name:'Finishing',       avgPct:65, classA:3,  classB:10, classC:4, employees:17 },
  { id:'d6', name:'Packing',         avgPct:92, classA:11, classB:2,  classC:0, employees:13 },
  { id:'d7', name:'Maintenance',     avgPct:76, classA:4,  classB:6,  classC:2, employees:12 },
  { id:'d8', name:'Quality Control', avgPct:81, classA:7,  classB:6,  classC:1, employees:14 },
  { id:'d9', name:'Cutting',         avgPct:69, classA:7,  classB:15, classC:5, employees:27 },
];

export const OVERVIEW_METRICS = {
  totalEmployees: 146,
  totalDepartments: 9,
  totalSkills: 67,
  avgSkillPct: 77.4,
  classA: 60,
  classB: 67,
  classC: 19,
  activeCampaigns: 2,
  completedCampaigns: 4,
  pendingTraining: 42,
  inProgressTraining: 18,
  completedTraining: 63,
};

export const SKILL_CATEGORIES = [
  'Safety & Compliance',
  'Technical Operations',
  'Quality Assurance',
  'Tool Handling',
  'Material Knowledge',
  'Process Efficiency',
  'Team Collaboration',
  'Documentation',
];

export const HEATMAP_DATA: Record<string, number[]> = {
  'd1': [3.6, 3.2, 3.1, 3.8, 3.0, 2.9, 3.5, 2.8],
  'd2': [3.7, 3.4, 3.3, 3.6, 3.8, 3.2, 3.6, 3.0],
  'd3': [3.4, 2.8, 3.2, 2.6, 2.9, 2.7, 3.1, 2.5],
  'd4': [3.8, 3.6, 3.5, 3.9, 3.9, 3.7, 3.4, 3.2],
  'd5': [3.2, 2.4, 3.0, 2.7, 2.8, 2.3, 3.0, 2.2],
  'd6': [3.9, 3.7, 3.8, 3.5, 3.4, 3.8, 3.7, 3.6],
  'd7': [3.8, 3.1, 3.2, 3.6, 3.4, 3.1, 3.2, 2.9],
  'd8': [3.9, 3.3, 3.9, 3.2, 3.3, 3.3, 3.5, 3.4],
  'd9': [3.5, 2.7, 2.9, 2.8, 3.1, 2.6, 3.0, 2.4],
};

const _names = [
  'Ahmed Al-Rashidi','Sara Al-Mutairi','Khalid Bin Nasser','Fatima Al-Harbi','Omar Al-Zahrani',
  'Layla Al-Anazi','Mohammed Al-Ghamdi','Nora Al-Shehri','Yusuf Al-Qahtani','Amani Al-Dosari',
  'Tariq Al-Otaibi','Reem Al-Subaie','Hamad Al-Balawi','Hessa Al-Ajmi','Faris Al-Malki',
  'Dana Al-Shamsi','Saud Al-Bishi','Maha Al-Jadidi','Saleh Al-Harthi','Wafa Al-Qurashi',
  'Nawaf Al-Hazmi','Ghada Al-Dawsari','Bandar Al-Qahtani','Noura Al-Otaibi','Ziyad Al-Harbi',
  'Hind Al-Mutairi','Faisal Al-Ghamdi','Dina Al-Zahrani','Majid Al-Rashidi','Lama Al-Anazi',
  'Abdulaziz Al-Malki','Shahad Al-Bishi','Turki Al-Subaie','Shaikha Al-Shehri','Walid Al-Ajmi',
  'Rand Al-Dosari','Sami Al-Balawi','Aisha Al-Shamsi','Khalil Al-Otaibi','Hana Al-Harthi',
  'Rayan Al-Hazmi','Mona Al-Jadidi','Bassam Al-Qahtani','Sana Al-Qurashi','Nawaf Al-Malki',
  'Rima Al-Dawsari','Fahad Al-Otaibi','Asma Al-Ghamdi','Ibrahim Al-Rashidi','Joud Al-Mutairi',
];

const _deptAssign: [string,number][] = [
  ['d1',18],['d2',15],['d3',14],['d4',16],['d5',17],['d6',13],['d7',12],['d8',14],['d9',27],
];

function _mkEmployees() {
  const employees: { id:string; name:string; deptId:string; deptName:string; pct:number; cls:'A'|'B'|'C'; idx:number }[] = [];
  const deptTargets: Record<string,number[]> = {
    'd1':[79,8], 'd2':[84,9], 'd3':[71,9], 'd4':[88,7], 'd5':[65,12],
    'd6':[92,6], 'd7':[76,9], 'd8':[81,8], 'd9':[69,11],
  };
  let ei = 0;
  for (const [deptId, count] of _deptAssign) {
    const dept = DEPARTMENTS.find(d => d.id === deptId)!;
    const [avg, spread] = deptTargets[deptId];
    for (let i = 0; i < count; i++) {
      const noise = (Math.sin(ei * 7.3 + 1.1) * spread + Math.sin(ei * 3.7) * spread * 0.5);
      const pct = Math.min(99, Math.max(30, Math.round(avg + noise)));
      const cls: 'A'|'B'|'C' = pct >= 85 ? 'A' : pct >= 60 ? 'B' : 'C';
      employees.push({ id:`e${ei+1}`, name:_names[ei % _names.length], deptId, deptName:dept.name, pct, cls, idx:ei });
      ei++;
    }
  }
  return employees;
}

export const EMPLOYEE_DATA = _mkEmployees();

export const CAMPAIGNS = [
  { id:'c1', title:'Q3 2024 Evaluation',   type:'Quarterly',   status:'Completed', start:'2024-07-01', end:'2024-08-15', completion:91, classA:48, classB:72, classC:26 },
  { id:'c2', title:'Q4 2024 Evaluation',   type:'Quarterly',   status:'Completed', start:'2024-10-01', end:'2024-11-20', completion:96, classA:54, classB:69, classC:23 },
  { id:'c3', title:'Annual Review 2024',   type:'Bi-Annually', status:'Completed', start:'2024-12-01', end:'2025-01-10', completion:100,classA:57, classB:68, classC:21 },
  { id:'c4', title:'Q1 2025 Evaluation',   type:'Quarterly',   status:'Completed', start:'2025-01-15', end:'2025-02-28', completion:98, classA:59, classB:67, classC:20 },
  { id:'c5', title:'Q2 2025 Evaluation',   type:'Quarterly',   status:'Active',    start:'2025-04-01', end:'2025-05-15', completion:68, classA:55, classB:64, classC:18 },
  { id:'c6', title:'Mid-Year Review 2025', type:'Bi-Annually', status:'Active',    start:'2025-05-01', end:'2025-06-30', completion:32, classA:0,  classB:0,  classC:0  },
];

export const TREND_DATA = [
  { name:'Q3 2024', A:48, B:72, C:26, total:146, completion:91 },
  { name:'Q4 2024', A:54, B:69, C:23, total:146, completion:96 },
  { name:'Annual',  A:57, B:68, C:21, total:146, completion:100 },
  { name:'Q1 2025', A:59, B:67, C:20, total:146, completion:98 },
  { name:'Q2 2025', A:55, B:64, C:18, total:137, completion:68 },
];

export const TRAINING_BY_DEPT = [
  { name:'Assembly',       urgent:3, recommended:9,  leadership:6  },
  { name:'Upholstery',     urgent:1, recommended:6,  leadership:8  },
  { name:'Painting',       urgent:2, recommended:8,  leadership:4  },
  { name:'Wood Prep',      urgent:1, recommended:5,  leadership:10 },
  { name:'Finishing',      urgent:4, recommended:10, leadership:3  },
  { name:'Packing',        urgent:0, recommended:2,  leadership:11 },
  { name:'Maintenance',    urgent:2, recommended:6,  leadership:4  },
  { name:'Quality Control',urgent:1, recommended:6,  leadership:7  },
  { name:'Cutting',        urgent:5, recommended:15, leadership:7  },
];

export const TOP_SKILLS = [
  { name:'Safety Procedures',     dept:'Quality Control', avgScore:3.92 },
  { name:'Product Packing Standards', dept:'Packing',    avgScore:3.87 },
  { name:'Machine Calibration',   dept:'Wood Prep',      avgScore:3.81 },
  { name:'Material Grading',      dept:'Wood Prep',      avgScore:3.79 },
  { name:'Final Inspection',      dept:'Quality Control',avgScore:3.76 },
];

export const BOTTOM_SKILLS = [
  { name:'Technical Reporting',   dept:'Cutting',        avgScore:1.94 },
  { name:'Color Matching',        dept:'Finishing',       avgScore:2.05 },
  { name:'Process Documentation', dept:'Cutting',        avgScore:2.12 },
  { name:'Surface Treatment',     dept:'Painting',       avgScore:2.18 },
  { name:'Speed Optimization',    dept:'Finishing',       avgScore:2.23 },
];

export const CLASS_PROGRESSION = {
  improved: 34,
  maintained: 97,
  declined: 15,
};
