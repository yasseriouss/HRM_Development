import { db } from "@hrm-development/db";
import {
  factoriesTable,
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

// ── FACTORIES ────────────────────────────────────────────────────────────────

export const FACTORIES = [
  { id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Woodworking Factory", code: "WOOD", description: "Primary furniture manufacturing facility" },
  { id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", name: "Metal Factory",       code: "METL", description: "Metal fabrication and CNC machining facility" },
];

// ── DEPARTMENTS ──────────────────────────────────────────────────────────────

export const DEPARTMENTS = [
  // WOODWORKING FACTORY
  { id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Assembly",              code: "ASM", description: "Furniture assembly and finishing" },
  { id: "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Engineering",            code: "ENG", description: "Design, CAD and process engineering" },
  { id: "b14b9381-8372-4a8a-b603-605f57b4d0a2", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Flat Surfaces",          code: "FLS", description: "Flat panel lamination and cutting" },
  { id: "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Industrial Wood Factory",code: "IWF", description: "Industrial wood processing" },
  { id: "5cdb45fd-eb49-4de4-92cd-c1f54881e56d", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Natural Wood Sanding",   code: "NWS", description: "Sanding and surface preparation" },
  { id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Painting",               code: "PNT", description: "Painting, lacquering and UV coating" },
  { id: "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Production Management",  code: "PMG", description: "Planning, scheduling and KPIs" },
  { id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Solid Wood Factory",     code: "SWF", description: "Solid wood machining" },
  { id: "cc858321-464e-4f70-98a0-f6460759ddab", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", name: "Upholstery",             code: "UPH", description: "Fabric cutting, sewing and foam work" },

  // METAL FACTORY
  { id: "b1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", factory_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", name: "Metal Fabrication",      code: "MFB", description: "Cutting, bending, and welding operations" },
  { id: "b2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", factory_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", name: "CNC Machining",          code: "CNC", description: "High-precision computer numerical control machining" },
  { id: "b3a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", factory_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", name: "Surface Treatment",       code: "MSF", description: "Powder coating and metal finishing" },
  { id: "b4a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", factory_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", name: "Metal Quality Assurance", code: "MQA", description: "Stress testing and tolerance verification" },
];

// ── DEMO USERS ───────────────────────────────────────────────────────────────

export const USERS_DEF = [
  // SUPER ADMINS (Access both or context based)
  { id: "02cd3916-4d5b-425c-a675-f6d6d124f87f", email: "super_admin@hrm-dev.com", role: "super_admin",    password: "admin123", factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", department_id: null,                                    production_role: "manager"    },
  
  // WOODWORKING FACTORY STAFF
  { id: "1c2b3ac7-96cb-4cee-a9c3-2dcbdca99d7e", email: "hr@hrm-dev.com",          role: "hr_coordinator", password: "hr123",    factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", department_id: null,                                    production_role: null         },
  { id: "bc467dbf-6e48-4ff3-9761-f2dbf34b99cb", email: "dept_head@hrm-dev.com",   role: "dept_head",      password: "head123",  factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", production_role: "supervisor" },
  
  // METAL FACTORY STAFF
  { id: "e1a2b3c4-5678-40ab-bdef-1234567890ab",    email: "hr_metal@hrm-dev.com",    role: "hr_coordinator", password: "hr123",    factory_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", department_id: null,                                    production_role: null         },
  { id: "e2a2b3c4-5678-40ab-bdef-1234567890ab",  email: "head_metal@hrm-dev.com",  role: "dept_head",      password: "head123",  factory_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", department_id: "b1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", production_role: "supervisor" },
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

  // METAL FABRICATION (MFB)
  { code: "MFB-S01", name: "TIG Welding",             department_id: "b1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", category: "Technical", weight: 4, criticality: "Critical" },
  { code: "MFB-S02", name: "Plasma Cutting",          department_id: "b1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", category: "Technical", weight: 4, criticality: "High" },
  { code: "MFB-S03", name: "Hydraulic Bending",       department_id: "b1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", category: "Technical", weight: 3, criticality: "High" },
  { code: "MFB-S04", name: "Structural Integrity",    department_id: "b1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", category: "Quality",   weight: 3, criticality: "Critical" },

  // CNC MACHINING (CNC)
  { code: "CNC-S01", name: "G-Code Programming",      department_id: "b2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", category: "Technical", weight: 4, criticality: "Critical" },
  { code: "CNC-S02", name: "Precision Measurement",   department_id: "b2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", category: "Technical", weight: 4, criticality: "High" },
  { code: "CNC-S03", name: "Tooling Selection",       department_id: "b2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", category: "Knowledge", weight: 3, criticality: "High" },

  // SURFACE TREATMENT (MSF)
  { code: "MSF-S01", name: "Powder Coating",          department_id: "b3a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", category: "Technical", weight: 4, criticality: "Critical" },
  { code: "MSF-S02", name: "Chemical Pre-treatment",  department_id: "b3a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", category: "Technical", weight: 3, criticality: "High" },
];

// ── EMPLOYEES ────────────────────────────────────────────────────────────────

type EmployeeClass = "A" | "B" | "C";

interface EmpDef {
  employee_code: string;
  full_name: string;
  factory_id: string;
  department_id: string;
  job_title: string;
  grade_level: string;
  joined_date: string;
  current_class: EmployeeClass;
}

export const EMPLOYEES: EmpDef[] = [
  // WOODWORKING FACTORY (Existing)
  { employee_code: "SWF001", full_name: "Khalid Al-Mansouri",  factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "Senior Craftsman",  grade_level: "G5", joined_date: "2019-03-10", current_class: "A" },
  { employee_code: "SWF002", full_name: "Youssef Al-Hamdan",   factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", department_id: "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", job_title: "CNC Operator",       grade_level: "G4", joined_date: "2020-07-15", current_class: "B" },
  { employee_code: "ASM001", full_name: "Omar Al-Rashidi",     factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", department_id: "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", job_title: "Assembly Supervisor", grade_level: "G6", joined_date: "2017-05-20", current_class: "A" },
  { employee_code: "PNT001", full_name: "Rami Al-Balawi",      factory_id: "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c", department_id: "32f9075f-6555-416c-9ed2-96cfb9f0134e", job_title: "Spray Painter",       grade_level: "G4", joined_date: "2020-04-20", current_class: "B" },

  // METAL FACTORY (New)
  { employee_code: "MET001", full_name: "Ahmed Al-Metal",      factory_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", department_id: "b1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", job_title: "Lead Welder",        grade_level: "G5", joined_date: "2021-01-10", current_class: "A" },
  { employee_code: "MET002", full_name: "Sami Al-Iron",       factory_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", department_id: "b1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", job_title: "Plasma Operator",    grade_level: "G4", joined_date: "2022-05-15", current_class: "B" },
  { employee_code: "CNC-M01", full_name: "Hassan Al-Steel",    factory_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", department_id: "b2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", job_title: "CNC Specialist",     grade_level: "G6", joined_date: "2020-11-20", current_class: "A" },
];

// ── MAIN ─────────────────────────────────────────────────────────────────────

export async function seed() {
  console.log("🌱 Starting seed...");

  // 1. Factories
  console.log("  🏭 Factories...");
  await db.insert(factoriesTable).values(FACTORIES).onConflictDoNothing();

  // 2. Departments
  console.log("  📁 Departments...");
  for (const dept of DEPARTMENTS) {
    await db.insert(departmentsTable).values({
      id: dept.id, 
      factory_id: dept.factory_id,
      name: dept.name, 
      code: dept.code, 
      description: dept.description,
    }).onConflictDoNothing();

    // Update factory_id if record already exists
    await db.update(departmentsTable)
      .set({ factory_id: dept.factory_id })
      .where(eq(departmentsTable.id, dept.id));
  }

  // 3. Users
  console.log("  👤 Demo users...");
  for (const u of USERS_DEF) {
    await db.insert(usersTable).values({
      id: u.id, 
      email: u.email, 
      password_hash: u.password,
      factory_id: u.factory_id,
      role: u.role as "super_admin" | "hr_coordinator" | "dept_head" | "employee",
      department_id: u.department_id ?? undefined,
      production_role: (u.production_role ?? null) as "manager" | "engineer" | "supervisor" | "technician" | "helper" | null,
    }).onConflictDoNothing();
    
    await db.update(usersTable)
      .set({ 
        factory_id: u.factory_id,
        password_hash: u.password,
        production_role: u.production_role as "manager" | "engineer" | "supervisor" | "technician" | "helper" | null
      })
      .where(eq(usersTable.id, u.id));
  }

  // 4. Skills
  console.log("  🔧 Skills...");
  const skillValues = SKILLS.map(s => ({
    code: s.code, 
    name: s.name, 
    department_id: s.department_id,
    category: s.category, 
    weight: s.weight, 
    criticality: s.criticality,
    description: s.description, 
    is_active: true,
  }));
  await db.insert(skillsTable).values(skillValues).onConflictDoNothing();

  // 5. Employees
  console.log("  👷 Employees...");
  for (const e of EMPLOYEES) {
    const [existing] = await db.select({ id: employeesTable.id })
      .from(employeesTable).where(eq(employeesTable.employee_code, e.employee_code)).limit(1);
    
    if (!existing) {
      await db.insert(employeesTable).values({
        employee_code: e.employee_code, 
        full_name: e.full_name,
        factory_id: e.factory_id,
        department_id: e.department_id, 
        job_title: e.job_title,
        joined_date: e.joined_date,
        current_class: e.current_class, 
        is_active: true,
      });
    } else {
      await db.update(employeesTable)
        .set({ 
          factory_id: e.factory_id,
          current_class: e.current_class 
        })
        .where(eq(employeesTable.id, existing.id));
    }
  }

  // 6. Campaigns + Evaluations + Summaries + Training
  console.log("  📋 Campaigns, evaluations, summaries, training...");
  await seedCampaignsAndEvaluations();

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
  const employees = await db.select().from(employeesTable).where(eq(employeesTable.is_active, true));
  const skills = await db.select().from(skillsTable).where(eq(skillsTable.is_active, true));

  const deptSkills = new Map<string, typeof skills>();
  for (const s of skills) {
    if (!deptSkills.has(s.department_id)) deptSkills.set(s.department_id, []);
    deptSkills.get(s.department_id)!.push(s);
  }

  const campaignDefs = [
    { title: "Q4 2024 Quarterly Assessment", type: "Quarterly" as const, status: "Completed" as const, start_date: "2024-10-01", end_date: "2024-12-31" },
    { title: "January 2025 Monthly Review", type: "Monthly" as const, status: "Completed" as const, start_date: "2025-01-01", end_date: "2025-01-31" },
    { title: "Q1 2025 Quarterly Assessment", type: "Quarterly" as const, status: "Active" as const, start_date: "2025-01-01", end_date: "2025-03-31" },
  ];

  for (const c of campaignDefs) {
    await db.insert(campaignsTable).values(c).onConflictDoNothing();
  }

  const completedCampaigns = await db.select({ id: campaignsTable.id, title: campaignsTable.title, start_date: campaignsTable.start_date })
    .from(campaignsTable)
    .where(eq(campaignsTable.status, "Completed"));
  
  completedCampaigns.sort((a: any, b: any) => (a.start_date ?? "").localeCompare(b.start_date ?? ""));
  const latestCompletedId = completedCampaigns[completedCampaigns.length - 1]?.id;

  const allEvaluations: any[] = [];
  const allSummaries: any[] = [];
  const allTraining: any[] = [];

  for (const campaign of completedCampaigns) {
    const evalDate = new Date(campaign.title.includes("2024") ? "2024-12-15" : "2025-01-28");
    
    for (const emp of employees) {
      const empSkills = deptSkills.get(emp.department_id) ?? [];
      if (empSkills.length === 0) continue;

      const baseScore = emp.current_class === "A" ? 3 : emp.current_class === "B" ? 2 : 1;
      let totalWeightedScore = 0;
      let maxPossibleScore = 0;

      for (const skill of empSkills) {
        const variance = Math.floor(Math.random() * 3) - 1;
        const score = Math.max(0, Math.min(4, baseScore + variance));
        const maxScore = 4;

        allEvaluations.push({
          campaign_id: campaign.id,
          employee_id: emp.id,
          skill_id: skill.id,
          score,
          evaluation_date: evalDate,
          notes: score >= 3 ? "Performing well" : score === 2 ? "Meets expectations" : "Needs improvement",
        });

        totalWeightedScore += score * skill.weight;
        maxPossibleScore += maxScore * skill.weight;
      }

      if (maxPossibleScore === 0) continue;

      const percentage = (totalWeightedScore / maxPossibleScore) * 100;
      const empClass: "A" | "B" | "C" = percentage >= 85 ? "A" : percentage >= 60 ? "B" : "C";

      allSummaries.push({
        campaign_id: campaign.id,
        employee_id: emp.id,
        total_score: String(totalWeightedScore),
        max_possible_score: String(maxPossibleScore),
        percentage: String(Math.round(percentage * 10) / 10),
        class: empClass,
        evaluated_skills_count: empSkills.length,
      });

      if (campaign.id === latestCompletedId) {
        await db.update(employeesTable)
          .set({ current_class: empClass })
          .where(eq(employeesTable.id, emp.id));
      }

      if (empClass !== "A") {
        const weakSkills = empSkills.slice(0, 2);
        for (const wskill of weakSkills) {
          allTraining.push({
            employee_id: emp.id,
            skill_id: wskill.id,
            campaign_id: campaign.id,
            recommendation_type: empClass === "C" ? "Immediate" : "Short-term",
            status: "Pending",
            notes: empClass === "C"
              ? `Critical skill gap identified. Immediate training required for ${wskill.name}.`
              : `Skill improvement recommended for ${wskill.name}.`,
          });
        }
      }
    }
  }

  // Batch insert all records
  console.log(`    Inserting ${allEvaluations.length} evaluations...`);
  if (allEvaluations.length > 0) {
    // Chunk evaluations to avoid hitting payload limits (Neon might have limits)
    for (let i = 0; i < allEvaluations.length; i += 100) {
      await db.insert(evaluationsTable).values(allEvaluations.slice(i, i + 100)).onConflictDoNothing();
    }
  }

  console.log(`    Inserting ${allSummaries.length} summaries...`);
  if (allSummaries.length > 0) {
    await db.insert(evaluationSummariesTable).values(allSummaries).onConflictDoNothing();
  }

  console.log(`    Inserting ${allTraining.length} training recommendations...`);
  if (allTraining.length > 0) {
    await db.insert(trainingRecommendationsTable).values(allTraining).onConflictDoNothing();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
}).finally(async () => {
  process.exit(0);
});
