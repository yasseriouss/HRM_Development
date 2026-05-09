import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.resolve(__dirname, "../artifacts/hrm-docs/skill-matrix-template.xlsx");

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  gold:        "FFD4960A",
  goldLight:   "FFFFF3CD",
  darkBg:      "FF1A1D2E",
  navyBg:      "FF12141F",
  blue:        "FF2563EB",
  blueLight:   "FFDBEAFE",
  green:       "FF16A34A",
  greenLight:  "FFDCFCE7",
  red:         "FFDC2626",
  redLight:    "FFFEE2E2",
  yellow:      "FFEAB308",
  yellowLight: "FFFEF9C3",
  purple:      "FF7C3AED",
  purpleLight: "FFEDE9FE",
  gray900:     "FF111827",
  gray700:     "FF374151",
  gray500:     "FF6B7280",
  gray300:     "FFD1D5DB",
  gray200:     "FFE5E7EB",
  gray100:     "FFF9FAFB",
  white:       "FFFFFFFF",
};

// ── Helper fns ─────────────────────────────────────────────────────────────────
const fill   = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const bdr    = (s = "thin") => { const x = { style: s }; return { top: x, left: x, bottom: x, right: x }; };
const fnt    = (bold, size, argb, name = "Calibri") => ({ bold, size, color: { argb }, name });
const algn   = (h, v = "middle", wrap = false) => ({ horizontal: h, vertical: v, wrapText: wrap });

function styleRow(row, bgArgb, fontArgb, bold = false, sz = 10, center = false) {
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill   = fill(bgArgb);
    cell.font   = fnt(bold, sz, fontArgb);
    cell.border = bdr();
    if (center) cell.alignment = algn("center");
  });
}

function titleBlock(ws, title, sub) {
  ws.mergeCells("A1:N1");
  const t = ws.getCell("A1");
  t.value = title;
  t.fill  = fill(C.darkBg);
  t.font  = fnt(true, 18, C.gold);
  t.alignment = algn("center");
  ws.getRow(1).height = 42;

  ws.mergeCells("A2:N2");
  const s = ws.getCell("A2");
  s.value = sub;
  s.fill  = fill(C.navyBg);
  s.font  = fnt(false, 11, C.gray200);
  s.alignment = algn("center");
  ws.getRow(2).height = 22;
  return 3;
}

function sectionHdr(ws, text, cols, row, bg = C.blue) {
  const endCol = String.fromCharCode(64 + cols);
  ws.mergeCells(`A${row}:${endCol}${row}`);
  const c = ws.getCell(`A${row}`);
  c.value = text;
  c.fill  = fill(bg);
  c.font  = fnt(true, 11, C.white);
  c.alignment = algn("left");
  ws.getRow(row).height = 24;
  return row + 1;
}

function colWidths(ws, widths) {
  widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

// ── Data ──────────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { id: "D01", name: "Production",            head: "Ahmed Al-Rashidi",    count: 28 },
  { id: "D02", name: "Quality Control",       head: "Fatima Al-Zahrani",   count: 14 },
  { id: "D03", name: "Maintenance",           head: "Omar Al-Harbi",       count: 12 },
  { id: "D04", name: "Warehouse & Logistics", head: "Khalid Al-Otaibi",    count: 18 },
  { id: "D05", name: "Sales & Marketing",     head: "Nora Al-Ghamdi",      count: 15 },
  { id: "D06", name: "Finance & Accounting",  head: "Saad Al-Shehri",      count: 8  },
  { id: "D07", name: "Human Resources",       head: "Layla Al-Dosari",     count: 10 },
  { id: "D08", name: "IT & Systems",          head: "Faris Al-Qahtani",    count: 9  },
  { id: "D09", name: "Health & Safety",       head: "Reem Al-Anazi",       count: 12 },
];

const SKILLS = {
  "Production":            ["CNC Machine Operation","Wood Cutting & Sizing","Furniture Assembly","Surface Finishing","Blueprint Reading","Quality Inspection","Preventive Maintenance","Safety Compliance","Material Handling","Production Planning"],
  "Quality Control":       ["Defect Detection","Measurement Tools","ISO 9001 Standards","Documentation","Statistical Process Control","Calibration","Audit Procedures","Non-Conformance Reporting"],
  "Maintenance":           ["Electrical Diagnostics","Pneumatics & Hydraulics","PLC Programming","Welding","Lubrication Procedures","Spare Parts Management","CMMS Software","Safety Lockout/Tagout"],
  "Warehouse & Logistics": ["Inventory Management","Forklift Operation","SAP WM Module","Receiving & Dispatch","FIFO/LIFO Procedures","Barcode/RFID Scanning","Stock Counting","Shipping Documentation"],
  "Sales & Marketing":     ["Customer Relations","Product Knowledge","Negotiation","Market Analysis","Presentation Skills","Digital Marketing","Lead Generation","Contract Management"],
  "Finance & Accounting":  ["Financial Reporting","Budget Management","Accounts Payable/Receivable","VAT Compliance","ERP Finance Modules","Cost Analysis","Internal Audit"],
  "Human Resources":       ["Recruitment","Onboarding","Performance Management","Labor Law (KSA)","Training Needs Analysis","Payroll Processing","Employee Relations","HR Systems"],
  "IT & Systems":          ["Network Administration","ERP Support","Database Management","Cybersecurity","Help Desk Support","Business Intelligence","IT Project Management"],
  "Health & Safety":       ["Hazard Identification","Risk Assessment","Fire Safety","First Aid","PPE Management","Safety Training","Incident Investigation","OSHA/Saudi Standards"],
};

const ROLES = {
  "Production":            ["Production Operator","Senior Operator","Line Supervisor","CNC Technician"],
  "Quality Control":       ["QC Inspector","Senior QC Inspector","QC Supervisor"],
  "Maintenance":           ["Maintenance Technician","Senior Technician","Maintenance Supervisor"],
  "Warehouse & Logistics": ["Warehouse Associate","Logistics Coordinator","Warehouse Supervisor"],
  "Sales & Marketing":     ["Sales Executive","Senior Sales Executive","Sales Supervisor"],
  "Finance & Accounting":  ["Accountant","Senior Accountant","Finance Supervisor"],
  "Human Resources":       ["HR Specialist","Senior HR Specialist","HR Supervisor"],
  "IT & Systems":          ["IT Support Specialist","Systems Analyst","IT Supervisor"],
  "Health & Safety":       ["HSE Officer","Senior HSE Officer","HSE Supervisor"],
};

const FN = ["Ahmed","Mohammed","Omar","Khalid","Faris","Saad","Tariq","Ali","Hassan","Walid","Fatima","Nora","Layla","Reem","Sara","Hessa","Dana","Lina","Amira","Rana"];
const LN = ["Al-Rashidi","Al-Zahrani","Al-Harbi","Al-Otaibi","Al-Ghamdi","Al-Shehri","Al-Dosari","Al-Qahtani","Al-Anazi","Al-Mutairi","Al-Balawi","Al-Enezi","Al-Yami","Al-Bishi","Al-Malki"];

let ec = 1;
const EMPLOYEES = [];
DEPARTMENTS.forEach((d) => {
  for (let i = 0; i < d.count; i++) {
    const fn = FN[(ec + i * 3) % FN.length];
    const ln = LN[(ec * 2 + i * 5) % LN.length];
    const roleList = ROLES[d.name] || ["Associate"];
    EMPLOYEES.push({
      id:       `EMP${String(ec).padStart(3,"0")}`,
      name:     `${fn} ${ln}`,
      dept:     d.name,
      deptId:   d.id,
      role:     roleList[i % roleList.length],
      joinDate: `${2019 + (ec % 6)}-${String((ec % 12)+1).padStart(2,"0")}-${String((ec%28)+1).padStart(2,"0")}`,
      email:    `${fn.toLowerCase()}.${ln.toLowerCase().replace(/-/g,"")}@hrm.sa`,
    });
    ec++;
  }
});

// deterministic pseudo-random skill score
function score(seed) { return 1 + ((seed * 1103515245 + 12345) & 0x7fffffff) % 5; }

// ── Workbook ──────────────────────────────────────────────────────────────────
async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator  = "yasserious.com";
  wb.created  = new Date();
  wb.title    = "HRM Skill Matrix System";
  wb.subject  = "Employee Competency Assessment";

  // ── 1. Overview ─────────────────────────────────────────────────────────────
  const ov = wb.addWorksheet("📋 Overview", { tabColor: { argb: "D4960A" } });
  colWidths(ov, [14,28,24,14,16,14,28]);
  let r = titleBlock(ov, "HRM SKILL MATRIX SYSTEM", "Wood Manufacturing · 146 Employees · 9 Departments · Created by yasserious.com");

  r = sectionHdr(ov, "COMPANY SNAPSHOT", 5, r, C.gold);
  [["Company","HRM Wood Manufacturing Factory"],["Industry","Wood Manufacturing & Furniture"],
   ["Founded","2015 — Riyadh, Saudi Arabia"],["Employees","146 full-time"],
   ["Departments","9 operational"],["System Version","HRM Skill Matrix v1.0"],
   ["Created by","yasserious.com — May 2026"]].forEach(([k,v],i) => {
    const row = ov.addRow([k,v]);
    row.getCell(1).fill = fill(i%2?C.white:C.gray100); row.getCell(1).font = fnt(true,10,C.gray900);
    row.getCell(2).fill = fill(i%2?C.white:C.gray100); row.getCell(2).font = fnt(false,10,C.gray700);
    row.eachCell(c=>{c.border=bdr();});
    row.height=20; r++;
  });

  r++;
  r = sectionHdr(ov,"DEPARTMENTS",7,r,C.blue);
  const dhdr = ov.addRow(["Dept ID","Department","Head","Employees","Skills","Avg Score","Status"]);
  styleRow(dhdr,C.gray700,C.white,true,11,true);
  ov.getRow(r).height=22; r++;
  DEPARTMENTS.forEach((d,i)=>{
    const nSkills = SKILLS[d.name]?.length||8;
    const avg = (2.8+((i*7)%12)/10).toFixed(1);
    const row = ov.addRow([d.id,d.name,d.head,d.count,nSkills,avg,"Active"]);
    styleRow(row,i%2?C.white:C.gray100,C.gray700);
    row.getCell(4).alignment=algn("center"); row.getCell(5).alignment=algn("center");
    const ac=parseFloat(avg); row.getCell(6).fill=fill(ac>=3.5?C.greenLight:ac>=2.5?C.yellowLight:C.redLight);
    row.getCell(6).alignment=algn("center"); row.getCell(6).font=fnt(true,10,C.gray900);
    row.getCell(7).fill=fill(C.greenLight); row.getCell(7).font=fnt(true,9,C.green); row.getCell(7).alignment=algn("center");
    row.height=20; r++;
  });

  r++;
  r = sectionHdr(ov,"SKILL LEVEL LEGEND",5,r,C.purple);
  const lhdr = ov.addRow(["Level","Name","Score","Colour","Description"]);
  styleRow(lhdr,C.gray700,C.white,true,11,true);
  r++;
  const LEVELS=[
    {l:0,n:"Not Applicable",sc:"N/A",bg:C.gray200},
    {l:1,n:"Beginner",sc:"1",bg:C.redLight},
    {l:2,n:"Developing",sc:"2",bg:C.yellowLight},
    {l:3,n:"Proficient",sc:"3",bg:C.blueLight},
    {l:4,n:"Advanced",sc:"4",bg:C.greenLight},
    {l:5,n:"Expert",sc:"5",bg:C.purpleLight},
  ];
  const LDESC=["Skill not relevant to this role","Basic awareness — needs close supervision","Can perform with guidance","Works independently with good quality","Highly skilled — can guide others","Mastery level — sets team standards"];
  LEVELS.forEach((lv,i)=>{
    const row = ov.addRow([lv.l,lv.n,lv.sc,"",LDESC[i]]);
    row.eachCell({includeEmpty:true},(cell,col)=>{
      cell.border=bdr();
      if(col===4){cell.fill=fill(lv.bg);cell.value=" ";}
      else{cell.fill=fill(C.white);cell.font=fnt(col<=2,10,C.gray700);}
    });
    row.getCell(1).alignment=algn("center");
    row.getCell(3).alignment=algn("center");
    row.height=20;
  });

  r = ov.rowCount+2;
  sectionHdr(ov,"WORKSHEETS IN THIS FILE",5,r,C.darkBg);
  [["📋 Overview","Company info, legend, and guide (this sheet)"],
   ["👥 Employees","Full 146-employee directory with metadata"],
   ["🏭 Departments","Department roster with skill coverage stats"],
   ["📊 Skill Matrix — Production","Full skills×employees grid for Production"],
   ["📊 Skill Matrix — Quality","Full skills×employees grid for Quality Control"],
   ["📊 Skill Matrix — All Depts","Cross-dept skill snapshot"],
   ["📈 Scores Summary","Aggregated scores per employee"],
   ["🎯 Gap Analysis","Skills below target — action required"],
   ["📚 Training Plan","Training assignments for 2026"],
   ["🔄 Evaluation Template","Blank evaluation form for campaigns"],
   ["⚙️ Skills Catalog","Master skill registry"],
  ].forEach(([sh,desc],i)=>{
    const row=ov.addRow([sh,desc]);
    row.getCell(1).fill=fill(i%2?C.white:C.gray100);row.getCell(1).font=fnt(true,10,C.blue);
    row.getCell(2).fill=fill(i%2?C.white:C.gray100);row.getCell(2).font=fnt(false,10,C.gray700);
    row.eachCell(c=>{c.border=bdr();});row.height=20;
  });

  // ── 2. Employees ─────────────────────────────────────────────────────────────
  const ew = wb.addWorksheet("👥 Employees", { tabColor: { argb: "2563EB" } });
  colWidths(ew,[12,26,24,28,12,38,14,12]);
  titleBlock(ew,"EMPLOYEE DIRECTORY","146 employees across 9 departments — HRM Wood Manufacturing");
  const ehdr = ew.addRow(["Emp ID","Full Name","Department","Role / Position","Dept ID","Email","Join Date","Status"]);
  styleRow(ehdr,C.darkBg,C.gold,true,11,true);
  ew.getRow(3).height=24;
  ew.autoFilter = { from:"A3", to:"H3" };
  EMPLOYEES.forEach((emp,i)=>{
    const row=ew.addRow([emp.id,emp.name,emp.dept,emp.role,emp.deptId,emp.email,emp.joinDate,"Active"]);
    styleRow(row,i%2?C.white:C.gray100,C.gray700);
    row.getCell(1).font=fnt(true,10,C.gray700);
    row.getCell(8).fill=fill(C.greenLight);row.getCell(8).font=fnt(true,9,C.green);row.getCell(8).alignment=algn("center");
    row.height=18;
  });

  // ── 3. Departments ────────────────────────────────────────────────────────────
  const dw = wb.addWorksheet("🏭 Departments", { tabColor: { argb: "7C3AED" } });
  colWidths(dw,[12,28,24,12,14,14,14,20]);
  titleBlock(dw,"DEPARTMENTS","9 operational departments — skill coverage overview");
  const dwhdr=dw.addRow(["Dept ID","Department","Head","Employees","Skills Tracked","Avg Score","Target","Last Evaluation"]);
  styleRow(dwhdr,C.purple,C.white,true,11,true);
  dw.getRow(3).height=24;
  DEPARTMENTS.forEach((d,i)=>{
    const ns=SKILLS[d.name]?.length||8;
    const avg=(2.8+((i*7)%12)/10).toFixed(1);
    const tgt=(3.5+((i*3)%5)/10).toFixed(1);
    const row=dw.addRow([d.id,d.name,d.head,d.count,ns,avg,tgt,`2026-0${(i%3)+1}-15`]);
    styleRow(row,i%2?C.white:C.gray100,C.gray700);
    [4,5,6,7,8].forEach(c=>row.getCell(c).alignment=algn("center"));
    const a=parseFloat(avg);
    row.getCell(6).fill=fill(a>=3.5?C.greenLight:a>=2.5?C.yellowLight:C.redLight);
    row.getCell(6).font=fnt(true,10,C.gray900);
    row.height=22;
  });

  // ── Helper: full skill matrix sheet ──────────────────────────────────────────
  function addMatrixSheet(name, tabArgb, deptName, empList) {
    const ws = wb.addWorksheet(name, { tabColor: { argb: tabArgb } });
    const skills = SKILLS[deptName] || [];
    const totalCols = 4 + skills.length;
    titleBlock(ws, `SKILL MATRIX — ${deptName.toUpperCase()}`,
      "Scores: 0=N/A  1=Beginner  2=Developing  3=Proficient  4=Advanced  5=Expert");

    // Column widths
    const cw = [10,24,22,11,...skills.map(()=>8)];
    colWidths(ws,cw);

    // Header with rotated skill names
    const hdrVals=["Emp ID","Full Name","Role","Avg",...skills];
    const hdr=ws.addRow(hdrVals);
    hdr.height=80;
    hdr.eachCell({includeEmpty:true},(cell,col)=>{
      cell.fill=fill(col<=4?C.darkBg:C.navyBg);
      cell.font=fnt(true,10,col<=4?C.gold:C.gray200);
      cell.border=bdr();
      if(col>4) cell.alignment={horizontal:"center",vertical:"bottom",wrapText:true,textRotation:90};
      else cell.alignment=algn("center","bottom");
    });

    // Target row
    const tgt=ws.addRow(["","TARGET","",3,...skills.map(()=>3)]);
    tgt.height=20;
    tgt.eachCell({includeEmpty:true},(cell,col)=>{
      cell.fill=fill(C.goldLight);cell.font=fnt(true,10,C.gray900);
      cell.border=bdr();cell.alignment=algn("center");
    });
    tgt.getCell(2).alignment=algn("left");

    const SCORE_COLORS=[C.gray200,C.redLight,C.yellowLight,C.blueLight,C.greenLight,C.purpleLight];

    empList.forEach((emp,i)=>{
      const scores=skills.map((_,si)=>score(i*37+si*13+emp.id.charCodeAt(3)));
      const avg=(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1);
      const row=ws.addRow([emp.id,emp.name,emp.role,avg,...scores]);
      row.height=20;
      // fixed cells
      [1,2,3,4].forEach(c=>{
        row.getCell(c).fill=fill(i%2?C.white:C.gray100);
        row.getCell(c).font=fnt(c===1||c===4,10,C.gray700);
        row.getCell(c).border=bdr();
      });
      row.getCell(4).alignment=algn("center");
      const av=parseFloat(avg);
      row.getCell(4).fill=fill(av>=3.5?C.greenLight:av>=2.5?C.yellowLight:C.redLight);
      row.getCell(4).font=fnt(true,10,C.gray900);
      // skill score cells
      scores.forEach((sc,si)=>{
        const cell=row.getCell(si+5);
        cell.fill=fill(SCORE_COLORS[sc]||C.white);
        cell.font=fnt(true,10,C.gray900);
        cell.alignment=algn("center");
        cell.border=bdr();
      });
    });
    return ws;
  }

  const prodEmps = EMPLOYEES.filter(e=>e.dept==="Production");
  const qcEmps   = EMPLOYEES.filter(e=>e.dept==="Quality Control");
  addMatrixSheet("📊 Skill Matrix — Production","D4960A","Production",prodEmps);
  addMatrixSheet("📊 Skill Matrix — Quality","16A34A","Quality Control",qcEmps);

  // ── Cross-dept matrix (first 3 employees per dept, first 4 skills each) ──────
  const cdw = wb.addWorksheet("📊 Skill Matrix — All Depts",{tabColor:{argb:"2563EB"}});
  titleBlock(cdw,"CROSS-DEPARTMENT SKILL SNAPSHOT","Top 4 skills per department — 3 sample employees each");
  const CDW_FIXED=4;
  const crossSkills=[];
  const crossDeptLabels=[];
  DEPARTMENTS.forEach(d=>{
    (SKILLS[d.name]||[]).slice(0,4).forEach(sk=>{
      crossSkills.push(`${d.name.split(" ")[0]}\n${sk}`);
      crossDeptLabels.push(d.name);
    });
  });
  const cdwCols=[12,24,22,10,...crossSkills.map(()=>7)];
  colWidths(cdw,cdwCols);
  const cdhdr=cdw.addRow(["Emp ID","Full Name","Dept","Avg",...crossSkills]);
  cdhdr.height=90;
  cdhdr.eachCell({includeEmpty:true},(cell,col)=>{
    cell.fill=fill(col<=CDW_FIXED?C.darkBg:C.navyBg);
    cell.font=fnt(true,9,col<=CDW_FIXED?C.gold:C.gray200);
    cell.border=bdr();
    if(col>CDW_FIXED) cell.alignment={horizontal:"center",vertical:"bottom",wrapText:true,textRotation:90};
    else cell.alignment=algn("center","bottom");
  });
  const SCORE_COLORS2=[C.gray200,C.redLight,C.yellowLight,C.blueLight,C.greenLight,C.purpleLight];
  const crossEmps=[];
  DEPARTMENTS.forEach(d=>crossEmps.push(...EMPLOYEES.filter(e=>e.dept===d.name).slice(0,3)));
  crossEmps.forEach((emp,i)=>{
    const scores=crossSkills.map((_,si)=>score(i*41+si*17+emp.id.charCodeAt(3)));
    const avg=(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1);
    const row=cdw.addRow([emp.id,emp.name,emp.dept,avg,...scores]);
    row.height=18;
    [1,2,3,4].forEach(c=>{
      row.getCell(c).fill=fill(i%2?C.white:C.gray100);
      row.getCell(c).font=fnt(c===1||c===4,9,C.gray700);
      row.getCell(c).border=bdr();
    });
    row.getCell(4).alignment=algn("center");
    const av=parseFloat(avg);
    row.getCell(4).fill=fill(av>=3.5?C.greenLight:av>=2.5?C.yellowLight:C.redLight);
    row.getCell(4).font=fnt(true,9,C.gray900);
    scores.forEach((sc,si)=>{
      const cell=row.getCell(si+5);
      cell.fill=fill(SCORE_COLORS2[sc]||C.white);
      cell.font=fnt(true,9,C.gray900);
      cell.alignment=algn("center");
      cell.border=bdr();
    });
  });

  // ── 4. Scores Summary ─────────────────────────────────────────────────────────
  const sw = wb.addWorksheet("📈 Scores Summary", { tabColor: { argb: "16A34A" } });
  colWidths(sw,[12,26,22,22,12,12,12,14,14,16]);
  titleBlock(sw,"SCORES SUMMARY","Aggregated scores per employee — all departments");
  const shdr=sw.addRow(["Emp ID","Full Name","Department","Role","Avg Score","Min","Max","At Target","Below Target","Rating"]);
  styleRow(shdr,C.darkBg,C.gold,true,11,true);
  sw.getRow(3).height=24;
  sw.autoFilter={from:"A3",to:"J3"};
  EMPLOYEES.forEach((emp,i)=>{
    const skills=SKILLS[emp.dept]||[];
    const scores=skills.map((_,si)=>score(i*37+si*13+emp.id.charCodeAt(3)));
    const avg=scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length):0;
    const avgF=parseFloat(avg.toFixed(1));
    const mn=scores.length?Math.min(...scores):0;
    const mx=scores.length?Math.max(...scores):0;
    const atT=scores.filter(s=>s>=3).length;
    const blw=scores.filter(s=>s<3).length;
    const rating=avgF>=4?"Excellent":avgF>=3?"Good":avgF>=2?"Developing":"Needs Support";
    const rc=avgF>=4?C.greenLight:avgF>=3?C.blueLight:avgF>=2?C.yellowLight:C.redLight;
    const row=sw.addRow([emp.id,emp.name,emp.dept,emp.role,avgF,mn,mx,atT,blw,rating]);
    styleRow(row,i%2?C.white:C.gray100,C.gray700);
    [5,6,7,8,9].forEach(c=>row.getCell(c).alignment=algn("center"));
    row.getCell(5).fill=fill(avgF>=3.5?C.greenLight:avgF>=2.5?C.yellowLight:C.redLight);
    row.getCell(5).font=fnt(true,10,C.gray900);
    row.getCell(10).fill=fill(rc);row.getCell(10).font=fnt(true,9,C.gray900);
    row.getCell(10).alignment=algn("center");
    row.height=18;
  });

  // ── 5. Gap Analysis ───────────────────────────────────────────────────────────
  const gw = wb.addWorksheet("🎯 Gap Analysis", { tabColor: { argb: "DC2626" } });
  colWidths(gw,[12,26,22,28,14,14,10,16,30]);
  titleBlock(gw,"SKILL GAP ANALYSIS","Skills below target level — prioritized for action");
  const ghdr=gw.addRow(["Emp ID","Employee","Department","Skill","Current","Target","Gap","Priority","Recommended Action"]);
  styleRow(ghdr,C.red,C.white,true,11,true);
  gw.getRow(3).height=24;
  gw.autoFilter={from:"A3",to:"I3"};
  let gapRows=0;
  EMPLOYEES.forEach((emp,ei)=>{
    const skills=SKILLS[emp.dept]||[];
    skills.forEach((sk,si)=>{
      const cur=score(ei*37+si*13+emp.id.charCodeAt(3));
      const tgt=3;
      const gap=tgt-cur;
      if(gap>0){
        const priority=gap>=2?"High":"Medium";
        const action=gap>=2?"Enroll in formal training course":"On-the-job coaching / mentoring";
        const row=gw.addRow([emp.id,emp.name,emp.dept,sk,cur,tgt,gap,priority,action]);
        styleRow(row,gapRows%2?C.white:C.gray100,C.gray700);
        [5,6,7,8].forEach(c=>row.getCell(c).alignment=algn("center"));
        row.getCell(7).fill=fill(gap>=2?C.redLight:C.yellowLight);
        row.getCell(7).font=fnt(true,10,gap>=2?C.red:C.yellow);
        row.getCell(8).fill=fill(priority==="High"?C.redLight:C.yellowLight);
        row.getCell(8).font=fnt(true,9,C.gray900);
        row.getCell(9).alignment=algn("left","middle",true);
        row.height=20;
        gapRows++;
      }
    });
  });

  // ── 6. Training Plan ──────────────────────────────────────────────────────────
  const tw = wb.addWorksheet("📚 Training Plan", { tabColor: { argb: "0369A1" } });
  colWidths(tw,[12,26,22,30,22,14,14,16,24]);
  titleBlock(tw,"TRAINING PLAN 2026","Recommended training assignments based on skill gap analysis");
  const thdr=tw.addRow(["Emp ID","Employee","Department","Training Program","Skill Area","Duration","Start Date","Status","Provider"]);
  styleRow(thdr,C.darkBg,C.gold,true,11,true);
  tw.getRow(3).height=24;
  tw.autoFilter={from:"A3",to:"I3"};
  const TPROG={
    "Production":            ["CNC Advanced Operations","Lean Manufacturing","Quality Inspection Basics","Safety Excellence Program"],
    "Quality Control":       ["ISO 9001 Certification","Statistical Process Control","Advanced Calibration","QC Audit Techniques"],
    "Maintenance":           ["PLC Programming Level 2","Hydraulics & Pneumatics","Electrical Safety","CMMS Operations"],
    "Warehouse & Logistics": ["SAP WM Module","Forklift Certification","Inventory Optimization","Logistics Management"],
    "Sales & Marketing":     ["Sales Mastery","Digital Marketing","CRM Advanced","Professional Negotiation"],
    "Finance & Accounting":  ["ZAKAT & VAT Compliance","Financial Modelling","ERP Finance Module","IFRS Essentials"],
    "Human Resources":       ["KSA Labor Law","HR Analytics","Talent Management","SHRM Certification"],
    "IT & Systems":          ["Cybersecurity Fundamentals","ERP Administration","Cloud Computing AWS","IT Project Management"],
    "Health & Safety":       ["NEBOSH Certification","Fire Safety Officer","Risk Assessment Methods","Incident Investigation"],
  };
  const PROVIDERS=["HRM Internal Academy","Saudi Training Center","Online — Coursera","External Consultant","HRDF Program"];
  const STATUSES=["Scheduled","In Progress","Completed","Pending Approval"];
  const SCOLORS={Scheduled:C.blueLight,"In Progress":C.yellowLight,Completed:C.greenLight,"Pending Approval":C.gray200};
  let ti=0;
  EMPLOYEES.forEach((emp,ei)=>{
    const skills=SKILLS[emp.dept]||[];
    const scores=skills.map((_,si)=>score(ei*37+si*13+emp.id.charCodeAt(3)));
    const hasGap=scores.some(s=>s<3);
    if(!hasGap) return;
    const progs=TPROG[emp.dept]||["General Skills Training"];
    const prog=progs[ti%progs.length];
    const sk=skills[ti%skills.length];
    const dur=`${8+(ti%5)*4} hrs`;
    const mon=String((ti%9)+1).padStart(2,"0");
    const day=String((ti%20)+1).padStart(2,"0");
    const status=STATUSES[ti%STATUSES.length];
    const prov=PROVIDERS[ti%PROVIDERS.length];
    const row=tw.addRow([emp.id,emp.name,emp.dept,prog,sk,dur,`2026-${mon}-${day}`,status,prov]);
    styleRow(row,ti%2?C.white:C.gray100,C.gray700);
    [6,7,8].forEach(c=>row.getCell(c).alignment=algn("center"));
    row.getCell(8).fill=fill(SCOLORS[status]||C.gray100);
    row.getCell(8).font=fnt(true,9,C.gray900);
    row.height=20;
    ti++;
  });

  // ── 7. Evaluation Template ────────────────────────────────────────────────────
  const etw = wb.addWorksheet("🔄 Evaluation Template", { tabColor: { argb: "7C3AED" } });
  colWidths(etw,[20,28,14,14,14,14,14,28]);
  let er=titleBlock(etw,"EVALUATION CAMPAIGN TEMPLATE","Complete this form during an evaluation campaign period");

  er=sectionHdr(etw,"CAMPAIGN INFORMATION",8,er,C.purple);
  [["Campaign Name:","Q3 2026 Skill Evaluation"],["Period:","July 1 – September 30, 2026"],
   ["Evaluator:",""," (fill in)"],["Department:",""," (fill in)"],
   ["Status:","Active"],["Instructions:","Enter scores 1–5 for each employee per skill. Use 0 for Not Applicable."]
  ].forEach(([k,v],i)=>{
    const row=etw.addRow([k,v]);
    row.getCell(1).fill=fill(C.gray100);row.getCell(1).font=fnt(true,10,C.gray900);
    row.getCell(2).fill=fill(C.white);row.getCell(2).font=fnt(false,10,C.gray700);
    row.eachCell(c=>{c.border=bdr();});row.height=20;er++;
  });

  er++;
  er=sectionHdr(etw,"SCORING LEGEND",8,er,C.gold);
  LEVELS.forEach((lv,i)=>{
    const row=etw.addRow([`${lv.l} — ${lv.n}`,"","",LDESC[i]]);
    etw.mergeCells(`B${er}:C${er}`);etw.mergeCells(`D${er}:H${er}`);
    row.getCell(1).fill=fill(lv.bg);row.getCell(1).font=fnt(true,10,C.gray900);
    row.getCell(4).fill=fill(lv.bg);row.getCell(4).font=fnt(false,10,C.gray700);
    row.eachCell(c=>{c.border=bdr();});row.height=20;er++;
  });

  const LDESC2=["Skill not relevant to this role","Basic awareness — needs close supervision","Can perform with guidance","Works independently with good quality","Highly skilled — can guide others","Mastery level — sets team standards"];

  er++;
  er=sectionHdr(etw,"EMPLOYEE EVALUATION GRID — PRODUCTION (SAMPLE, fill in scores)",8,er,C.darkBg);
  const prodSkillSample=SKILLS["Production"].slice(0,6);
  const eghdr=etw.addRow(["Emp ID","Employee Name",...prodSkillSample]);
  styleRow(eghdr,C.navyBg,C.gold,true,10,true);
  etw.getRow(er).height=22;er++;
  const prodEmpsSample=EMPLOYEES.filter(e=>e.dept==="Production").slice(0,15);
  prodEmpsSample.forEach((emp,i)=>{
    const row=etw.addRow([emp.id,emp.name,...new Array(prodSkillSample.length).fill("")]);
    row.getCell(1).fill=fill(i%2?C.white:C.gray100);row.getCell(1).font=fnt(true,10,C.gray700);
    row.getCell(2).fill=fill(i%2?C.white:C.gray100);row.getCell(2).font=fnt(false,10,C.gray700);
    for(let c=3;c<=2+prodSkillSample.length;c++){
      row.getCell(c).fill=fill(C.white);
      row.getCell(c).alignment=algn("center");
      row.getCell(c).dataValidation={
        type:"list",allowBlank:true,formulae:['"0,1,2,3,4,5"'],
        showErrorMessage:true,error:"Enter 0–5",errorTitle:"Invalid Score"
      };
    }
    row.eachCell(c=>{c.border=bdr();});row.height=20;er++;
  });

  // ── 8. Skills Catalog ─────────────────────────────────────────────────────────
  const scw = wb.addWorksheet("⚙️ Skills Catalog", { tabColor: { argb: "374151" } });
  colWidths(scw,[12,22,30,16,14,12,18,20]);
  titleBlock(scw,"SKILLS CATALOG","Master registry of all tracked skills — definitions and targets");
  const skhdr=scw.addRow(["Skill ID","Department","Skill Name","Category","Target Level","Weight","Eval Method","Notes"]);
  styleRow(skhdr,C.darkBg,C.gold,true,11,true);
  scw.getRow(3).height=24;
  scw.autoFilter={from:"A3",to:"H3"};
  const CATS=["Technical","Operational","Safety","Analytical","Managerial","Interpersonal"];
  const METHODS=["Direct Observation","Supervisor Assessment","Written Test","Peer Review","Portfolio Review"];
  let skillId=1;
  DEPARTMENTS.forEach(d=>{
    (SKILLS[d.name]||[]).forEach((sk,si)=>{
      const row=scw.addRow([
        `SK${String(skillId).padStart(3,"0")}`,d.name,sk,
        CATS[si%CATS.length],3+(si%2),`${5+(si%6)*5}%`,
        METHODS[si%METHODS.length],""
      ]);
      styleRow(row,skillId%2?C.white:C.gray100,C.gray700);
      row.getCell(1).font=fnt(true,10,C.gray700);
      [5,6,7].forEach(c=>row.getCell(c).alignment=algn("center"));
      row.height=18;skillId++;
    });
  });

  return wb;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const LDESC=["Skill not relevant to this role","Basic awareness — needs close supervision","Can perform with guidance","Works independently with good quality","Highly skilled — can guide others","Mastery level — sets team standards"];
const LEVELS=[
  {l:0,n:"Not Applicable",sc:"N/A",bg:C.gray200},
  {l:1,n:"Beginner",sc:"1",bg:C.redLight},
  {l:2,n:"Developing",sc:"2",bg:C.yellowLight},
  {l:3,n:"Proficient",sc:"3",bg:C.blueLight},
  {l:4,n:"Advanced",sc:"4",bg:C.greenLight},
  {l:5,n:"Expert",sc:"5",bg:C.purpleLight},
];

console.log("🔨  Building HRM Skill Matrix Excel workbook…");
const wb = await build();

const outDir=path.dirname(OUTPUT_PATH);
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
await wb.xlsx.writeFile(OUTPUT_PATH);
const sz=fs.statSync(OUTPUT_PATH).size;
console.log(`✅  Saved: ${OUTPUT_PATH}`);
console.log(`   Size : ${(sz/1024).toFixed(0)} KB`);
console.log(`   Sheets: ${wb.worksheets.map(w=>w.name).join("  |  ")}`);
