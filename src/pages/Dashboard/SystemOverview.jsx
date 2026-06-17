import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminOverview from './SuperAdminOverview';

export default function SystemOverview() {
  const { user } = useAuth();
  const role = user?.role || 'SUPER_ADMIN'; // fallback for dev

  // ─── Role-based routing ───
  // Baaki roles ke overviews baad mein add honge (Admin, Associate, Member)
  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminOverview />;
    case 'ADMIN':
      return <SuperAdminOverview />; // TODO: AdminOverview
    case 'ASSOCIATE':
      return <SuperAdminOverview />; // TODO: AssociateOverview
    case 'MEMBER':
      return <SuperAdminOverview />; // TODO: MemberOverview
    default:
      return <SuperAdminOverview />;
  }
}
