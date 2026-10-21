import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Search, 
  Users, 
  UserCheck,
  Pill, 
  FileSpreadsheet, 
  Download, 
  Clock,
  Cloud
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';

export type ActiveTab = 'student-lookup' | 'staff-lookup' | 'visitors' | 'pharmacy';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenCsvImport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenCsvImport,
}) => {
  const { exportDatabaseJSON, isCloudSynced } = useMedical();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  CampusMed
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  <span>Cloud DB</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                College Health Centre & Dispensary
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onTabChange('student-lookup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'student-lookup'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-teal-600" />
              <span>Students</span>
            </button>

            <button
              onClick={() => onTabChange('staff-lookup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'staff-lookup'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Staff & Guards</span>
            </button>

            <button
              onClick={() => onTabChange('visitors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'visitors'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Visitors / Others</span>
            </button>

            <button
              onClick={() => onTabChange('pharmacy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'pharmacy'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              <span>Medicine Stock</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime || '00:00:00'}</span>
            </div>

            {/* CSV Import Button */}
            <button
              type="button"
              onClick={onOpenCsvImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">Import CSV Roster</span>
              <span className="sm:hidden">CSV</span>
            </button>

            {/* Database Backup JSON */}
            <button
              type="button"
              onClick={exportDatabaseJSON}
              title="Backup Cloud Database to JSON"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
