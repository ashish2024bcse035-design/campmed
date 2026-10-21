import React, { useState } from 'react';
import { MedicalProvider } from './context/MedicalContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { StudentLookup } from './components/StudentLookup';
import { StaffLookup } from './components/StaffLookup';
import { VisitorsLookup } from './components/VisitorsLookup';
import { PharmacyInventory } from './components/PharmacyInventory';
import { CsvImportModal } from './components/CsvImportModal';
import { RegisterPatientModal } from './components/RegisterPatientModal';

export interface MedicalAppProps {
  onSwitchWorkspace?: () => void;
}

export function MedicalApp({ onSwitchWorkspace }: MedicalAppProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('student-lookup');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerType, setRegisterType] = useState<'student' | 'staff'>('student');
  const [prefilledEnrollment, setPrefilledEnrollment] = useState('');

  const handleOpenRegisterStudent = (enrollment?: string) => {
    setRegisterType('student');
    setPrefilledEnrollment(enrollment || '');
    setIsRegisterModalOpen(true);
  };

  const handleOpenRegisterStaff = () => {
    setRegisterType('staff');
    setPrefilledEnrollment('');
    setIsRegisterModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {onSwitchWorkspace && (
        <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium">CampusMed Directory & Dispensary Registry</span>
            <span className="text-slate-400 hidden sm:inline">· Student search, staff filter, and pharmacy stock</span>
          </div>
          <button
            onClick={onSwitchWorkspace}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-semibold transition"
          >
            ← Switch to Clinical Care Workspace (MedCap)
          </button>
        </div>
      )}
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCsvImport={() => setIsCsvModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'student-lookup' && (
          <StudentLookup onOpenRegisterStudent={handleOpenRegisterStudent} />
        )}

        {activeTab === 'staff-lookup' && (
          <StaffLookup onOpenRegisterStaff={handleOpenRegisterStaff} />
        )}

        {activeTab === 'visitors' && (
          <VisitorsLookup />
        )}

        {activeTab === 'pharmacy' && (
          <PharmacyInventory />
        )}
      </main>

      {/* Professional Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-800">College Medical Unit</span> · Student, Staff & Visitor Dispensary Cloud Database
          </div>
          <div className="flex items-center gap-3">
            <span>Student Search: <code className="font-mono text-teal-700 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">2024BCSE001</code></span>
            <span>·</span>
            <span>Staff: Branch & Name</span>
            <span>·</span>
            <span>Cloud Synced</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />

      <RegisterPatientModal
        isOpen={isRegisterModalOpen}
        defaultType={registerType}
        prefilledEnrollment={prefilledEnrollment}
        onClose={() => setIsRegisterModalOpen(false)}
      />

    </div>
  );
}

export default function App({ onSwitchWorkspace }: { onSwitchWorkspace?: () => void } = {}) {
  return (
    <MedicalProvider>
      <MedicalApp onSwitchWorkspace={onSwitchWorkspace} />
    </MedicalProvider>
  );
}
