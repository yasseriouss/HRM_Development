# منصة HRM الموحدة - الهندسة التقنية والاستراتيجية (AR)

## 1. مخطط علاقة الكيانات (ERD)
يوضح هذا المخطط هيكل البيانات الأساسي والعلاقات بين الموظفين والتقييمات وسير العمل التشغيلي.

```mermaid
erDiagram
    USERS ||--o| EMPLOYEES : "يرتبط_بـ"
    DEPARTMENTS ||--o{ EMPLOYEES : "يحتوي_على"
    DEPARTMENTS ||--o{ WORKFLOWS : "يدير"
    CAMPAIGNS ||--o{ EVALUATIONS : "يجمع"
    CAMPAIGNS ||--o{ EVALUATION_SUMMARIES : "ينهي"
    EMPLOYEES ||--o{ EVALUATIONS : "يتلقى"
    EMPLOYEES ||--o{ EVALUATION_SUMMARIES : "يتم_تقييمه_في"
    EMPLOYEES ||--o{ TRAINING : "يخصص_له"
    SKILLS ||--o{ EVALUATIONS : "يتم_قياسها_بواسطة"
    SKILLS ||--o{ TRAINING : "يستهدف"
    WORKFLOWS ||--o{ EVALUATIONS : "يتحقق_من"

    USERS {
        uuid id PK "المعرف"
        string email UK "البريد الإلكتروني"
        string role "الدور: مدير، منسق، موظف"
        uuid employee_id FK "معرف الموظف"
    }

    EMPLOYEES {
        uuid id PK "المعرف"
        string full_name "الاسم الكامل"
        uuid dept_id FK "معرف القسم"
        string current_class "الفئة الحالية: A, B, C"
    }

    DEPARTMENTS {
        uuid id PK "المعرف"
        string name "الاسم"
        uuid manager_id FK "معرف المدير"
    }

    SKILLS {
        uuid id PK "المعرف"
        string name "الاسم"
        string category "الفئة"
        int weight "الوزن"
    }

    CAMPAIGNS {
        uuid id PK "المعرف"
        string title "العنوان"
        string status "الحالة: نشط، مكتمل"
        date start_date "تاريخ البدء"
    }

    EVALUATIONS {
        uuid id PK "المعرف"
        uuid campaign_id FK "معرف الحملة"
        uuid employee_id FK "معرف الموظف"
        uuid skill_id FK "معرف المهارة"
        int score "الدرجة: 0-4"
    }

    TRAINING {
        uuid id PK "المعرف"
        uuid employee_id FK "معرف الموظف"
        uuid skill_id FK "معرف المهارة"
        string type "النوع: فوري، طويل المدى"
        string status "الحالة: معلق، مكتمل"
    }
```

## 2. التدفق التشغيلي للنظام
دورة "الذكاء الصناعي" من البداية حتى توصيات التدريب المؤتمتة.

```mermaid
graph TD
    A[بدء الحملة] -->|تعريف المدير| B(نافذة التقييم النشطة)
    B -->|المدراء/رؤساء الأقسام| C{شبكة إدخال الدرجات}
    C -->|المتوسط المرجح| D[تصنيف الأداء]
    D -->|الفئات A/B/C| E{محرك رؤى الذكاء الاصطناعي}
    E -->|الفجوات العاجلة| F[توصيات التدريب]
    E -->|الموافقات| G[سلسلة بروتوكول سير العمل]
    F -->|نمو المهارات| H[تحديث ملف الموظف]
    G -->|اكتمال| I[الأرشيف التشغيلي]
    H -->|الدورة التالية| A
```

## 3. خارطة الطريق للتنفيذ
الجدول الزمني لتسليم منصة HRM الموحدة.

```mermaid
timeline
    title خارطة طريق HRM الموحدة 2026
    المرحلة 1 : التأسيس : تحسين مخطط قاعدة البيانات : نظام المصادقة : السجل الأساسي
    المرحلة 2 : الوحدات : تحليلات لوحة التحكم : تكامل جداول البيانات : الدليل التفاعلي
    المرحلة 3 : الذكاء : محرك رؤى الذكاء الاصطناعي : خطط التدريب المؤتمتة : سلسلة سير العمل
    المرحلة 4 : التميز : التكافؤ اللغوي (EN/AR) : تحسين تجربة المستخدم الصناعية : التدقيق الأمني النهائي
```
