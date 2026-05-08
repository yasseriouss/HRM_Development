import { useState, useRef } from "react";
import ExcelJS from "exceljs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileDown, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useT } from "@/i18n";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  type: "employees" | "skills" | "departments" | "profiles";
}

export function ImportDialog({ open, onOpenChange, onSuccess, type }: ImportDialogProps) {
  const t = useT();
  const { toast } = useToast();
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
          url = "/api/job-profiles";
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
        title: "Import Complete",
        description: `Successfully imported ${successCount} of ${preview.length} items.`,
        variant: successCount === preview.length ? "default" : "destructive",
      });
      
      if (successCount > 0) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (err) {
      toast({ title: "Import Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Import {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Download Template</p>
              <p className="text-xs text-muted-foreground">Use our template to ensure correct format.</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
              <FileDown className="h-4 w-4" /> Template
            </Button>
          </div>

          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx,.xls" 
              onChange={handleFileChange} 
            />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">{file ? file.name : "Select Excel File"}</p>
            <p className="text-xs text-muted-foreground mt-1">Upload your filled template here.</p>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Preview ({preview.length} rows found)</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                  <CheckCircle2 className="h-3 w-3" /> Ready
                </div>
              </div>
              <div className="max-h-[200px] overflow-auto rounded border border-border bg-card">
                <table className="w-full text-[10px]">
                  <tbody className="divide-y divide-border">
                    {preview.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="px-2 py-1.5 truncate max-w-[100px]">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                    {preview.length > 5 && (
                      <tr>
                        <td colSpan={10} className="px-2 py-1.5 text-center text-muted-foreground">... and {preview.length - 5} more</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            size="sm" 
            onClick={handleImport} 
            disabled={!preview.length || loading}
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Confirm Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
