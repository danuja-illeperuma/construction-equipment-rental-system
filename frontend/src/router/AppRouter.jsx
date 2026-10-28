import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';

// Public Homepage & Informational Pages
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';

// Auth Pages
import { Login } from '../modules/auth/pages/Login';
import { CustomerRegister } from '../modules/auth/pages/CustomerRegister';
import { CustomerList } from '../modules/auth/pages/CustomerList';
import { UsersList } from '../modules/auth/pages/UsersList';
import { Profile } from '../modules/auth/pages/Profile';

// Dashboard (Handles CustomerDashboard vs InternalDashboard)
import { Dashboard } from '../modules/dashboard/pages/Dashboard';

// Equipment & Categories
import { EquipmentCatalog } from '../modules/equipment/pages/EquipmentCatalog';
import { EquipmentDetail } from '../modules/equipment/pages/EquipmentDetail';
import { EquipmentManagement } from '../modules/equipment/pages/EquipmentManagement';
import { CategoryManagement } from '../modules/equipment/pages/CategoryManagement';

// Rental Operations & Booking
import { RentalBooking } from '../modules/rental/pages/RentalBooking';
import { BookingPreview } from '../modules/rental/pages/BookingPreview';
import { QuotationPage } from '../modules/rental/pages/QuotationPage';
import { MyRentals } from '../modules/rental/pages/MyRentals';
import { RentalOperations } from '../modules/rental/pages/RentalOperations';
import { RentalDetail } from '../modules/rental/pages/RentalDetail';

// Payments
import { PaymentCheckout } from '../modules/payment/pages/PaymentCheckout';
import { PaymentList } from '../modules/payment/pages/PaymentList';

// Returns & Damage
import { ReturnProcessing } from '../modules/returns/pages/ReturnProcessing';
import { DamageReports } from '../modules/returns/pages/DamageReports';

// Maintenance
import { MaintenanceList } from '../modules/maintenance/pages/MaintenanceList';
import { MaintenanceSchedule } from '../modules/maintenance/pages/MaintenanceSchedule';

// Reports & Audit
import { ReportsDashboard } from '../modules/reports/pages/ReportsDashboard';
import { AuditLogList } from '../modules/audit/pages/AuditLogList';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Authentication Screens */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CustomerRegister />} />

      {/* Public Homepage & Informational Pages */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Main Application with Dynamic AppLayout (Dashboard vs Customer) */}
      <Route element={<AppLayout />}>
        {/* Public or shared fleet catalog & booking preview */}
        <Route path="/equipment" element={<EquipmentCatalog />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/quotation" element={<QuotationPage />} />
        <Route path="/booking/checkout-preview" element={<BookingPreview />} />
        <Route path="/booking/preview" element={<BookingPreview />} />

        {/* Authenticated Routes: Accessible to Customers & Internal Users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/rentals/new" element={<RentalBooking />} />
          <Route path="/rentals/:id" element={<RentalDetail />} />
          <Route path="/my-rentals" element={<MyRentals />} />
          <Route path="/payments/checkout" element={<PaymentCheckout />} />
          <Route path="/payment/:bookingReference" element={<PaymentCheckout />} />
          <Route path="/payments/:bookingReference" element={<PaymentCheckout />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Internal Operations Routes: Staff & Admin */}
        <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
          <Route path="/rentals" element={<RentalOperations />} />
          <Route path="/returns" element={<ReturnProcessing />} />
          <Route path="/damage" element={<DamageReports />} />
          <Route path="/damage-reports" element={<DamageReports />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/maintenance/schedule" element={<MaintenanceSchedule />} />
        </Route>

        {/* Management Routes: Staff & Admin */}
        <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
          <Route path="/equipment/manage" element={<EquipmentManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/payment" element={<PaymentList />} />
          <Route path="/payments" element={<PaymentList />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/audit-logs" element={<AuditLogList />} />
        </Route>

        {/* System Administration Routes: Admin Only */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/users" element={<UsersList />} />
        </Route>
      </Route>

      {/* Catch-all redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
