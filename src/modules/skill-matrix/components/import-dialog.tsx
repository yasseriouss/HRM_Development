import { useState, useRef } from "react";
import ExcelJS from "exceljs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Upload, FileDown, CheckCircle2, Loader2, FileSpreadsheet, X } from "lucide-react";
import { useToast } from "@shared/hooks/use-toast";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  type: "employees" | "skills" | "departments" | "profiles";
}

export function ImportDialog({ open, onOpenChange, onSuccess, type }: ImportDialogProps) {
  const { toast } = useToast();
  const isAr = document.documentElement.dir === "rtl";
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Template");
    
    let headers: string[] = [];
    if (type === "employees") {
      headers = ["Full Name", "Code", "Department ID", "Job Title", "Email", "Phone", "Joined Date (YYYY-MM-DD)"];
    } else if (type === "skills") {
      headers = ["Skill Name", "Code", "Department ID", "Category", "Weight (1-5)", "Criticality (Low/Medium/High/Critical)", "Description"];
    } else if (type === "profiles") {
      headers = ["Job Title (EN)", "Job Title (AR)", "Department ID", "Education Level", "Experience Level", "Knowledge Level", "Supervisory Level", "Decision Level"];
    } else {
      headers = ["Name", "Code", "Description", "Manager Email"];
    }

    ws.addRow(headers);
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
    
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `HRM_${type}_template.xlsx`;
    link.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    try {
      const wb = new ExcelJS.Workbook();
      const buffer = await f.arrayBuffer();
      await wb.xlsx.load(buffer);
      const ws = wb.getWorksheet(1);
      const rows: any[] = [];
      ws?.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            rowData[colNumber] = cell.value;
          });
          rows.push(rowData);
        }
      });
      setPreview(rows);
    } catch (err) {
      toast({ title: isAr ? "خطأ في قراءة الملف" : "Error reading file", variant: "destructive" });
    }
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setLoading(true);
    const headers = getAuthHeaders();
    
    try {
      let successCount = 0;
      for (const row of preview) {
        let body: any = {};
        let url = "";

        if (type === "employees") {
          url = "/api/employees";
          body = {
            full_name: row[1],
            employee_code: row[2],
            department_id: row[3],
            job_title: row[4],
            email: row[5],
            phone: row[6],
            joined_date: row[7],
          };
        } else if (type === "skills") {
          url = "/api/skills";
          body = {
            name: row[1],
            code: row[2],
            department_id: row[3],
            category: row[4],
            weight: Number(row[5]),
            criticality: row[6],
            description: row[7],
          };
        } else if (type === "profiles") {
          url = "/api/job-evaluation/profiles";
          body = {
            title_en: row[1],
            title_ar: row[2],
            department_id: row[3],
            factors: {
              edu: Number(row[4]),
              exp: Number(row[5]),
              knw: Number(row[6]),
              sup: Number(row[7]),
              dec: Number(row[8]),
            }
          };
        } else {
          url = "/api/departments";
          body = {
            name: row[1],
            code: row[2],
            description: row[3],
            manager_email: row[4],
          };
        }

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(body),
        });
        if (res.ok) successCount++;
      }

      toast({
        title: isAr ? "اكتمل الاستيراد" : "Import Complete",
        description: isAr 
          ? `تم استيراد ${successCount} من ${preview.length} عنصر بنجاح.` 
          : `Successfully imported ${successCount} of ${preview.length} items.`,
        variant: successCount === preview.length ? "default" : "destructive",
      });
      
      if (successCount > 0) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (err) {
      toast({ title: isAr ? "فشل الاستيراد" : "Import Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = isAr 
    ? (type === 'employees' ? 'الموظفين' : type === 'departments' ? 'الأقسام' : type === 'skills' ? 'المهارات' : 'الوظائف')
    : type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface border border-muted/20 rounded-4xl p-0 overflow-hidden text-foreground shadow-2xl">
        <DialogHeader className="p-8 border-b border-muted/10 bg-muted/5">
          <DialogTitle className="flex items-center gap-3 text-2xl font-headline font-bold tracking-tight">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            {isAr ? `استيراد ${typeLabel}` : `Import ${typeLabel}`}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr ? "قم برفع ملف Excel الخاص بك لاستيراد البيانات بشكل جماعي." : "Upload your Excel file to bulk import records."}
          </p>
        </DialogHeader>
        
        <div className="p-10 space-y-8">
          {/* Step 1: Template */}
          <div className="flex items-center justify-between p-6 border border-primary/10 rounded-3xl bg-primary/5 group hover:border-primary/30 transition-all shadow-sm">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                <FileDown className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold tracking-tight">{isAr ? "تحميل النموذج" : "Download Template"}</p>
                <p className="text-[10px] text-muted-foreground font-headline font-black uppercase tracking-widest opacity-60">{isAr ? "استخدم النموذج الصحيح لتجنب الأخطاء" : "Use the correct format to avoid errors"}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2 border-primary/10 rounded-2xl bg-background hover:bg-background/80 hover:text-primary h-10 px-6 font-headline font-black text-[10px] tracking-widest uppercase">
              {isAr ? "تحميل" : "Download"}
            </Button>
          </div>

          {/* Step 2: Upload */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`relative border-2 border-dashed rounded-4xl p-16 text-center transition-all cursor-pointer group
              ${file ? 'border-primary bg-primary/5 shadow-inner' : 'border-muted/20 hover:border-primary/30 hover:bg-muted/5'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx,.xls" 
              onChange={handleFileChange} 
            />
            {file ? (
              <div className="space-y-3">
                <div className="h-20 w-20 mx-auto rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30 border-4 border-surface">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-xl font-headline font-black tracking-tight text-foreground uppercase">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-headline font-black uppercase tracking-widest opacity-60">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview([]);
                  }}
                >
                  <X className="h-4 w-4 me-2" /> {isAr ? "إزالة الملف" : "Remove File"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-20 w-20 mx-auto rounded-3xl bg-muted/10 flex items-center justify-center text-muted-foreground/30 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-muted/5 group-hover:border-primary/20">
                  <Upload className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-lg font-bold">{isAr ? "اختر ملف Excel" : "Select Excel File"}</p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{isAr ? "أو قم برفع الملف هنا" : "or drag and drop your file here"}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Step 3: Preview */}
          <AnimatePresence>
            {preview.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isAr ? `معاينة (${preview.length} صف)` : `Data Preview (${preview.length} rows)`}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-black">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    READY FOR IMPORT
                  </div>
                </div>
                <div className="max-h-[240px] overflow-auto rounded-3xl border border-muted/10 bg-background/50 custom-scrollbar shadow-inner">
                  <table className="w-full text-[10px]">
                    <thead className="sticky top-0 bg-muted/5 backdrop-blur-md border-b border-muted/10">
                      <tr>
                        {Object.keys(preview[0] || {}).map((k, i) => (
                          <th key={i} className="px-3 py-2 text-start font-bold text-muted-foreground">Col {k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/5">
                      {preview.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-primary/5 transition-colors group/row">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-4 py-3 truncate max-w-[150px] font-sans font-bold text-foreground/70 group-hover/row:text-foreground">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 5 && (
                  <p className="text-[10px] text-center text-muted-foreground italic">... and {preview.length - 5} more rows</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="p-8 border-t border-muted/10 bg-muted/5">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-headline font-black text-[10px] tracking-widest uppercase text-muted-foreground hover:bg-background h-12 px-10">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              size="lg" 
              onClick={handleImport} 
              disabled={!preview.length || loading}
              className="gap-3 px-12 h-14 rounded-2xl bg-primary text-white font-headline font-black text-[10px] tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isAr ? "جاري الاستيراد..." : "Importing..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {isAr ? "تأكيد الاستيراد" : "Confirm Import"}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
