import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  Copy,
  CheckCircle2,
  ArrowRight,
  FileSpreadsheet,
  FileJson,
  FileText,
  Plus,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Day26DataExportProps {
  dayId: number;
  onComplete: () => void;
}

const EXPORT_FORMATS = [
  { id: "csv", label: "CSV", icon: FileSpreadsheet, desc: "Excel-friendly, most common" },
  { id: "json", label: "JSON", icon: FileJson, desc: "For developers, API-ready" },
  { id: "pdf", label: "PDF", icon: FileText, desc: "For reports, printable" },
];

const COMMON_DATA_TYPES = [
  { id: "users", label: "User Data", fields: ["email", "name", "created_at", "plan", "status"] },
  { id: "transactions", label: "Transaction History", fields: ["date", "amount", "description", "status"] },
  { id: "activity", label: "Activity/Usage", fields: ["action", "timestamp", "details"] },
  { id: "content", label: "User Content", fields: ["title", "body", "created_at", "updated_at"] },
];

export function Day26DataExport({ dayId, onComplete }: Day26DataExportProps) {
  const [step, setStep] = useState<"formats" | "data" | "fields" | "prompt">("formats");
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [selectedDataTypes, setSelectedDataTypes] = useState<Set<string>>(new Set());
  const [customFields, setCustomFields] = useState<string[]>([""]);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const { toast } = useToast();

  const toggleFormat = (formatId: string) => {
    const newFormats = new Set(selectedFormats);
    if (newFormats.has(formatId)) {
      newFormats.delete(formatId);
    } else {
      newFormats.add(formatId);
    }
    setSelectedFormats(newFormats);
  };

  const toggleDataType = (typeId: string) => {
    const newTypes = new Set(selectedDataTypes);
    if (newTypes.has(typeId)) {
      newTypes.delete(typeId);
    } else {
      newTypes.add(typeId);
    }
    setSelectedDataTypes(newTypes);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, ""]);
  };

  const removeCustomField = (index: number) => {
    if (customFields.length > 1) {
      setCustomFields(customFields.filter((_, i) => i !== index));
    }
  };

  const updateCustomField = (index: number, value: string) => {
    const newFields = [...customFields];
    newFields[index] = value;
    setCustomFields(newFields);
  };

  const generateBuildPrompt = () => {
    const formats = Array.from(selectedFormats).map(id =>
      EXPORT_FORMATS.find(f => f.id === id)?.label
    ).filter(Boolean);

    const dataTypes = Array.from(selectedDataTypes).map(id =>
      COMMON_DATA_TYPES.find(t => t.id === id)
    ).filter(Boolean);

    const allFields = [
      ...dataTypes.flatMap(t => t?.fields || []),
      ...customFields.filter(f => f.trim())
    ];

    const prompt = `Add data export functionality to my app:

EXPORT FORMATS NEEDED:
${formats.map(f => `- ${f}`).join("\n")}

DATA TO EXPORT:
${dataTypes.map(t => `- ${t?.label}: ${t?.fields.join(", ")}`).join("\n")}
${customFields.filter(f => f.trim()).length > 0 ? `\nCUSTOM FIELDS:\n${customFields.filter(f => f.trim()).map(f => `- ${f}`).join("\n")}` : ""}

IMPLEMENTATION:

1. EXPORT BUTTON
   - Add "Export Data" button in user settings or account page
   - Dropdown or modal to select format
   - Show loading state while generating

2. CSV EXPORT
${selectedFormats.has("csv") ? `   - Use a library like 'papaparse' or 'csv-stringify'
   - Set proper headers
   - Handle commas in data (quote strings)
   - Trigger download with proper filename: "export-[date].csv"` : "   - Not needed"}

3. JSON EXPORT
${selectedFormats.has("json") ? `   - Pretty-print with 2-space indentation
   - Include metadata (export date, user, version)
   - Trigger download: "export-[date].json"` : "   - Not needed"}

4. PDF EXPORT
${selectedFormats.has("pdf") ? `   - Use a library like 'jspdf' or 'react-pdf'
   - Add header with app logo and export date
   - Format data in a readable table
   - Trigger download: "export-[date].pdf"` : "   - Not needed"}

5. BACKEND ENDPOINT
   \`\`\`typescript
   // GET /api/export/:format
   app.get("/api/export/:format", async (req, res) => {
     const userId = req.user.id;
     const format = req.params.format; // csv, json, pdf

     // Fetch user's data
     const data = await db.query.yourTable.findMany({
       where: eq(yourTable.userId, userId)
     });

     // Format and send
     if (format === "csv") {
       res.setHeader("Content-Type", "text/csv");
       res.setHeader("Content-Disposition", "attachment; filename=export.csv");
       // Convert to CSV and send
     }
     // ... handle other formats
   });
   \`\`\`

6. PRIVACY & SECURITY
   - Only export the authenticated user's own data
   - Exclude sensitive fields (password hashes, tokens)
   - Log export actions for audit trail
   - Rate limit exports (max 10 per hour)

7. GDPR COMPLIANCE (if applicable)
   - This helps with "right to data portability"
   - Include ALL user data when requested
   - Provide within 30 days (you'll do it instantly)

Add a success toast after export completes.`;

    setGeneratedPrompt(prompt);
    setStep("prompt");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Export Prompt Copied!",
      description: "Paste this into Replit Agent",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
            <Download className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Data Freedom</h3>
            <p className="text-slate-600 mt-1">
              Let users export their data. It builds trust. It's also the law (GDPR).
            </p>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["Formats", "Data Types", "Fields", "Build"].map((label, idx) => {
          const steps = ["formats", "data", "fields", "prompt"];
          const currentIdx = steps.indexOf(step);
          const isComplete = idx < currentIdx;
          const isCurrent = steps[idx] === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                isComplete ? "bg-emerald-100 text-emerald-700" :
                isCurrent ? "bg-emerald-500 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                {label}
              </div>
              {idx < 3 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Formats */}
      {step === "formats" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What formats should users be able to export?</h4>
          <p className="text-sm text-slate-500 mb-4">Select all that apply</p>

          <div className="grid sm:grid-cols-3 gap-3">
            {EXPORT_FORMATS.map((format) => {
              const Icon = format.icon;
              const isSelected = selectedFormats.has(format.id);
              return (
                <button
                  key={format.id}
                  onClick={() => toggleFormat(format.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                  <div className="font-bold text-slate-900">{format.label}</div>
                  <div className="text-sm text-slate-500">{format.desc}</div>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={selectedFormats.size === 0}
            onClick={() => setStep("data")}
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Data Types */}
      {step === "data" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <h4 className="font-bold text-slate-900 mb-2">What data do users need to export?</h4>
          <p className="text-sm text-slate-500 mb-4">Select the types of data your app stores</p>

          <div className="grid sm:grid-cols-2 gap-3">
            {COMMON_DATA_TYPES.map((type) => {
              const isSelected = selectedDataTypes.has(type.id);
              return (
                <button
                  key={type.id}
                  onClick={() => toggleDataType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="font-bold text-slate-900">{type.label}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {type.fields.join(", ")}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("formats")}>Back</Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={selectedDataTypes.size === 0}
              onClick={() => setStep("fields")}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Custom Fields */}
      {step === "fields" && (
        <Card className="p-6 border-2 border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900">Any custom fields?</h4>
              <p className="text-sm text-slate-500">Add any app-specific data fields</p>
            </div>
            <Button variant="outline" onClick={addCustomField} className="gap-2">
              <Plus className="w-4 h-4" /> Add Field
            </Button>
          </div>

          <div className="space-y-3">
            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Input
                  value={field}
                  onChange={(e) => updateCustomField(idx, e.target.value)}
                  placeholder="e.g., project_name, subscription_tier..."
                />
                {customFields.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeCustomField(idx)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep("data")}>Back</Button>
            <Button className="flex-1" size="lg" onClick={generateBuildPrompt}>
              Generate Build Prompt <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Prompt */}
      {step === "prompt" && (
        <>
          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900">Your Export Prompt</h4>
                <p className="text-sm text-slate-500">Copy and paste into Replit Agent</p>
              </div>
              <Button onClick={handleCopyPrompt} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                <Copy className="w-4 h-4" />
                Copy Prompt
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 max-h-[400px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>
          </Card>

          <Card className="p-6 border-2 border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Data portability = trust</p>
                <p className="text-sm text-slate-500">Users stay when they know they can leave</p>
              </div>
              <Button size="lg" onClick={onComplete}>
                Complete Day 26
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50">
        <h4 className="font-bold text-amber-900 mb-3">Why Data Export Matters</h4>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>GDPR Requirement.</strong> EU users have the right to export their data.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Trust Builder.</strong> Users feel safe when they can take their data.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Reduces Churn.</strong> Paradoxically, easy exit = more likely to stay.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
