import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { StudentProvider, useStudent } from './hooks/useStudent';
import { ToastProvider } from './components/shared/Toast';
import DemoBanner from './components/shared/DemoBanner';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import MobileNav from './components/layout/MobileNav';
import AuthLayout from './components/layout/AuthLayout';
import Overview from './components/dashboard/Overview';

// Lazy-loaded routes for code splitting
const DomainPage = lazy(() => import('./components/domains/DomainPage'));
const LearningSchedule = lazy(() => import('./components/schedule/LearningSchedule'));
const WeeklyBlueprint = lazy(() => import('./components/schedule/WeeklyBlueprint'));
const UploadedDocs = lazy(() => import('./components/docs/UploadedDocs'));
const PrintablesTab = lazy(() => import('./components/printables/PrintablesTab'));
const QuickAssessment = lazy(() => import('./components/assessment/QuickAssessment'));
const HowWeMeasure = lazy(() => import('./components/methodology/HowWeMeasure'));
const AIInsights = lazy(() => import('./components/insights/AIInsights'));
const AIChat = lazy(() => import('./components/chat/AIChat'));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage'));
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold animate-pulse"
        style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
        {'\u03B1'}
      </div>
    </div>
  );
}

function AppContent() {
  const { isDemo } = useAuth();
  const { loading, hasStudents } = useStudent();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg animate-pulse"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
          {'\u03B1'}
        </div>
      </div>
    );
  }

  // New real users with no students see onboarding wizard
  if (!hasStudents && !isDemo) {
    return (
      <Suspense fallback={<PageLoader />}>
        <OnboardingWizard />
      </Suspense>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg-primary">
        <DemoBanner />
        <Sidebar />
        <div className="min-h-screen flex flex-col sidebar-offset">
          <TopBar />
          <main className="flex-1 main-content">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/literacy" element={<DomainPage domainId="literacy" />} />
                <Route path="/numeracy" element={<DomainPage domainId="numeracy" />} />
                <Route path="/social" element={<DomainPage domainId="social" />} />
                <Route path="/motor" element={<DomainPage domainId="motor" />} />
                <Route path="/schedule" element={<LearningSchedule />} />
                <Route path="/blueprint" element={<WeeklyBlueprint />} />
                <Route path="/docs" element={<UploadedDocs />} />
                <Route path="/printables" element={<PrintablesTab />} />
                <Route path="/assessment" element={<QuickAssessment />} />
                <Route path="/methodology" element={<HowWeMeasure />} />
                <Route path="/insights" element={<AIInsights />} />
                <Route path="/chat" element={<AIChat />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/reset-password" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        <MobileNav />
      </div>
    </ToastProvider>
  );
}

function AppShell() {
  const { user, loading, isRecovery } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg animate-pulse"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
          {'\u03B1'}
        </div>
      </div>
    );
  }

  // Password recovery flow — user is authenticated but needs to set new password
  // Show ResetPassword page instead of the normal app or onboarding
  if (user && isRecovery) {
    return (
      <Suspense fallback={<PageLoader />}>
        <ResetPassword />
      </Suspense>
    );
  }

  if (!user) {
    return <AuthLayout />;
  }

  return (
    <StudentProvider>
      <AppContent />
    </StudentProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
