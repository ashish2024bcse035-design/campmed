import React, { useState, useEffect, useId } from 'react';
import { 
  Search, 
  Pill, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UserPlus, 
  X, 
  History,
  GraduationCap,
  Filter
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { StudentPatient } from '../types/medical';

interface StudentLookupProps {
  onOpenRegisterStudent: (enrollment?: string) => void;
}

export const StudentLookup: React.FC<StudentLookupProps> = ({ onOpenRegisterStudent }) => {
  const { 
    medicines, 
    searchStudentsByBranchAndYear, 
    findStudentByEnrollment, 
    getPatientVisits, 
    saveVisit,
    getAllBranches,
    getAllYears
  } = useMedical();

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const branches = getAllBranches();
  const years = getAllYears();

  // Active Selected Student
  const [selectedStudent, setSelectedStudent] = useState<StudentPatient | null>(() => {
    return findStudentByEnrollment('2024BCSE001') || null;
  });

  const searchInputId = useId();
  const medSelectId = useId();
  const qtyInputId = useId();

  // Dispense Form State
  const [selectedMedId, setSelectedMedId] = useState<string>(medicines[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(2);
  const [currentLiveTime, setCurrentLiveTime] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  // Filtered Students list
  const filteredStudents = searchStudentsByBranchAndYear(selectedBranch, selectedYear, searchQuery);

  // Live timestamp preview
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;
    const directFound = findStudentByEnrollment(query);
    if (directFound) {
      setSelectedStudent(directFound);
    } else if (filteredStudents.length > 0) {
      setSelectedStudent(filteredStudents[0]);
    }
    setSaveSuccessMessage('');
  };

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedMedId || quantity <= 0) return;

    const chosenMedicine = medicines.find(m => m.id === selectedMedId);
    if (!chosenMedicine) return;

    if (chosenMedicine.stockQuantity <= 0) {
      alert(`Cannot dispense: ${chosenMedicine.name} is currently OUT OF STOCK.`);
      return;
    }

    const saved = saveVisit(selectedStudent, selectedMedId, quantity);

    setSaveSuccessMessage(
      `Saved! Dispensed ${saved.quantity} units of ${saved.medicineName} to ${selectedStudent.name} at ${saved.formattedDateTime}. Removed from cloud stock.`
    );

    setTimeout(() => {
      setSaveSuccessMessage('');
    }, 5000);
  };

  const selectedMed = medicines.find(m => m.id === selectedMedId);
  const studentVisits = selectedStudent ? getPatientVisits(selectedStudent.id) : [];

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
              Student Medical Intake
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Student Record Directory (Branch & Year Wise)
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Find student by Enrollment Number (format: <span className="font-mono font-bold text-teal-800">2024BCSE001</span>) or filter by branch and academic year.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenRegisterStudent(searchQuery)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-teal-600" />
            <span>+ Add Student Manually</span>
          </button>
        </div>

        {/* Branch Filter Tabs */}
        <div className="mt-5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            1. Filter by Branch / Department
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedBranch('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedBranch === 'all'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Branches
            </button>
            {branches.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBranch(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedBranch === b
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter Tabs & Search Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          <div className="md:col-span-5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              2. Filter by Academic Year
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedYear('all')}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedYear === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                All
              </button>
              {years.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setSelectedYear(y)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedYear === y ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  {y.replace(' Year', 'th').replace('1th', '1st').replace('2th', '2nd').replace('3th', '3rd')}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="md:col-span-7">
            <label htmlFor={searchInputId} className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              3. Search by Enrollment Number or Name
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id={searchInputId}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type Enrollment No (e.g. 2024BCSE001) or student name..."
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

        </div>
      </div>

      {/* Selected Student Active Card: Medicine Dispense + Past Records */}
      {selectedStudent && (
        <div className="space-y-5">
          
          {/* Active Profile */}
          <div className="bg-white rounded-2xl border border-teal-500/40 bg-teal-50/20 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  Active Intake Patient
                </span>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedStudent.name}
                  </h2>
                  <span className="font-mono text-xs font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded border border-teal-300">
                    {selectedStudent.enrollmentNo}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 font-semibold">
                  {selectedStudent.branch} · <span className="text-teal-700">{selectedStudent.year}</span>
                </p>
              </div>

              <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto font-medium">
                Past Visits: <strong className="font-mono text-slate-900 font-bold">{studentVisits.length}</strong>
              </div>
            </div>
          </div>

          {/* Quick Dispense Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Dispense Medicine for {selectedStudent.name}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Auto Timestamp: <strong className="text-slate-800">{currentLiveTime}</strong></span>
              </div>
            </div>

            {saveSuccessMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleDispense} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              
              {/* Medicine Select */}
              <div className="md:col-span-7">
                <label htmlFor={medSelectId} className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Medicine
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

              {/* Quantity (Keyboard Editable) */}
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

              {/* Save Button */}
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

          {/* Past Consultations for this searched student */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-teal-600" />
              <span>All Past Visiting Records for {selectedStudent.name} ({studentVisits.length})</span>
            </h3>

            {studentVisits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Visiting Date & Time</th>
                      <th className="py-2.5 px-3">Medicine Dispensed</th>
                      <th className="py-2.5 px-3 text-right">Quantity Given</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {studentVisits.map((v) => (
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
              <p className="text-xs text-slate-400 italic">No past visits recorded for this student yet.</p>
            )}
          </div>

        </div>
      )}

      {/* Branch-Wise & Year-Wise Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Student Records Table ({filteredStudents.length} Students Listed)
          </h3>
          <span className="text-xs text-slate-500">
            Click any row to select student for medicine dispensation
          </span>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Enrollment Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Branch / Department</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((stud) => {
                  const isSelected = selectedStudent?.id === stud.id;
                  return (
                    <tr 
                      key={stud.id} 
                      onClick={() => {
                        setSelectedStudent(stud);
                        setSaveSuccessMessage('');
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/70 hover:bg-teal-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">
                        {stud.enrollmentNo}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {stud.name}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {stud.branch}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                          {stud.year}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {stud.phone || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(stud);
                            setSaveSuccessMessage('');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-white hover:bg-teal-100 border border-teal-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Select & Dispense
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No students found matching selected branch, year, or query.
          </div>
        )}
      </div>

    </div>
  );
};
