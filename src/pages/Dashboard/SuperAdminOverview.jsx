import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { analyticsAPI } from '../../api/services';

const RANGE_OPTIONS = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: '7D' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '1y', label: '1Y' },
  { value: 'lifetime', label: 'All' },
];

const MEMBER_GROWTH = [
  { month: 'Jan', members: 180 }, { month: 'Feb', members: 240 },
  { month: 'Mar', members: 310 }, { month: 'Apr', members: 420 },
  { month: 'May', members: 530 }, { month: 'Jun', members: 680 },
  { month: 'Jul', members: 790 }, { month: 'Aug', members: 920 },
  { month: 'Sep', members: 1050 }, { month: 'Oct', members: 1140 },
  { month: 'Nov', members: 1200 }, { month: 'Dec', members: 1250 },
];

const REVENUE_DATA = [
  { month: 'Jan', pads: 18000, trees: 12500 },
  { month: 'Feb', pads: 24000, trees: 18000 },
  { month: 'Mar', pads: 31000, trees: 22000 },
  { month: 'Apr', pads: 42000, trees: 28000 },
  { month: 'May', pads: 53000, trees: 35000 },
  { month: 'Jun', pads: 68000, trees: 41000 },
  { month: 'Jul', pads: 79000, trees: 48000 },
  { month: 'Aug', pads: 92000, trees: 55000 },
  { month: 'Sep', pads: 105000, trees: 61000 },
  { month: 'Oct', pads: 114000, trees: 68000 },
  { month: 'Nov', pads: 120000, trees: 74000 },
  { month: 'Dec', pads: 128000, trees: 78000 },
];

const DELIVERY_PIE = [
  { name: 'Delivered', value: 890, color: '#10b981' },
  { name: 'Pending',   value: 34,  color: '#f59e0b' },
  { name: 'On Way',    value: 12,  color: '#3b82f6' },
  { name: 'Emergency', value: 3,   color: '#ef4444' },
  { name: 'Failed',    value: 21,  color: '#94a3b8' },
];

const TOP_ASSOCIATES = [
  { name: 'Rajesh Kumar',  block: 'Danapur',     delivered: 124, rate: '98%', district: 'Patna' },
  { name: 'Sunita Devi',   block: 'Hajipur',     delivered: 118, rate: '97%', district: 'Vaishali' },
  { name: 'Mohan Prasad',  block: 'Bodh Gaya',   delivered: 112, rate: '96%', district: 'Gaya' },
  { name: 'Priya Singh',   block: 'Muzaffarpur', delivered: 108, rate: '95%', district: 'Muzaffarpur' },
  { name: 'Amit Verma',    block: 'Bhagalpur',   delivered: 102, rate: '94%', district: 'Bhagalpur' },
];

const DISTRICT_DATA = [
  { district: 'Patna',       members: 420, blocks: 6, revenue: 185000, status: 'HIGH' },
  { district: 'Gaya',        members: 310, blocks: 4, revenue: 142000, status: 'HIGH' },
  { district: 'Muzaffarpur', members: 280, blocks: 3, revenue: 98000,  status: 'STABLE' },
  { district: 'Bhagalpur',   members: 240, blocks: 2, revenue: 61000,  status: 'STABLE' },
];

const FALLBACK_METRICS = {
  financials: { totalRevenueCollected: 485900, subscriptionRevenuePads: 280000, onDemandRevenueTrees: 205900 },
  userMetrics: { totalRegisteredMembers: 1250, activePremiumMembers: 980, pendingVerificationMembers: 270, activeFieldAssociates: 45, districtAdminsCount: 8 },
  logistics: { pendingInQueue: 34, emergencyPriority: 3, dispatchedOnTheWay: 12, successfullyDelivered: 890, failedDeliveries: 21, overallSuccessRate: '98%' },
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtRs = (n) => `₹${fmt(n)}`;

const KPI_CARDS = (m) => [
  {
    label: 'Total Revenue',
    value: fmtRs(m.financials?.totalRevenueCollected),
    sub: 'Pads + Trees combined',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Active Members',
    value: fmt(m.userMetrics?.activePremiumMembers),
    sub: `${fmt(m.userMetrics?.pendingVerificationMembers)} pending review`,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Field Associates',
    value: fmt(m.userMetrics?.activeFieldAssociates),
    sub: `${fmt(m.userMetrics?.districtAdminsCount)} district admins`,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  {
    label: 'Delivery Rate',
    value: m.logistics?.overallSuccessRate || '—',
    sub: `${fmt(m.logistics?.successfullyDelivered)} delivered`,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export default function SuperAdminOverview() {
  const [range, setRange] = useState('lifetime');
  const [metrics, setMetrics] = useState(FALLBACK_METRICS);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [donationSummary, setDonationSummary] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const [dashRes, donRes] = await Promise.all([
          analyticsAPI.getDashboard(range),
          analyticsAPI.getDonationStats(1), // just need summary, limit=1 is fine
        ]);
        setMetrics(dashRes.data.data);
        setBackendOnline(true);
        if (donRes.data.success) setDonationSummary(donRes.data.data.summary);
      } catch {
        setMetrics(FALLBACK_METRICS);
        setBackendOnline(false);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [range]);

  const m = metrics;

  const urgentAlerts = [
    ...(m.logistics?.emergencyPriority > 0 ? [{
      type: 'Emergency',
      color: 'bg-red-50 border-red-200 text-red-700',
      dot: 'bg-red-500',
      msg: `${m.logistics.emergencyPriority} emergency delivery requests unclaimed — 2hr SLA breach risk`,
    }] : []),
    ...(m.userMetrics?.pendingVerificationMembers > 50 ? [{
      type: 'Pending',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      msg: `${m.userMetrics.pendingVerificationMembers} members pending activation — review required`,
    }] : []),
    ...(m.logistics?.failedDeliveries > 15 ? [{
      type: 'Failed',
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      dot: 'bg-orange-500',
      msg: `${m.logistics.failedDeliveries} failed deliveries this period — field check needed`,
    }] : []),
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">System Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {backendOnline ? 'Live data from backend' : 'Demo data — backend offline'}
          </p>
        </div>

        <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                range === opt.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {urgentAlerts.length > 0 && (
        <div className="space-y-2">
          {urgentAlerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${alert.color}`}>
              <span className={`h-2 w-2 rounded-full shrink-0 animate-pulse ${alert.dot}`} />
              <span className="font-semibold text-xs uppercase tracking-wide shrink-0">{alert.type}</span>
              <span className="text-xs">{alert.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS(m).map((kpi, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.border} border ${kpi.color}`}>
                  {kpi.icon}
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 leading-none">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Donation Summary Strip */}
      {donationSummary && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Razorpay Donations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time from payment gateway</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
              {fmtRs(donationSummary.totalAmount)} collected
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Transactions', value: fmt(donationSummary.totalCount),   color: 'text-slate-800'   },
              { label: 'Successful',         value: fmt(donationSummary.successCount), color: 'text-emerald-600' },
              { label: 'Pending',            value: fmt(donationSummary.pendingCount), color: 'text-amber-600'   },
              { label: 'Failed',             value: fmt(donationSummary.failedCount),  color: 'text-red-500'     },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{item.label}</p>
                <p className={`text-lg font-bold mt-0.5 ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Member Growth</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cumulative registrations over time</p>
            </div>
            <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
              +48 this month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MEMBER_GROWTH} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                formatter={(v) => [fmt(v), 'Members']}
              />
              <Area type="monotone" dataKey="members" stroke="#7C3AED" strokeWidth={2} fill="url(#memberGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Revenue Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly pads vs trees revenue</p>
            </div>
            <div className="flex gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="h-2 w-2 rounded-sm bg-emerald-500 inline-block" />Pads
              </span>
              <span className="flex items-center gap-1.5 text-green-800">
                <span className="h-2 w-2 rounded-sm bg-green-800 inline-block" />Trees
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                formatter={(v, n) => [fmtRs(v), n === 'pads' ? 'Pads' : 'Trees']}
              />
              <Bar dataKey="pads" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="trees" fill="#166534" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Delivery Status</h3>
          <p className="text-xs text-slate-400 mb-4">Current period breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={DELIVERY_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                {DELIVERY_PIE.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(v, n) => [fmt(v), n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {DELIVERY_PIE.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                {d.name}: <span className="font-semibold">{fmt(d.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Top Associates</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by delivery performance</p>
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
              This period
            </span>
          </div>
          <div className="space-y-1">
            {TOP_ASSOCIATES.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-sm w-6 text-center shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-xs font-bold text-slate-300">#{i + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{a.name}</p>
                  <p className="text-xs text-slate-400">{a.block}, {a.district}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-800">{a.delivered} <span className="text-slate-400 font-normal text-xs">delivered</span></p>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{a.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">District Performance</h3>
            <p className="text-xs text-slate-400 mt-0.5">{DISTRICT_DATA.length} active districts</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">District</th>
                <th className="py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Blocks</th>
                <th className="py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Members</th>
                <th className="py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue</th>
                <th className="py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DISTRICT_DATA.map((row, i) => {
                const pct = Math.round((row.members / 500) * 100);
                return (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-semibold text-slate-800">{row.district}</td>
                    <td className="py-3 text-center text-slate-600">{row.blocks}</td>
                    <td className="py-3 text-center font-semibold text-violet-600">{fmt(row.members)}</td>
                    <td className="py-3 text-right font-semibold text-emerald-600">{fmtRs(row.revenue)}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        row.status === 'HIGH'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {row.status === 'HIGH' ? 'High Active' : 'Stable'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-8 text-right font-medium">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
