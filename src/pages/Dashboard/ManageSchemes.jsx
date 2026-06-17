import React, { useState } from 'react';

const INITIAL_SCHEMES = [
  { id: 'SCH-101', title: 'Har Ghar Hariyali Campaign', category: '🌱 Tree Plantation', targetMetric: '5,000 Trees', achievedMetric: '2,450 Trees', budget: '₹1,50,000', status: 'ACTIVE' },
  { id: 'SCH-102', title: 'Suraksha Kawach Initiative', category: '🩺 Health & Hygiene', targetMetric: '10,000 Pads', achievedMetric: '6,200 Pads', budget: '₹2,10,000', status: 'ACTIVE' },
];

const EMPTY_FORM = { title: '', category: '🌱 Tree Plantation', targetMetric: '', budget: '' };

export default function ManageSchemes() {
  const [schemes, setSchemes] = useState(INITIAL_SCHEMES);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title || !form.targetMetric || !form.budget) return;
    const newScheme = {
      id: `SCH-${100 + schemes.length + 1}`,
      title: form.title,
      category: form.category,
      targetMetric: form.targetMetric,
      achievedMetric: '0 (Just Started)',
      budget: form.budget.startsWith('₹') ? form.budget : `₹${form.budget}`,
      status: 'ACTIVE',
    };
    setSchemes([newScheme, ...schemes]);
    setForm(EMPTY_FORM);
    setIsOpen(false);
  };

  const toggleStatus = (id) => {
    setSchemes(schemes.map((s) => s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE' } : s));
  };

  const activeCount = schemes.filter((s) => s.status === 'ACTIVE').length;
  const completedCount = schemes.filter((s) => s.status === 'COMPLETED').length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl border border-slate-200 p-4 gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Scheme & Project Hub</h4>
          <p className="text-xs text-slate-400 mt-0.5">Monitor NGO ground-level operations and budgets</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Launch Scheme
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-xl font-bold text-slate-800">{schemes.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{completedCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Completed</p>
        </div>
      </div>

      {/* Scheme cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className={`bg-white rounded-xl border border-slate-200 p-5 space-y-4 transition-opacity ${scheme.status === 'COMPLETED' ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">{scheme.id}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                    scheme.status === 'ACTIVE'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : 'bg-blue-50 border-blue-100 text-blue-700'
                  }`}>
                    {scheme.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{scheme.category}</p>
                <h4 className="text-sm font-semibold text-slate-800 mt-0.5">{scheme.title}</h4>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-lg p-3">
              <div className="text-center border-r border-slate-200">
                <p className="text-xs text-slate-400 font-medium mb-1">Budget</p>
                <p className="text-sm font-bold text-slate-800">{scheme.budget}</p>
              </div>
              <div className="text-center border-r border-slate-200">
                <p className="text-xs text-slate-400 font-medium mb-1">Target</p>
                <p className="text-sm font-bold text-violet-700">{scheme.targetMetric}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium mb-1">Achieved</p>
                <p className="text-sm font-bold text-emerald-700">{scheme.achievedMetric}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => toggleStatus(scheme.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  scheme.status === 'ACTIVE'
                    ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {scheme.status === 'ACTIVE' ? 'Mark Completed' : 'Re-Open Scheme'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Launch Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">Launch New Scheme</h4>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Scheme Title *</label>
                <input required type="text" placeholder="e.g. Kanya Swasthya Suraksha Drive" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option value="🌱 Tree Plantation">🌱 Tree Plantation</option>
                  <option value="🩺 Health & Hygiene">🩺 Health & Hygiene</option>
                  <option value="📚 Rural Education">📚 Rural Education</option>
                  <option value="🌾 Farmers Welfare">🌾 Farmers Welfare</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Target Goal *</label>
                  <input required type="text" placeholder="e.g. 5,000 Units" value={form.targetMetric} onChange={(e) => setForm({ ...form, targetMetric: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Budget (INR) *</label>
                  <input required type="text" placeholder="e.g. 1,50,000" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg transition-colors">Deploy Scheme</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
