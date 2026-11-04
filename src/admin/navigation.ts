import {
  BarChart3,
  Bell,
  CreditCard,
  Crown,
  Heart,
  LayoutGrid,
  LucideIcon,
  MessageCircle,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { AdminRole } from './adminAccess';

export interface AdminSection {
  path: string;
  en: string;
  mr: string;
  icon: LucideIcon;
  roles: AdminRole[];
}

/** Sidebar order follows the client's design. The server enforces the same roles on every action. */
export const ADMIN_SECTIONS: AdminSection[] = [
  { path: '', en: 'Dashboard', mr: 'डॅशबोर्ड', icon: LayoutGrid, roles: ['super_admin', 'admin', 'moderator', 'support'] },
  { path: 'users', en: 'User Management', mr: 'सदस्य व्यवस्थापन', icon: Users, roles: ['super_admin', 'admin', 'moderator', 'support'] },
  { path: 'approvals', en: 'Profile Approval', mr: 'प्रोफाइल मंजुरी', icon: UserCheck, roles: ['super_admin', 'admin', 'moderator'] },
  { path: 'plans', en: 'Subscription Plans', mr: 'सदस्यता योजना', icon: Crown, roles: ['super_admin', 'admin'] },
  { path: 'payments', en: 'Payments', mr: 'पेमेंट्स', icon: CreditCard, roles: ['super_admin', 'admin'] },
  { path: 'verification', en: 'Verification', mr: 'पडताळणी', icon: ShieldCheck, roles: ['super_admin', 'admin', 'moderator'] },
  { path: 'stories', en: 'Success Stories', mr: 'विवाहगाथा', icon: Heart, roles: ['super_admin', 'admin'] },
  { path: 'complaints', en: 'Complaints & Support', mr: 'तक्रारी व मदत', icon: MessageCircle, roles: ['super_admin', 'admin', 'support'] },
  { path: 'notifications', en: 'Notifications', mr: 'सूचना', icon: Bell, roles: ['super_admin', 'admin'] },
  { path: 'reports', en: 'Reports', mr: 'अहवाल', icon: BarChart3, roles: ['super_admin', 'admin'] },
  { path: 'settings', en: 'Settings', mr: 'सेटिंग्ज', icon: Settings, roles: ['super_admin', 'admin', 'moderator', 'support'] },
];

export const sectionFor = (path: string): AdminSection =>
  ADMIN_SECTIONS.find((s) => s.path === path) ?? ADMIN_SECTIONS[0];
