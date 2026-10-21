import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  StudentPatient, 
  StaffPatient, 
  VisitorPatient,
  Patient, 
  MedicineItem, 
  MedicalVisitRecord,
  StaffRole
} from '../types/medical';
import { 
  INITIAL_STUDENTS, 
  INITIAL_STAFF, 
  INITIAL_VISITORS,
  INITIAL_MEDICINES, 
  INITIAL_VISITS 
} from '../data/initialData';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';

interface ImportResult {
  importedStudents: number;
  importedStaff: number;
  totalParsed: number;
  error?: string;
}

interface MedicalContextType {
  students: StudentPatient[];
  staff: StaffPatient[];
  visitors: VisitorPatient[];
  medicines: MedicineItem[];
  visits: MedicalVisitRecord[];
  isCloudSynced: boolean;
  
  // Lookups
  findStudentByEnrollment: (enrollmentNo: string) => StudentPatient | undefined;
  searchStudentsByBranchAndYear: (branchFilter: string, yearFilter: string, query: string) => StudentPatient[];
  searchStaff: (branchFilter: string, nameOrIdQuery: string) => StaffPatient[];
  searchVisitors: (query: string) => VisitorPatient[];
  getPatientVisits: (patientId: string) => MedicalVisitRecord[];
  getAllBranches: () => string[];
  getAllYears: () => string[];
  
  // Actions
  saveVisit: (patient: Patient, medicineId: string, quantity: number) => MedicalVisitRecord;
  updateMedicineStock: (medicineId: string, deltaQuantity: number) => void;
  addMedicine: (medicine: Omit<MedicineItem, 'id'>) => MedicineItem;
  addStudent: (student: Omit<StudentPatient, 'id' | 'type' | 'createdAt'>) => StudentPatient;
  addStaff: (staffMember: Omit<StaffPatient, 'id' | 'type' | 'createdAt'>) => StaffPatient;
  addVisitor: (visitor: Omit<VisitorPatient, 'id' | 'type' | 'createdAt'>) => VisitorPatient;
  
  // CSV Import & Export
  importFromCSV: (csvText: string) => Promise<ImportResult>;
  exportDatabaseJSON: () => void;
}

const MedicalContext = createContext<MedicalContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  STUDENTS: 'campusmed_cloud_students',
  STAFF: 'campusmed_cloud_staff',
  VISITORS: 'campusmed_cloud_visitors',
  MEDICINES: 'campusmed_cloud_medicines',
  VISITS: 'campusmed_cloud_visits',
};

export const MedicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<StudentPatient[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [staff, setStaff] = useState<StaffPatient[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.STAFF);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [visitors, setVisitors] = useState<VisitorPatient[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.VISITORS);
      return saved ? JSON.parse(saved) : INITIAL_VISITORS;
    } catch {
      return INITIAL_VISITORS;
    }
  });

  const [medicines, setMedicines] = useState<MedicineItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MEDICINES);
      return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
    } catch {
      return INITIAL_MEDICINES;
    }
  });

  const [visits, setVisits] = useState<MedicalVisitRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.VISITS);
      return saved ? JSON.parse(saved) : INITIAL_VISITS;
    } catch {
      return INITIAL_VISITS;
    }
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Sync with LocalStorage backup
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) { console.error('LocalStorage write error (students):', e); }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.STAFF, JSON.stringify(staff));
    } catch (e) { console.error('LocalStorage write error (staff):', e); }
  }, [staff]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VISITORS, JSON.stringify(visitors));
    } catch (e) { console.error('LocalStorage write error (visitors):', e); }
  }, [visitors]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    } catch (e) { console.error('LocalStorage write error (medicines):', e); }
  }, [medicines]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VISITS, JSON.stringify(visits));
    } catch (e) { console.error('LocalStorage write error (visits):', e); }
  }, [visits]);

  // Firebase Real-Time Listeners & Cloud Sync
  useEffect(() => {
    let unsubStudents: () => void;
    let unsubStaff: () => void;
    let unsubVisitors: () => void;
    let unsubMedicines: () => void;
    let unsubVisits: () => void;

    const initFirebaseSync = async () => {
      try {
        // Students
        unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
          if (!snap.empty) {
            const loaded = snap.docs.map(d => ({ ...d.data(), id: d.id } as StudentPatient));
            setStudents(loaded);
          } else {
            // Seed initial
            INITIAL_STUDENTS.forEach(async (s) => {
              await setDoc(doc(db, 'students', s.id), s);
            });
          }
        }, (err) => console.warn('Students firestore sync:', err.message));

        // Staff
        unsubStaff = onSnapshot(collection(db, 'staff'), (snap) => {
          if (!snap.empty) {
            const loaded = snap.docs.map(d => ({ ...d.data(), id: d.id } as StaffPatient));
            setStaff(loaded);
          } else {
            INITIAL_STAFF.forEach(async (st) => {
              await setDoc(doc(db, 'staff', st.id), st);
            });
          }
        }, (err) => console.warn('Staff firestore sync:', err.message));

        // Visitors
        unsubVisitors = onSnapshot(collection(db, 'visitors'), (snap) => {
          if (!snap.empty) {
            const loaded = snap.docs.map(d => ({ ...d.data(), id: d.id } as VisitorPatient));
            setVisitors(loaded);
          } else {
            INITIAL_VISITORS.forEach(async (v) => {
              await setDoc(doc(db, 'visitors', v.id), v);
            });
          }
        }, (err) => console.warn('Visitors firestore sync:', err.message));

        // Medicines
        unsubMedicines = onSnapshot(collection(db, 'medicines'), (snap) => {
          if (!snap.empty) {
            const loaded = snap.docs.map(d => ({ ...d.data(), id: d.id } as MedicineItem));
            setMedicines(loaded);
          } else {
            INITIAL_MEDICINES.forEach(async (m) => {
              await setDoc(doc(db, 'medicines', m.id), m);
            });
          }
        }, (err) => console.warn('Medicines firestore sync:', err.message));

        // Visits
        unsubVisits = onSnapshot(collection(db, 'visits'), (snap) => {
          if (!snap.empty) {
            const loaded = snap.docs.map(d => ({ ...d.data(), id: d.id } as MedicalVisitRecord));
            setVisits(loaded);
          } else {
            INITIAL_VISITS.forEach(async (vis) => {
              await setDoc(doc(db, 'visits', vis.id), vis);
            });
          }
        }, (err) => console.warn('Visits firestore sync:', err.message));

        setIsCloudSynced(true);
      } catch (e) {
        console.warn('Firebase initialization error; operating with local persistence:', e);
      }
    };

    initFirebaseSync();

    return () => {
      if (unsubStudents) unsubStudents();
      if (unsubStaff) unsubStaff();
      if (unsubVisitors) unsubVisitors();
      if (unsubMedicines) unsubMedicines();
      if (unsubVisits) unsubVisits();
    };
  }, []);

  // Lookup methods
  const findStudentByEnrollment = (enrollmentNo: string): StudentPatient | undefined => {
    const clean = enrollmentNo.trim().toUpperCase();
    if (!clean) return undefined;
    return students.find(s => s.enrollmentNo.trim().toUpperCase() === clean);
  };

  const searchStudentsByBranchAndYear = (branchFilter: string, yearFilter: string, query: string): StudentPatient[] => {
    const cleanBranch = branchFilter.trim().toLowerCase();
    const cleanYear = yearFilter.trim().toLowerCase();
    const cleanQuery = query.trim().toUpperCase();

    return students.filter(s => {
      const matchesBranch = !cleanBranch || cleanBranch === 'all' || s.branch.toLowerCase().includes(cleanBranch);
      const matchesYear = !cleanYear || cleanYear === 'all' || s.year.toLowerCase().includes(cleanYear);
      const matchesQuery = !cleanQuery || 
        s.enrollmentNo.toUpperCase().includes(cleanQuery) || 
        s.name.toUpperCase().includes(cleanQuery);

      return matchesBranch && matchesYear && matchesQuery;
    });
  };

  const searchStaff = (branchFilter: string, nameOrIdQuery: string): StaffPatient[] => {
    const cleanBranch = branchFilter.trim().toLowerCase();
    const cleanQuery = nameOrIdQuery.trim().toLowerCase();

    return staff.filter(member => {
      const matchesBranch = !cleanBranch || cleanBranch === 'all' || member.branch.toLowerCase().includes(cleanBranch);
      const matchesQuery = !cleanQuery || 
        member.name.toLowerCase().includes(cleanQuery) || 
        member.employeeId.toLowerCase().includes(cleanQuery);

      return matchesBranch && matchesQuery;
    });
  };

  const searchVisitors = (query: string): VisitorPatient[] => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return visitors;
    return visitors.filter(v => 
      v.name.toLowerCase().includes(cleanQuery) || 
      (v.purpose && v.purpose.toLowerCase().includes(cleanQuery)) ||
      (v.phone && v.phone.toLowerCase().includes(cleanQuery))
    );
  };

  const getPatientVisits = (patientId: string): MedicalVisitRecord[] => {
    return visits
      .filter(v => v.patientId === patientId)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  };

  const getAllBranches = (): string[] => {
    const branchSet = new Set<string>();
    students.forEach(s => { if (s.branch) branchSet.add(s.branch); });
    staff.forEach(st => { if (st.branch) branchSet.add(st.branch); });
    return Array.from(branchSet).sort();
  };

  const getAllYears = (): string[] => {
    return ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  };

  // Save Visit: Automatically captures Date & Time and decrements medicine stock
  const saveVisit = (
    patient: Patient,
    medicineId: string,
    quantity: number
  ): MedicalVisitRecord => {
    const now = new Date();
    const isoDateTime = now.toISOString();
    
    const formattedDateTime = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const medicine = medicines.find(m => m.id === medicineId);
    const medicineName = medicine ? medicine.name : 'Prescribed Medicine';

    let identifier = 'Visitor';
    if (patient.type === 'student') identifier = patient.enrollmentNo;
    else if (patient.type === 'staff') identifier = patient.employeeId;

    const branch = (patient as any).branch || 'Campus Guest / Visitor';

    const newRecord: MedicalVisitRecord = {
      id: `vis-${Date.now()}`,
      patientId: patient.id,
      patientType: patient.type,
      patientName: patient.name,
      identifier,
      branch,
      dateTime: isoDateTime,
      formattedDateTime,
      medicineId,
      medicineName,
      quantity: Math.max(1, quantity),
    };

    // Update local visits state
    setVisits(prev => [newRecord, ...prev]);

    // Save to Firestore
    setDoc(doc(db, 'visits', newRecord.id), newRecord).catch(e => {
      console.warn('Failed saving visit to cloud db:', e);
    });

    // Auto-decrement medicine stock quantity in database
    if (medicine && quantity > 0) {
      const updatedStock = Math.max(0, medicine.stockQuantity - quantity);
      setMedicines(prev => prev.map(m => m.id === medicineId ? { ...m, stockQuantity: updatedStock } : m));

      // Update Firestore medicine document
      setDoc(doc(db, 'medicines', medicine.id), {
        ...medicine,
        stockQuantity: updatedStock,
      }).catch(e => {
        console.warn('Failed updating medicine stock in cloud db:', e);
      });
    }

    return newRecord;
  };

  const updateMedicineStock = (medicineId: string, deltaQuantity: number) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    const updatedQty = Math.max(0, med.stockQuantity + deltaQuantity);
    setMedicines(prev => prev.map(m => m.id === medicineId ? { ...m, stockQuantity: updatedQty } : m));

    setDoc(doc(db, 'medicines', med.id), {
      ...med,
      stockQuantity: updatedQty,
    }).catch(e => console.warn('Failed updating medicine stock in cloud:', e));
  };

  const addMedicine = (med: Omit<MedicineItem, 'id'>): MedicineItem => {
    const newMed: MedicineItem = {
      ...med,
      id: `med-${Date.now()}`,
    };
    setMedicines(prev => [...prev, newMed]);
    setDoc(doc(db, 'medicines', newMed.id), newMed).catch(e => console.warn('Failed creating medicine in cloud:', e));
    return newMed;
  };

  const addStudent = (data: Omit<StudentPatient, 'id' | 'type' | 'createdAt'>): StudentPatient => {
    const newStudent: StudentPatient = {
      ...data,
      id: `stud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'student',
      enrollmentNo: data.enrollmentNo.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    setStudents(prev => [newStudent, ...prev]);
    setDoc(doc(db, 'students', newStudent.id), newStudent).catch(e => console.warn('Failed creating student in cloud:', e));
    return newStudent;
  };

  const addStaff = (data: Omit<StaffPatient, 'id' | 'type' | 'createdAt'>): StaffPatient => {
    const newStaff: StaffPatient = {
      ...data,
      id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'staff',
      employeeId: data.employeeId.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    setStaff(prev => [newStaff, ...prev]);
    setDoc(doc(db, 'staff', newStaff.id), newStaff).catch(e => console.warn('Failed creating staff in cloud:', e));
    return newStaff;
  };

  const addVisitor = (data: Omit<VisitorPatient, 'id' | 'type' | 'createdAt'>): VisitorPatient => {
    const newVisitor: VisitorPatient = {
      ...data,
      id: `vis-pat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'visitor',
      createdAt: new Date().toISOString(),
    };
    setVisitors(prev => [newVisitor, ...prev]);
    setDoc(doc(db, 'visitors', newVisitor.id), newVisitor).catch(e => console.warn('Failed creating visitor in cloud:', e));
    return newVisitor;
  };

  // CSV Bulk Importer with Cloud Sync
  const importFromCSV = async (csvText: string): Promise<ImportResult> => {
    try {
      const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        return { importedStudents: 0, importedStaff: 0, totalParsed: 0, error: 'CSV file is empty or has only 1 line.' };
      }

      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result.map(s => s.replace(/^["']|["']$/g, '').trim());
      };

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());

      const findHeaderIndex = (aliases: string[]) => {
        return headers.findIndex(h => aliases.some(alias => h.includes(alias)));
      };

      const idIndex = findHeaderIndex(['enrollment', 'roll', 'id', 'code', 'emp']);
      const nameIndex = findHeaderIndex(['name', 'student', 'staff', 'employee']);
      const branchIndex = findHeaderIndex(['branch', 'department', 'dept', 'course']);
      const yearIndex = findHeaderIndex(['year', 'sem', 'class', 'batch']);
      const typeIndex = findHeaderIndex(['type', 'role', 'category', 'designation']);
      const phoneIndex = findHeaderIndex(['phone', 'mobile', 'contact']);

      let importedStudents = 0;
      let importedStaff = 0;
      const newStudents: StudentPatient[] = [];
      const newStaff: StaffPatient[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 2) continue;

        const rawId = (idIndex >= 0 ? cols[idIndex] : cols[0]) || `ID-${Date.now()}-${i}`;
        const rawName = (nameIndex >= 0 ? cols[nameIndex] : cols[1]) || 'Unnamed';
        const rawBranch = (branchIndex >= 0 ? cols[branchIndex] : cols[2]) || 'General';
        const rawYear = (yearIndex >= 0 ? cols[yearIndex] : '1st Year') || '1st Year';
        const rawType = (typeIndex >= 0 ? cols[typeIndex] : '').toLowerCase();
        const rawPhone = phoneIndex >= 0 ? cols[phoneIndex] : undefined;

        const isStaff = rawType.includes('guard') || 
                        rawType.includes('teacher') || 
                        rawType.includes('faculty') || 
                        rawType.includes('staff') ||
                        rawId.toUpperCase().startsWith('SEC') ||
                        rawId.toUpperCase().startsWith('EMP');

        if (isStaff) {
          const role: StaffRole = rawType.includes('guard') ? 'guard' : rawType.includes('faculty') || rawType.includes('teacher') ? 'faculty' : 'other';
          const staffObj: StaffPatient = {
            id: `staff-csv-${Date.now()}-${i}`,
            type: 'staff',
            employeeId: rawId.toUpperCase(),
            name: rawName,
            branch: rawBranch,
            staffRole: role,
            designation: rawType || 'Staff Member',
            phone: rawPhone,
            createdAt: new Date().toISOString(),
          };
          newStaff.push(staffObj);
          importedStaff++;
          setDoc(doc(db, 'staff', staffObj.id), staffObj).catch(e => console.warn(e));
        } else {
          // Normalize year
          let formattedYear = '1st Year';
          if (rawYear.includes('2') || rawYear.toLowerCase().includes('second')) formattedYear = '2nd Year';
          else if (rawYear.includes('3') || rawYear.toLowerCase().includes('third')) formattedYear = '3rd Year';
          else if (rawYear.includes('4') || rawYear.toLowerCase().includes('fourth')) formattedYear = '4th Year';

          const studentObj: StudentPatient = {
            id: `stud-csv-${Date.now()}-${i}`,
            type: 'student',
            enrollmentNo: rawId.toUpperCase(),
            name: rawName,
            branch: rawBranch,
            year: formattedYear,
            phone: rawPhone,
            createdAt: new Date().toISOString(),
          };
          newStudents.push(studentObj);
          importedStudents++;
          setDoc(doc(db, 'students', studentObj.id), studentObj).catch(e => console.warn(e));
        }
      }

      if (newStudents.length > 0) {
        setStudents(prev => {
          const existing = new Set(prev.map(s => s.enrollmentNo.toUpperCase()));
          const filtered = newStudents.filter(s => !existing.has(s.enrollmentNo.toUpperCase()));
          return [...filtered, ...prev];
        });
      }

      if (newStaff.length > 0) {
        setStaff(prev => {
          const existing = new Set(prev.map(st => st.employeeId.toUpperCase()));
          const filtered = newStaff.filter(st => !existing.has(st.employeeId.toUpperCase()));
          return [...filtered, ...prev];
        });
      }

      return {
        importedStudents,
        importedStaff,
        totalParsed: importedStudents + importedStaff,
      };
    } catch (err: any) {
      return {
        importedStudents: 0,
        importedStaff: 0,
        totalParsed: 0,
        error: err.message || 'Failed to parse CSV.',
      };
    }
  };

  const exportDatabaseJSON = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      college: 'College Medical Unit Cloud DB',
      students,
      staff,
      visitors,
      medicines,
      visits,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `college-medical-unit-cloud-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MedicalContext.Provider
      value={{
        students,
        staff,
        visitors,
        medicines,
        visits,
        isCloudSynced,
        findStudentByEnrollment,
        searchStudentsByBranchAndYear,
        searchStaff,
        searchVisitors,
        getPatientVisits,
        getAllBranches,
        getAllYears,
        saveVisit,
        updateMedicineStock,
        addMedicine,
        addStudent,
        addStaff,
        addVisitor,
        importFromCSV,
        exportDatabaseJSON,
      }}
    >
      {children}
    </MedicalContext.Provider>
  );
};

export const useMedical = () => {
  const context = useContext(MedicalContext);
  if (!context) {
    throw new Error('useMedical must be used within MedicalProvider');
  }
  return context;
};
