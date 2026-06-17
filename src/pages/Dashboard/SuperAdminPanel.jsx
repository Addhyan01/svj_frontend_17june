import React, { useState } from 'react';

const INITIAL_OPENINGS = [
  { id: 'JOB-001', title: 'Field Associate (District Operations)', location: 'Bihar (All Districts)', type: 'Full-Time', desc: 'Sanitary pads distribution aur tree plantation schemes ko ground level par execute karna aur members data track karna.', appCount: 2, status: 'ONGOING' },
  { id: 'JOB-002', title: 'Social Media & Awareness Volunteer', location: 'Remote / Work from Home', type: 'Volunteer', desc: 'NGO ke campaigns aur health protection awareness ko digital platforms par promote karna.', appCount: 1, status: 'ONGOING' },
];

const INITIAL_APPLICANTS = [
  { id: 'APP-991', jobId: 'JOB-001', name: 'Manoj Kumar Giri', phone: '95723XXXXX', email: 'manoj.giri@gmail.com', district: 'Patna', block: 'Bihta', experience: '1 Year', message: 'Hum Bihar ke gaon me ground level par sanitary pad distribution system setup karna chahte hain.', status: 'PENDING' },
  { id: 'APP-992', jobId: 'JOB-001', name: 'Ravi Ranjan Yadav', phone: '70045XXXXX', email: 'ravi.yadav@gmail.com', district: 'Gaya', block: 'Sherghati', experience: 'Fresher', message: 'Plantation work me ruchi hai aur youth ko jod sakta hoon.', status: 'PENDING' },
  { id: 'APP-993', jobId: 'JOB-002', name: 'Suman Kumari', phone: '91221XXXXX', email: 'suman.k@gmail.com', district: 'Muzaffarpur', block: 'Mushahari', experience: '2+ Years', message: 'Social media management ka experience hai.', status: 'PENDING' },
];

const EMPTY_FORM = { title: '', location: 'Bihar (All Districts)', type: 'Full-Time', desc: '' };

export default function SuperAdminPanel() {
  const [openings, setOpenings] = useState(INITIAL_OPENINGS);
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title || !form.desc) return;
    setOpenings([{ id: `JOB-00${openings.length + 1}`, ...form, appCount: 0, status: 'ONGOING' }, ...openings]);
    setForm(EMPTY_FORM);
    setIsCreating(false);
  };

  const toggleJobStatus = (jobId) => {
    setOpenings(openings.map((j) => j.id === jobId ? { ...j, status: j.status === 'ONGOING' ? 'CLOSED' : 'ONGOING' } : j));
  };

  const handleAppAction = (appId, action) => {
    setApplicants(applicants.map((a) => a.id === appId ? { ...a, status: action } : a));
  };

  const activeApplicants = applicants.filter((a) => a.jobId === selectedJobId);
  const currentJob = openings.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl border border-slate-200 p-4 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded">Super Admin</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-800">Recruitment Control Panel</h4>
          <p className="text-xs text-slate-400 mt-0.5">{openings.filter((j) => j.status === 'ONGOING').length} active positions · {applicants.length} total applications</p>
        </div>
        <button
          onClick={() => { setIsCreating(true); setSelectedJobId(null); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Position
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Job cards */}
        <div className="lg:col-span-7 space-y-3">
          {openings.map((job) => (
            <div
              key={job.id}
              className={`bg-white rounded-xl border p-4 space-y-3 transition-all ${
                job.status === 'CLOSED' ? 'opacity-60 border-slate-200' : selectedJobId === job.id ? 'border-violet-300 shadow-sm' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-semibold text-slate-800 text-sm">{job.title}</h5>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      job.status === 'ONGOING'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{job.location} · <span className="font-mono">{job.id}</span> · {job.type}</p>
                </div>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed">{job.desc}</p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  <span className="font-semibold text-violet-600">{job.appCount}</span> applications
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleJobStatus(job.id)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      job.status === 'ONGOING'
                        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                    }`}
                  >
                    {job.status === 'ONGOING' ? 'Close' : 'Reopen'}
                  </button>
                  <button
                    onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedJobId === job.id
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-violet-600 border-violet-200 hover:bg-violet-50'
                    }`}
                  >
                    {selectedJobId === job.id ? 'Hide' : 'View Apps'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Applicants panel — desktop */}
        <div className="lg:col-span-5 hidden lg:block">
          {selectedJobId && currentJob ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded inline-block">Applicants</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate max-w-[200px]">{currentJob.title}</p>
                </div>
                <button onClick={() => setSelectedJobId(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                {activeApplicants.length > 0 ? (
                  activeApplicants.map((app) => (
                    <div key={app.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{app.name}</p>
                          <p className="text-xs text-slate-400">{app.phone} · {app.district} ({app.block})</p>
                        </div>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">{app.experience}</span>
                      </div>
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">"{app.message}"</p>
                      <div className="flex justify-end gap-2">
                        {app.status === 'PENDING' ? (
                          <>
                            <button onClick={() => handleAppAction(app.id, 'ACCEPTED')} className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Accept</button>
                            <button onClick={() => handleAppAction(app.id, 'REJECTED')} className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                          </>
                        ) : (
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-slate-400 text-sm">No applications yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">Active Positions</p>
                <p className="text-2xl font-bold text-slate-800">{openings.filter((j) => j.status === 'ONGOING').length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">Total Applications</p>
                <p className="text-2xl font-bold text-violet-600">{applicants.length}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 text-white">
                <p className="text-xs font-semibold text-slate-400 mb-1">Quick Tip</p>
                <p className="text-xs text-slate-300 leading-relaxed">Click "View Apps" on any job card to review and manage applicants from this panel.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Job Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">Create New Position</h4>
              <button onClick={() => setIsCreating(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Job Title *</label>
                <input required type="text" placeholder="e.g. Block Lead Supervisor" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Job Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="Full-Time">Full-Time</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Contractual">Contractual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Description *</label>
                <textarea required rows="4" placeholder="Roles, qualifications, and responsibilities..." value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none leading-relaxed" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg transition-colors">Deploy Position</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile applicants modal */}
      {selectedJobId && currentJob && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedJobId(null)} />
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl z-10 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <p className="text-xs font-medium text-violet-600">Applicants</p>
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{currentJob.title}</p>
              </div>
              <button onClick={() => setSelectedJobId(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {activeApplicants.length > 0 ? (
                activeApplicants.map((app) => (
                  <div key={app.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{app.name}</p>
                        <p className="text-xs text-slate-400">{app.phone} · {app.district}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">{app.experience}</span>
                    </div>
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">"{app.message}"</p>
                    <div className="flex justify-end gap-2">
                      {app.status === 'PENDING' ? (
                        <>
                          <button onClick={() => handleAppAction(app.id, 'ACCEPTED')} className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">Accept</button>
                          <button onClick={() => handleAppAction(app.id, 'REJECTED')} className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">Reject</button>
                        </>
                      ) : (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-slate-400 text-sm">No applications yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
