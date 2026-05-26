import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ConsumersPage from './pages/admin/ConsumersPage.jsx';
import ConsumerDetailPage from './pages/admin/ConsumerDetailPage.jsx';
import EmployeesPage from './pages/admin/EmployeesPage.jsx';
import TariffPage from './pages/admin/TariffPage.jsx';
import MeterReadingsPage from './pages/admin/MeterReadingsPage.jsx';
import BillsPage from './pages/admin/BillsPage.jsx';
import BillDetailPage from './pages/admin/BillDetailPage.jsx';
import PaymentsPage from './pages/admin/PaymentsPage.jsx';
import ComplaintsPage from './pages/admin/ComplaintsPage.jsx';
import LoadSheddingPage from './pages/admin/LoadSheddingPage.jsx';
import TheftDetectionPage from './pages/admin/TheftDetectionPage.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';
import NotificationsPage from './pages/admin/NotificationsPage.jsx';
import SecurityPage from './pages/admin/SecurityPage.jsx';
import PlaceholderPage from './pages/admin/PlaceholderPage.jsx';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard.jsx';
import ConsumerBillsPage from './pages/consumer/ConsumerBillsPage.jsx';
import ConsumerPaymentsPage from './pages/consumer/ConsumerPaymentsPage.jsx';
import ConsumerProfilePage from './pages/consumer/ConsumerProfilePage.jsx';
import ConsumerAnalyticsPage from './pages/consumer/ConsumerAnalyticsPage.jsx';
import ConsumerMeterPage from './pages/consumer/ConsumerMeterPage.jsx';
import ConsumerComplaintsPage from './pages/consumer/ConsumerComplaintsPage.jsx';
import ConsumerOutagesPage from './pages/consumer/ConsumerOutagesPage.jsx';
import ConsumerServicesPage from './pages/consumer/ConsumerServicesPage.jsx';
import ConsumerNotificationsPage from './pages/consumer/ConsumerNotificationsPage.jsx';
import ConsumerSupportPage from './pages/consumer/ConsumerSupportPage.jsx';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx';
import EmployeeProfilePage from './pages/employee/EmployeeProfilePage.jsx';
import EmployeeTasksPage from './pages/employee/EmployeeTasksPage.jsx';
import EmployeeAttendancePage from './pages/employee/EmployeeAttendancePage.jsx';
import EmployeeMeterReadingsPage from './pages/employee/EmployeeMeterReadingsPage.jsx';
import EmployeeComplaintsPage from './pages/employee/EmployeeComplaintsPage.jsx';
import EmployeeFieldServicePage from './pages/employee/EmployeeFieldServicePage.jsx';
import EmployeeMaintenancePage from './pages/employee/EmployeeMaintenancePage.jsx';
import EmployeeInventoryPage from './pages/employee/EmployeeInventoryPage.jsx';
import EmployeePerformancePage from './pages/employee/EmployeePerformancePage.jsx';
import EmployeeLoadSheddingPage from './pages/employee/EmployeeLoadSheddingPage.jsx';
import EmployeeNotificationsPage from './pages/employee/EmployeeNotificationsPage.jsx';
import EmployeeReportsPage from './pages/employee/EmployeeReportsPage.jsx';
import EmployeePlaceholderPage from './pages/employee/EmployeePlaceholderPage.jsx';

import Layout from './components/Layout.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

function RoleRedirect() {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role === 'consumer') return <Navigate to="/consumer/dashboard" replace />;
  if (user?.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
}

export default function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Layout role="admin" />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="consumers" element={<ConsumersPage />} />
            <Route path="consumers/:id" element={<ConsumerDetailPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="meter-readings" element={<MeterReadingsPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="bills/:id" element={<BillDetailPage />} />
            <Route path="tariffs" element={<TariffPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="load-shedding" element={<LoadSheddingPage />} />
            <Route path="theft-detection" element={<TheftDetectionPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>

          {/* Employee */}
          <Route path="/employee" element={
            <ProtectedRoute roles={['employee']}>
              <Layout role="employee" />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="tasks" element={<EmployeeTasksPage />} />
            <Route path="attendance" element={<EmployeeAttendancePage />} />
            <Route path="meter-readings" element={<EmployeeMeterReadingsPage />} />
            <Route path="complaints" element={<EmployeeComplaintsPage />} />
            <Route path="field-service" element={<EmployeeFieldServicePage />} />
            <Route path="maintenance" element={<EmployeeMaintenancePage />} />
            <Route path="inventory" element={<EmployeeInventoryPage />} />
            <Route path="performance" element={<EmployeePerformancePage />} />
            <Route path="load-shedding" element={<EmployeeLoadSheddingPage />} />
            <Route path="notifications" element={<EmployeeNotificationsPage />} />
            <Route path="reports" element={<EmployeeReportsPage />} />
            <Route path="profile" element={<EmployeeProfilePage />} />
          </Route>

          {/* Consumer */}
          <Route path="/consumer" element={
            <ProtectedRoute roles={['consumer']}>
              <Layout role="consumer" />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ConsumerDashboard />} />
            <Route path="bills" element={<ConsumerBillsPage />} />
            <Route path="payments" element={<ConsumerPaymentsPage />} />
            <Route path="analytics" element={<ConsumerAnalyticsPage />} />
            <Route path="meter" element={<ConsumerMeterPage />} />
            <Route path="complaints" element={<ConsumerComplaintsPage />} />
            <Route path="outages" element={<ConsumerOutagesPage />} />
            <Route path="services" element={<ConsumerServicesPage />} />
            <Route path="notifications" element={<ConsumerNotificationsPage />} />
            <Route path="support" element={<ConsumerSupportPage />} />
            <Route path="profile" element={<ConsumerProfilePage />} />
          </Route>

          <Route path="/unauthorized" element={
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:'1rem'}}>
              <h1>403 — Unauthorized</h1>
              <a href="/" style={{color:'#3b82f6'}}>Go Home</a>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}
