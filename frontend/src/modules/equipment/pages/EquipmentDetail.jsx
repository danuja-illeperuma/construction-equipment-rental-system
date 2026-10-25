import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { equipmentApi } from '../api/equipmentApi';
import { rentalApi } from '../../rental/api/rentalApi';
import { maintenanceApi } from '../../maintenance/api/maintenanceApi';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { getEquipmentImage, handleImageError } from '../../../utils/equipmentImages';
import { BRAND } from '../../../utils/constants';
import { EquipmentStatusBadge } from '../../../components/equipment/EquipmentStatusBadge';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  CalendarCheck,
  Truck,
  MapPin,
  Tag,
  Wrench,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  Zap,
  Layers,
  FileText,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowRight,
  Calendar,
  Sparkles,
  Info,
  Lock,
} from 'lucide-react';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFutureDateString = (daysToAdd) => {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [equipment, setEquipment] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isCustomer, isAuthenticated } = useAuth();

  // Phase 4 & Phase 2 Rental Selection State (preserves params on Edit Rental)
  const navEdit = location.state?.editConfig;
  const initRentalType = searchParams.get('rentalType') || navEdit?.rentalType || 'DAILY';
  const initStartDate = searchParams.get('startDate') || navEdit?.startDate || getTodayString();
  const initEndDate = searchParams.get('endDate') || navEdit?.endDate || getFutureDateString(3);
  const initHours = parseInt(searchParams.get('hours') || navEdit?.hours || navEdit?.duration, 10) || 8;

  const [selectedRentalType, setSelectedRentalType] = useState(initRentalType);
  const [startDate, setStartDate] = useState(initStartDate);
  const [endDate, setEndDate] = useState(initEndDate);
  const [hourlyHours, setHourlyHours] = useState(initHours);
  const quantity = 1;
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [customerMaintenanceSummary, setCustomerMaintenanceSummary] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);

    const isStaffOrAdmin = isAuthenticated && !isCustomer;
    const fetchPromises = [equipmentApi.getById(id)];

    if (isStaffOrAdmin) {
      fetchPromises.push(maintenanceApi.getAll({ equipmentId: id }).catch(() => ({ data: [] })));
    }

    if (isAuthenticated && isCustomer) {
      maintenanceApi.getMyCharges()
        .then((res) => {
          if (res?.success && res?.data) {
            setCustomerMaintenanceSummary(res.data);
          }
        })
        .catch(() => setCustomerMaintenanceSummary(null));
    }

    Promise.all(fetchPromises)
      .then(([eqRes, maintRes]) => {
        if (eqRes.success || eqRes.data) {
          setEquipment(eqRes.data || eqRes);
        } else {
          setEquipment(null);
        }
        if (maintRes && (maintRes.success || maintRes.data)) {
          setMaintenanceHistory(maintRes.data || []);
        } else {
          setMaintenanceHistory([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load equipment details:', err);
        setError(err.message || 'Unable to retrieve equipment details.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Only display rental types that have valid rates in the database
  const availableRentalTypes = useMemo(() => {
    if (!equipment) return [];
    const types = [];
    if (equipment.hourlyRate != null && Number(equipment.hourlyRate) > 0) {
      types.push({
        type: 'HOURLY',
        label: 'Hourly',
        rate: Number(equipment.hourlyRate),
        unit: '/ hr',
      });
    }
    if (equipment.dailyRate != null && Number(equipment.dailyRate) > 0) {
      types.push({
        type: 'DAILY',
        label: 'Daily',
        rate: Number(equipment.dailyRate),
        unit: '/ day',
      });
    }
    if (equipment.monthlyRate != null && Number(equipment.monthlyRate) > 0) {
      types.push({
        type: 'MONTHLY',
        label: 'Monthly',
        rate: Number(equipment.monthlyRate),
        unit: '/ month',
      });
    }
    return types;
  }, [equipment]);

  // Initialize selected type once available types are computed
  useEffect(() => {
    if (availableRentalTypes.length > 0) {
      const preferred = searchParams.get('rentalType') || navEdit?.rentalType || selectedRentalType;
      const matched = availableRentalTypes.find((t) => t.type === preferred?.toUpperCase());

      if (matched) {
        setSelectedRentalType(matched.type);
      } else {
        const hasDaily = availableRentalTypes.some((t) => t.type === 'DAILY');
        if (hasDaily) {
          setSelectedRentalType('DAILY');
          if (!searchParams.get('endDate') && !navEdit?.endDate) {
            setEndDate(getFutureDateString(3));
          }
        } else {
          const firstType = availableRentalTypes[0].type;
          setSelectedRentalType(firstType);
          if (!searchParams.get('endDate') && !navEdit?.endDate) {
            if (firstType === 'HOURLY') {
              setEndDate(startDate);
            } else if (firstType === 'MONTHLY') {
              setEndDate(getFutureDateString(30));
            }
          }
        }
      }
    }
  }, [availableRentalTypes]);

  // Parameter Change Handlers (Invalidates previous availability check)
  const handleRentalTypeChange = (newType) => {
    setSelectedRentalType(newType);
    setAvailabilityResult(null);

    if (newType === 'HOURLY') {
      setEndDate(startDate);
    } else if (newType === 'DAILY') {
      if (startDate === endDate) {
        setEndDate(getFutureDateString(3));
      }
    } else if (newType === 'MONTHLY') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
      if (diffDays < 30) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 30);
        setEndDate(d.toISOString().split('T')[0]);
      }
    }
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    setAvailabilityResult(null);
    if (selectedRentalType === 'HOURLY') {
      setEndDate(val);
    } else if (endDate && new Date(endDate) < new Date(val)) {
      setEndDate(val);
    }
  };

  const handleEndDateChange = (val) => {
    setEndDate(val);
    setAvailabilityResult(null);
  };

  const handleHourlyHoursChange = (val) => {
    setHourlyHours(val);
    setAvailabilityResult(null);
  };

  // Authoritative Rental Calculation Logic
  const calculation = useMemo(() => {
    if (!equipment || availableRentalTypes.length === 0) {
      return {
        valid: false,
        duration: 0,
        durationLabel: '',
        total: 0,
        error: 'No rental rates configured for this machinery.',
      };
    }

    const typeObj = availableRentalTypes.find((t) => t.type === selectedRentalType);
    if (!typeObj) {
      return {
        valid: false,
        duration: 0,
        durationLabel: '',
        total: 0,
        error: 'Selected rental scheme is not available.',
      };
    }

    const unitRate = typeObj.rate;

    if (!startDate) {
      return {
        valid: false,
        duration: 0,
        durationLabel: '',
        total: 0,
        error: 'Start date is required.',
      };
    }

    if (!endDate) {
      return {
        valid: false,
        duration: 0,
        durationLabel: '',
        total: 0,
        error: 'End date is required.',
      };
    }

    if (endDate < startDate) {
      return {
        valid: false,
        duration: 0,
        durationLabel: '',
        total: 0,
        error: 'End date cannot be earlier than start date.',
      };
    }

    if (selectedRentalType === 'HOURLY') {
      if (startDate !== endDate) {
        return {
          valid: false,
          duration: 0,
          durationLabel: '',
          total: 0,
          error: 'Hourly rentals must have the same start and end date.',
        };
      }
      const hours = parseInt(hourlyHours, 10);
      if (isNaN(hours) || hours <= 0 || hours > 24) {
        return {
          valid: false,
          duration: 0,
          durationLabel: '',
          total: 0,
          error: 'Hourly duration must be between 1 and 24 hours.',
        };
      }
      const total = Math.round(hours * unitRate * 100) / 100;
      return {
        valid: true,
        duration: hours,
        durationLabel: `${hours} Hour${hours > 1 ? 's' : ''}`,
        unitRate,
        quantity: 1,
        total,
        error: null,
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (selectedRentalType === 'DAILY') {
      const days = diffDays === 0 ? 1 : diffDays;
      const total = Math.round(days * unitRate * 100) / 100;
      return {
        valid: true,
        duration: days,
        durationLabel: `${days} Day${days > 1 ? 's' : ''}`,
        unitRate,
        quantity: 1,
        total,
        error: null,
      };
    }

    if (selectedRentalType === 'MONTHLY') {
      // Backend canonical database formula: 1 month = 30 days
      let months;
      if (diffDays <= 30) {
        months = 1;
      } else {
        months = Math.round((diffDays / 30) * 10) / 10;
      }
      const total = Math.round(months * unitRate * 100) / 100;
      return {
        valid: true,
        duration: months,
        durationLabel: `${months} Month${months > 1 ? 's' : ''} (${diffDays} days)`,
        unitRate,
        quantity: 1,
        total,
        error: null,
      };
    }

    return {
      valid: false,
      duration: 0,
      durationLabel: '',
      total: 0,
      error: 'Invalid rental configuration.',
    };
  }, [equipment, availableRentalTypes, selectedRentalType, startDate, endDate, hourlyHours]);

  // Aggregate multi-angle gallery images and primary photo
  const allImages = useMemo(() => {
    if (!equipment) return [];
    if (Array.isArray(equipment.images) && equipment.images.length > 0) {
      return equipment.images.map((img) => img.imageUrl);
    }
    const single = getEquipmentImage(equipment);
    return single ? [single] : [];
  }, [equipment]);

  // Real Backend Availability Check
  const handleCheckAvailability = async () => {
    if (!calculation.valid) return;

    setCheckingAvailability(true);
    setAvailabilityResult(null);

    try {
      const res = await rentalApi.checkAvailability({
        equipmentId: Number(equipment.equipmentId),
        equipmentIds: [Number(equipment.equipmentId)],
        startDate,
        endDate,
      });

      const isAvail = res?.data?.available ?? res?.data?.isAvailable ?? false;
      const message =
        res?.data?.message ||
        (isAvail
          ? 'Equipment is available for the selected dates.'
          : 'Equipment is not available for this period.');

      setAvailabilityResult({
        isAvailable: isAvail,
        message,
        checkedAt: new Date(),
      });
    } catch (err) {
      console.error('Availability check failed:', err);
      setAvailabilityResult({
        isAvailable: false,
        message: err.message || 'Unable to check availability. Please try again.',
        checkedAt: new Date(),
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Proceed to Rental Quotation (Phase 4)
  const handleProceedToQuotation = () => {
    if (!calculation.valid) return;

    const quotationConfig = {
      equipmentId: equipment.equipmentId,
      equipmentName: equipment.equipmentName,
      equipmentCode: equipment.equipmentCode,
      brand: equipment.brand,
      model: equipment.model,
      categoryName: equipment.categoryName,
      imageUrl: equipment.imageUrl,
      location: equipment.location,
      rentalType: selectedRentalType,
      startDate,
      endDate,
      duration: calculation.duration,
      durationLabel: calculation.durationLabel,
      unitRate: calculation.unitRate,
      quantity: calculation.quantity,
      estimatedTotal: calculation.total,
      hours: hourlyHours,
      availabilityResult: availabilityResult || null,
    };

    try {
      sessionStorage.setItem('cerms_pending_quote', JSON.stringify(quotationConfig));
    } catch (e) {
      // Ignore
    }

    const params = new URLSearchParams({
      equipmentId: String(equipment.equipmentId),
      rentalType: selectedRentalType,
      startDate,
      endDate,
      quantity: String(quantity),
      hours: String(hourlyHours),
    });

    navigate(`/quotation?${params.toString()}`, { state: { quotationConfig } });
  };

  if (loading) return <LoadingSpinner size="lg" />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-16 w-16 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Failed to Load Equipment</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/equipment')}>
            Back to Equipment Fleet
          </Button>
          <Button variant="primary" size="sm" icon={RefreshCw} onClick={loadData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Truck className="h-16 w-16 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Equipment Asset Not Found</h2>
        <p className="text-sm text-slate-500">
          The machinery unit requested does not exist or has been decommissioned.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/equipment')}>
          Back to Equipment Fleet
        </Button>
      </div>
    );
  }

  const currentDisplayImage = allImages[activeImageIndex] || allImages[0] || getEquipmentImage(equipment);
  const isMaintenance = equipment.status === 'MAINTENANCE';
  const isUnderMaintenance = isMaintenance || equipment.isActive === false;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/equipment')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Fleet Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <EquipmentStatusBadge status={equipment.status} />
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="bg-white rounded-3xl border border-[#DFE8F0] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Machinery Photography Section */}
        <div className="lg:col-span-6 relative bg-[#F5F9FC] overflow-hidden min-h-[380px] lg:min-h-full flex flex-col justify-between">
          <div className="relative flex-1 min-h-[280px]">
            <img
              src={currentDisplayImage}
              alt={equipment.equipmentName}
              onError={(e) => handleImageError(e, currentDisplayImage)}
              className="w-full h-full object-cover object-center absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

            {/* Overlay Tag */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-heading font-bold uppercase tracking-wider bg-white/95 text-[#368BD1] border border-[#DFE8F0] shadow-xs">
                {equipment.categoryName || 'Heavy Equipment'}
              </span>
            </div>

            {/* Machine Code & Yard */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <span className="font-mono font-bold text-sm bg-[#368BD1] text-white px-3 py-1 rounded-md shadow-xs">
                {equipment.equipmentCode}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/95 text-[#263746] px-3 py-1 rounded-md backdrop-blur-sm border border-[#DFE8F0] shadow-2xs">
                <MapPin className="h-3.5 w-3.5 text-[#368BD1]" />
                {equipment.location || 'Colombo Main Yard'}
              </span>
            </div>
          </div>

          {/* Multi-angle Gallery Thumbnail Slider */}
          {allImages.length > 1 && (
            <div className="p-2.5 bg-white border-t border-[#DFE8F0] flex items-center gap-2 overflow-x-auto scrollbar-thin">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#368BD1] ring-2 ring-[#368BD1]/30 scale-105'
                      : 'border-[#DFE8F0] opacity-70 hover:opacity-100 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Machinery view ${idx + 1}`}
                    onError={(e) => handleImageError(e, currentDisplayImage)}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Quick specs pill row on footer */}
          <div className="p-4 bg-white border-t border-[#DFE8F0] text-[#657786] text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="h-3.5 w-3.5 text-[#368BD1]" />
              {equipment.location || 'Central Fleet Yard'}
            </span>
            <span className="font-mono text-3xs text-[#657786]">
              Code: {equipment.equipmentCode || 'N/A'}
            </span>
          </div>
        </div>

        {/* Phase 2: Rental Configuration & Real Availability Checker */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-5">
            {/* Title Header */}
            <div>
              <span className="text-3xs font-heading font-bold uppercase tracking-widest text-[#368BD1] block mb-1">
                {equipment.brand || 'Commercial'} Heavy Plant
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#263746] tracking-tight">
                {equipment.equipmentName}
              </h1>
              <p className="text-xs text-[#657786] mt-1">
                Model: <strong className="text-[#263746] font-semibold">{equipment.model || 'Standard Edition'}</strong> &bull; Status:{' '}
                <span className="font-semibold text-[#263746]">{equipment.status}</span>
              </p>
            </div>

            {/* 1. Rental Type Selection (Only valid rates in DB) */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700 block">
                Select Rental Scheme
              </label>

              {availableRentalTypes.length === 0 ? (
                <div className="p-3 bg-equipment-50 border border-equipment-200 rounded-xl text-xs text-equipment-900">
                  No rental rates currently configured for this machinery.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableRentalTypes.map((item) => {
                    const isSelected = selectedRentalType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => handleRentalTypeChange(item.type)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-[#368BD1] text-white border-[#368BD1] shadow-md ring-2 ring-[#5BA9E6]/40'
                            : 'bg-white text-slate-700 border-[#DFE8F0] hover:bg-[#F5F9FC] hover:border-[#368BD1]'
                        }`}
                      >
                        <span
                          className={`text-3xs font-heading font-bold uppercase tracking-wider block ${
                            isSelected ? 'text-sky-100 font-extrabold' : 'text-slate-400'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="text-xs sm:text-sm font-heading font-bold mt-0.5 block tabular-nums">
                          {formatCurrency(item.rate)}
                        </span>
                        <span
                          className={`text-3xs font-medium block ${
                            isSelected ? 'text-slate-200' : 'text-slate-400'
                          }`}
                        >
                          {item.unit}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Schedule Date & Time Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  min={getTodayString()}
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  <span>End Date</span>
                </label>
                <input
                  type="date"
                  min={startDate || getTodayString()}
                  value={endDate}
                  disabled={selectedRentalType === 'HOURLY'}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                    selectedRentalType === 'HOURLY' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            {/* Hourly Rental Specific: Hours on Same Day */}
            {selectedRentalType === 'HOURLY' && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Hourly Duration (Same Calendar Day)</span>
                  </span>
                  <span className="text-xs font-extrabold text-amber-950">{hourlyHours} Hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={hourlyHours}
                    onChange={(e) => handleHourlyHoursChange(e.target.value)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={hourlyHours}
                    onChange={(e) => handleHourlyHoursChange(e.target.value)}
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                  />
                </div>
                <span className="text-3xs text-slate-500 block">
                  Hourly rentals are scheduled within a single calendar day (24-hour limit).
                </span>
              </div>
            )}

            {/* 3. Rental Duration & Estimated Cost Display */}
            {calculation.valid ? (
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Duration:</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {calculation.durationLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Rental Rate ({selectedRentalType.toLowerCase()}):</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(calculation.unitRate)} LKR
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xs font-heading font-extrabold uppercase tracking-wider text-slate-400 block">
                      Estimated Cost (LKR)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-heading font-black text-advantis-950 tabular-nums">
                      {formatCurrency(calculation.total)}
                    </span>
                    <span className="text-3xs font-bold text-slate-500 ml-1">LKR</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{calculation.error}</span>
              </div>
            )}

            {/* 4. Availability Outcome Display */}
            {availabilityResult && (
              <div
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  availabilityResult.isAvailable
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {availabilityResult.isAvailable ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="text-sm font-heading font-bold block">
                      {availabilityResult.isAvailable
                        ? 'Machinery Available for Requested Period!'
                        : 'Machinery Currently Unavailable for Selected Dates'}
                    </strong>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {availabilityResult.message}
                    </p>
                  </div>
                </div>

                {availabilityResult.isAvailable && (
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reserved Period:</span>
                      <span className="font-bold text-slate-800">
                        {formatDate(startDate)} &rarr; {formatDate(endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rental Duration:</span>
                      <span className="font-bold text-slate-800">
                        {calculation.durationLabel}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-emerald-100">
                      <span className="text-slate-700 font-bold">Estimated Total:</span>
                      <span className="font-heading font-bold text-emerald-900 tabular-nums">
                        {formatCurrency(calculation.total)} LKR
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 6. Action CTAs */}
          <div className="space-y-3 pt-2">
            {isUnderMaintenance ? (
              <Button
                variant="secondary"
                size="lg"
                disabled
                className="w-full font-heading font-bold uppercase tracking-wider cursor-not-allowed"
              >
                Machinery Under Maintenance ({equipment.status})
              </Button>
            ) : customerMaintenanceSummary?.hasOutstandingDues ? (
              <div className="space-y-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wide">
                    Rentals Temporarily Locked
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Your account has outstanding equipment maintenance/repair dues totaling{' '}
                  <strong className="font-bold">{formatCurrency(customerMaintenanceSummary.outstandingAmount)} LKR</strong>.
                  Please settle these charges with staff before booking additional machinery.
                </p>
                <Link
                  to="/dashboard"
                  className="block text-center py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  View Maintenance Dues on Dashboard
                </Link>
              </div>
            ) : availabilityResult?.isAvailable ? (
              /* Proceed to Rental Quotation after successful availability check */
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={FileText}
                  onClick={handleProceedToQuotation}
                  className="w-full font-heading font-bold uppercase tracking-wider shadow-lg py-3.5 text-sm"
                >
                  Review Official Rental Quotation
                </Button>
                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={checkingAvailability}
                  className="w-full py-2 text-xs font-heading font-bold text-advantis-700 hover:text-advantis-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${checkingAvailability ? 'animate-spin' : ''}`} />
                  <span>Re-check Live Availability</span>
                </button>
              </div>
            ) : (
              /* Check Availability and Get Quotation Buttons */
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Search}
                  disabled={!calculation.valid || checkingAvailability}
                  onClick={handleCheckAvailability}
                  className="w-full font-heading font-bold uppercase tracking-wider shadow-lg py-3.5"
                >
                  {checkingAvailability ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Checking Live Registry...</span>
                    </div>
                  ) : (
                    'Check Real Equipment Availability'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileText}
                  disabled={!calculation.valid}
                  onClick={handleProceedToQuotation}
                  className="w-full font-heading font-bold uppercase tracking-wider"
                >
                  Get Rental Quotation Directly
                </Button>
              </div>
            )}

            {/* Zero Deposit Callout */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-advantis-50 border border-advantis-200 text-3xs text-slate-700">
              <ShieldCheck className="h-4 w-4 text-advantis-700 shrink-0" />
              <span>
                <strong className="font-heading font-bold text-advantis-900">Pre-Approved Zero Upfront Deposit:</strong> Pay for usage after reservation confirmation via invoice or bank transfer.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Operational Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specifications Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-lg bg-advantis-50 text-advantis-900 font-bold">
              <Truck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-heading font-bold text-advantis-900 uppercase tracking-wider">
              Technical Specifications
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-3xs font-heading text-slate-400 font-semibold block uppercase tracking-wider">
                Equipment Code
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                {equipment.equipmentCode}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-3xs font-heading text-slate-400 font-semibold block uppercase tracking-wider">
                Category
              </span>
              <span className="font-heading font-bold text-slate-800 text-sm mt-0.5 block">
                {equipment.categoryName || 'General Plant'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-3xs font-heading text-slate-400 font-semibold block uppercase tracking-wider">
                Manufacturer Brand
              </span>
              <span className="font-semibold text-slate-700 mt-0.5 block">
                {equipment.brand || 'Commercial'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-3xs font-heading text-slate-400 font-semibold block uppercase tracking-wider">
                Model Designation
              </span>
              <span className="font-semibold text-slate-700 mt-0.5 block">
                {equipment.model || 'Standard'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-3xs font-heading text-slate-400 font-semibold block uppercase tracking-wider">
                Chassis / Serial No.
              </span>
              <span className="font-mono font-semibold text-slate-700 mt-0.5 block">
                {equipment.serialNumber || 'N/A'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-3xs font-heading text-slate-400 font-semibold block uppercase tracking-wider">
                Current Depot Yard
              </span>
              <span className="font-semibold text-slate-700 mt-0.5 block">
                {equipment.location || 'Colombo Depot'}
              </span>
            </div>
          </div>
        </div>

        {/* Operational & Hire Terms */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-lg bg-[#E8F2FA] text-[#2473B5] font-bold">
              <Truck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-heading font-bold text-advantis-900 uppercase tracking-wider">
              Site Logistics & Deployment
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-600 font-medium">Lowbed Transport Delivery:</span>
              <span className="font-semibold text-slate-800">Island-wide dispatch available</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-600 font-medium">Pre-Hire Inspection:</span>
              <span className="font-semibold text-emerald-700">Passed safety certification</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-600 font-medium">Depot Location:</span>
              <span className="font-semibold text-slate-800">{equipment.location || 'Central Fleet Yard'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-advantis-50 border border-advantis-200 text-advantis-900 text-3xs leading-relaxed">
              <strong className="font-heading font-bold">Sri Lanka Site Requirements:</strong> Hirer is responsible for site access clearance and on-site fuel replenishment for diesel-operated machinery during the hire period.
            </div>
          </div>
        </div>
      </div>

      {/* Internal Staff: Maintenance History */}
      {!isCustomer && maintenanceHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-advantis-900 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="h-4 w-4 text-equipment-500" />
              Workshop Maintenance History ({maintenanceHistory.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-[#f0f4f8] text-2xs font-heading font-bold uppercase tracking-wider text-advantis-900 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Maintenance Type</th>
                  <th className="py-2.5 px-3">Cost (LKR)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {maintenanceHistory.map((m) => (
                  <tr key={m.maintenanceId} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500">{formatDate(m.startDate)}</td>
                    <td className="py-2.5 px-3 font-heading font-bold text-slate-800">{m.maintenanceType}</td>
                    <td className="py-2.5 px-3 font-heading font-semibold text-slate-900 tabular-nums">{formatCurrency(m.cost)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-3xs font-heading font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {m.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {m.description || 'Routine service'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetail;
