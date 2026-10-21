import React, { useState, useEffect, useId } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { StaffRole } from '../types/medical';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'student' | 'staff';
  prefilledEnrollment?: string;
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'student',
  prefilledEnrollment = '',
}) => {
  const { addStudent, addStaff, getAllBranches } = useMedical();
  const [patientType, setPatientType] = useState<'student' | 'staff'>(defaultType);
  const existingBranches = getAllBranches();
  const enrollmentInputId = useId();
  const nameInputId = useId();
  const branchInputId = useId();
  const roleSelectId = useId();
  const empIdInputId = useId();

  // Student specific
  const [enrollmentNo, setEnrollmentNo] = useState(prefilledEnrollment || '');
  const [yearOrSem, setYearOrSem] = useState('1st Year');

  // Staff specific
  const [staffRole, setStaffRole] = useState<StaffRole>('guard');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');

  // Common
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefilledEnrollment) {
      setEnrollmentNo(prefilledEnrollment);
      setPatientType('student');
    }
  }, [prefilledEnrollment, isOpen]);

  useEffect(() => {
    if (defaultType) {
      setPatientType(defaultType);
    }
  }, [defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide the full name.');
      return;
    }

    if (patientType === 'student') {
      if (!enrollmentNo.trim()) {
        setError('Enrollment Number is required (e.g. 2024BCSE001).');
        return;
      }

      addStudent({
        enrollmentNo: enrollmentNo.trim().toUpperCase(),
        name: name.trim(),
        branch: branch.trim(),
        year: yearOrSem || '1st Year',
        phone: phone.trim() || undefined,
      });
    } else {
      const generatedId = employeeId.trim() || `EMP-${Date.now().toString().slice(-4)}`;
      addStaff({
        staffRole,
        employeeId: generatedId.toUpperCase(),
        name: name.trim(),
        branch: branch.trim(),
        designation: designation.trim() || (staffRole === 'guard' ? 'Security Guard' : 'Faculty Member'),
        phone: phone.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">
              Add New Person to Database
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setPatientType('student')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                patientType === 'student' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Student (Enrollment No)
            </button>
            <button
              type="button"
              onClick={() => setPatientType('staff')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                patientType === 'staff' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Staff / Guard / Teacher
            </button>
          </div>

          {patientType === 'student' ? (
            <div className="grid grid-cols-2 gap-3 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
              <div>
                <label htmlFor={enrollmentInputId} className="block font-bold text-slate-700 mb-1">
                  Enrollment No *
                </label>
                <input
                  id={enrollmentInputId}
                  type="text"
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value.toUpperCase())}
                  placeholder="e.g. 2024BCSE001"
                  required
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold uppercase focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={yearOrSem}
                  onChange={(e) => setYearOrSem(e.target.value)}
                  placeholder="e.g. 1st Year / Sem 2"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <div>
                <label htmlFor={roleSelectId} className="block font-bold text-slate-700 mb-1">
                  Role
                </label>
                <select
                  id={roleSelectId}
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as StaffRole)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="guard">Security Guard</option>
                  <option value="faculty">Teacher / Faculty</option>
                  <option value="technical">Lab / Tech Staff</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor={empIdInputId} className="block font-bold text-slate-700 mb-1">
                  Employee ID
                </label>
                <input
                  id={empIdInputId}
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  placeholder="e.g. SEC-GD-030"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold uppercase"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor={nameInputId} className="block font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              id={nameInputId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma / Ramesh Singh"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor={branchInputId} className="block font-bold text-slate-700 mb-1">
              Branch / Department *
            </label>
            <input
              id={branchInputId}
              type="text"
              list="branch-suggestions"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Computer Science, Campus Security"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
            <datalist id="branch-suggestions">
              {existingBranches.map(b => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 00000"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 cursor-pointer"
            >
              Save to Database
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
