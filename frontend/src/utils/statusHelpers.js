/**
 * Status Helpers mapping database enums to badges, semantic colors, and display labels.
 * Strictly uses the 11 tables' exact enum values.
 */

export const EQUIPMENT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
};

export const RENTAL_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

export const RENTAL_TYPE = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
  MONTHLY: 'MONTHLY',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
};

export const PAYMENT_METHOD = {
  PAYHERE: 'PAYHERE',
  SIMULATED: 'SIMULATED',
};

export const RETURN_CONDITION = {
  GOOD: 'GOOD',
  DAMAGED: 'DAMAGED',
};

export const MAINTENANCE_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
};

export const MAINTENANCE_TYPE = {
  ROUTINE: 'ROUTINE',
  REPAIR: 'REPAIR',
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};

export const CUSTOMER_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',
  CONTRACTOR: 'CONTRACTOR',
  COMPANY: 'COMPANY',
};

export const getStatusConfig = (status) => {
  if (!status) {
    return { label: 'Unknown', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
  }

  const s = String(status).toUpperCase();

  switch (s) {
    // Equipment Statuses
    case 'AVAILABLE':
      return { label: 'Available', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'RENTED':
      return { label: 'Rented', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'MAINTENANCE':
      return { label: 'Maintenance', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };

    // Rental Statuses
    case 'PENDING_PAYMENT':
      return { label: 'Pending Payment', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'CONFIRMED':
      return { label: 'Confirmed (Awaiting Pickup)', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'ACTIVE':
      return { label: 'Active on Site', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'COMPLETED':
      return { label: 'Completed', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    case 'CANCELLED':
      return { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'EXPIRED':
      return { label: 'Expired', bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border-zinc-200' };

    // Payment Statuses
    case 'PENDING':
      return { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'SUCCESS':
      return { label: 'Paid / Success', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'FAILED':
      return { label: 'Failed', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };

    // Return Conditions
    case 'GOOD':
      return { label: 'Good Condition', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'DAMAGED':
      return { label: 'Damaged', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };

    // Maintenance Types
    case 'ROUTINE':
      return { label: 'Routine Service', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'REPAIR':
      return { label: 'Breakdown Repair', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };

    // User Roles
    case 'ADMIN':
      return { label: 'Administrator', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'STAFF':
      return { label: 'Operations Staff', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'CUSTOMER':
      return { label: 'Customer Contractor', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };

    default:
      return { label: s.replace(/_/g, ' '), bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
};
