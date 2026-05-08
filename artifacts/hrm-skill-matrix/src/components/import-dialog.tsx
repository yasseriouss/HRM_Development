import { useState, useRef } from "react";
import ExcelJS from "exceljs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileDown, AlertCircle, CheckCircle2, Loader2, FileSpreadsheet, X } from "lucide-react";
import { useT } from "@/i18n";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  type: "employees" | "skills" | "departments" | "profiles";
}

export function ImportDialog({ open, onOpenChange, onSuccess, type }: ImportDialogProps) {
  const t = useT();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border/50 bg-muted/10">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            {isAr ? `استيراد ${type}` : `Import ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr ? "قم برفع ملف Excel الخاص بك لاستيراد البيانات بشكل جماعي." : "Upload your Excel file to bulk import records."}
          </p>
        </DialogHeader>
        
        <div className="p-8 space-y-6">
          {/* Step 1: Template */}
          <div className="flex items-center justify-between p-4 border border-primary/20 rounded-2xl bg-primary/5 group hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FileDown className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold">{isAr ? "تحميل النموذج" : "Download Template"}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{isAr ? "استخدم النموذج الصحيح لتجنب الأخطاء" : "Use the correct format to avoid errors"}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary">
              {isAr ? "تحميل" : "Download"}
            </Button>
          </div>

          {/* Step 2: Upload */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer group
              ${file ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50 hover:bg-muted/10'}`}
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
                <div className="h-16 w-16 mx-auto rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-black">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{(file.size / 1024).toFixed(2)} KB</p>
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
                  <X className="h-4 w-4 mr-2" /> {isAr ? "إزالة الملف" : "Remove File"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-bold">{isAr ? "اختر ملف Excel" : "Select Excel File"}</p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{isAr ? "أو قم بسحب وإفلات الملف هنا" : "or drag and drop your file here"}</p>
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
                <div className="max-h-[200px] overflow-auto rounded-2xl border border-border/50 bg-background/50 custom-scrollbar shadow-inner">
                  <table className="w-full text-[10px]">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm border-b border-border/50">
                      <tr>
                        {Object.keys(preview[0] || {}).map((k, i) => (
                          <th key={i} className="px-3 py-2 text-left font-bold text-muted-foreground">Col {k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {preview.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-primary/5 transition-colors">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-3 py-2 truncate max-w-[150px] font-medium">{String(val)}</td>
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

        <DialogFooter className="p-6 border-t border-border/50 bg-muted/10">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              size="lg" 
              onClick={handleImport} 
              disabled={!preview.length || loading}
              className="gap-2 px-8 bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
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
