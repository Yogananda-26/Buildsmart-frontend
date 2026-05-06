import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import AppNavbar from './components/common/AppNavbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthPortal from './pages/AuthPortal';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UserManagementPage from './pages/admin/UserManagementPage';
import PendingApprovalsPage from './pages/admin/PendingApprovalsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import DashboardSummary from './features/analytics/pages/DashboardSummary';
import FinanceDashboard from './features/analytics/pages/FinanceDashboard';
import ProjectHealth from './features/analytics/pages/ProjectHealth';
import ResourceDashboard from './features/analytics/pages/ResourceDashboard';
import SafetyDashboard from './features/analytics/pages/SafetyDashboard';
import SiteEngineerDashboard from './features/analytics/pages/SiteEngineerDashboard';
import UserAnalytics from './features/analytics/pages/UserAnalytics';
import VendorDashboard from './features/analytics/pages/VendorDashboard';
import DashboardLayout from './components/layout/DashboardLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <AppNavbar />
        <Routes>
          <Route path="/login" element={<AuthPortal initial="signin" />} />
          <Route path="/signup" element={<AuthPortal initial="signup" />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardSummary /></DashboardLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          {/* Reports hub removed - analytics pages are accessed directly via sidebar links */}
          <Route path="/analytics/finance" element={<ProtectedRoute><DashboardLayout><FinanceDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/analytics/projects" element={<ProtectedRoute><DashboardLayout><ProjectHealth /></DashboardLayout></ProtectedRoute>} />
          <Route path="/analytics/resources" element={<ProtectedRoute><DashboardLayout><ResourceDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/analytics/safety" element={<ProtectedRoute><DashboardLayout><SafetyDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/analytics/site-engineers" element={<ProtectedRoute><DashboardLayout><SiteEngineerDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/analytics/users" element={<ProtectedRoute><DashboardLayout><UserAnalytics /></DashboardLayout></ProtectedRoute>} />
          <Route path="/analytics/vendors" element={<ProtectedRoute><DashboardLayout><VendorDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/analytics/vendors/:id" element={<ProtectedRoute><DashboardLayout><VendorDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
          <Route path="/admin/pending" element={<AdminRoute><PendingApprovalsPage /></AdminRoute>} />
          <Route path="/admin/audit" element={<AdminRoute><AuditLogsPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
