import React, { useState, useEffect, useId } from 'react';
import { 
  Search, 
  Pill, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap, 
  Wrench, 
  UserPlus, 
  History 
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { StaffPatient, StaffRole } from '../types/medical';

interface StaffLookupProps {
  onOpenRegisterStaff: () => void;
}

export const StaffLookup: React.FC<StaffLookupProps> = ({ onOpenRegisterStaff }) => {
  const { staff, medicines, searchStaff, getPatientVisits, saveVisit, getAllBranches } = useMedical();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [nameOrIdQuery, setNameOrIdQuery] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffPatient | null>(staff[0] || null);

  const branchSelectId = useId();
  const searchInputId = useId();
  const medSelectId = useId();
  const qtyInputId = useId();

  // Dispense state
  const [selectedMedId, setSelectedMedId] = useState<string>(medicines[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(2);
  const [currentLiveTime, setCurrentLiveTime] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  const branches = getAllBranches();
  const filteredStaff = searchStaff(selectedBranch, nameOrIdQuery);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentLiveTime(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedMedId && medicines.length > 0) {
      setSelectedMedId(medicines[0].id);
    }
  }, [medicines, selectedMedId]);

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !selectedMedId || quantity <= 0) return;

    const chosenMedicine = medicines.find(m => m.id === selectedMedId);
    if (!chosenMedicine) return;

    if (chosenMedicine.stockQuantity <= 0) {
      alert(`Cannot dispense: ${chosenMedicine.name} is currently OUT OF STOCK.`);
      return;
    }

    const saved = saveVisit(selectedStaff, selectedMedId, quantity);

    setSaveSuccessMessage(
      `Saved! Given ${saved.quantity} units of ${saved.medicineName} to ${selectedStaff.name} at ${saved.formattedDateTime}. Removed from stock.`
    );

    setTimeout(() => {
      setSaveSuccessMessage('');
    }, 5000);
  };

  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'guard':
        return <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"><ShieldCheck className="w-3.5 h-3.5" /> Security Guard</span>;
      case 'faculty':
        return <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200"><GraduationCap className="w-3.5 h-3.5" /> Faculty / Teacher</span>;
      default:
        return <span className="flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded"><Wrench className="w-3.5 h-3.5" /> Staff</span>;
    }
  };

  const selectedMed = medicines.find(m => m.id === selectedMedId);
  const staffVisits = selectedStaff ? getPatientVisits(selectedStaff.id) : [];

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
            Staff & Personnel Intake
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Staff & Guard Lookup by Branch & Name
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Find teachers, security guards, technicians, and campus workers by Branch / Department and Name.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={branchSelectId} className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Branch / Department
            </label>
            <select
              id={branchSelectId}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Branches & Departments</option>
              <option value="Campus Security">Campus Security</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electrical Maintenance">Electrical Maintenance</option>
              {branches
                .filter(b => !['Campus Security', 'Computer Science & Engineering', 'Mechanical Engineering', 'Electrical Maintenance'].includes(b))
                .map(b => (
                  <option key={b} value={b}>{b}</option>
                ))
              }
            </select>
          </div>

          <div>
            <label htmlFor={searchInputId} className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Search by Name or Employee ID
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id={searchInputId}
                type="text"
                value={nameOrIdQuery}
                onChange={(e) => setNameOrIdQuery(e.target.value)}
                placeholder="e.g. Ramesh, Sunita, SEC-GD-018..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Quick List Selection */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">Quick Select:</span>
          {staff.slice(0, 6).map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSelectedStaff(s);
                setSaveSuccessMessage('');
              }}
              className={`px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer ${
                selectedStaff?.id === s.id
                  ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.name} ({s.staffRole === 'guard' ? 'Guard' : 'Staff'})
            </button>
          ))}
        </div>
      </div>

      {/* Selected Staff Card */}
      {selectedStaff && (
        <div className="space-y-5">
          
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedStaff.name}
                  </h2>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {selectedStaff.employeeId}
                  </span>
                  {getRoleBadge(selectedStaff.staffRole)}
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Branch / Dept: <span className="font-bold text-slate-800">{selectedStaff.branch}</span> {selectedStaff.designation ? `· ${selectedStaff.designation}` : ''}
                </p>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
                Total Visits: <strong className="font-mono text-slate-800 font-bold">{staffVisits.length}</strong>
              </div>
            </div>
          </div>

          {/* Direct Medicine Dispense Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Record Visit & Dispense Medicine
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Auto-timestamp: <strong className="text-slate-800">{currentLiveTime}</strong></span>
              </div>
            </div>

            {saveSuccessMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleDispense} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              
              <div className="md:col-span-7">
                <label htmlFor={medSelectId} className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Medicine to Dispense
                </label>
                <select
                  id={medSelectId}
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} — (Stock: {m.stockQuantity} {m.unit})
                    </option>
                  ))}
                </select>
                {selectedMed && selectedMed.stockQuantity <= 0 && (
                  <span className="text-[11px] font-bold text-rose-600 block mt-1">
                    Warning: Out of stock! Cannot dispense until restocked.
                  </span>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor={qtyInputId} className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quantity (Type #)
                </label>
                <input
                  id={qtyInputId}
                  type="number"
                  min="1"
                  step="1"
                  max={selectedMed ? Math.max(1, selectedMed.stockQuantity) : 50}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDispense(e);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={selectedMed ? selectedMed.stockQuantity <= 0 : false}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Deduct Stock</span>
                </button>
              </div>

            </form>
          </div>

          {/* Past Medicine Visit Records for this staff */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-teal-600" />
              <span>Previous Medical Visits & Medicines Taken ({staffVisits.length})</span>
            </h3>

            {staffVisits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date & Time Visited</th>
                      <th className="py-2.5 px-3">Medicine Dispensed</th>
                      <th className="py-2.5 px-3 text-right">Quantity Given</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {staffVisits.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-mono">
                          {v.formattedDateTime}
                        </td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{v.medicineName}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-800">
                          {v.quantity} units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No previous visits recorded for this staff member.</p>
            )}
          </div>

        </div>
      )}

      {/* Roster list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            All Staff & Guards in Database ({filteredStaff.length})
          </h3>
          <button
            type="button"
            onClick={onOpenRegisterStaff}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Staff Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filteredStaff.map(s => (
            <div
              key={s.id}
              onClick={() => {
                setSelectedStaff(s);
                setSaveSuccessMessage('');
              }}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                selectedStaff?.id === s.id
                  ? 'border-teal-500 bg-teal-50/50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{s.name}</span>
                <span className="font-mono text-[11px] text-slate-500">{s.employeeId}</span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5 truncate">{s.branch}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
