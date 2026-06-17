import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';
import DonationLogs from './DonationLogs';
import SystemOverview from './SystemOverview';
import ManageMembers from './ManageMembers';
import ManageOpenings from './ManageOpenings';
import ManageLocations from './ManageLocations';
import ManageBroadcasts from './ManageBroadcasts';
import SuperAdminPanel from './SuperAdminPanel';
import AdminOverview from './AdminOverview';
import AssociateOverview from './AssociateOverview';
import AssociateBlockDetails from './AssociateBlockDetails';
import AdminBlockDetails from './AdminBlockDetails';
import MemberOverview from './MemberOverview';
import ManageMeetings from './ManageMeetings';
import EnquiryLogs from './EnquiryLogs';
import ManageProducts from './ManageProducts';
import ManageDeliveries from './ManageDeliveries';
import MemberOrder from './MemberOrder';
import MemberMyDeliveries from './MemberMyDeliveries';
import AdminOrders from './AdminOrders';
import AdminDeliveries from './AdminDeliveries';
import SuperAdminOrders from './SuperAdminOrders';
import SuperAdminDeliveries from './SuperAdminDeliveries';

const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Manage Users',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { id: 'user-member', label: 'Members' },
      { id: 'user-donor', label: 'Donors' },
      { id: 'user-associate', label: 'Field Associates' },
      { id: 'user-district-admin', label: 'District Admins' },
    ],
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { id: 'loc-district', label: 'Districts' },
      { id: 'loc-block', label: 'Blocks & Map' },
      { id: 'loc-assign', label: 'Assign Associate' },
    ],
  },
  {
    id: 'broadcasts',
    label: 'Broadcasts',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    id: 'donations',
    label: 'Donation Logs',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    id: 'careers',
    label: 'Openings',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'products',
    label: 'Products',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    children: [
      { id: 'product-catalog', label: 'Service Catalog' },
      { id: 'product-activate', label: 'Activate Member' },
      { id: 'product-emergency', label: 'Emergency (Helpline)' },
      { id: 'product-deliveries', label: 'All Deliveries' },
    ],
  },
  {
    id: 'super-orders',
    label: 'Orders',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'super-deliveries',
    label: 'Deliveries',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

const ADMIN_NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  },
  {
    id: 'users',
    label: 'Manage Users',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    children: [
      { id: 'user-member', label: 'Members' },
      { id: 'user-donor', label: 'Donors' },
      { id: 'user-associate', label: 'Field Associates' },
    ],
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    children: [
      { id: 'loc-block', label: 'Blocks & Map' },
      { id: 'loc-assign', label: 'Assign Associate' },
    ],
  },
  {
    id: 'admin-block-details',
    label: 'Block Details',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  },
  {
    id: 'broadcasts',
    label: 'Broadcasts',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
  {
    id: 'donations',
    label: 'Donation Logs',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  {
    id: 'admin-orders',
    label: 'Orders',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    id: 'admin-deliveries',
    label: 'Deliveries',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  },
];

const ASSOCIATE_NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  },
  {
    id: 'my-members',
    label: 'My Members',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    id: 'deliveries',
    label: 'My Deliveries',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  },
  {
    id: 'block-details',
    label: 'Block Details',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    id: 'broadcasts',
    label: 'Broadcasts',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
  {
    id: 'meetings',
    label: 'My Meetings',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
];

const MEMBER_NAV_ITEMS = [
  {
    id: 'overview',
    label: 'My Dashboard',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    id: 'member-order',
    label: 'Order',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    id: 'member-deliveries',
    label: 'My Delivery',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    children: [
      { id: 'member-deliveries-scheduled', label: '🗓 Scheduled Orders' },
      { id: 'member-deliveries-done',      label: '✅ Delivered Orders'  },
    ],
  },
  {
    id: 'broadcasts',
    label: 'Notices',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
];

const TAB_TITLES = {
  overview: 'System Overview',
  'my-members': 'My Members',
  'deliveries': 'My Deliveries',
  'block-details': 'Block Details',
  'admin-block-details': 'Block Details',
  'user-member': 'Registered Members',
  'user-donor': 'Premium Donors',
  'user-associate': 'Field Associates',
  'user-district-admin': 'District Admins',
  donations: 'Donation Logs',
  enquiries: 'Enquiries',
  careers: 'Manage Openings',
  'loc-district': 'Active Districts',
  'loc-block': 'Blocks & Map',
  'loc-assign': 'Assign Associate',
  broadcasts: 'Notices & Broadcasts',
  meetings: 'Meetings',
  'super-admin': 'Super Admin Panel',
  'products': 'Product Management',
  'product-catalog': 'Service Catalog',
  'product-activate': 'Activate Member Subscription',
  'product-emergency': 'Emergency Request (Helpline)',
  'product-deliveries': 'All Deliveries',
  'member-order': 'Place New Order',
  'member-deliveries': 'My Deliveries',
  'member-deliveries-scheduled': 'Scheduled Orders',
  'member-deliveries-done': 'Delivered Orders',
  'admin-orders': 'District Orders',
  'admin-deliveries': 'District Deliveries',
  'super-orders': 'All Orders — System Wide',
  'super-deliveries': 'All Deliveries — System Wide',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [openGroups, setOpenGroups] = useState({ users: false, locations: false, products: false, 'member-deliveries': false });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = user?.role || 'SUPER_ADMIN';
  const isAdmin     = userRole === 'ADMIN';
  const isAssociate = userRole === 'ASSOCIATE';
  const isMember    = userRole === 'MEMBER' || userRole === 'DONOR';
  const navItems = isMember ? MEMBER_NAV_ITEMS : isAssociate ? ASSOCIATE_NAV_ITEMS : isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS;
  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SA';

  const handleLogout = () => {
    logout();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isGroupActive = (item) =>
    item.children?.some((c) => c.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        if (isMember)    return <MemberOverview />;
        if (isAssociate) return <AssociateOverview />;
        if (isAdmin)     return <AdminOverview />;
        return <SystemOverview />;
      case 'my-members':        return <ManageMembers currentViewRole="MEMBER" />;
      case 'deliveries':        return <ManageDeliveries />;
      case 'block-details':     return <AssociateBlockDetails />;
      case 'admin-block-details': return <AdminBlockDetails />;
      case 'user-member':         return <ManageMembers currentViewRole="MEMBER" />;
      case 'user-donor':          return <ManageMembers currentViewRole="DONOR" />;
      case 'user-associate':      return <ManageMembers currentViewRole="FIELD_ASSOCIATE" />;
      case 'user-district-admin': return <ManageMembers currentViewRole="DISTRICT_ADMIN" />;
      case 'donations':           return <DonationLogs />;
      case 'enquiries':           return <EnquiryLogs />;
      case 'careers':             return <ManageOpenings />;
      case 'loc-district':        return <ManageLocations currentSubSection="district" />;
      case 'loc-block':           return <ManageLocations currentSubSection="block" />;
      case 'loc-assign':          return <ManageLocations currentSubSection="assign" />;
      case 'broadcasts':          return <ManageBroadcasts />;
      case 'meetings':            return <ManageMeetings />;
      case 'super-admin':         return <SuperAdminPanel />;
      case 'products':
      case 'product-catalog':     return <ManageProducts section="catalog" />;
      case 'product-activate':    return <ManageProducts section="activate" />;
      case 'product-emergency':   return <ManageProducts section="emergency" />;
      case 'product-deliveries':  return <ManageDeliveries />;
      // ── Member-only routes ────────────────────────────────────────
      case 'member-order':                 return <MemberOrder />;
      case 'member-deliveries':
      case 'member-deliveries-scheduled':  return <MemberMyDeliveries defaultTab="scheduled" />;
      case 'member-deliveries-done':       return <MemberMyDeliveries defaultTab="delivered" />;
      // ── District Admin routes ─────────────────────────────────────
      case 'admin-orders':                 return <AdminOrders />;
      case 'admin-deliveries':             return <AdminDeliveries />;
      // ── Super Admin routes ────────────────────────────────────────
      case 'super-orders':                 return <SuperAdminOrders />;
      case 'super-deliveries':             return <SuperAdminDeliveries />;
      default:                    return <SystemOverview />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="SVJ Logo"
            className="h-11 w-11 object-contain shrink-0 rounded-lg"
          />
          <div className="select-none min-w-0">
            <div className="text-sm font-black tracking-wide leading-tight flex gap-1 flex-wrap">
              <span style={{ color: '#c084fc' }}>सबका</span>
              <span style={{ color: '#34d399' }}>वि<span style={{ color: '#c084fc' }}>का</span>स</span>
              <span style={{ color: '#c084fc' }}>ज्यति</span>
            </div>
            <span className="text-[10px] font-semibold leading-none mt-0.5 block truncate" style={{ color: '#6ee7b7' }}>
              "गाँव गाँव खुशी, देश खुशहाल"
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 no-scrollbar">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 pb-2">Navigation</p>

        {navItems.map((item) => {
          const isActive = activeTab === item.id || isGroupActive(item);
          const isOpen = openGroups[item.id];

          if (item.children) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={isActive ? 'text-emerald-400' : ''}>{item.icon}</span>
                    {item.label}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="mt-0.5 ml-4 pl-3 border-l border-white/10 space-y-0.5 pb-1">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleTabChange(child.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          activeTab === child.id
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.accent
                  ? activeTab === item.id
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-slate-400 hover:bg-violet-500/10 hover:text-violet-300'
                  : activeTab === item.id
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <span className={
                item.accent
                  ? activeTab === item.id ? 'text-violet-400' : 'text-slate-500'
                  : activeTab === item.id ? 'text-emerald-400' : 'text-slate-500'
              }>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
            <p className="text-[10px] font-semibold truncate" style={{
              color: isMember ? '#f59e0b' : isAssociate ? '#60a5fa' : isAdmin ? '#34d399' : '#c084fc'
            }}>
              {isMember ? (userRole === 'DONOR' ? 'Donor' : 'Member') : isAssociate ? 'Field Associate' : isAdmin ? 'District Admin' : 'Super Admin'}
            </p>          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden">

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 bg-slate-900 flex flex-col
        transform transition-transform duration-300 ease-in-out md:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="w-60 bg-slate-900 hidden md:flex flex-col h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <h1 className="text-sm font-semibold text-slate-800">
                {TAB_TITLES[activeTab] || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div className="h-8 w-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
