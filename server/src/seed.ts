import { db } from "@hrm-development/db";
import {
  departmentsTable,
  usersTable,
  employeesTable,
  skillsTable,
  campaignsTable,
  evaluationsTable,
  evaluationSummariesTable,
  trainingRecommendationsTable,
} from "@hrm-development/db/schema";
import { eq, count, and } from "drizzle-orm";

// ── DEPARTMENTS ──────────────────────────────────────────────────────────────

export const DEPARTMENTS = [
  { id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", name: "Assembly",              code: "ASM", description: "Furniture assembly and finishing" },
  { id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", name: "Engineering",            code: "ENG", description: "Design, CAD and process engineering" },
  { id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", name: "Flat Surfaces",          code: "FLS", description: "Flat panel lamination and cutting" },
  { id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", name: "Industrial Wood Factory",code: "IWF", description: "Industrial wood processing" },
  { id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", name: "Natural Wood Sanding",   code: "NWS", description: "Sanding and surface preparation" },
  { id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", name: "Painting",               code: "PNT", description: "Painting, lacquering and UV coating" },
  { id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", name: "Production Management",  code: "PMG", description: "Planning, scheduling and KPIs" },
  { id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", name: "Solid Wood Factory",     code: "SWF", description: "Solid wood machining" },
  { id: "cc858321-464e-4f70-98a0-f6460759ddab", name: "Upholstery",             code: "UPH", description: "Fabric cutting, sewing and foam work" },
];

// ── DEMO USERS ───────────────────────────────────────────────────────────────

// Passwords are stored as plaintext in this demo system (auth.ts does === comparison)
export const USERS_DEF = [
  { id: "02cd3916-4d5b-425c-a675-f6d6d124f87f", email: "super_admin@hrm-dev.com", role: "super_admin",    password: "admin123", department_id: null,                                    production_role: "manager"    },
  { id: "1c2b3ac7-96cb-4cee-a9c3-2dcbdca99d7e", email: "hr@hrm-dev.com",          role: "hr_coordinator", password: "hr123",    department_id: null,                                    production_role: null         },
  { id: "bc467dbf-6e48-4ff3-9761-f2dbf34b99cb", email: "dept_head@hrm-dev.com",   role: "dept_head",      password: "head123",  department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", production_role: "supervisor" },
  { id: "07e01a20-d2fb-40c5-8f79-9e19a86438cd", email: "employee@hrm-dev.com",    role: "employee",       password: "emp123",   department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", production_role: "engineer"   },
] as const;

// ── SKILLS ───────────────────────────────────────────────────────────────────

type Criticality = "Low" | "Medium" | "High" | "Critical";

export const SKILLS: Array<{ code: string; name: string; department_id: string; category: string; weight: number; criticality: Criticality; description?: string }> = [
  // Assembly (ASM)
  { code: "ASM-S01", name: "Furniture Assembly",         department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", category: "Technical",            weight: 4, criticality: "Critical" },
  { code: "ASM-S02", name: "Hardware Installation",      department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", category: "Technical",            weight: 3, criticality: "High" },
  { code: "ASM-S03", name: "Fitting & Alignment",        department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", category: "Technical",            weight: 3, criticality: "High" },
  { code: "ASM-S04", name: "Quality Control",            department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", category: "Quality",              weight: 2, criticality: "High" },
  { code: "ASM-S05", name: "Tool Operation",             department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", category: "Technical",            weight: 2, criticality: "Medium" },
  { code: "ASM-S06", name: "Sequence Planning",          department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", category: "Operations",           weight: 2, criticality: "Medium" },
  { code: "ASM-010", name: "Frame Alignment & Squaring", department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", category: "Structural Assembly",  weight: 4, criticality: "High" },
  { code: "ASM-011", name: "Dowel Insertion Technique",  department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", category: "Joinery",              weight: 3, criticality: "Medium" },

  // Engineering (ENG)
  { code: "ENG-S01", name: "AutoCAD Drafting",               department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", category: "Technical",  weight: 4, criticality: "Critical" },
  { code: "ENG-S02", name: "3D Modelling",                   department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", category: "Technical",  weight: 4, criticality: "High" },
  { code: "ENG-S03", name: "Material Specification",         department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", category: "Knowledge",  weight: 3, criticality: "High" },
  { code: "ENG-S04", name: "Manufacturing Process Knowledge",department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", category: "Knowledge",  weight: 3, criticality: "High" },
  { code: "ENG-S05", name: "Cost Estimation",                department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", category: "Operations", weight: 2, criticality: "Medium" },
  { code: "ENG-S06", name: "Design Standards",               department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", category: "Knowledge",  weight: 2, criticality: "High" },
  { code: "ENG-010", name: "AutoCAD 2D Drafting",            department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", category: "Design Software",      weight: 3, criticality: "High" },
  { code: "ENG-011", name: "Material Stress Analysis",       department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", category: "Engineering Analysis", weight: 4, criticality: "Critical" },

  // Flat Surfaces (FLS)
  { code: "FLS-S01", name: "Laminate Application",     department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", category: "Technical",  weight: 4, criticality: "Critical" },
  { code: "FLS-S02", name: "Surface Preparation",      department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", category: "Technical",  weight: 3, criticality: "High" },
  { code: "FLS-S03", name: "Pattern Matching",         department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", category: "Technical",  weight: 2, criticality: "High" },
  { code: "FLS-S04", name: "Post-forming Techniques",  department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", category: "Technical",  weight: 3, criticality: "Medium" },
  { code: "FLS-S05", name: "Color Theory",             department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", category: "Knowledge",  weight: 2, criticality: "Medium" },
  { code: "FLT-009", name: "MDF Edge Sealing",         department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", category: "Surface Treatment", weight: 3, criticality: "Medium" },
  { code: "FLT-010", name: "Laminate Heat Pressing",   department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", category: "Lamination",        weight: 4, criticality: "High" },

  // Industrial Wood Factory (IWF)
  { code: "IWF-S01", name: "Industrial Saw Operation",      department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", category: "Technical",  weight: 4, criticality: "Critical" },
  { code: "IWF-S02", name: "Edge Banding",                  department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", category: "Technical",  weight: 3, criticality: "High" },
  { code: "IWF-S03", name: "Press Machine Operation",       department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", category: "Technical",  weight: 3, criticality: "High" },
  { code: "IWF-S04", name: "MDF/Particle Board Processing", department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", category: "Knowledge",  weight: 2, criticality: "Medium" },
  { code: "IWF-S05", name: "Production Line Efficiency",    department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", category: "Operations", weight: 2, criticality: "High" },
  { code: "IWF-S06", name: "Machine Maintenance",           department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", category: "Technical",  weight: 2, criticality: "High" },

  // Natural Wood Sanding (NWS)
  { code: "NWS-S01", name: "Machine Sanding",       department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", category: "Technical",  weight: 4, criticality: "Critical" },
  { code: "NWS-S02", name: "Hand Sanding",          department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", category: "Technical",  weight: 3, criticality: "High" },
  { code: "NWS-S03", name: "Grit Selection",        department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", category: "Knowledge",  weight: 2, criticality: "High" },
  { code: "NWS-S04", name: "Surface Quality Control",department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", category: "Quality",    weight: 3, criticality: "Critical" },
  { code: "NWS-S05", name: "Profile Sanding",       department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", category: "Technical",  weight: 2, criticality: "Medium" },
  { code: "SND-008", name: "Drum Sander Operation",  department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", category: "Machine Operation", weight: 3, criticality: "High" },
  { code: "SND-009", name: "Grit Progression Technique", department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", category: "Surface Quality", weight: 4, criticality: "Medium" },

  // Painting (PNT)
  { code: "PNT-S01", name: "Spray Gun Operation",           department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", category: "Technical",  weight: 4, criticality: "Critical" },
  { code: "PNT-S02", name: "Surface Preparation",           department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", category: "Technical",  weight: 3, criticality: "High" },
  { code: "PNT-S03", name: "Color Mixing",                  department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", category: "Technical",  weight: 3, criticality: "High" },
  { code: "PNT-S04", name: "Lacquer & Varnish Application", department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", category: "Technical",  weight: 3, criticality: "Critical" },
  { code: "PNT-S05", name: "Drying & Curing",               department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", category: "Knowledge",  weight: 2, criticality: "Medium" },
  { code: "PNT-S06", name: "Defect Identification",         department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", category: "Quality",    weight: 2, criticality: "High" },
  { code: "PNT-009", name: "UV Coating Application",        department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", category: "Coating Technology", weight: 4, criticality: "High" },
  { code: "PNT-010", name: "Color Matching & Tinting",      department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", category: "Color Management",   weight: 3, criticality: "Medium" },

  // Production Management (PMG)
  { code: "PMG-S01", name: "Production Planning",  department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", category: "Operations",  weight: 4, criticality: "Critical" },
  { code: "PMG-S02", name: "Lean Manufacturing",   department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", category: "Operations",  weight: 3, criticality: "High" },
  { code: "PMG-S03", name: "KPI Monitoring",       department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", category: "Operations",  weight: 3, criticality: "High" },
  { code: "PMG-S04", name: "Team Leadership",      department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", category: "Soft Skills", weight: 3, criticality: "High" },
  { code: "PMG-S05", name: "Inventory Control",    department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", category: "Operations",  weight: 2, criticality: "Medium" },
  { code: "PMG-S06", name: "Safety Compliance",    department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", category: "Compliance",  weight: 2, criticality: "High" },
  { code: "PMG-008", name: "KPI Dashboard Monitoring", department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", category: "Performance Management", weight: 4, criticality: "High" },

  // Solid Wood Factory (SWF)
  { code: "SWF-S01", name: "CNC Machine Operation",   department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", category: "Technical",  weight: 4, criticality: "Critical" },
  { code: "SWF-S02", name: "Wood Joinery",             department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", category: "Technical",  weight: 4, criticality: "Critical" },
  { code: "SWF-S03", name: "Wood Species Knowledge",   department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", category: "Knowledge",  weight: 3, criticality: "High" },
  { code: "SWF-S04", name: "Lathe Operation",          department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", category: "Technical",  weight: 3, criticality: "High" },
  { code: "SWF-S05", name: "Moisture Assessment",      department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", category: "Quality",    weight: 2, criticality: "Medium" },
  { code: "SWF-S06", name: "Cutting Accuracy",         department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", category: "Technical",  weight: 3, criticality: "High" },

  // Upholstery (UPH)
  { code: "UPH-S01", name: "Fabric Cutting",         department_id: "cc858321-464e-4f70-98a0-f6460759ddab", category: "Technical",  weight: 4, criticality: "Critical" },
  { code: "UPH-S02", name: "Sewing & Stitching",     department_id: "cc858321-464e-4f70-98a0-f6460759ddab", category: "Technical",  weight: 4, criticality: "Critical" },
  { code: "UPH-S03", name: "Foam Selection",         department_id: "cc858321-464e-4f70-98a0-f6460759ddab", category: "Knowledge",  weight: 3, criticality: "High" },
  { code: "UPH-S04", name: "Frame Attachment",       department_id: "cc858321-464e-4f70-98a0-f6460759ddab", category: "Technical",  weight: 3, criticality: "High" },
  { code: "UPH-S05", name: "Finish Quality Control", department_id: "cc858321-464e-4f70-98a0-f6460759ddab", category: "Quality",    weight: 2, criticality: "High" },
  { code: "UPH-S06", name: "Material Estimation",    department_id: "cc858321-464e-4f70-98a0-f6460759ddab", category: "Operations", weight: 2, criticality: "Medium" },
  { code: "UPH-009", name: "Pattern Cutting & Layout",   department_id: "cc858321-464e-4f70-98a0-f6460759ddab", category: "Fabric Work",     weight: 3, criticality: "Medium" },
  { code: "UPH-010", name: "Cushion Density Assessment", department_id: "cc858321-464e-4f70-98a0-f6460759ddab", category: "Material Quality", weight: 3, criticality: "Medium" },
];

// ── EMPLOYEES ────────────────────────────────────────────────────────────────

type EmployeeClass = "A" | "B" | "C";

interface EmpDef {
  employee_code: string;
  full_name: string;
  department_id: string;
  job_title: string;
  grade_level: string;
  joined_date: string;
  current_class: EmployeeClass;
}

export const EMPLOYEES: EmpDef[] = [
  // Solid Wood Factory (10)
  { employee_code: "SWF001", full_name: "Khalid Al-Mansouri",  department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "Senior Craftsman",  grade_level: "G5", joined_date: "2019-03-10", current_class: "A" },
  { employee_code: "SWF002", full_name: "Youssef Al-Hamdan",   department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "CNC Operator",       grade_level: "G4", joined_date: "2020-07-15", current_class: "B" },
  { employee_code: "SWF003", full_name: "Ibrahim Al-Qurashi",  department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "Wood Joiner",        grade_level: "G3", joined_date: "2021-01-20", current_class: "B" },
  { employee_code: "SWF004", full_name: "Samir Al-Amin",       department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "Lathe Operator",     grade_level: "G3", joined_date: "2021-06-05", current_class: "C" },
  { employee_code: "SWF005", full_name: "Tariq Al-Zahrani",    department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "Wood Craftsman",     grade_level: "G4", joined_date: "2020-11-12", current_class: "B" },
  { employee_code: "SWF006", full_name: "Hassan Al-Ghamdi",    department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "Junior Craftsman",   grade_level: "G2", joined_date: "2022-04-18", current_class: "C" },
  { employee_code: "SWF007", full_name: "Faisal Al-Otaibi",    department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "CNC Programmer",     grade_level: "G5", joined_date: "2018-09-01", current_class: "A" },
  { employee_code: "SWF008", full_name: "Ali Al-Shahrani",     department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "Machine Operator",   grade_level: "G3", joined_date: "2021-08-23", current_class: "B" },
  { employee_code: "SWF009", full_name: "Mohammed Al-Harbi",   department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "Wood Finisher",      grade_level: "G3", joined_date: "2022-01-15", current_class: "C" },
  { employee_code: "SWF010", full_name: "Abdullah Al-Qahtani", department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "Senior Operator",    grade_level: "G4", joined_date: "2019-12-05", current_class: "A" },
  // Assembly (7)
  { employee_code: "ASM001", full_name: "Omar Al-Rashidi",     department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", job_title: "Assembly Supervisor", grade_level: "G6", joined_date: "2017-05-20", current_class: "A" },
  { employee_code: "ASM002", full_name: "Nasser Al-Dossari",   department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", job_title: "Assembly Technician", grade_level: "G4", joined_date: "2020-03-11", current_class: "B" },
  { employee_code: "ASM003", full_name: "Saleh Al-Mutairi",    department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", job_title: "Junior Assembler",    grade_level: "G2", joined_date: "2022-09-01", current_class: "C" },
  { employee_code: "ASM004", full_name: "Badr Al-Anzi",        department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", job_title: "Assembly Technician", grade_level: "G3", joined_date: "2021-02-14", current_class: "B" },
  { employee_code: "ASM005", full_name: "Waleed Al-Subaie",    department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", job_title: "QC Inspector",        grade_level: "G4", joined_date: "2020-06-30", current_class: "B" },
  { employee_code: "ASM006", full_name: "Yousef Al-Harbi",     department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", job_title: "Senior Assembler",    grade_level: "G5", joined_date: "2018-12-10", current_class: "A" },
  { employee_code: "ASM007", full_name: "Majed Al-Shehri",     department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", job_title: "Junior Assembler",    grade_level: "G2", joined_date: "2023-01-15", current_class: "C" },
  // Painting (7)
  { employee_code: "PNT001", full_name: "Rami Al-Balawi",      department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", job_title: "Spray Painter",       grade_level: "G4", joined_date: "2020-04-20", current_class: "B" },
  { employee_code: "PNT002", full_name: "Khaled Al-Bogami",    department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", job_title: "Senior Painter",      grade_level: "G5", joined_date: "2018-07-08", current_class: "A" },
  { employee_code: "PNT003", full_name: "Ahmad Al-Solami",     department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", job_title: "UV Coating Operator", grade_level: "G3", joined_date: "2021-10-05", current_class: "B" },
  { employee_code: "PNT004", full_name: "Sultan Al-Zahrani",   department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", job_title: "Paint Mixer",         grade_level: "G2", joined_date: "2022-06-14", current_class: "C" },
  { employee_code: "PNT005", full_name: "Mansour Al-Yami",     department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", job_title: "Spray Painter",       grade_level: "G3", joined_date: "2021-03-22", current_class: "B" },
  { employee_code: "PNT006", full_name: "Turki Al-Saidi",      department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", job_title: "Finishing Specialist", grade_level: "G4", joined_date: "2019-08-17", current_class: "A" },
  { employee_code: "PNT007", full_name: "Ziad Al-Barqi",       department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", job_title: "Paint Technician",    grade_level: "G3", joined_date: "2021-11-30", current_class: "C" },
  // Sanding (6)
  { employee_code: "SND001", full_name: "Fahad Al-Marri",      department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", job_title: "Sanding Specialist",  grade_level: "G4", joined_date: "2020-02-28", current_class: "B" },
  { employee_code: "SND002", full_name: "Hamad Al-Kuwari",     department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", job_title: "Senior Sander",       grade_level: "G5", joined_date: "2017-11-15", current_class: "A" },
  { employee_code: "SND003", full_name: "Salem Al-Mahri",      department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", job_title: "Machine Sander",      grade_level: "G3", joined_date: "2021-07-01", current_class: "B" },
  { employee_code: "SND004", full_name: "Khalifa Al-Naimi",    department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", job_title: "Junior Sander",       grade_level: "G2", joined_date: "2022-10-10", current_class: "C" },
  { employee_code: "SND005", full_name: "Essa Al-Hajri",       department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", job_title: "Sanding Technician",  grade_level: "G3", joined_date: "2021-04-25", current_class: "B" },
  { employee_code: "SND006", full_name: "Jassim Al-Suwaidi",   department_id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", job_title: "QC Sanding Inspector",grade_level: "G4", joined_date: "2019-06-18", current_class: "A" },
  // Upholstery (6)
  { employee_code: "UPH001", full_name: "Rashid Al-Kalbani",   department_id: "cc858321-464e-4f70-98a0-f6460759ddab", job_title: "Upholstery Craftsman", grade_level: "G4", joined_date: "2020-01-13", current_class: "B" },
  { employee_code: "UPH002", full_name: "Saeed Al-Amri",       department_id: "cc858321-464e-4f70-98a0-f6460759ddab", job_title: "Senior Upholsterer",   grade_level: "G5", joined_date: "2018-04-02", current_class: "A" },
  { employee_code: "UPH003", full_name: "Mubarak Al-Wahaibi",  department_id: "cc858321-464e-4f70-98a0-f6460759ddab", job_title: "Fabric Cutter",        grade_level: "G3", joined_date: "2021-09-14", current_class: "B" },
  { employee_code: "UPH004", full_name: "Hilal Al-Farsi",      department_id: "cc858321-464e-4f70-98a0-f6460759ddab", job_title: "Foam Specialist",      grade_level: "G3", joined_date: "2022-03-07", current_class: "C" },
  { employee_code: "UPH005", full_name: "Yaqoob Al-Hosni",     department_id: "cc858321-464e-4f70-98a0-f6460759ddab", job_title: "Upholstery Technician",grade_level: "G3", joined_date: "2021-06-22", current_class: "B" },
  { employee_code: "UPH006", full_name: "Sultan Al-Badi",      department_id: "cc858321-464e-4f70-98a0-f6460759ddab", job_title: "Junior Upholsterer",   grade_level: "G2", joined_date: "2023-02-01", current_class: "C" },
  // Engineering (4)
  { employee_code: "ENG001", full_name: "Dr. Nabil Al-Fayez",  department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", job_title: "Chief Engineer",      grade_level: "G8", joined_date: "2015-06-01", current_class: "A" },
  { employee_code: "ENG002", full_name: "Hani Al-Joubouri",    department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", job_title: "CAD Designer",        grade_level: "G5", joined_date: "2019-09-10", current_class: "A" },
  { employee_code: "ENG003", full_name: "Riyad Al-Dakhil",     department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", job_title: "Process Engineer",    grade_level: "G6", joined_date: "2018-03-14", current_class: "B" },
  { employee_code: "ENG004", full_name: "Saud Al-Osaimi",      department_id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", job_title: "Junior Designer",     grade_level: "G3", joined_date: "2022-07-20", current_class: "C" },
  // Flat Surfaces (5)
  { employee_code: "FLS001", full_name: "Mazen Al-Bishi",      department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", job_title: "Lamination Specialist", grade_level: "G4", joined_date: "2020-05-05", current_class: "B" },
  { employee_code: "FLS002", full_name: "Adel Al-Shamrani",    department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", job_title: "Senior Laminator",      grade_level: "G5", joined_date: "2018-10-22", current_class: "A" },
  { employee_code: "FLS003", full_name: "Bassam Al-Qasim",     department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", job_title: "Press Operator",        grade_level: "G3", joined_date: "2021-12-08", current_class: "B" },
  { employee_code: "FLS004", full_name: "Nawaf Al-Enezi",      department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", job_title: "Junior Operator",       grade_level: "G2", joined_date: "2023-03-01", current_class: "C" },
  { employee_code: "FLS005", full_name: "Fawaz Al-Rasheed",    department_id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", job_title: "QC Inspector",          grade_level: "G4", joined_date: "2019-11-19", current_class: "A" },
  // Industrial Wood Factory (5)
  { employee_code: "IWF001", full_name: "Mousa Al-Ajlan",      department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", job_title: "Industrial Operator",  grade_level: "G4", joined_date: "2020-08-25", current_class: "B" },
  { employee_code: "IWF002", full_name: "Raed Al-Shammari",    department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", job_title: "Senior Operator",      grade_level: "G5", joined_date: "2018-01-30", current_class: "A" },
  { employee_code: "IWF003", full_name: "Dakheel Al-Rashidi",  department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", job_title: "Machine Technician",   grade_level: "G3", joined_date: "2021-05-17", current_class: "B" },
  { employee_code: "IWF004", full_name: "Ghazi Al-Mutairi",    department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", job_title: "Junior Operator",      grade_level: "G2", joined_date: "2022-11-03", current_class: "C" },
  { employee_code: "IWF005", full_name: "Nawwaf Al-Anzi",      department_id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", job_title: "Edge Banding Tech",    grade_level: "G3", joined_date: "2021-09-28", current_class: "B" },
  // Production Management (4)
  { employee_code: "PMG001", full_name: "Wail Al-Asiri",       department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", job_title: "Production Manager",  grade_level: "G8", joined_date: "2016-02-15", current_class: "A" },
  { employee_code: "PMG002", full_name: "Shaker Al-Qahtani",   department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", job_title: "Shift Supervisor",    grade_level: "G6", joined_date: "2018-06-20", current_class: "A" },
  { employee_code: "PMG003", full_name: "Meshal Al-Fuhaidi",   department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", job_title: "Planning Coordinator",grade_level: "G5", joined_date: "2019-04-10", current_class: "B" },
  { employee_code: "PMG004", full_name: "Bander Al-Khaldi",    department_id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", job_title: "KPI Analyst",         grade_level: "G4", joined_date: "2020-10-05", current_class: "B" },
];

// ── MAIN ─────────────────────────────────────────────────────────────────────

export async function seed() {
  console.log("🌱 Starting seed...");

  // 1. Departments
  console.log("  📁 Departments...");
  for (const dept of DEPARTMENTS) {
    await db.insert(departmentsTable).values({
      id: dept.id, name: dept.name, code: dept.code, description: dept.description,
    }).onConflictDoNothing();
  }

  // 2. Users (password_hash stores plaintext for this demo system)
  console.log("  👤 Demo users...");
  for (const u of USERS_DEF) {
    await db.insert(usersTable).values({
      id: u.id, email: u.email, password_hash: u.password,
      role: u.role as "super_admin" | "hr_coordinator" | "dept_head" | "employee",
      department_id: u.department_id ?? undefined,
      production_role: (u.production_role ?? null) as "manager" | "engineer" | "supervisor" | "technician" | "helper" | null,
    }).onConflictDoNothing();
    // Update production_role for existing rows (onConflictDoNothing skips inserts)
    if (u.production_role) {
      await db.update(usersTable)
        .set({ 
          production_role: u.production_role as "manager" | "engineer" | "supervisor" | "technician" | "helper",
          password_hash: u.password 
        })
        .where(eq(usersTable.id, u.id));
    } else {
      await db.update(usersTable)
        .set({ password_hash: u.password })
        .where(eq(usersTable.id, u.id));
    }
  }

  // 3. Skills
  console.log("  🔧 Skills...");
  for (const s of SKILLS) {
    await db.insert(skillsTable).values({
      code: s.code, name: s.name, department_id: s.department_id,
      category: s.category, weight: s.weight, criticality: s.criticality,
      description: s.description, is_active: true,
    }).onConflictDoNothing();
  }

  // 4. Employees (skip if already enough)
  const [existingEmpCount] = await db.select({ total: count() }).from(employeesTable);
  if (Number(existingEmpCount.total) < 50) {
    console.log("  👷 Employees...");
    for (const e of EMPLOYEES) {
      const [existing] = await db.select({ id: employeesTable.id })
        .from(employeesTable).where(eq(employeesTable.employee_code, e.employee_code)).limit(1);
      if (!existing) {
        await db.insert(employeesTable).values({
          employee_code: e.employee_code, full_name: e.full_name,
          department_id: e.department_id, job_title: e.job_title,
          joined_date: e.joined_date,
          current_class: e.current_class, is_active: true,
        });
      }
    }
  } else {
    console.log(`  👷 Employees: ${Number(existingEmpCount.total)} already present, skipping.`);
  }

  // 5. Campaigns + Evaluations + Summaries + Training
  const [existingCampaignCount] = await db.select({ total: count() }).from(campaignsTable);
  if (Number(existingCampaignCount.total) < 3) {
    console.log("  📋 Campaigns, evaluations, summaries, training...");
    await seedCampaignsAndEvaluations();
  } else {
    console.log(`  📋 Campaigns: ${Number(existingCampaignCount.total)} already present, skipping.`);
  }

  // Summary
  const [empCount] = await db.select({ total: count() }).from(employeesTable);
  const [skillCount] = await db.select({ total: count() }).from(skillsTable);
  const [deptCount] = await db.select({ total: count() }).from(departmentsTable);
  const [userCount] = await db.select({ total: count() }).from(usersTable);
  const [campaignCount] = await db.select({ total: count() }).from(campaignsTable);
  const [evalCount] = await db.select({ total: count() }).from(evaluationsTable);
  const [trainingCount] = await db.select({ total: count() }).from(trainingRecommendationsTable);

  console.log("\n✅ Seed complete:");
  console.log(`   Departments:  ${deptCount.total}`);
  console.log(`   Users:        ${userCount.total}`);
  console.log(`   Employees:    ${empCount.total}`);
  console.log(`   Skills:       ${skillCount.total}`);
  console.log(`   Campaigns:    ${campaignCount.total}`);
  console.log(`   Evaluations:  ${evalCount.total}`);
  console.log(`   Training:     ${trainingCount.total}`);
  console.log("\nDemo credentials:");
  console.log("   super_admin@hrm-dev.com / admin123");
  console.log("   hr@hrm-dev.com / hr123");
  console.log("   dept_head@hrm-dev.com / head123  (Assembly dept)");
  console.log("   employee@hrm-dev.com / emp123");
}

// ── CAMPAIGNS / EVALUATIONS / SUMMARIES / TRAINING ───────────────────────────

async function seedCampaignsAndEvaluations() {
  // Fetch all active employees and their department skills
  const employees = await db.select().from(employeesTable).where(eq(employeesTable.is_active, true));
  const skills = await db.select().from(skillsTable).where(eq(skillsTable.is_active, true));

  const deptSkills = new Map<string, typeof skills>();
  for (const s of skills) {
    if (!deptSkills.has(s.department_id)) deptSkills.set(s.department_id, []);
    deptSkills.get(s.department_id)!.push(s);
  }

  // Define 3 campaigns: one completed quarterly, one completed monthly, one active
  // Insert only if a campaign with that title does not already exist (idempotent by title)
  const campaignDefs = [
    { title: "Q4 2024 Quarterly Assessment",  type: "Quarterly" as const, status: "Completed" as const, start_date: "2024-10-01", end_date: "2024-12-31" },
    { title: "January 2025 Monthly Review",   type: "Monthly"   as const, status: "Completed" as const, start_date: "2025-01-01", end_date: "2025-01-31" },
    { title: "Q1 2025 Quarterly Assessment",  type: "Quarterly" as const, status: "Active"    as const, start_date: "2025-01-01", end_date: "2025-03-31" },
  ];

  for (const c of campaignDefs) {
    const [existing] = await db.select({ id: campaignsTable.id }).from(campaignsTable)
      .where(eq(campaignsTable.title, c.title)).limit(1);
    if (!existing) {
      await db.insert(campaignsTable).values({
        title: c.title,
        type: c.type,
        status: c.status,
        start_date: c.start_date,
        end_date: c.end_date,
      });
    }
  }

  // Resolve actual DB IDs (needed after insert since we use DB-generated UUIDs)
  // Order by start_date ascending so completedCampaigns[0] is Q4-2024, [1] is Jan-2025 (latest)
  const completedCampaigns = await db.select({ id: campaignsTable.id, title: campaignsTable.title, start_date: campaignsTable.start_date })
    .from(campaignsTable)
    .where(eq(campaignsTable.status, "Completed"));
  completedCampaigns.sort((a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""));
  const completedCampaignIds = completedCampaigns.map((c) => c.id);
  // Latest completed campaign ID is used to update employee current_class
  const latestCompletedId = completedCampaignIds[completedCampaignIds.length - 1];
  // Map campaign ID -> evaluation date string
  const campaignEvalDates: Record<string, string> = {};
  completedCampaigns.forEach((c, i) => {
    campaignEvalDates[c.id] = i === 0 ? "2024-12-15" : "2025-01-28";
  });

  for (const campaignId of completedCampaignIds) {
    const evalDateStr = campaignEvalDates[campaignId] ?? "2025-01-28";
    for (const emp of employees) {
      const empSkills = deptSkills.get(emp.department_id) ?? [];
      if (empSkills.length === 0) continue;

      // Check if evaluations already exist for this campaign+employee
      const [existingEval] = await db.select({ total: count() })
        .from(evaluationsTable)
        .where(and(
          eq(evaluationsTable.campaign_id, campaignId),
          eq(evaluationsTable.employee_id, emp.id),
        ));
      if (Number(existingEval.total) > 0) continue;

      // Generate realistic scores based on employee class
      const baseScore = emp.current_class === "A" ? 3 : emp.current_class === "B" ? 2 : 1;
      let totalWeightedScore = 0;
      let maxPossibleScore = 0;
      const evalDate = new Date(evalDateStr);

      for (const skill of empSkills) {
        // Vary score ±1 around base, clamped 0-4
        const variance = Math.floor(Math.random() * 3) - 1;
        const score = Math.max(0, Math.min(4, baseScore + variance));
        const maxScore = 4;

        await db.insert(evaluationsTable).values({
          campaign_id: campaignId,
          employee_id: emp.id,
          skill_id: skill.id,
          score,
          evaluation_date: evalDate,
          notes: score >= 3 ? "Performing well" : score === 2 ? "Meets expectations" : "Needs improvement",
        }).onConflictDoNothing();

        totalWeightedScore += score * skill.weight;
        maxPossibleScore += maxScore * skill.weight;
      }

      if (maxPossibleScore === 0) continue;

      const percentage = (totalWeightedScore / maxPossibleScore) * 100;
      const empClass: "A" | "B" | "C" = percentage >= 85 ? "A" : percentage >= 60 ? "B" : "C";

      // Insert/update evaluation summary
      await db.insert(evaluationSummariesTable).values({
        campaign_id: campaignId,
        employee_id: emp.id,
        total_score: String(totalWeightedScore),
        max_possible_score: String(maxPossibleScore),
        percentage: String(Math.round(percentage * 10) / 10),
        class: empClass,
        evaluated_skills_count: empSkills.length,
      }).onConflictDoNothing();

      // Update employee's current class from latest completed campaign
      if (campaignId === latestCompletedId) {
        await db.update(employeesTable)
          .set({ current_class: empClass })
          .where(eq(employeesTable.id, emp.id));
      }

      // Create training recommendations for class B and C employees
      if (empClass !== "A") {
        const weakSkills = empSkills.filter((_, i) => {
          // We already inserted evaluations, but for simplicity pick the first 2 skills
          return i < 2;
        });
        for (const wskill of weakSkills) {
          const [existingTraining] = await db.select({ total: count() })
            .from(trainingRecommendationsTable)
            .where(and(
              eq(trainingRecommendationsTable.employee_id, emp.id),
              eq(trainingRecommendationsTable.skill_id, wskill.id),
            ));
          if (Number(existingTraining.total) > 0) continue;

          await db.insert(trainingRecommendationsTable).values({
            employee_id: emp.id,
            skill_id: wskill.id,
            campaign_id: campaignId,
            recommendation_type: empClass === "C" ? "Immediate" : "Short-term",
            status: "Pending",
            notes: empClass === "C"
              ? `Critical skill gap identified. Immediate training required for ${wskill.name}.`
              : `Skill improvement recommended for ${wskill.name}.`,
          }).onConflictDoNothing();
        }
      }
    }
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
}).finally(async () => {
  process.exit(0);
});
