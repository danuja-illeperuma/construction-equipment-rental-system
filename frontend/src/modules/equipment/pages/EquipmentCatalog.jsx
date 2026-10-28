import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { equipmentApi } from '../api/equipmentApi';
import { categoryApi } from '../api/categoryApi';
import { formatCurrency, formatCompactRate } from '../../../utils/formatters';
import { getEquipmentImage, handleImageError } from '../../../utils/equipmentImages';
import { BRAND } from '../../../utils/constants';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import {
  Truck,
  Plus,
  MapPin,
  ShieldCheck,
  UserCheck,
  Search,
  Eye,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const EquipmentCatalog = () => {
  const [fullEquipmentList, setFullEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryName = searchParams.get('category') || 'ALL';
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const { isCustomer, isAuthenticated } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [equipRes, catRes] = await Promise.all([
        equipmentApi.getAll(), // Fetch all equipment once
        categoryApi.getAll(),
      ]);
      
      if (equipRes.success || equipRes.data) {
        const list = equipRes.data || equipRes || [];
        setFullEquipmentList(Array.isArray(list) ? list : []);
      }
      
      if (catRes.success || catRes.data) {
        const rawCats = catRes.data || catRes || [];
        const cleanCats = Array.isArray(rawCats)
          ? rawCats.filter(
              (cat) =>
                cat.isActive !== false &&
                !/^(Cat-|EquipCat-|CustRuleCat-|M5 Cat|Test)/i.test(cat.categoryName)
            )
          : [];
        setCategories(cleanCats);
      }
    } catch (err) {
      console.error('Failed to load fleet data:', err);
      setError(err.message || 'Failed to connect to the fleet registry. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const filteredEquipment = useMemo(() => {
    return fullEquipmentList.filter(eq => {
      // Must be active
      if (eq.isActive === false || eq.is_active === false) return false;

      // Category match
      if (selectedCategoryName !== 'ALL') {
        const eqCatName = (eq.categoryName || '').toUpperCase();
        if (eqCatName !== selectedCategoryName.toUpperCase()) {
          return false;
        }
      }

      // Search match
      if (search.trim()) {
        const query = search.toLowerCase();
        const textToSearch = `${eq.equipmentName || ''} ${eq.model || ''} ${eq.brand || ''} ${eq.equipmentCode || ''} ${eq.categoryName || ''}`.toLowerCase();
        if (!textToSearch.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [fullEquipmentList, selectedCategoryName, search]);

  const handleCategorySelect = (catName) => {
    const newParams = new URLSearchParams(searchParams);
    if (!catName || catName === 'ALL') {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    setSearchParams(newParams);
  };

  const getResultText = () => {
    const count = filteredEquipment.length;
    if (selectedCategoryName === 'ALL') {
      return `${count} machine${count === 1 ? '' : 's'} found`;
    }
    return `${count} ${selectedCategoryName} found`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-advantis-50 border border-advantis-200 text-xs font-heading font-bold text-advantis-900 mb-2 uppercase tracking-wider">
            <Truck className="h-3.5 w-3.5 text-advantis-600" />
            <span>{BRAND.name} Fleet</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-bold text-advantis-900 tracking-tight">
            Find the right equipment for your project.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Browse our commercial machinery fleet across Sri Lanka. Heavy excavators, backhoe loaders, road rollers, concrete mixers, diesel generators, and dewatering pumps ready for immediate dispatch.
          </p>
        </div>

        {!isCustomer && isAuthenticated && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/equipment/manage')}
            className="shrink-0 font-heading font-bold uppercase tracking-wider"
          >
            Manage Equipment
          </Button>
        )}
      </div>

      {/* Category Chips and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#DFE8F0] p-5 shadow-xs space-y-5">
        {/* Horizontal Category Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCategorySelect('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all border uppercase tracking-wider ${
              selectedCategoryName === 'ALL'
                ? 'bg-[#368BD1] text-white border-[#368BD1] shadow-xs'
                : 'bg-white text-[#657786] border-[#DFE8F0] hover:bg-[#F5F9FC] hover:text-[#263746]'
            }`}
          >
            All
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.categoryId}
              onClick={() => handleCategorySelect(cat.categoryName)}
              className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all border uppercase tracking-wider ${
                selectedCategoryName.toUpperCase() === (cat.categoryName || '').toUpperCase()
                  ? 'bg-[#368BD1] text-white border-[#368BD1] shadow-xs'
                  : 'bg-white text-[#657786] border-[#DFE8F0] hover:bg-[#F5F9FC] hover:text-[#263746]'
              }`}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>

        {/* Search & Result Count */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-t border-[#DFE8F0] pt-5">
          <div className="relative w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657786]">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search equipment by name, brand, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F9FC] border border-[#DFE8F0] rounded-xl text-sm text-[#263746] placeholder-[#657786] focus:outline-none focus:ring-2 focus:ring-[#5BA9E6]/30 focus:border-[#368BD1] transition-colors"
            />
          </div>
          
          <div className="text-xs font-heading font-bold text-[#263746] bg-[#F5F9FC] border border-[#DFE8F0] px-4 py-2 rounded-lg shrink-0 uppercase tracking-wider">
            {getResultText()}
          </div>
        </div>
      </div>

      {/* Error Notification Banner */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchData}
            className="border-rose-300 text-rose-700 hover:bg-rose-100 shrink-0 self-start sm:self-auto"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Zero Deposit Callout Banner */}
      <div className="bg-[#F5F9FC] border border-[#DFE8F0] border-l-4 border-l-[#368BD1] p-4 rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#368BD1] text-white font-heading font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-heading font-bold text-[#263746] text-sm">Pre-Approved Zero Upfront Deposit Hire</span>
            <p className="text-[#657786] mt-0.5">
              Standard rentals in Sri Lanka require no upfront cash deposit. Pay for machine usage via direct bank transfer or corporate invoicing.
            </p>
          </div>
        </div>
        <div className="text-[#657786] font-heading font-semibold shrink-0 uppercase tracking-wider text-2xs">
          Island-wide Yard Dispatch &bull; Mon–Sat 7AM–7PM
        </div>
      </div>

      {/* Equipment Machinery Grid */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : filteredEquipment.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={
            search
              ? `No machinery matching "${search}"`
              : selectedCategoryName !== 'ALL'
              ? `No equipment found under ${selectedCategoryName}`
              : 'No equipment available in the fleet'
          }
          description={
            search
              ? 'Try adjusting your search terms or clearing the category filter.'
              : 'Try selecting a different category or click below to view the entire fleet.'
          }
          action={
            <div className="flex items-center justify-center gap-3">
              {search && (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              )}
              {selectedCategoryName !== 'ALL' && (
                <Button variant="primary" onClick={() => handleCategorySelect('ALL')}>
                  View All Equipment
                </Button>
              )}
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredEquipment.map((eq) => {
            const machineImg = getEquipmentImage(eq);
            const isAvailable = eq.status === 'AVAILABLE';

            return (
              <div
                key={eq.equipmentId}
                className="bg-white rounded-2xl border border-[#DFE8F0] shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:border-[#368BD1] transition-all duration-300 group"
              >
                {/* Machinery Photography Container */}
                <div
                  className="relative h-48 bg-[#F5F9FC] overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/equipment/${eq.equipmentId}`)}
                >
                  <img
                    src={machineImg}
                    alt={eq.equipmentName}
                    onError={(e) => handleImageError(e, machineImg)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                  {/* Status Badge in Top Right */}
                  <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={eq.status} />
                  </div>

                  {/* Category Pill in Top Left */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-3xs font-heading font-extrabold uppercase tracking-wider bg-white/95 text-[#368BD1] border border-[#DFE8F0] shadow-xs">
                      {eq.categoryName || 'Heavy Plant'}
                    </span>
                  </div>

                  {/* Equipment Code at bottom left of image */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-3xs font-mono font-bold uppercase tracking-wider bg-[#368BD1] text-white px-2 py-0.5 rounded shadow-xs">
                      {eq.equipmentCode}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3
                      onClick={() => navigate(`/equipment/${eq.equipmentId}`)}
                      className="text-lg font-heading font-bold text-[#263746] tracking-tight group-hover:text-[#368BD1] transition-colors line-clamp-1 cursor-pointer"
                    >
                      {eq.equipmentName}
                    </h3>
                    <p className="text-xs text-[#657786] mt-0.5">
                      {eq.brand || 'Commercial'} {eq.model || ''}
                    </p>

                    {/* Machine Details / Specs */}
                    <div className="mt-3.5 space-y-1.5 text-xs text-[#657786] bg-[#F5F9FC] p-3 rounded-xl border border-[#DFE8F0]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#657786] font-medium">Yard Location:</span>
                        <span className="font-semibold text-[#263746] flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#368BD1]" />
                          {eq.location || 'Central Depot'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#657786] font-medium">Fleet Code:</span>
                        <span className="font-mono text-3xs font-bold text-[#263746]">
                          {eq.equipmentCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rates Breakdown */}
                  <div>
                    <div className="pt-3 border-t border-[#DFE8F0] space-y-2">
                      {/* Featured Daily Rate */}
                      <div className="bg-[#E8F2FA] px-3 py-2 rounded-xl border border-[#A4D0F2] flex items-center justify-between">
                        <span className="text-3xs uppercase font-heading font-extrabold tracking-wider text-[#2473B5]">
                          Daily Hire
                        </span>
                        <div className="text-right min-w-0">
                          <span
                            className="text-sm font-heading font-black text-[#263746] tabular-nums"
                            title={formatCurrency(eq.dailyRate)}
                          >
                            {formatCompactRate(eq.dailyRate)}
                          </span>
                          <span className="text-3xs text-[#657786] font-medium ml-1">/day</span>
                        </div>
                      </div>

                      {/* Secondary Rates (Hourly & Monthly) */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#F5F9FC] px-2.5 py-1.5 rounded-lg border border-[#DFE8F0] min-w-0">
                          <span className="block text-3xs text-[#657786] uppercase font-heading font-bold tracking-wider">
                            Hourly
                          </span>
                          <span
                            className="text-xs font-heading font-bold text-[#263746] tabular-nums truncate block"
                            title={formatCurrency(eq.hourlyRate)}
                          >
                            {formatCompactRate(eq.hourlyRate)}
                            <span className="text-3xs font-normal text-[#657786] ml-0.5">/hr</span>
                          </span>
                        </div>
                        <div className="bg-[#F5F9FC] px-2.5 py-1.5 rounded-lg border border-[#DFE8F0] min-w-0">
                          <span className="block text-3xs text-[#657786] uppercase font-heading font-bold tracking-wider">
                            Monthly
                          </span>
                          <span
                            className="text-xs font-heading font-bold text-[#263746] tabular-nums truncate block"
                            title={formatCurrency(eq.monthlyRate)}
                          >
                            {formatCompactRate(eq.monthlyRate)}
                            <span className="text-3xs font-normal text-[#657786] ml-0.5">/mo</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Eye}
                        onClick={() => navigate(`/equipment/${eq.equipmentId}`)}
                        className="w-full text-xs font-bold"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EquipmentCatalog;
