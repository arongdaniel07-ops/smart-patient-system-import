import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { FindCarePage } from './pages/care/FindCarePage';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { MedicinePage } from './pages/medicines/MedicinePage';
import { FollowUpsPage } from './pages/followups/FollowUpsPage';
import { RecordSharingPage } from './pages/sharing/RecordSharingPage';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { UserRole } from './types';

// Role Guard Component
interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-teal" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's role-specific primary page
    switch (user.role) {
      case 'DOCTOR':
        return <Navigate to="/doctor" replace />;
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'PATIENT':
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <AppShell>{children}</AppShell>;
};

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const getDefaultHome = () => {
    if (!isAuthenticated || !user) return <LandingPage />;
    switch (user.role) {
      case 'DOCTOR':
        return <Navigate to="/doctor" replace />;
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'PATIENT':
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={getDefaultHome()} />
      <Route path="/login" element={isAuthenticated ? getDefaultHome() : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? getDefaultHome() : <RegisterPage />} />

      {/* Patient Specific Protected Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/find-care"
        element={
          <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR']}>
            <FindCarePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medicines"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <MedicinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/follow-ups"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <FollowUpsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sharing"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <RecordSharingPage />
          </ProtectedRoute>
        }
      />

      {/* Doctor Workspace */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Governance */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shared Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
