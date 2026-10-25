import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { equipmentApi } from '../modules/equipment/api/equipmentApi';
import { categoryApi } from '../modules/equipment/api/categoryApi';
import { formatCurrency } from '../utils/formatters';
import { getEquipmentImage, HERO_EQUIPMENT_SLIDES, handleImageError } from '../utils/equipmentImages';
import { BRAND } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HardHat,
  PhoneCall,
  UserCheck,
  Coins,
  Layers,
} from 'lucide-react';

export const HomePage = () => {
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Real backend data for popular equipment & categories
  const [popularEquipment, setPopularEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-advance hero slides every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_EQUIPMENT_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Fetch real equipment & categories from backend
  useEffect(() => {
    Promise.all([
      equipmentApi.getAll().catch(() => ({ data: [] })),
      categoryApi.getAll().catch(() => ({ data: [] })),
    ])
      .then(([eqRes, catRes]) => {
        const list = eqRes.data || eqRes || [];
        if (Array.isArray(list)) {
          const activeList = list.filter((e) => e.isActive !== false && e.is_active !== false);
          // Select available or distinctive machinery to showcase
          const available = activeList.filter((e) => e.status === 'AVAILABLE');
          setPopularEquipment(available.length >= 6 ? available.slice(0, 6) : activeList.slice(0, 6));
        }
        const cats = catRes.data || catRes || [];
        if (Array.isArray(cats)) {
          const cleanCats = cats.filter(
            (cat) =>
              cat.isActive !== false &&
              !/^(Cat-|EquipCat-|CustRuleCat-|M5 Cat|Test)/i.test(cat.categoryName)
          );
          setCategories(cleanCats.slice(0, 6));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const slide = HERO_EQUIPMENT_SLIDES[currentSlide];

  return (
    <div className="bg-white text-[#263746] flex flex-col font-sans">

      {/* ============================================================ */}
      {/* 1. HERO SECTION WITH DYNAMIC ROTATING CROSSFADE               */}
      {/* ============================================================ */}
      <section
        className="relative bg-gradient-to-br from-[#1C5D94] via-[#2473B5] to-[#368BD1] overflow-hidden border-b border-[#DFE8F0]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Image Carousel with Smooth Crossfade */}
        <div className="absolute inset-0 z-0">
          {HERO_EQUIPMENT_SLIDES.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-30 scale-105 transition-transform duration-7000' : 'opacity-0 scale-100'
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => handleImageError(e, item.image)}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
          {/* Subtle gradient overlays for contrast & legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#154874]/95 via-[#1C5D94]/90 to-[#2473B5]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#154874] via-transparent to-[#154874]/60" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Main Copy */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-bold text-white backdrop-blur-md shadow-xs font-heading uppercase tracking-wider">
                <HardHat className="h-4 w-4 text-blue-200" />
                <span>Sri Lanka's Premier Heavy Machinery Fleet</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white leading-tight sm:leading-none">
                Reliable Construction Equipment.{' '}
                <span className="text-[#A4D0F2] block mt-2">
                  Ready for Your Next Project.
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-blue-50 max-w-2xl leading-relaxed">
                Rent quality construction equipment with simple booking, transparent pricing and reliable service. Powering infrastructure, commercial and residential works across Sri Lanka.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/equipment"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold text-sm bg-white text-[#2473B5] hover:bg-[#F5F9FC] transition-all shadow-lg hover:shadow-xl active:scale-95 uppercase tracking-wider"
                >
                  <Truck className="h-4 w-4 text-[#368BD1]" />
                  <span>Browse Equipment</span>
                </Link>

                <Link
                  to={isAuthenticated ? (isCustomer ? '/rentals/new' : '/dashboard') : '/register'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold text-sm bg-white/10 text-white hover:bg-white/20 border border-white/30 transition-all active:scale-95 uppercase tracking-wider"
                >
                  <span>{isAuthenticated ? 'Reserve Machinery' : 'Get Started'}</span>
                  <ArrowRight className="h-4 w-4 text-blue-200" />
                </Link>
              </div>

              {/* Key Highlights Checklist */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Zero Upfront Deposit</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Island-wide Dispatch</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Inspected Machinery</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Carousel Focus Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden bg-white/95 border border-white/40 shadow-2xl p-4 sm:p-5 backdrop-blur-xl text-[#263746]">
                {/* Active Machinery Image Preview */}
                <div className="relative h-60 sm:h-72 rounded-xl overflow-hidden bg-[#F5F9FC]">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    onError={(e) => handleImageError(e, slide.image)}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-2xs font-heading font-bold uppercase tracking-wider bg-[#368BD1] text-white shadow-xs">
                      {slide.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-2xs font-heading font-bold text-[#263746] bg-white/95 border border-[#DFE8F0] shadow-2xs">
                      {slide.badge}
                    </span>
                  </div>
                </div>

                {/* Machinery Details Bar */}
                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-heading font-bold text-[#263746] tracking-tight">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-[#657786] mt-0.5">
                      {slide.subtitle}
                    </p>
                  </div>
                  <Link
                    to="/equipment"
                    className="p-2 rounded-lg bg-[#368BD1] text-white hover:bg-[#2473B5] transition-colors shadow-xs"
                    title="View in catalog"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Carousel Controls */}
                <div className="mt-4 pt-3 border-t border-[#DFE8F0] flex items-center justify-between">
                  {/* Indicators */}
                  <div className="flex items-center gap-1.5">
                    {HERO_EQUIPMENT_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentSlide
                            ? 'w-6 bg-[#368BD1]'
                            : 'w-2 bg-[#DFE8F0] hover:bg-[#A4D0F2]'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Prev/Next buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setCurrentSlide(
                          (prev) => (prev - 1 + HERO_EQUIPMENT_SLIDES.length) % HERO_EQUIPMENT_SLIDES.length
                        )
                      }
                      className="p-1.5 rounded-lg bg-[#F5F9FC] text-[#263746] hover:bg-[#DFE8F0] transition-colors cursor-pointer border border-[#DFE8F0]"
                      aria-label="Previous equipment"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSlide((prev) => (prev + 1) % HERO_EQUIPMENT_SLIDES.length)
                      }
                      className="p-1.5 rounded-lg bg-[#F5F9FC] text-[#263746] hover:bg-[#DFE8F0] transition-colors cursor-pointer border border-[#DFE8F0]"
                      aria-label="Next equipment"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. STATS / CREDIBILITY BANNER                                */}
      {/* ============================================================ */}
      <section className="bg-[#F5F9FC] border-b border-[#DFE8F0] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-white border border-[#DFE8F0] shadow-xs">
              <span className="text-2xl sm:text-3xl font-heading font-black text-[#368BD1] tabular-nums">100+</span>
              <p className="text-xs text-[#657786] font-heading font-medium mt-1">Available Fleet Units</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#DFE8F0] shadow-xs">
              <span className="text-2xl sm:text-3xl font-heading font-black text-[#263746] tabular-nums">0%</span>
              <p className="text-xs text-[#657786] font-heading font-medium mt-1">Upfront Deposit Required</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#DFE8F0] shadow-xs">
              <span className="text-2xl sm:text-3xl font-heading font-black text-[#368BD1] tabular-nums">9</span>
              <p className="text-xs text-[#657786] font-heading font-medium mt-1">Provinces Served in Sri Lanka</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#DFE8F0] shadow-xs">
              <span className="text-2xl sm:text-3xl font-heading font-black text-[#263746] tabular-nums">24/7</span>
              <p className="text-xs text-[#657786] font-heading font-medium mt-1">On-Site Breakdown Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. POPULAR EQUIPMENT SHOWCASE (REAL BACKEND DATA)             */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-[#368BD1] uppercase tracking-widest mb-2">
                <Truck className="h-4 w-4" />
                <span>Featured Machinery</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#263746] tracking-tight">
                Popular Construction Equipment
              </h2>
              <p className="text-sm text-[#657786] mt-2 max-w-xl">
                Inspect our most in-demand earthmoving, compaction, and concrete equipment ready for dispatch.
              </p>
            </div>

            <Link
              to="/equipment"
              className="inline-flex items-center gap-2 text-sm font-heading font-bold text-[#368BD1] hover:text-[#2473B5] transition-colors group self-start md:self-auto uppercase tracking-wider"
            >
              <span>View Full Fleet Catalog</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Equipment Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularEquipment.map((item) => {
              const image = getEquipmentImage(item);
              const isAvailable = item.status === 'AVAILABLE';

              return (
                <div
                  key={item.equipmentId}
                  className="group rounded-2xl bg-white border border-[#DFE8F0] hover:border-[#368BD1] transition-all duration-300 shadow-xs hover:shadow-lg flex flex-col overflow-hidden"
                >
                  {/* Equipment Photography */}
                  <div
                    onClick={() => navigate(`/equipment/${item.equipmentId}`)}
                    className="relative h-48 bg-[#F5F9FC] overflow-hidden cursor-pointer"
                  >
                    <img
                      src={image}
                      alt={item.equipmentName}
                      onError={(e) => handleImageError(e, image)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-heading font-bold uppercase tracking-wider ${
                          isAvailable
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-amber-500 text-white shadow-xs'
                        }`}
                      >
                        {item.status || 'AVAILABLE'}
                      </span>
                    </div>

                    {/* Code Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="font-mono text-3xs font-semibold px-2 py-0.5 rounded bg-white/95 text-[#263746] border border-[#DFE8F0] shadow-xs">
                        {item.equipmentCode}
                      </span>
                    </div>

                    {/* Category Label at bottom of image */}
                    <div className="absolute bottom-2.5 left-3">
                      <span className="text-2xs font-heading font-semibold text-white drop-shadow-sm uppercase tracking-wider">
                        {item.categoryName || 'Heavy Machinery'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3
                        onClick={() => navigate(`/equipment/${item.equipmentId}`)}
                        className="text-lg font-heading font-bold text-[#263746] group-hover:text-[#368BD1] transition-colors line-clamp-1 cursor-pointer"
                      >
                        {item.equipmentName}
                      </h3>
                      <p className="text-xs text-[#657786] mt-1">
                        {item.brand ? `${item.brand} ${item.model || ''}` : 'Industrial Grade Heavy Unit'}
                      </p>
                    </div>

                    {/* Rates & Specs */}
                    <div className="pt-3 border-t border-[#DFE8F0] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-3xs uppercase font-heading font-semibold text-[#657786] block tracking-wider">
                          Daily Hire Rate
                        </span>
                        <span className="text-base font-heading font-black text-[#263746] tabular-nums">
                          {formatCurrency(item.dailyRate)}
                        </span>
                        <span className="text-3xs text-[#657786] block">/ day</span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xs uppercase font-heading font-semibold text-[#657786] block tracking-wider">
                          Fleet Yard
                        </span>
                        <span className="text-xs font-semibold text-[#263746] mt-1 inline-block">
                          {item.location || 'Central Depot'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                      <Link
                        to={`/equipment/${item.equipmentId}`}
                        className="block w-full text-center py-2.5 px-3 rounded-xl text-xs font-heading font-bold uppercase tracking-wider bg-[#368BD1] text-white hover:bg-[#2473B5] transition-colors shadow-xs"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. WHY CHOOSE US (SRI LANKAN CONTRACTOR VALUE PROP)          */}
      {/* ============================================================ */}
      <section id="why-us" className="py-16 sm:py-24 bg-[#F5F9FC] border-t border-[#DFE8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-heading font-bold text-[#368BD1] uppercase tracking-widest">
              Built for Sri Lankan Contractors
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#263746] tracking-tight">
              Why Partner with LK Construction Rental?
            </h2>
            <p className="text-sm text-[#657786]">
              We eliminate project downtime with well-maintained machinery, direct booking, and fair transparent terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DFE8F0] hover:border-[#368BD1]/50 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F2FA] text-[#368BD1] flex items-center justify-center border border-[#DFE8F0]">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#263746]">Transparent LKR Pricing</h3>
              <p className="text-xs text-[#657786] leading-relaxed">
                Clear, upfront hourly, daily, and monthly rates in Sri Lankan Rupees. No hidden yard fees, surprise administrative charges, or deposit lock-ins.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DFE8F0] hover:border-[#368BD1]/50 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F2FA] text-[#368BD1] flex items-center justify-center border border-[#DFE8F0]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#263746]">Zero Deposit Policy</h3>
              <p className="text-xs text-[#657786] leading-relaxed">
                We believe in simple, accessible equipment hire. Qualified contractors and registered builders enjoy zero upfront security deposits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DFE8F0] hover:border-[#368BD1]/50 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F2FA] text-[#368BD1] flex items-center justify-center border border-[#DFE8F0]">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#263746]">Island-wide Logistics</h3>
              <p className="text-xs text-[#657786] leading-relaxed">
                Direct low-bed trailer transport to your work site anywhere in Sri Lanka—from urban Colombo high-rises to rural Southern and Central highway projects.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DFE8F0] hover:border-[#368BD1]/50 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F2FA] text-[#368BD1] flex items-center justify-center border border-[#DFE8F0]">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#263746]">Strict Maintenance Standards</h3>
              <p className="text-xs text-[#657786] leading-relaxed">
                Every machine undergoes routine multi-point hydraulic, engine, and electrical inspections before leaving our yard to ensure 100% on-site reliability.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DFE8F0] hover:border-[#368BD1]/50 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F2FA] text-[#368BD1] flex items-center justify-center border border-[#DFE8F0]">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#263746]">Rapid Island-Wide Delivery</h3>
              <p className="text-xs text-[#657786] leading-relaxed">
                Direct lowbed transportation dispatch to your project work site across Western, Southern, Central, and North-Western provinces on schedule.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DFE8F0] hover:border-[#368BD1]/50 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F2FA] text-[#368BD1] flex items-center justify-center border border-[#DFE8F0]">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#263746]">Flexible Rental Durations</h3>
              <p className="text-xs text-[#657786] leading-relaxed">
                From emergency single-day breakdown replacements to multi-month infrastructure contracts, easily scale your machinery requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. EQUIPMENT SHOWCASE CATEGORIES                             */}
      {/* ============================================================ */}
      <section id="categories" className="py-16 sm:py-24 bg-white border-t border-[#DFE8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-heading font-bold text-[#368BD1] uppercase tracking-widest">
              Comprehensive Machinery Inventory
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#263746] tracking-tight">
              Equipment Categories for Every Job
            </h2>
            <p className="text-sm text-[#657786]">
              Browse our diverse fleet tailored for Sri Lankan construction, civil engineering, and road development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HERO_EQUIPMENT_SLIDES.map((cat) => (
              <div
                key={cat.id}
                className="group relative rounded-2xl overflow-hidden bg-white border border-[#DFE8F0] hover:border-[#368BD1] transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <div className="h-56 bg-[#F5F9FC] overflow-hidden relative">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    onError={(e) => handleImageError(e, cat.image)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-2xs font-heading font-bold uppercase tracking-wider bg-white/95 text-[#368BD1] border border-[#DFE8F0] shadow-xs">
                      {cat.tag}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-heading font-bold text-[#263746] group-hover:text-[#368BD1] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#657786] leading-relaxed">
                    {cat.subtitle}
                  </p>
                  <div className="pt-3 flex items-center justify-between border-t border-[#DFE8F0]/60">
                    <span className="text-2xs text-[#657786] font-semibold">{cat.badge}</span>
                    <Link
                      to={cat.categoryName ? `/equipment?category=${encodeURIComponent(cat.categoryName)}` : '/equipment'}
                      className="inline-flex items-center gap-1 text-xs font-heading font-bold text-[#368BD1] hover:text-[#2473B5] uppercase tracking-wider"
                    >
                      <span>Explore category</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. CALL TO ACTION (CTA) SECTION                              */}
      {/* ============================================================ */}
      <section id="contact" className="py-20 bg-gradient-to-r from-[#368BD1] via-[#2473B5] to-[#1C5D94] border-t border-[#DFE8F0] relative overflow-hidden text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-heading font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powering Sri Lankan Infrastructure</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight">
            Ready to Power Your Construction Project?
          </h2>

          <p className="text-base text-blue-50 max-w-2xl mx-auto leading-relaxed">
            Connect with Sri Lanka's most dependable machinery partner. Check live equipment availability, compare daily hire rates, and book online in minutes.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/equipment"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-heading font-bold uppercase tracking-wider bg-white text-[#2473B5] hover:bg-[#F5F9FC] transition-all shadow-xl active:scale-95"
            >
              <Truck className="h-4 w-4 text-[#368BD1]" />
              <span>Browse Full Equipment Fleet</span>
            </Link>

            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-heading font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 border border-white/30 transition-all active:scale-95"
            >
              <span>{isAuthenticated ? 'Go to Client Portal' : 'Register Contractor Account'}</span>
              <ArrowRight className="h-4 w-4 text-blue-200" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
