-- Job Evaluation (Point Factor Method) Schema

-- 1. Main Categories (Factors)
CREATE TABLE IF NOT EXISTS job_evaluation_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    weight_percentage DECIMAL(5,2) NOT NULL, -- e.g., 35.00
    max_points INTEGER NOT NULL, -- e.g., 350
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sub-Factors
CREATE TABLE IF NOT EXISTS job_evaluation_sub_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factor_id UUID REFERENCES job_evaluation_factors(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    max_points INTEGER NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Evaluation Levels (1-5)
CREATE TABLE IF NOT EXISTS job_evaluation_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_factor_id UUID REFERENCES job_evaluation_sub_factors(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 5),
    points INTEGER NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Job Grades Structure
CREATE TABLE IF NOT EXISTS job_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_code TEXT NOT NULL UNIQUE, -- e.g., G1, G2...
    min_points INTEGER NOT NULL,
    max_points INTEGER NOT NULL,
    title_category_en TEXT NOT NULL,
    title_category_ar TEXT NOT NULL,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Job Profiles (Evaluated Jobs)
CREATE TABLE IF NOT EXISTS job_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    department_id UUID REFERENCES departments(id),
    status TEXT DEFAULT 'Draft', -- Draft, Pending, Approved
    total_points INTEGER DEFAULT 0,
    grade_id UUID REFERENCES job_grades(id),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Job Profile Factor Scores (Linking Profiles to Levels)
CREATE TABLE IF NOT EXISTS job_profile_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_profile_id UUID REFERENCES job_profiles(id) ON DELETE CASCADE,
    sub_factor_id UUID REFERENCES job_evaluation_sub_factors(id),
    level_id UUID REFERENCES job_evaluation_levels(id),
    points_awarded INTEGER NOT NULL,
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data for initial setup (based on user document)

-- Insert Factors
INSERT INTO job_evaluation_factors (name_en, name_ar, weight_percentage, max_points) VALUES
('Skills', 'المهارات', 35.00, 350),
('Responsibility', 'المسؤولية', 35.00, 350),
('Effort', 'الجهد', 20.00, 200),
('Work Conditions', 'ظروف العمل', 10.00, 100);

-- Insert Grades
INSERT INTO job_grades (grade_code, min_points, max_points, title_category_en, title_category_ar) VALUES
('G1', 100, 149, 'Worker / Assistant', 'عامل / مساعد'),
('G2', 150, 199, 'Junior Technician', 'فني مبتدئ'),
('G3', 200, 259, 'Mid-Level Technician / Admin', 'فني / إداري متوسط'),
('G4', 260, 329, 'Supervisor / Admin', 'مشرف / إداري'),
('G5', 330, 409, 'Senior Admin / Engineer', 'إداري أول / مهندس'),
('G6', 410, 509, 'Section Head', 'مدير قسم'),
('G7', 510, 629, 'Department / Project Manager', 'مدير إدارة / مشروع'),
('G8', 630, 769, 'Head of Function', 'رئيس إدارة'),
('G9', 770, 929, 'General Manager', 'مدير عام'),
('G10', 930, 1000, 'Chief Executive', 'تنفيذي أول');
