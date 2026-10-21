import React, { useState, useId } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  PackagePlus, 
  X 
} from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { MedicineItem } from '../types/medical';

export const PharmacyInventory: React.FC = () => {
  const { medicines, updateMedicineStock, addMedicine } = useMedical();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add medicine state
  const [name, setName] = useState('');
  const [stockQuantity, setStockQuantity] = useState(100);
  const [unit, setUnit] = useState('tablets');
  const [minThreshold, setMinThreshold] = useState(25);
  const searchInputId = useId();
  const nameInputId = useId();

  const filteredMedicines = medicines.filter(m => 
    !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = medicines.filter(m => m.stockQuantity <= m.minStockThreshold && m.stockQuantity > 0).length;
  const outOfStockCount = medicines.filter(m => m.stockQuantity === 0).length;

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMedicine({
      name: name.trim(),
      stockQuantity: Number(stockQuantity) || 0,
      unit,
      minStockThreshold: Number(minThreshold) || 20,
    });

    setName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
              Dispensary Pharmacy Stock
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Medicine Stock & Inventory
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Stock automatically decreases whenever medicines are dispensed to students or staff.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Medicine</span>
          </button>
        </div>

        {/* Status Counters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Stocked Items</span>
              <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">{medicines.length}</span>
            </div>
            <Pill className="w-6 h-6 text-teal-600" />
          </div>

          <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-800 font-medium block">Low Stock Alert</span>
              <span className="text-xl font-bold text-amber-900 font-mono tabular-nums">{lowStockCount}</span>
            </div>
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Out of Stock</span>
              <span className={`text-xl font-bold font-mono tabular-nums ${outOfStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {outOfStockCount}
              </span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <label htmlFor={searchInputId} className="sr-only">Search medicines</label>
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id={searchInputId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter medicine by name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMedicines.map((med) => {
                const isOut = med.stockQuantity === 0;
                const isLow = med.stockQuantity <= med.minStockThreshold && !isOut;

                return (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>{med.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`font-mono text-base font-bold tabular-nums ${
                        isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {med.stockQuantity}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 capitalize">
                      {med.unit}
                    </td>

                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Adequate
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateMedicineStock(med.id, 20)}
                          className="px-2 py-1 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer"
                        >
                          +20
                        </button>
                        <button
                          type="button"
                          onClick={() => updateMedicineStock(med.id, 50)}
                          className="px-2 py-1 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer"
                        >
                          +50
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-teal-600" />
                <span>Add Medicine to Stock</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="mt-4 space-y-3 text-xs">
              <div>
                <label htmlFor={nameInputId} className="block font-bold text-slate-700 mb-1">
                  Medicine Name & Strength *
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paracetamol 650mg, Cetirizine 10mg"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Initial Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Unit Type
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="tablets">Tablets</option>
                    <option value="capsules">Capsules</option>
                    <option value="sachets">Sachets</option>
                    <option value="bottles">Bottles</option>
                    <option value="tubes">Tubes</option>
                    <option value="rolls">Rolls</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
