import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { EmptyState } from '../components/states/UiStates';
import { AdminGuard, RoleGate } from './AdminGuard';
import { AdminLayout } from './AdminLayout';
import { useAdminSession } from './adminAccess';
import { sectionFor } from './navigation';
import { ProfileApprovalPage } from './pages/ProfileApprovalPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { VerificationPage } from './pages/VerificationPage';

const Gated: React.FC<{ path: string; children: React.ReactNode }> = ({ path, children }) => {
  const { role } = useAdminSession();
  return <RoleGate role={role} allowed={sectionFor(path).roles}>{children}</RoleGate>;
};

/** A section the rollout hasn't reached yet. Says so plainly rather than showing fake data. */
const NotBuiltYet: React.FC<{ path: string }> = ({ path }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const section = sectionFor(path);
  return (
    <EmptyState
      icon={<Construction size={30} />}
      title={mr ? section.mr : section.en}
      description={mr ? 'हा विभाग सध्या तयार होत आहे. तोपर्यंत आपण प्रोफाइल मंजुरी वापरू शकता.' : 'This section is being built. Profile Approval is ready to use now.'}
      action={{ label: mr ? 'प्रोफाइल मंजुरीकडे जा' : 'Go to Profile Approval', to: '/admin/approvals' }}
    />
  );
};

const PENDING_SECTIONS = ['plans', 'payments', 'stories', 'notifications', 'reports'];

const AdminRoutes: React.FC = () => (
  <AdminGuard>
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<NotBuiltYet path="" />} />
        <Route path="users" element={<Gated path="users"><UsersPage /></Gated>} />
        <Route path="users/:userId" element={<Gated path="users"><UserDetailPage /></Gated>} />
        <Route path="approvals" element={<Gated path="approvals"><ProfileApprovalPage /></Gated>} />
        <Route path="verification" element={<Gated path="verification"><VerificationPage /></Gated>} />
        <Route path="complaints" element={<Gated path="complaints"><ComplaintsPage /></Gated>} />
        <Route path="settings" element={<Gated path="settings"><SettingsPage /></Gated>} />
        {PENDING_SECTIONS.map((path) => (
          <Route key={path} path={path} element={<Gated path={path}><NotBuiltYet path={path} /></Gated>} />
        ))}
        <Route path="verifications" element={<Navigate to="/admin/approvals" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  </AdminGuard>
);

export default AdminRoutes;
