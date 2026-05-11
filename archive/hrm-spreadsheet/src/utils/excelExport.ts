import ExcelJS from 'exceljs';
import type { Employee, Skill, Department, Campaign, ScoreMap } from '../data/masterData';
import {
  DEPARTMENTS, EMPLOYEES, SKILLS, CAMPAIGNS,
  UPHOLSTERY_EMPLOYEES, UPHOLSTERY_SKILLS,
  PAINTING_EMPLOYEES, PAINTING_SKILLS,
  NATURAL_WOOD_EMPLOYEES, NATURAL_WOOD_SKILLS,
  ASSEMBLY_EMPLOYEES, ASSEMBLY_SKILLS,
  CUTTING_EMPLOYEES, CUTTING_SKILLS,
  QC_EMPLOYEES, QC_SKILLS,
  LOGISTICS_EMPLOYEES, LOGISTICS_SKILLS,
  MAINTENANCE_EMPLOYEES, MAINTENANCE_SKILLS,
  ADMIN_EMPLOYEES, ADMIN_SKILLS,
} from '../data/masterData';

const BRAND = 'Created by yasserious.com';

function buildEvalSheet(
  wb: ExcelJS.Workbook,
  employees: Employee[],
  skills: Skill[],
  deptName: string,
  scores: ScoreMap,
  sheetName: string,
): void {
  const ws = wb.addWorksheet(sheetName);
  const nSkills = skills.length;
  const maxScore = skills.reduce((sum, s) => sum + 4 * s.weight, 0);
  const weightsConst = `{${skills.map(s => s.weight).join(',')}}`;

  ws.addRow([`${deptName} — HRM Development Evaluation`, ...Array(nSkills + 4).fill(''), BRAND]);
  ws.addRow([
    'Employee Name',
    'Code',
    ...skills.map(s => `${s.name} (W:${s.weight})`),
    'Total Score',
    'Max Score',
    'Percentage',
    'Class',
    '',
  ]);

  const scoreStartCol = 3;
  const scoreEndCol = 2 + nSkills;
  const totalScoreCol = 3 + nSkills;
  const maxScoreCol = 4 + nSkills;
  const pctCol = 5 + nSkills;
  const classCol = 6 + nSkills;

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const empScores = scores[emp.id] ?? {};
    const rowNum = i + 3;

    const row = ws.getRow(rowNum);
    row.getCell(1).value = emp.fullName;
    row.getCell(2).value = emp.code;
    for (let j = 0; j < skills.length; j++) {
      row.getCell(3 + j).value = empScores[skills[j].id] ?? 0;
    }

    const scoreStartRef = ws.getCell(rowNum, scoreStartCol).address;
    const scoreEndRef = ws.getCell(rowNum, scoreEndCol).address;
    const totalRef = ws.getCell(rowNum, totalScoreCol).address;
    const maxRef = ws.getCell(rowNum, maxScoreCol).address;
    const pctRef = ws.getCell(rowNum, pctCol).address;

    row.getCell(totalScoreCol).value = { formula: `SUMPRODUCT(${scoreStartRef}:${scoreEndRef},${weightsConst})`, result: 0 };
    row.getCell(maxScoreCol).value = maxScore;
    row.getCell(pctCol).value = { formula: `ROUND(${totalRef}/${maxRef}*100,1)`, result: 0 };
    row.getCell(classCol).value = { formula: `IF(${pctRef}>=85,"A",IF(${pctRef}>=60,"B","C"))`, result: '' };
    row.commit();
  }

  ws.addRow([]);
  ws.addRow([BRAND]);
}

export async function exportToExcel(
  upholsteryScores: ScoreMap,
  paintingScores: ScoreMap,
  naturalWoodScores: ScoreMap,
  assemblyScores: ScoreMap,
  cuttingScores: ScoreMap,
  qcScores: ScoreMap,
  logisticsScores: ScoreMap,
  maintenanceScores: ScoreMap,
  adminScores: ScoreMap,
): Promise<void> {
  const wb = new ExcelJS.Workbook();

  const systemSheet = wb.addWorksheet('HRM System');
  const systemData: (string | number)[][] = [
    ['HRM Development System', '', '', BRAND],
    ['', '', '', ''],
    ['Company', 'HRM Wood Manufacturing', '', ''],
    ['Total Employees', '146', '', ''],
    ['Departments', '9', '', ''],
    ['Total Skills in Library', `${SKILLS.length}`, '', ''],
    ['Evaluation Scale', '0 – 4', '', ''],
    ['Classes', 'A (≥85%) | B (60–84%) | C (<60%)', '', ''],
    ['', '', '', ''],
    ['Scoring Formula:', '', '', ''],
    ['Percentage = Σ(Score × Weight) / Σ(4 × Weight) × 100', '', '', ''],
    ['', '', '', ''],
    ['Sheet Navigation:', '', '', ''],
    ['Sheet 1: HRM System', 'Sheet 2: Instructions', 'Sheet 3: Departments', 'Sheet 4: Skills Library'],
    ['Sheet 5: Employees', 'Sheet 6: Campaigns', 'Sheet 7: Upholstery Eval', 'Sheet 8: Painting Eval'],
    ['Sheet 9: Natural Wood Eval', 'Sheet 10: Assembly Eval', 'Sheet 11: Cutting Eval', 'Sheet 12: QC Eval'],
    ['Sheet 13: Logistics Eval', 'Sheet 14: Maintenance Eval', 'Sheet 15: Administration Eval', 'Sheet 16: Calculations'],
    ['Sheet 17: Blank Template', '', '', ''],
    ['', '', '', ''],
    [BRAND, '', '', ''],
  ];
  for (const row of systemData) systemSheet.addRow(row);

  const instrSheet = wb.addWorksheet('Instructions');
  const instrData: (string | number)[][] = [
    ['INSTRUCTIONS & USER GUIDE', '', BRAND],
    ['', '', ''],
    ['EVALUATION SCALE (0 – 4):', '', ''],
    ['Score', 'Description', 'Color Indicator'],
    ['0', 'Cannot perform / Not trained', 'Red'],
    ['1', 'Can perform with constant supervision', 'Orange'],
    ['2', 'Can perform with occasional supervision', 'Yellow'],
    ['3', 'Can perform independently', 'Lime Green'],
    ['4', 'Expert / Can train others', 'Green'],
    ['', '', ''],
    ['PERFORMANCE CLASSIFICATION:', '', ''],
    ['Class A (85–100%)', 'Promotion Ready — Can mentor junior staff', ''],
    ['Class B (60–84%)', 'Core Performer — Needs targeted training', ''],
    ['Class C (<60%)', 'Needs Improvement — Intensive training required', ''],
    ['', '', ''],
    ['WEIGHTED SCORING FORMULA:', '', ''],
    ['Total Score = Σ(Employee Skill Score × Skill Weight)', '', ''],
    ['Max Score = Σ(4 × Skill Weight)', '', ''],
    ['Percentage = ROUND(Total Score / Max Score × 100, 1)', '', ''],
    ['', '', ''],
    ['HOW TO USE THE EVALUATION SHEETS:', '', ''],
    ['1. Navigate to your department evaluation sheet (Sheets 7–15).', '', ''],
    ['2. Enter scores (0–4) for each employee and each skill.', '', ''],
    ['3. Total Score, Percentage, and Class update automatically via formulas.', '', ''],
    ['4. Use the Blank Template (Sheet 17) for custom department setups.', '', ''],
    ['5. Export to Excel at any time using the Export button in the web tool.', '', ''],
    ['', '', ''],
    [BRAND, '', ''],
  ];
  for (const row of instrData) instrSheet.addRow(row);

  const deptSheet = wb.addWorksheet('Departments');
  deptSheet.addRow(['DEPARTMENTS — HRM Wood Manufacturing', '', '', '', '', BRAND]);
  deptSheet.addRow(['Code', 'Department Name', 'Manager', 'Email', 'Employee Count', 'Description']);
  for (const d of DEPARTMENTS) {
    deptSheet.addRow([d.code, d.name, d.manager, d.email, d.employeeCount, d.description]);
  }
  deptSheet.addRow([]);
  deptSheet.addRow([BRAND]);

  const skillSheet = wb.addWorksheet('Skills Library');
  skillSheet.addRow([`SKILLS LIBRARY — ${SKILLS.length} Skills Across 9 Departments`, '', '', '', '', '', BRAND]);
  skillSheet.addRow(['Code', 'Skill Name', 'Department', 'Category', 'Weight (1–5)', 'Criticality', 'Description']);
  for (const s of SKILLS) {
    const dept = DEPARTMENTS.find((d: Department) => d.id === s.departmentId);
    skillSheet.addRow([s.code, s.name, dept?.name ?? s.departmentId, s.category, s.weight, s.criticality, s.description]);
  }
  skillSheet.addRow([]);
  skillSheet.addRow([BRAND]);

  const empSheet = wb.addWorksheet('Employees');
  empSheet.addRow(['EMPLOYEES — HRM Wood Manufacturing', '', '', '', '', '', BRAND]);
  empSheet.addRow(['Code', 'Full Name', 'Department', 'Job Title', 'Joined Date', 'Current Class', 'Email']);
  for (const e of EMPLOYEES) {
    const dept = DEPARTMENTS.find((d: Department) => d.id === e.departmentId);
    empSheet.addRow([e.code, e.fullName, dept?.name ?? e.departmentId, e.jobTitle, e.joinedDate, e.currentClass, e.email]);
  }
  empSheet.addRow([]);
  empSheet.addRow([BRAND]);

  const campSheet = wb.addWorksheet('Campaigns');
  campSheet.addRow(['EVALUATION CAMPAIGNS', '', '', '', '', '', '', BRAND]);
  campSheet.addRow(['ID', 'Title', 'Type', 'Department', 'Status', 'Start Date', 'End Date', 'Notes']);
  for (const c of CAMPAIGNS as Campaign[]) {
    campSheet.addRow([c.id, c.title, c.type, c.department, c.status, c.startDate, c.endDate, c.notes]);
  }
  campSheet.addRow([]);
  campSheet.addRow([BRAND]);

  buildEvalSheet(wb, UPHOLSTERY_EMPLOYEES, UPHOLSTERY_SKILLS, 'Upholstery', upholsteryScores, 'Upholstery Evals');
  buildEvalSheet(wb, PAINTING_EMPLOYEES, PAINTING_SKILLS, 'Painting', paintingScores, 'Painting Evals');
  buildEvalSheet(wb, NATURAL_WOOD_EMPLOYEES, NATURAL_WOOD_SKILLS, 'Natural Wood', naturalWoodScores, 'Natural Wood Evals');
  buildEvalSheet(wb, ASSEMBLY_EMPLOYEES, ASSEMBLY_SKILLS, 'Assembly', assemblyScores, 'Assembly Evals');
  buildEvalSheet(wb, CUTTING_EMPLOYEES, CUTTING_SKILLS, 'Cutting', cuttingScores, 'Cutting Evals');
  buildEvalSheet(wb, QC_EMPLOYEES, QC_SKILLS, 'Quality Control', qcScores, 'QC Evals');
  buildEvalSheet(wb, LOGISTICS_EMPLOYEES, LOGISTICS_SKILLS, 'Logistics', logisticsScores, 'Logistics Evals');
  buildEvalSheet(wb, MAINTENANCE_EMPLOYEES, MAINTENANCE_SKILLS, 'Maintenance', maintenanceScores, 'Maintenance Evals');
  buildEvalSheet(wb, ADMIN_EMPLOYEES, ADMIN_SKILLS, 'Administration', adminScores, 'Administration Evals');

  const calcSheet = wb.addWorksheet('Calculations');
  const calcData: (string | number)[][] = [
    ['CALCULATIONS REFERENCE', '', '', BRAND],
    ['', '', '', ''],
    ['THE WEIGHTED SCORING FORMULA', '', '', ''],
    ['', '', '', ''],
    ['Step 1: Assign scores (0–4) for each skill', '', '', ''],
    ['Step 2: Multiply each score by the skill weight', '', '', ''],
    ['Step 3: Total Score = Σ(score × weight) — use SUMPRODUCT in Excel', '', '', ''],
    ['Step 4: Max Score = Σ(4 × weight) — fixed per department', '', '', ''],
    ['Step 5: Percentage = ROUND(Total / Max × 100, 1)', '', '', ''],
    ['Step 6: Class = IF(Pct>=85,"A", IF(Pct>=60,"B","C"))', '', '', ''],
    ['', '', '', ''],
    ['WORKED EXAMPLE (Upholstery — Ahmed Al-Rashidi):', '', '', ''],
    ['Skill', 'Weight', 'Score', 'Weighted Score'],
    ['Frame Assembly', 4, 4, '=4×4=16'],
    ['Seam Stitching', 4, 4, '=4×4=16'],
    ['Sewing Machine Op.', 3, 3, '=3×3=9'],
    ['Spring Installation', 3, 4, '=4×3=12'],
    ['Fabric Finishing', 4, 4, '=4×4=16'],
    ['Material Cutting', 2, 4, '=4×2=8'],
    ['Pattern Recognition', 3, 3, '=3×3=9'],
    ['Foam Shaping', 2, 4, '=4×2=8'],
    ['Safety & 5S', 2, 4, '=4×2=8'],
    ['TOTAL SCORE', '', '', 102],
    ['MAX SCORE', '', '', 108],
    ['PERCENTAGE', '', '', 'ROUND(102/108×100,1) = 94.4%'],
    ['CLASS', '', '', 'A (≥85%)'],
    ['', '', '', ''],
    ['CLASSIFICATION THRESHOLDS:', '', '', ''],
    ['Class A', '85% – 100%', 'Promotion Ready', ''],
    ['Class B', '60% – 84%', 'Core Performer', ''],
    ['Class C', '0% – 59%', 'Needs Improvement', ''],
    ['', '', '', ''],
    [BRAND, '', '', ''],
  ];
  for (const row of calcData) calcSheet.addRow(row);

  const blankSheet = wb.addWorksheet('Blank Template');
  const blankSkillNames = ['Skill 1 (W:_)', 'Skill 2 (W:_)', 'Skill 3 (W:_)', 'Skill 4 (W:_)', 'Skill 5 (W:_)'];
  blankSheet.addRow(['BLANK DEPARTMENT TEMPLATE — Copy and customize for any department', ...Array(blankSkillNames.length + 4).fill(''), BRAND]);
  blankSheet.addRow(['Employee Name', 'Code', ...blankSkillNames, 'Total Score', 'Max Score', 'Percentage', 'Class', 'Notes']);
  for (let i = 1; i <= 20; i++) {
    blankSheet.addRow(['', '', 0, 0, 0, 0, 0, '', '', '', '', '']);
  }
  blankSheet.addRow([]);
  blankSheet.addRow([BRAND]);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'HRM_Skill_Matrix_Evaluation.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
