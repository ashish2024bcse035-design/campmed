import React, { useState, useId } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  FileText 
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importFromCSV } = useMedical();
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<{ importedStudents: number; importedStaff: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const textareaId = useId();

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setError('');
    setResult(null);

    if (!csvText.trim()) {
      setError('Please choose a CSV file or paste CSV text below.');
      return;
    }

    const res = await importFromCSV(csvText);
    if (res.error) {
      setError(res.error);
    } else {
      setResult({
        importedStudents: res.importedStudents,
        importedStaff: res.importedStaff,
        total: res.totalParsed,
      });
      setCsvText('');
      setFileName('');
    }
  };

  const handleDownloadSample = () => {
    const sample = `Enrollment No,Name,Branch,Type,Phone
2024BCSE101,Aditya Verma,Computer Science & Engineering,Student,+91 98765 11111
2024BCSE102,Deepika Sen,Computer Science & Engineering,Student,+91 98765 22222
2023BECE055,Karan Malhotra,Electronics & Communication,Student,+91 98765 33333
2022BME088,Sanjay Dutt,Mechanical Engineering,Student,+91 98765 44444
SEC-GD-040,Harpal Singh,Campus Security,Guard,+91 98450 99999
EMP-ECE-201,Dr. Manisha Roy,Electronics Department,Teacher,+91 94480 88888`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'college_medical_roster_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Import College Roster (CSV File)
              </h2>
              <p className="text-xs text-slate-500">
                Bulk import students, teachers, guards, and staff into the database
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Sample template prompt */}
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-teal-900 block">Accepted Columns:</span>
              <span className="text-slate-600">
                Enrollment No / ID, Name, Branch / Department, Type (Student / Guard / Teacher), Phone
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="px-2.5 py-1.5 bg-white border border-teal-300 text-teal-800 font-semibold rounded-lg hover:bg-teal-50 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Sample CSV</span>
            </button>
          </div>

          {/* Success state */}
          {result && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Import Successful!</span>
                <span className="block mt-0.5 text-xs text-emerald-800">
                  Added <strong className="text-emerald-950 font-mono">{result.importedStudents}</strong> students and <strong className="text-emerald-950 font-mono">{result.importedStaff}</strong> staff/guards directly to the database.
                </span>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Upload Box */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[11px] tracking-wider">
              Upload CSV File
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/30 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors">
              <Upload className="w-7 h-7 text-teal-600 mb-1.5" />
              <span className="font-semibold text-slate-800 text-xs">
                {fileName ? fileName : 'Click to select CSV file from your computer'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Supports .csv files with student enrollment numbers
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Or Paste CSV text */}
          <div>
            <label htmlFor={textareaId} className="block font-bold text-slate-700 mb-1.5 uppercase text-[11px] tracking-wider">
              Or Paste CSV Data Directly
            </label>
            <textarea
              id={textareaId}
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Enrollment No,Name,Branch,Type&#10;2024BCSE101,John Doe,Computer Science,Student&#10;SEC-GD-030,Suraj Singh,Campus Security,Guard"
              className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import into Database</span>
          </button>
        </div>

      </div>
    </div>
  );
};
