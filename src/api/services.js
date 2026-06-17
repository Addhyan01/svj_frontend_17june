/**
 * Centralized API service layer
 * All backend calls go through here — keeps components clean.
 */
import API from './axios';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const authAPI = {
  /** POST /auth/login → { token, user } */
  login: (email, password) =>
    API.post('/auth/login', { email, password }),

  /** GET /auth/me → { data: user } */
  getMe: () =>
    API.get('/auth/me'),

  /** POST /auth/public-register */
  register: (data) =>
    API.post('/auth/public-register', data),

  /** PUT /auth/update-profile */
  updateProfile: (data) =>
    API.put('/auth/update-profile', data),

  /** PUT /auth/change-password */
  changePassword: (currentPassword, newPassword) =>
    API.put('/auth/change-password', { currentPassword, newPassword }),

  /** PUT /auth/admin/reset-password/:targetUserId */
  adminResetPassword: (targetUserId, newPassword) =>
    API.put(`/auth/admin/reset-password/${targetUserId}`, { newPassword }),

  /** POST /auth/admin-register (protected) */
  adminRegister: (data) =>
    API.post('/auth/admin-register', data),

  /** GET /auth/users?role=MEMBER — fetch users by role */
  getUsers: (role, status, associateId) => {
    const params = new URLSearchParams();
    if (role)        params.append('role', role);
    if (status)      params.append('status', status);
    if (associateId) params.append('associateId', associateId);
    return API.get(`/auth/users?${params.toString()}`);
  },

  /** PUT /auth/users/:userId/toggle-status */
  toggleUserStatus: (userId) =>
    API.put(`/auth/users/${userId}/toggle-status`),

  /** POST /auth/activate/:userId — activate membership after payment */
  activateMembership: (userId, data) =>
    API.post(`/auth/activate/${userId}`, data),
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export const analyticsAPI = {
  /** GET /analytics/dashboard?range=... → { data: { financials, userMetrics, logistics } } */
  getDashboard: (range = 'lifetime') => {
    const param = range === 'lifetime' ? '' : `?range=${range}`;
    return API.get(`/analytics/dashboard${param}`);
  },

  /** GET /analytics/donations?limit=50 → { data: { summary, donations[] } } */
  getDonationStats: (limit = 50) =>
    API.get(`/analytics/donations?limit=${limit}`),
};

// ─── GEO ─────────────────────────────────────────────────────────────────────

export const geoAPI = {
  /** GET /geo/districts → { data: [{ _id, name, state }] } */
  getDistricts: () =>
    API.get('/geo/districts'),

  /** GET /geo/districts/:districtId/blocks → { data: [{ _id, name, districtId }] } */
  getBlocks: (districtId) =>
    API.get(`/geo/districts/${districtId}/blocks`),

  /** POST /geo/districts → { data: district } */
  createDistrict: (name) =>
    API.post('/geo/districts', { name }),

  /** POST /geo/blocks → { data: block } */
  createBlock: (name, districtId) =>
    API.post('/geo/blocks', { name, districtId }),

  /** PUT /geo/assign-associate/:associateId → { data: { associateId, assignedBlocks } } */
  assignBlocks: (associateId, blockIds) =>
    API.put(`/geo/assign-associate/${associateId}`, { blockIds }),

  /** GET /geo/assigned-associates → { data: [associate with populated assignedBlocks] } */
  getAssignedAssociates: () =>
    API.get('/geo/assigned-associates'),

  /** GET /geo/my-blocks → associate's own assigned blocks with district populated */
  getMyBlocks: () =>
    API.get('/geo/my-blocks'),

  /** GET /geo/admin/district-blocks → all blocks in admin's district with associate counts */
  getAdminDistrictBlocks: () =>
    API.get('/geo/admin/district-blocks'),

  /** GET /geo/blocks/:blockId/associates → associates assigned to that block */
  getAssociatesByBlock: (blockId) =>
    API.get(`/geo/blocks/${blockId}/associates`),
};

// ─── SERVICES (NGO catalog) ───────────────────────────────────────────────────

export const servicesAPI = {
  /** GET /services → { data: [{ _id, name, type, baseFee, ... }] } */
  getAll: () =>
    API.get('/services'),

  /** POST /services */
  create: (data) =>
    API.post('/services', data),

  /** PUT /services/:id */
  update: (id, data) =>
    API.put(`/services/${id}`, data),
};

// ─── BROADCASTS ──────────────────────────────────────────────────────────────

export const broadcastAPI = {
  /** GET /broadcasts?status=active&category=...&targetGroup=... */
  getAll: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status)      q.append('status', params.status);
    if (params.category)    q.append('category', params.category);
    if (params.targetGroup) q.append('targetGroup', params.targetGroup);
    const qs = q.toString();
    return API.get(`/broadcasts${qs ? `?${qs}` : ''}`);
  },

  /** POST /broadcasts */
  create: (data) => API.post('/broadcasts', data),

  /** PUT /broadcasts/:id/revoke */
  revoke: (id) => API.put(`/broadcasts/${id}/revoke`),

  /** DELETE /broadcasts/:id */
  remove: (id) => API.delete(`/broadcasts/${id}`),
};

// ─── MEETINGS ────────────────────────────────────────────────────────────────

export const meetingAPI = {
  /** POST /meetings  (multipart/form-data with optional photos[]) */
  create: (formData) => {
    const config = { headers: { 'Content-Type': undefined } };
    return API.post('/meetings', formData, config);
  },

  /** GET /meetings?page=&limit=&meetingType=&conductedBy=&districtId=&month=&year= */
  getAll: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.append(k, v); });
    const qs = q.toString();
    return API.get(`/meetings${qs ? `?${qs}` : ''}`);
  },

  /** GET /meetings/stats */
  getStats: () => API.get('/meetings/stats'),

  /** GET /meetings/:id */
  getById: (id) => API.get(`/meetings/${id}`),

  /** PUT /meetings/:id  (multipart/form-data) */
  update: (id, formData) => {
    const config = { headers: { 'Content-Type': undefined } };
    return API.put(`/meetings/${id}`, formData, config);
  },

  /** GET /meetings/district/:districtId/associates — associates with meeting counts */
  getDistrictAssociates: (districtId) =>
    API.get(`/meetings/district/${districtId}/associates`),

  /** DELETE /meetings/:id */
  remove: (id) => API.delete(`/meetings/${id}`),
};

// ─── DELIVERIES ──────────────────────────────────────────────────────────────

export const deliveryAPI = {
  /** GET /deliveries/my → member's own delivery history */
  getMyDeliveries: () =>
    API.get('/deliveries/my'),

  /** GET /deliveries/my-membership → member's own memberships */
  getMyMembership: () =>
    API.get('/deliveries/my-membership'),

  /** GET /deliveries/pending — associate's active/emergency deliveries (scoped) */
  getPending: () =>
    API.get('/deliveries/pending'),

  /** GET /deliveries/my-associate-deliveries — associate's full history (scoped to own members) */
  getAssociateDeliveries: () =>
    API.get('/deliveries/my-associate-deliveries'),

  /** PUT /deliveries/:id/status */
  updateStatus: (id, status, failReason, notes) =>
    API.put(`/deliveries/${id}/status`, { status, failReason, notes }),

  /** POST /deliveries/emergency */
  raiseEmergency: (serviceId) =>
    API.post('/deliveries/emergency', { serviceId }),

  /** PUT /deliveries/:id/accept-emergency */
  acceptEmergency: (id) =>
    API.put(`/deliveries/${id}/accept-emergency`),

  /** GET /deliveries/admin/escalations */
  getEscalations: () =>
    API.get('/deliveries/admin/escalations'),

  /** GET /deliveries/admin/all?status=&blockId=&serviceId=&deliveryType=&page=&limit= */
  getAllDeliveries: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.append(k, v); });
    const qs = q.toString();
    return API.get(`/deliveries/admin/all${qs ? `?${qs}` : ''}`);
  },

  /** GET /deliveries/admin/member/:memberId/orders — all orders for a specific member */
  getMemberOrders: (memberId) =>
    API.get(`/deliveries/admin/member/${memberId}/orders`),

  /** POST /deliveries/admin/emergency-for-member */
  adminRaiseEmergency: (memberId, serviceId) =>
    API.post('/deliveries/admin/emergency-for-member', { memberId, serviceId }),

  /** PUT /deliveries/admin/schedule-bulk */
  scheduleBulk: (blockId, serviceId, deliveryDate) =>
    API.put('/deliveries/admin/schedule-bulk', { blockId, serviceId, deliveryDate }),

  /** POST /scheduler/generate-monthly-cycle — SuperAdmin: trigger monthly pad delivery batch */
  generateMonthlyCycle: () =>
    API.post('/scheduler/generate-monthly-cycle'),

  /** GET /deliveries/admin/district-orders?from=&to= — District Admin: all orders by members in district */
  getDistrictOrders: (from, to) => {
    const q = new URLSearchParams();
    if (from) q.append('from', from);
    if (to)   q.append('to', to);
    const qs = q.toString();
    return API.get(`/deliveries/admin/district-orders${qs ? `?${qs}` : ''}`);
  },

  /** GET /deliveries/super/all-orders — SuperAdmin: all orders system-wide with filters */
  getSuperOrders: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.append(k, v); });
    const qs = q.toString();
    return API.get(`/deliveries/super/all-orders${qs ? `?${qs}` : ''}`);
  },

  /** GET /deliveries/super/all-deliveries — SuperAdmin: all deliveries system-wide with filters */
  getSuperDeliveries: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.append(k, v); });
    const qs = q.toString();
    return API.get(`/deliveries/super/all-deliveries${qs ? `?${qs}` : ''}`);
  },
};

// ─── DONATIONS ────────────────────────────────────────────────────────────────

export const donationAPI = {
  /** POST /donations/create-order → { orderId, amount, currency, donationId } */
  createOrder: (data) =>
    API.post('/donations/create-order', data),

  /** POST /donations/verify → { success, donation } */
  verifyPayment: (data) =>
    API.post('/donations/verify', data),

  /** GET /donations (admin only) → { data: [donations] } */
  getAll: () =>
    API.get('/donations'),
};

// ─── OPENINGS & CAREER APPLICATIONS ──────────────────────────────────────────

export const openingsAPI = {
  /** GET /openings/public — public: only ONGOING openings */
  getPublic: () =>
    API.get('/openings/public'),

  /** POST /openings/apply — public: submit a job application */
  apply: (data) =>
    API.post('/openings/apply', data),

  /** GET /openings — SUPER_ADMIN: all openings with app counts */
  getAll: () =>
    API.get('/openings'),

  /** POST /openings — SUPER_ADMIN: create opening */
  create: (data) =>
    API.post('/openings', data),

  /** PUT /openings/:id/toggle — SUPER_ADMIN: toggle status */
  toggleStatus: (id) =>
    API.put(`/openings/${id}/toggle`),

  /** DELETE /openings/:id — SUPER_ADMIN: delete opening */
  remove: (id) =>
    API.delete(`/openings/${id}`),

  /** GET /openings/:id/applications — SUPER_ADMIN: all applicants for an opening */
  getApplications: (id) =>
    API.get(`/openings/${id}/applications`),

  /** PUT /openings/:id/applications/:appId/status — SUPER_ADMIN: accept/reject */
  updateAppStatus: (openingId, appId, status) =>
    API.put(`/openings/${openingId}/applications/${appId}/status`, { status }),
};

// ─── ENQUIRIES ────────────────────────────────────────────────────────────────

export const enquiryAPI = {
  /** POST /enquiries (public) */
  submit: (data) =>
    API.post('/enquiries', data),

  /** GET /enquiries?status=NEW&limit=100 (admin) */
  getAll: (status = '', limit = 100) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit);
    return API.get(`/enquiries?${params.toString()}`);
  },

  /** PUT /enquiries/:id/status */
  updateStatus: (id, status) =>
    API.put(`/enquiries/${id}/status`, { status }),
};
