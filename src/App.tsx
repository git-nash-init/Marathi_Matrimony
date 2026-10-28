import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProfileDetailPage } from './pages/ProfileDetailPage';
import { ShortlistPage } from './pages/ShortlistPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SuccessStoriesPage } from './pages/SuccessStoriesPage';
import { MembershipPage } from './pages/MembershipPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { LocationLandingPage } from './pages/LocationLandingPage';
import { WeddingServicesPage } from './pages/WeddingServicesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfileCreatePage } from './pages/ProfileCreatePage';
import { ProfileEditPage } from './pages/ProfileEditPage';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { AdminVerificationPage } from './pages/AdminVerificationPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  {/* Public Discovery & Informational Routes */}
                  <Route index element={<HomePage />} />
                  <Route path="matches" element={<SearchPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="shortlist" element={<ShortlistPage />} />
                  <Route path="shortlists" element={<ShortlistPage />} />
                  <Route path="profile/:id" element={<ProfileDetailPage />} />
                  <Route path="how-it-works" element={<HowItWorksPage />} />
                  <Route path="success-stories" element={<SuccessStoriesPage />} />
                  <Route path="membership" element={<MembershipPage />} />
                  <Route path="wedding-services" element={<WeddingServicesPage />} />
                  <Route path="about" element={<AboutUsPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="faq" element={<FAQPage />} />
                  <Route path="privacy" element={<PrivacyPolicyPage />} />
                  <Route path="terms" element={<TermsPage />} />

                  {/* Regional Hubs & Canonical Crawled Sitemap Landing Pages */}
                  <Route path="location/:slug" element={<LocationLandingPage />} />
                  <Route path="maratha-marriage-bureau-borivali" element={<LocationLandingPage />} />
                  <Route path="maratha-marriage-bureau-lower-parel" element={<LocationLandingPage />} />
                  <Route path="maratha-vadhu-var-suchak-dadar" element={<LocationLandingPage />} />
                  <Route path="maratha-vivah-mandal-mulund" element={<LocationLandingPage />} />
                  <Route path="maratha-marriage-bureau-vashi" element={<LocationLandingPage />} />
                  <Route path="maratha-matrimony-kharghar" element={<LocationLandingPage />} />
                  <Route path="maratha-vadhu-var-suchak-jogeshwari" element={<LocationLandingPage />} />
                  <Route path="maratha-vadhu-var-suchak-ghodbunder-thane" element={<LocationLandingPage />} />
                  <Route path="maratha-vadhu-var-suchak-dhankawadi-pune" element={<LocationLandingPage />} />
                  <Route path="maratha-vadhu-var-suchak-pimpri-chinchwad" element={<LocationLandingPage />} />

                  {/* Category Search URL Aliases for Crawlers & Legacy Links */}
                  <Route path="maratha-matrimony/:category/:location" element={<SearchPage />} />
                  <Route path="maratha-matrimony/:category" element={<SearchPage />} />

                {/* Auth Routes */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="signup" element={<RegisterPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="verify" element={<VerifyEmailPage />} />
                <Route path="auth/callback" element={<VerifyEmailPage />} />
                <Route path="auth/verify" element={<VerifyEmailPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />

                {/* Protected User Account Routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile/create"
                  element={
                    <ProtectedRoute>
                      <ProfileCreatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile/edit"
                  element={
                    <ProtectedRoute>
                      <ProfileEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="interests"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="shortlists"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="payment/:planSlug"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="payment/success"
                  element={
                    <ProtectedRoute>
                      <PaymentSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute>
                      <AdminVerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/verifications"
                  element={
                    <ProtectedRoute>
                      <AdminVerificationPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
