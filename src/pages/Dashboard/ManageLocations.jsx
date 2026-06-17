import React, { useState, useEffect, useRef } from 'react';
import { geoAPI, authAPI } from '../../api/services';

// ─── Reusable modal shell ─────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ label, color }) {
  const styles = {
    green: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${styles[color]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${color === 'green' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
      {label}
    </span>
  );
}

export default function ManageLocations({ currentSubSection }) {
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [assignedAssociates, setAssignedAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [isAddDistrictOpen, setIsAddDistrictOpen] = useState(false);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form states
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newBlockName, setNewBlockName] = useState('');
  const [selectedDistrictForBlock, setSelectedDistrictForBlock] = useState('');
  const [selectedAssociateId, setSelectedAssociateId] = useState('');
  const [selectedAssociateName, setSelectedAssociateName] = useState('');
  const [associateSearch, setAssociateSearch] = useState('');
  const [showAssociateDropdown, setShowAssociateDropdown] = useState(false);
  const [selectedBlockIds, setSelectedBlockIds] = useState([]);
  const [blockSearch, setBlockSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const associateDropdownRef = useRef(null);

  // Close associate dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (associateDropdownRef.current && !associateDropdownRef.current.contains(e.target)) {
        setShowAssociateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ─── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [distRes, assocRes, assignedRes] = await Promise.all([
          geoAPI.getDistricts(),
          authAPI.getUsers('ASSOCIATE'),
          geoAPI.getAssignedAssociates(),
        ]);
        const distList = distRes.data.data || [];
        setDistricts(distList);
        setAssociates(assocRes.data.data || []);
        setAssignedAssociates(assignedRes.data.data || []);

        // Load all blocks for all districts
        if (distList.length > 0) {
          const blockResults = await Promise.all(
            distList.map((d) => geoAPI.getBlocks(d._id).then((r) => r.data.data || []))
          );
          setBlocks(blockResults.flat());
        }
      } catch {
        setError('Failed to load location data from server.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Refresh assigned associates list after any assignment change
  const refreshAssigned = async () => {
    try {
      const { data } = await geoAPI.getAssignedAssociates();
      setAssignedAssociates(data.data || []);
    } catch { /* silent */ }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleAddDistrict = async (e) => {
    e.preventDefault();
    if (!newDistrictName.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await geoAPI.createDistrict(newDistrictName.trim());
      setDistricts((prev) => [...prev, data.data]);
      showSuccess(`District "${data.data.name}" activated successfully.`);
      setNewDistrictName('');
      setIsAddDistrictOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create district.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    if (!newBlockName.trim() || !selectedDistrictForBlock) return;
    setSubmitting(true);
    try {
      const { data } = await geoAPI.createBlock(newBlockName.trim(), selectedDistrictForBlock);
      const parentDistrict = districts.find((d) => d._id === selectedDistrictForBlock);
      setBlocks((prev) => [...prev, { ...data.data, districtName: parentDistrict?.name }]);
      setDistricts((prev) =>
        prev.map((d) =>
          d._id === selectedDistrictForBlock
            ? { ...d, activeBlocksCount: (d.activeBlocksCount || 0) + 1 }
            : d
        )
      );
      showSuccess(`Block "${data.data.name}" mapped successfully.`);
      setNewBlockName('');
      setIsAddBlockOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create block.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssociateId || selectedBlockIds.length === 0) return;
    setSubmitting(true);
    try {
      await geoAPI.assignBlocks(selectedAssociateId, selectedBlockIds);
      showSuccess('Block jurisdictions assigned successfully.');
      closeAssignModal();
      await refreshAssigned();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign blocks.');
    } finally {
      setSubmitting(false);
    }
  };

  // Remove a single block from an associate and save
  const handleRemoveBlock = async (associateId, blockIdToRemove, associateName) => {
    const associate = assignedAssociates.find((a) => a._id === associateId);
    if (!associate) return;
    const updatedBlockIds = associate.assignedBlocks
      .map((b) => b._id || b)
      .filter((id) => id !== blockIdToRemove);
    try {
      await geoAPI.assignBlocks(associateId, updatedBlockIds);
      showSuccess(`Block removed from ${associateName}.`);
      await refreshAssigned();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove block.');
    }
  };

  // Open assign modal pre-filled for editing an existing associate
  const handleEditAssociate = (associate) => {
    setSelectedAssociateId(associate._id);
    setSelectedAssociateName(associate.name);
    setAssociateSearch(associate.name);
    setSelectedBlockIds(associate.assignedBlocks.map((b) => b._id || b));
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedAssociateId('');
    setSelectedAssociateName('');
    setAssociateSearch('');
    setShowAssociateDropdown(false);
    setSelectedBlockIds([]);
    setBlockSearch('');
  };

  const toggleBlockId = (id) => {
    setSelectedBlockIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const getDistrictName = (districtId) =>
    districts.find((d) => d._id === districtId)?.name || '—';

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Feedback banners */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-3">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}

      {/* ── DISTRICTS ── */}
      {currentSubSection === 'district' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Active Districts</h4>
              <p className="text-xs text-slate-400 mt-0.5">{districts.length} districts in network</p>
            </div>
            <button
              onClick={() => setIsAddDistrictOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add District
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">State</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districts.length > 0 ? districts.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{d.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{d.state || 'BIHAR'}</td>
                    <td className="py-3.5 px-4"><StatusBadge label="Live" color="green" /></td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="text-center py-10 text-slate-400 text-sm">No districts found. Add one to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BLOCKS ── */}
      {currentSubSection === 'block' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Blocks & District Mapping</h4>
              <p className="text-xs text-slate-400 mt-0.5">{blocks.length} blocks mapped</p>
            </div>
            <button
              onClick={() => setIsAddBlockOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Block
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Block Name</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Parent District</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blocks.length > 0 ? blocks.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{b.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{getDistrictName(b.districtId)}</td>
                    <td className="py-3.5 px-4"><StatusBadge label="Mapped" color="blue" /></td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="text-center py-10 text-slate-400 text-sm">No blocks found. Add one to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ASSIGN ── */}
      {currentSubSection === 'assign' && (
        <div className="space-y-4">
          {/* Header bar */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Associate Jurisdiction</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {assignedAssociates.filter((a) => a.assignedBlocks?.length > 0).length} associates with active block assignments
              </p>
            </div>
            <button
              onClick={() => { closeAssignModal(); setIsAssignModalOpen(true); }}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Assign Blocks
            </button>
          </div>

          {/* Assignments table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Associate</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Blocks</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignedAssociates.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-12 text-slate-400 text-sm">
                        No associates found. Add associates first, then assign blocks.
                      </td>
                    </tr>
                  ) : (
                    assignedAssociates.map((assoc) => (
                      <tr key={assoc._id} className="hover:bg-slate-50/60 transition-colors align-top">
                        {/* Associate info */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <p className="font-semibold text-slate-800">{assoc.name}</p>
                          {assoc.employeeId && (
                            <p className="text-xs text-violet-600 font-mono mt-0.5">{assoc.employeeId}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-0.5">{assoc.phone || assoc.email || '—'}</p>
                        </td>

                        {/* Block chips with remove × */}
                        <td className="py-3.5 px-4">
                          {assoc.assignedBlocks?.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {assoc.assignedBlocks.map((block) => (
                                <span
                                  key={block._id}
                                  className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full"
                                >
                                  {block.name}
                                  <button
                                    type="button"
                                    title="Remove block"
                                    onClick={() => handleRemoveBlock(assoc._id, block._id, assoc.name)}
                                    className="ml-0.5 text-violet-400 hover:text-red-500 transition-colors leading-none"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No blocks assigned</span>
                          )}
                        </td>

                        {/* Edit button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleEditAssociate(assoc)}
                            className="text-xs font-medium text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 border border-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xl font-bold text-slate-800">{assignedAssociates.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total Associates</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xl font-bold text-violet-600">
                {assignedAssociates.filter((a) => a.assignedBlocks?.length > 0).length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Assigned</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xl font-bold text-amber-500">
                {assignedAssociates.filter((a) => !a.assignedBlocks?.length).length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Unassigned</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Add District Modal ── */}
      <Modal open={isAddDistrictOpen} onClose={() => setIsAddDistrictOpen(false)} title="Add New District">
        <form onSubmit={handleAddDistrict} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">District Name *</label>
            <input
              required
              type="text"
              placeholder="e.g. Muzaffarpur"
              value={newDistrictName}
              onChange={(e) => setNewDistrictName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsAddDistrictOpen(false)} className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-[2] text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add District'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Add Block Modal ── */}
      <Modal open={isAddBlockOpen} onClose={() => setIsAddBlockOpen(false)} title="Create & Map Block">
        <form onSubmit={handleAddBlock} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Block Name *</label>
            <input
              required
              type="text"
              placeholder="e.g. Bihta"
              value={newBlockName}
              onChange={(e) => setNewBlockName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Parent District *</label>
            <select
              required
              value={selectedDistrictForBlock}
              onChange={(e) => setSelectedDistrictForBlock(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select district...</option>
              {districts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsAddBlockOpen(false)} className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-[2] text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Mapping...' : 'Map Block'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Assign Blocks Modal ── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAssignModal} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h4 className="text-sm font-semibold text-slate-800">
                {selectedAssociateId ? `Edit Blocks — ${selectedAssociateName}` : 'Assign Block Jurisdictions'}
              </h4>
              <button onClick={closeAssignModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4 overflow-y-auto">

              {/* ── Associate searchable dropdown ── */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Associate Name *</label>
                {/* Lock field when editing an existing associate */}
                {selectedAssociateId && assignedAssociates.find((a) => a._id === selectedAssociateId) ? (
                  <div className="w-full px-3 py-2 border border-violet-200 bg-violet-50 rounded-lg text-sm text-violet-800 font-medium">
                    {selectedAssociateName}
                  </div>
                ) : (
                  <div className="relative" ref={associateDropdownRef}>
                    <input
                      type="text"
                      placeholder="Search associate by name..."
                      value={associateSearch}
                      onChange={(e) => {
                        setAssociateSearch(e.target.value);
                        setShowAssociateDropdown(true);
                        if (selectedAssociateName && e.target.value !== selectedAssociateName) {
                          setSelectedAssociateId('');
                          setSelectedAssociateName('');
                        }
                      }}
                      onFocus={() => setShowAssociateDropdown(true)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                    />
                    {showAssociateDropdown && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                        {associates.filter((a) => a.name.toLowerCase().includes(associateSearch.toLowerCase())).length === 0 ? (
                          <div className="px-3 py-3 text-xs text-slate-400 text-center">No associates found</div>
                        ) : (
                          associates
                            .filter((a) => a.name.toLowerCase().includes(associateSearch.toLowerCase()))
                            .map((a) => (
                              <button
                                key={a._id}
                                type="button"
                                onClick={() => {
                                  setSelectedAssociateId(a._id);
                                  setSelectedAssociateName(a.name);
                                  setAssociateSearch(a.name);
                                  setShowAssociateDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-violet-50 transition-colors flex items-center justify-between gap-2 ${
                                  selectedAssociateId === a._id ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-700'
                                }`}
                              >
                                <span>{a.name}</span>
                                <span className="text-xs text-slate-400 truncate">{a.phone || a.email}</span>
                              </button>
                            ))
                        )}
                      </div>
                    )}
                    {selectedAssociateId && (
                      <p className="text-xs text-violet-600 mt-1">
                        Selected: <span className="font-medium">{selectedAssociateName}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Select Blocks *
                  {selectedBlockIds.length > 0 && (
                    <span className="ml-2 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {selectedBlockIds.length} selected
                    </span>
                  )}
                </label>
                {/* Block search input */}
                <input
                  type="text"
                  placeholder="Filter blocks by name..."
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                />
                <div className="border border-slate-200 rounded-lg bg-slate-50 max-h-48 overflow-y-auto">
                  {/* Select all / clear row */}
                  {blocks.length > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white sticky top-0">
                      <button
                        type="button"
                        onClick={() => setSelectedBlockIds(blocks.map((b) => b._id))}
                        className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBlockIds([])}
                        className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  <div className="p-2 space-y-1">
                    {blocks
                      .filter((b) =>
                        b.name.toLowerCase().includes(blockSearch.toLowerCase())
                      )
                      .map((b) => (
                        <label
                          key={b._id}
                          className={`flex items-center gap-2.5 text-sm cursor-pointer rounded-lg px-2 py-1.5 transition-colors ${
                            selectedBlockIds.includes(b._id)
                              ? 'bg-violet-50 text-violet-800'
                              : 'text-slate-700 hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedBlockIds.includes(b._id)}
                            onChange={() => toggleBlockId(b._id)}
                            className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4 shrink-0"
                          />
                          <span className="font-medium">{b.name}</span>
                          <span className="text-xs text-slate-400 ml-auto">({getDistrictName(b.districtId)})</span>
                        </label>
                      ))}
                    {blocks.filter((b) =>
                      b.name.toLowerCase().includes(blockSearch.toLowerCase())
                    ).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">No blocks match your search</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeAssignModal} className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting || !selectedAssociateId || selectedBlockIds.length === 0}
                  className="flex-[2] text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Assigning...' : `Confirm Assignment${selectedBlockIds.length > 0 ? ` (${selectedBlockIds.length})` : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
