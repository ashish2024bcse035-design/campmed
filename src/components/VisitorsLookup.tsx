import React, { useState, useEffect, useId } from 'react';
import { 
  Users, 
  Search, 
  Pill, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  History, 
  X,
  AlertTriangle
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { VisitorPatient } from '../types/medical';

export const VisitorsLookup: React.FC = () => {
  const { 
    visitors, 
    medicines, 
    searchVisitors, 
    getPatientVisits, 
    saveVisit, 
    addVisitor 
  } = useMedical();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorPatient | null>(visitors[0] || null);

  const [isAddVisitorOpen, setIsAddVisitorOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newAge, setNewAge] = useState<number>(30);
  const [newPhone, setNewPhone] = useState('');
  const [newPurpose, setNewPurpose] = useState('Campus Guest / Parent');

  // Dispense Form State
  const [selectedMedId, setSelectedMedId] = useState<string>(medicines[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(2);
  const [currentLiveTime, setCurrentLiveTime] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  const searchInputId = useId();
  const medSelectId = useId();
  const qtyInputId = useId();
  const visitorNameInputId = useId();

  const filteredVisitors = searchVisitors(searchQuery);

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

  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = addVisitor({
      name: newName.trim(),
      gender: newGender,
      age: Number(newAge) || 25,
      phone: newPhone.trim() || undefined,
      purpose: newPurpose.trim() || undefined,
    });

    setSelectedVisitor(created);
    setNewName('');
    setNewPhone('');
    setIsAddVisitorOpen(false);
  };

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitor || !selectedMedId || quantity <= 0) return;

    const chosenMedicine = medicines.find(m => m.id === selectedMedId);
    if (!chosenMedicine) return;

    if (chosenMedicine.stockQuantity <= 0) {
      alert(`Cannot dispense: ${chosenMedicine.name} is currently OUT OF STOCK.`);
      return;
    }

    const saved = saveVisit(selectedVisitor, selectedMedId, quantity);

    setSaveSuccessMessage(
      `Saved! Dispensed ${saved.quantity} units of ${saved.medicineName} to visitor ${selectedVisitor.name} at ${saved.formattedDateTime}. Removed from stock.`
    );

    setTimeout(() => {
      setSaveSuccessMessage('');
    }, 5000);
  };

  const selectedMed = medicines.find(m => m.id === selectedMedId);
  const visitorVisits = selectedVisitor ? getPatientVisits(selectedVisitor.id) : [];

  return (
    <div className="space-y-6">
      
      {/* Search & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
              Other / Campus Visitors
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Visitor & Guest Medical Records
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Store medical consultations for parents, contractors, event guests, and general campus visitors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddVisitorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Visitor</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id={searchInputId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visitor by name, purpose, or phone..."
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
          </div>
        </div>
      </div>

      {/* Selected Visitor Details & Dispense Form */}
      {selectedVisitor && (
        <div className="space-y-5">
          
          {/* Visitor Card */}
          <div className="bg-white rounded-2xl border border-teal-500/40 bg-teal-50/20 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  Campus Visitor Profile
                </span>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedVisitor.name}
                  </h2>
                  <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedVisitor.gender}, {selectedVisitor.age} yrs
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Affiliation: <span className="font-bold text-slate-800">{selectedVisitor.purpose || 'Campus Visitor'}</span> {selectedVisitor.phone ? `· Phone: ${selectedVisitor.phone}` : ''}
                </p>
              </div>

              <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto font-medium">
                Past Visits: <strong className="font-mono text-slate-900 font-bold">{visitorVisits.length}</strong>
              </div>
            </div>
          </div>

          {/* Quick Dispense Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Dispense Medicine for {selectedVisitor.name}
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

              {/* Quantity Keyboard Input */}
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

          {/* Past Consultations for this searched visitor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-teal-600" />
              <span>All Past Visiting Records for {selectedVisitor.name} ({visitorVisits.length})</span>
            </h3>

            {visitorVisits.length > 0 ? (
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
                    {visitorVisits.map((v) => (
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
              <p className="text-xs text-slate-400 italic">No past visits recorded for this visitor yet.</p>
            )}
          </div>

        </div>
      )}

      {/* Visitors Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Registered Visitors & Guests Table ({filteredVisitors.length})
          </h3>
          <span className="text-xs text-slate-500">
            Click any row to select visitor for intake & medicine
          </span>
        </div>

        {filteredVisitors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Visitor Name</th>
                  <th className="py-3 px-4">Gender & Age</th>
                  <th className="py-3 px-4">Affiliation / Purpose</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVisitors.map((vis) => {
                  const isSelected = selectedVisitor?.id === vis.id;
                  return (
                    <tr 
                      key={vis.id} 
                      onClick={() => {
                        setSelectedVisitor(vis);
                        setSaveSuccessMessage('');
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/70 hover:bg-teal-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {vis.name}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {vis.gender}, {vis.age} yrs
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {vis.purpose || 'Campus Visitor'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {vis.phone || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVisitor(vis);
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
            No visitors found matching your search.
          </div>
        )}
      </div>

      {/* Add Visitor Modal */}
      {isAddVisitorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>Add Visitor / Guest</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddVisitorOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisitor} className="mt-4 space-y-3 text-xs">
              <div>
                <label htmlFor={visitorNameInputId} className="block font-bold text-slate-700 mb-1">
                  Visitor Full Name *
                </label>
                <input
                  id={visitorNameInputId}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Suresh Trivedi"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Affiliation / Purpose of Visit
                </label>
                <input
                  type="text"
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  placeholder="e.g. Electrical Contractor, Parent, Campus Guest"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddVisitorOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                >
                  Save Visitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
