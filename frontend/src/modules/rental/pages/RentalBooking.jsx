import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { rentalApi } from '../api/rentalApi';
import { equipmentApi } from '../../equipment/api/equipmentApi';
import { maintenanceApi } from '../../maintenance/api/maintenanceApi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';
import { RENTAL_TYPE } from '../../../utils/constants';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Plus, Trash2, CalendarCheck, CheckCircle2, AlertCircle, AlertTriangle, Lock } from 'lucide-react';

export const RentalBooking = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('equipmentId');

  const [equipmentList, setEquipmentList] = useState([]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    return tomorrow.toISOString().split('T')[0];
  });

  const [items, setItems] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [maintenanceSummary, setMaintenanceSummary] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';
  const { error, success } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      maintenanceApi.getMyCharges()
        .then((res) => {
          if (res?.success && res?.data) {
            setMaintenanceSummary(res.data);
          }
        })
        .catch((err) => {
          console.warn('Failed to check customer maintenance dues:', err);
        });
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    equipmentApi.getAll().then((res) => {
      if (res.success) {
        setEquipmentList(res.data);
        if (preselectedId) {
          const matched = res.data.find((e) => String(e.equipmentId) === String(preselectedId));
          if (matched) {
            setItems([
              {
                equipmentId: matched.equipmentId,
                rentalType: RENTAL_TYPE.DAILY,
                quantity: 1,
                duration: 3,
              },
            ]);
          }
        }
      }
    });
  }, [preselectedId]);

  const addItem = () => {
    if (equipmentList.length === 0) return;
    setItems((prev) => [
      ...prev,
      {
        equipmentId: equipmentList[0].equipmentId,
        rentalType: RENTAL_TYPE.DAILY,
        quantity: 1,
        duration: 1,
      },
    ]);
    setAvailabilityResult(null);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setAvailabilityResult(null);
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
    setAvailabilityResult(null);
  };

  const handleCheckAvailability = async () => {
    if (items.length === 0) {
      error('Please add at least one equipment item');
      return;
    }
    setCheckingAvailability(true);
    try {
      const equipmentIds = items.map((i) => Number(i.equipmentId));
      const res = await rentalApi.checkAvailability({
        equipmentIds,
        startDate,
        endDate,
      });
      if (res.success) {
        setAvailabilityResult(res.data);
        if (res.data.available) {
          success('All selected machines are available for these dates!');
        } else {
          error(res.data.message);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to verify availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCreateBooking = async () => {
    if (items.length === 0) {
      error('Please select at least one machinery item');
      return;
    }
    setBookingLoading(true);
    try {
      const payload = {
        startDate,
        endDate,
        items: items.map((item) => ({
          equipmentId: Number(item.equipmentId),
          rentalType: item.rentalType,
          quantity: Number(item.quantity),
          duration: Number(item.duration),
        })),
      };

      const res = await rentalApi.create(payload);
      if (res.success && res.data) {
        success('Booking reserved! Please complete payment to confirm.');
        navigate(`/payments/checkout?rentalId=${res.data.rentalId}`);
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to create rental booking');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Reserve Equipment Booking"
        subtitle="Configure rental dates, select machinery, and confirm availability"
      />

      {/* Outstanding Maintenance Warning */}
      {maintenanceSummary?.hasOutstandingDues && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-bold">New Machinery Rentals Locked</strong>
              <span className="text-xs text-rose-800">
                You have pending maintenance/repair dues of{' '}
                <strong className="font-bold">{formatCurrency(maintenanceSummary.outstandingAmount)} LKR</strong>.
                All outstanding maintenance charges must be settled before booking additional equipment.
              </span>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="shrink-0 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Review Invoices
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {/* Date Selection Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-heading font-bold text-advantis-900 mb-4 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-advantis-600" />
            1. Rental Schedule Dates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date (Required)"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setAvailabilityResult(null);
              }}
              required
            />
            <Input
              label="Expected Return Date (Required)"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setAvailabilityResult(null);
              }}
              required
            />
          </div>
        </div>

        {/* Selected Equipment Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-heading font-bold text-advantis-900">2. Machinery Items & Duration</h3>
            <Button variant="outline" size="sm" icon={Plus} onClick={addItem}>
              Add Equipment Item
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
              <p className="text-sm text-slate-500">No machinery selected yet.</p>
              <Button variant="secondary" size="sm" className="mt-2" onClick={addItem}>
                Add an Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const selectedEq = equipmentList.find((e) => String(e.equipmentId) === String(item.equipmentId));
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-end"
                  >
                    <div className="flex-1 w-full">
                      <Select
                        label="Equipment"
                        value={item.equipmentId}
                        onChange={(e) => updateItem(idx, 'equipmentId', e.target.value)}
                        options={equipmentList.map((eq) => ({
                          value: eq.equipmentId,
                          label: `${eq.equipmentCode} - ${eq.equipmentName} (${formatCurrency(eq.dailyRate)}/day)`,
                        }))}
                      />
                    </div>

                    <div className="w-full md:w-36">
                      <Select
                        label="Rental Type"
                        value={item.rentalType}
                        onChange={(e) => updateItem(idx, 'rentalType', e.target.value)}
                        options={[
                          { value: RENTAL_TYPE.HOURLY, label: 'Hourly' },
                          { value: RENTAL_TYPE.DAILY, label: 'Daily' },
                          { value: RENTAL_TYPE.MONTHLY, label: 'Monthly' },
                        ]}
                      />
                    </div>

                    <div className="w-full md:w-28">
                      <Input
                        label="Duration"
                        type="number"
                        min="1"
                        step="1"
                        value={item.duration}
                        onChange={(e) => updateItem(idx, 'duration', e.target.value)}
                      />
                    </div>


                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => removeItem(idx)}
                      className="shrink-0 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Availability Banner & Actions */}
        {availabilityResult && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              availabilityResult.available
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {availabilityResult.available ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{availabilityResult.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            loading={checkingAvailability}
            onClick={handleCheckAvailability}
          >
            Check Date Availability
          </Button>

          {maintenanceSummary?.hasOutstandingDues ? (
            <Button
              variant="danger"
              size="lg"
              disabled
              icon={Lock}
              className="opacity-70 cursor-not-allowed"
            >
              Booking Locked (Dues: {formatCurrency(maintenanceSummary.outstandingAmount)} LKR)
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              loading={bookingLoading}
              onClick={handleCreateBooking}
            >
              Proceed to Payment Checkout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
