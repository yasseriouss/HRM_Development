import fs from 'fs';
import path from 'path';

const WOODWORKING_FACTORY_ID = "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c";

const DEPT_MAP = {
  "التجميع الخشبى": "dec521d4-19b7-41b3-b9d1-9f40ef3567f8", // Assembly
  "الدهانات الخشبى": "32f9075f-6555-416c-9ed2-96cfb9f0134e", // Painting
  "التنجيد الخشبى": "cc858321-464e-4f70-98a0-f6460759ddab", // Upholstery
  "التفصيل الخشبي": "b14b9381-8372-4a8a-b603-605f57b4d0a2", // Flat Surfaces
  "التخريم والراوتر الخشبى": "777ad386-faf1-4cbc-83bc-9a83a4b2bb03", // Engineering
  "الشريط الخشبى": "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", // Industrial Wood Factory
  "الطبيعي الخشبى": "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", // Solid Wood Factory
  "الطبيعى الخشبى": "dfd7d1fb-4f89-4c49-9a45-f874de588d8d", // Solid Wood Factory
  "الإنتاج الخشبى": "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", // Industrial Wood Factory
  "الانتاج الخشبى": "f6e27cd9-beff-4fad-aa09-7416ad7ab20c", // Industrial Wood Factory
  "الإنتاج": "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", // Production Management
  "الانتاج": "5e6cb91f-4eb8-4d68-af29-bc667bb33cd6", // Production Management
};

const DEFAULT_DEPT = "f6e27cd9-beff-4fad-aa09-7416ad7ab20c"; // Industrial Wood Factory

const raw = fs.readFileSync('server/employees_data.json', 'utf8');
const data = JSON.parse(raw);

const employees = data.map((emp, index) => {
  const deptId = DEPT_MAP[emp.section] || DEPT_MAP[emp.department] || DEFAULT_DEPT;
  
  // Clean hiring date
  let joinedDate = emp.hiring_date;
  if (!joinedDate || joinedDate === "" || joinedDate.includes('\\') || joinedDate.includes('/')) {
    const separator = joinedDate.includes('\\') ? '\\' : '/';
    if (joinedDate && (joinedDate.includes('\\') || joinedDate.includes('/'))) {
      const parts = joinedDate.split(separator);
      if (parts.length === 3) {
         const year = parts[2].padStart(4, '20').slice(-4);
         const month = parts[1].padStart(2, '0');
         const day = parts[0].padStart(2, '0');
         joinedDate = `${year}-${month}-${day}`;
      } else {
        joinedDate = "2023-01-01";
      }
    } else {
      joinedDate = "2023-01-01";
    }
  }

  return {
    employee_code: `W-EMP-${emp.employee_id.padStart(3, '0')}-${index}`,
    full_name: emp.full_name,
    factory_id: WOODWORKING_FACTORY_ID,
    department_id: deptId,
    job_title: emp.job_title.trim(),
    grade_level: "G3",
    joined_date: joinedDate,
    current_class: "B"
  };
});

fs.writeFileSync('scratch/mapped_employees.json', JSON.stringify(employees, null, 2), 'utf8');
console.log('Successfully mapped ' + employees.length + ' employees.');
