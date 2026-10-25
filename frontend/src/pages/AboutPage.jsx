import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BRAND } from '../utils/constants';
import { handleImageError } from '../utils/equipmentImages';
import { Button } from '../components/common/Button';

// High-resolution machinery assets
import catExcavator from '../assets/images/equipment/excavator/excavator-01.jpg';
import jcbBackhoe from '../assets/images/equipment/backhoe-loader/backhoe-loader-01.jpg';
import roadRoller from '../assets/images/equipment/road-roller/road-roller-01.jpg';
import concreteMixer from '../assets/images/equipment/concrete-mixer/concrete-mixer-01.jpg';
import generatorImg from '../assets/images/equipment/generator/generator-01.jpg';
import waterPumpImg from '../assets/images/equipment/water-pump/water-pump-01.jpg';

import {
  HardHat,
  ShieldCheck,
  Truck,
  Wrench,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Award,
  ArrowRight,
  PhoneCall,
  CalendarCheck,
  Building2,
  FileCheck,
  Coins,
  ChevronRight,
  Target,
  Compass,
  Sparkles,
} from 'lucide-react';

export const AboutPage = () => {
  const navigate = useNavigate();

  const milestones = [
    {
      year: 'Fleet Readiness',
      title: '100% Inspected Machinery',
      desc: 'Every plant unit undergoes pre-hire hydraulic, engine, and electrical verification before leaving our depot.',
    },
    {
      year: 'Commercial Policy',
      title: 'Zero Upfront Deposit',
      desc: 'Pioneered transparent machinery hire in Sri Lanka without upfront cash lock-ins for verified clients.',
    },
    {
      year: 'Nationwide Reach',
      title: 'Island-wide Site Mobilization',
      desc: 'Rapid lowbed trailer transport dispatched across Western, Central, Southern, and North-Western provinces.',
    },
    {
      year: 'Fleet Quality',
      title: 'Safety & Certified Reliability',
      desc: 'All earthmoving and compaction machinery undergoes strict multi-point safety testing before site mobilization.',
    },
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Safety & Regulatory Compliance',
      description:
        'All equipment complies with Sri Lankan civil engineering safety regulations, complete with load-chart verification, emergency cut-offs, and routine maintenance logs.',
    },
    {
      icon: Wrench,
      title: 'Preventive Multi-Point Servicing',
      description:
        'Our dedicated in-house mechanical engineers perform oil analysis, track tensioning, filter replacements, and stress testing after every rental cycle.',
    },
    {
      icon: Coins,
      title: 'Transparent Sri Lankan Pricing',
      description:
        'We believe in straightforward commercial partnership. Hourly, daily, and monthly rates are stated in LKR upfront with zero surprise yard overheads.',
    },
    {
      icon: Truck,
      title: 'Direct Site Transport Logistics',
      description:
        'Dedicated multi-axle lowbed trailers ensure heavy crawler excavators and tandem rollers arrive on site strictly on your scheduled delivery window.',
    },
    {
      icon: Users,
      title: 'Technical Consultation & Sizing',
      description:
        'Unsure whether your site requires an 8-ton or 20-ton excavator? Our fleet engineers provide free jobsite machinery sizing and suitability advice.',
    },
    {
      icon: Clock,
      title: '24/7 Field Breakdown Support',
      description:
        'Mobile repair vans equipped with critical hydraulic spares, hoses, and replacement consumables ensure minimal downtime during project execution.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Infrastructure Projects Powered', sub: 'Across Sri Lanka' },
    { value: '99.4%', label: 'On-Site Machine Uptime', sub: 'Preventive maintenance standard' },
    { value: '9', label: 'Provinces Served', sub: 'Island-wide lowbed logistics' },
    { value: '0 LKR', label: 'Upfront Security Deposit', sub: 'Pre-approved client terms' },
  ];

  const yards = [
    {
      city: 'Central Logistics Depot (Peliyagoda / Kadawatha)',
      role: 'Heavy Machinery & Crawler Fleet Yard',
      address: 'Kandy Road, Kadawatha, Western Province',
      phone: '+94 11 234 5678',
    },
    {
      city: 'Southern Province Operational Yard (Galle)',
      role: 'Road Construction & Compaction Hub',
      address: 'Expressway Interchange Link, Galle, Southern Province',
      phone: '+94 91 223 4567',
    },
    {
      city: 'Central Province Machinery Depot (Kandy)',
      role: 'Earthmoving & Dewatering Station',
      address: 'Industrial Zone, Katugastota, Central Province',
      phone: '+94 81 238 9012',
    },
  ];

  return (
    <div className="bg-white text-[#263746] font-sans">
      {/* ============================================================ */}
      {/* 1. HERO BANNER                                               */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F9FC] via-[#F5F9FC]/60 to-white border-b border-[#DFE8F0] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F2FA] text-[#2473B5] border border-[#A4D0F2] text-xs font-heading font-bold uppercase tracking-wider">
              <HardHat className="h-4 w-4" />
              <span>About LK Construction Equipment Rental</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#263746] leading-tight">
              Powering Sri Lanka's Construction & Infrastructure Growth
            </h1>

            <p className="text-base sm:text-lg text-[#657786] leading-relaxed">
              We provide construction contractors, civil engineering enterprises, and private developers across Sri Lanka with modern, reliable heavy equipment on flexible hire terms—backed by zero upfront cash deposits, certified equipment safety, and rapid island-wide delivery.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                icon={Truck}
                onClick={() => navigate('/equipment')}
                className="shadow-sm"
              >
                Browse Available Fleet
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={CalendarCheck}
                onClick={() => navigate('/register')}
              >
                Open Contractor Account
              </Button>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#5BA9E6]/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ============================================================ */}
      {/* 2. KEY STATS BANNER                                          */}
      {/* ============================================================ */}
      <section className="py-10 bg-white border-b border-[#DFE8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#F5F9FC] border border-[#DFE8F0] text-center space-y-1"
              >
                <div className="text-2xl sm:text-4xl font-heading font-black text-[#368BD1] tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm font-heading font-bold text-[#263746]">
                  {s.label}
                </div>
                <div className="text-3xs sm:text-xs text-[#657786]">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. OUR STORY & DUAL MISSION / VISION                         */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-heading font-bold text-[#368BD1] uppercase tracking-widest">
                Our Corporate Identity
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-[#263746] tracking-tight">
                Built to Solve Contractor Bottlenecks on Sri Lankan Jobsites
              </h2>
              <div className="space-y-4 text-sm text-[#657786] leading-relaxed">
                <p>
                  Founded to address the critical machinery shortages and high capital expenditure faced by construction firms in Sri Lanka, <strong>LK Construction Equipment Rental</strong> bridges the gap between major infrastructure developers and access to world-class heavy plant equipment.
                </p>
                <p>
                  From Colombo high-rise excavations and urban pipeline projects to the Southern Expressway maintenance corridors and Central Province irrigation schemes, our modern fleet of hydraulic excavators, backhoe loaders, soil compactors, transit mixers, generators, and dewatering pumps ensures contractors never lose project momentum.
                </p>
                <p>
                  We have dismantled the conventional hurdles of equipment hire—replacing cumbersome deposit requirements with a verified <strong>Zero Upfront Deposit Policy</strong>, providing transparent hourly and daily rates in Sri Lankan Rupees, and maintaining a strict preventive service regimen across our full machinery portfolio.
                </p>
              </div>

              {/* Mission & Vision Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-5 rounded-2xl bg-[#F5F9FC] border border-[#DFE8F0] space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#368BD1] text-white flex items-center justify-center shadow-xs">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-[#263746] text-base">Our Mission</h3>
                  <p className="text-xs text-[#657786] leading-relaxed">
                    To eliminate project downtime for Sri Lankan builders by delivering fully-certified, ready-to-work heavy machinery on transparent, flexible hire terms.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F5F9FC] border border-[#DFE8F0] space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2473B5] text-white flex items-center justify-center shadow-xs">
                    <Compass className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-[#263746] text-base">Our Vision</h3>
                  <p className="text-xs text-[#657786] leading-relaxed">
                    To remain Sri Lanka's most trusted, technology-driven construction plant rental provider, known for fleet reliability, machine safety, and commercial integrity.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-[#F5F9FC] border border-[#DFE8F0] shadow-xl p-3">
                <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900">
                  <img
                    src={catExcavator}
                    alt="Caterpillar Hydraulic Excavator Fleet"
                    onError={(e) => handleImageError(e, catExcavator)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="inline-block text-3xs font-mono font-bold uppercase bg-[#368BD1] text-white px-2 py-0.5 rounded mb-1">
                      CAT 320 Heavy Excavator
                    </span>
                    <h4 className="text-base font-heading font-bold">Western Province Fleet Mobilization</h4>
                    <p className="text-xs text-slate-200">Certified for deep foundation excavation & earthmoving</p>
                  </div>
                </div>
              </div>

              {/* Floating Quality Callout Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl border border-[#DFE8F0] shadow-lg flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-heading font-extrabold text-[#263746]">ISO Quality Standard</div>
                  <div className="text-3xs text-[#657786]">Certified Hydraulic Pre-Delivery Testing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CORE OPERATIONAL PILLARS (HOW WE WORK)                    */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-[#F5F9FC] border-t border-b border-[#DFE8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-heading font-bold text-[#368BD1] uppercase tracking-widest">
              The LK Rental Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-[#263746] tracking-tight">
              Why Sri Lankan Builders Choose Our Fleet
            </h2>
            <p className="text-sm text-[#657786]">
              Every rental is engineered for maximum reliability, predictable cost control, and comprehensive job site safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white border border-[#DFE8F0] hover:border-[#368BD1] transition-all shadow-xs hover:shadow-md space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E8F2FA] text-[#368BD1] flex items-center justify-center border border-[#A4D0F2]">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-heading font-bold text-[#263746]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#657786] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. MULTI-SHOT MACHINERY FLEET OVERVIEW                       */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-heading font-bold text-[#368BD1] uppercase tracking-widest">
                Our Equipment Arsenal
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-[#263746] tracking-tight mt-1">
                Modern Machinery for Every Construction Stage
              </h2>
              <p className="text-sm text-[#657786] mt-2 max-w-xl">
                From initial site clearing and deep trenching to concrete batching, compaction, and auxiliary site power generation.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              icon={ArrowRight}
              onClick={() => navigate('/equipment')}
              className="self-start md:self-auto"
            >
              Explore Full Fleet (8 Categories)
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category 1: Excavators */}
            <div className="rounded-2xl border border-[#DFE8F0] overflow-hidden bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="relative h-48 bg-[#F5F9FC] overflow-hidden">
                <img
                  src={catExcavator}
                  alt="Crawler Excavator"
                  onError={(e) => handleImageError(e, catExcavator)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-3xs font-heading font-bold uppercase tracking-wider bg-white/95 text-[#368BD1] px-2.5 py-1 rounded shadow-xs">
                  Excavators
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-heading font-bold text-[#263746] text-base">Hydraulic Crawler Excavators</h3>
                <p className="text-xs text-[#657786] leading-relaxed">
                  Heavy 20T to 30T tracked excavators for bulk earthmoving, rock breaking, and foundation trenching.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-[#368BD1] font-heading font-semibold">
                  <span>CAT & Komatsu Fleet</span>
                  <Link to="/equipment" className="hover:underline flex items-center gap-1">
                    View Fleet &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Category 2: Backhoe Loaders */}
            <div className="rounded-2xl border border-[#DFE8F0] overflow-hidden bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="relative h-48 bg-[#F5F9FC] overflow-hidden">
                <img
                  src={jcbBackhoe}
                  alt="Backhoe Loader"
                  onError={(e) => handleImageError(e, jcbBackhoe)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-3xs font-heading font-bold uppercase tracking-wider bg-white/95 text-[#368BD1] px-2.5 py-1 rounded shadow-xs">
                  Backhoe Loaders
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-heading font-bold text-[#263746] text-base">JCB 3CX 4WD Loaders</h3>
                <p className="text-xs text-[#657786] leading-relaxed">
                  The ultimate versatile workhorse for pipe laying, material transport, and urban road repairs.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-[#368BD1] font-heading font-semibold">
                  <span>Dual Bucket Ready</span>
                  <Link to="/equipment" className="hover:underline flex items-center gap-1">
                    View Fleet &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Category 3: Road Rollers */}
            <div className="rounded-2xl border border-[#DFE8F0] overflow-hidden bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="relative h-48 bg-[#F5F9FC] overflow-hidden">
                <img
                  src={roadRoller}
                  alt="Road Roller"
                  onError={(e) => handleImageError(e, roadRoller)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-3xs font-heading font-bold uppercase tracking-wider bg-white/95 text-[#368BD1] px-2.5 py-1 rounded shadow-xs">
                  Road Rollers
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-heading font-bold text-[#263746] text-base">Vibratory Compaction Rollers</h3>
                <p className="text-xs text-[#657786] leading-relaxed">
                  Single-drum soil compactors and tandem asphalt rollers ensuring road density specifications.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-[#368BD1] font-heading font-semibold">
                  <span>Soil & Asphalt Specs</span>
                  <Link to="/equipment" className="hover:underline flex items-center gap-1">
                    View Fleet &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Category 4: Concrete Mixers */}
            <div className="rounded-2xl border border-[#DFE8F0] overflow-hidden bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="relative h-48 bg-[#F5F9FC] overflow-hidden">
                <img
                  src={concreteMixer}
                  alt="Concrete Mixer"
                  onError={(e) => handleImageError(e, concreteMixer)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-3xs font-heading font-bold uppercase tracking-wider bg-white/95 text-[#368BD1] px-2.5 py-1 rounded shadow-xs">
                  Concrete Mixers
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-heading font-bold text-[#263746] text-base">Commercial Drum Mixers</h3>
                <p className="text-xs text-[#657786] leading-relaxed">
                  Continuous high-volume site concrete mixers for structural slabs, footings, and retaining walls.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-[#368BD1] font-heading font-semibold">
                  <span>Heavy-Duty Drums</span>
                  <Link to="/equipment" className="hover:underline flex items-center gap-1">
                    View Fleet &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Category 5: Generators */}
            <div className="rounded-2xl border border-[#DFE8F0] overflow-hidden bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="relative h-48 bg-[#F5F9FC] overflow-hidden">
                <img
                  src={generatorImg}
                  alt="Industrial Generator"
                  onError={(e) => handleImageError(e, generatorImg)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-3xs font-heading font-bold uppercase tracking-wider bg-white/95 text-[#368BD1] px-2.5 py-1 rounded shadow-xs">
                  Generators
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-heading font-bold text-[#263746] text-base">Diesel Industrial Generators</h3>
                <p className="text-xs text-[#657786] leading-relaxed">
                  Acoustically silenced mobile power units from 25kVA up to 500kVA for prime site power.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-[#368BD1] font-heading font-semibold">
                  <span>Soundproof Enclosures</span>
                  <Link to="/equipment" className="hover:underline flex items-center gap-1">
                    View Fleet &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Category 6: Water Pumps */}
            <div className="rounded-2xl border border-[#DFE8F0] overflow-hidden bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="relative h-48 bg-[#F5F9FC] overflow-hidden">
                <img
                  src={waterPumpImg}
                  alt="Dewatering Water Pump"
                  onError={(e) => handleImageError(e, waterPumpImg)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-3xs font-heading font-bold uppercase tracking-wider bg-white/95 text-[#368BD1] px-2.5 py-1 rounded shadow-xs">
                  Water Pumps
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-heading font-bold text-[#263746] text-base">Heavy Dewatering Pumps</h3>
                <p className="text-xs text-[#657786] leading-relaxed">
                  High-capacity diesel slurry and water pumps for flooded foundation excavations and groundwater control.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-[#368BD1] font-heading font-semibold">
                  <span>High-Discharge L/min</span>
                  <Link to="/equipment" className="hover:underline flex items-center gap-1">
                    View Fleet &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SRI LANKAN DEPOT NETWORK                                 */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-[#F5F9FC] border-t border-[#DFE8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-heading font-bold text-[#368BD1] uppercase tracking-widest">
              Depot Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-[#263746] tracking-tight">
              Strategic Depot Network Across Sri Lanka
            </h2>
            <p className="text-sm text-[#657786]">
              Equipped with dedicated lowbed loading bays, high-pressure wash facilities, and mechanical overhaul service bays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {yards.map((yard, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white border border-[#DFE8F0] shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="inline-flex p-2.5 rounded-xl bg-[#E8F2FA] text-[#368BD1] border border-[#A4D0F2]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-[#263746] text-base">
                    {yard.city}
                  </h3>
                  <span className="inline-block text-3xs font-heading font-bold uppercase tracking-wider text-[#2473B5] bg-[#E8F2FA] px-2 py-0.5 rounded">
                    {yard.role}
                  </span>
                  <p className="text-xs text-[#657786] leading-relaxed pt-1">
                    {yard.address}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DFE8F0] flex items-center justify-between text-xs">
                  <span className="text-[#657786]">Direct Yard Dispatch:</span>
                  <strong className="text-[#263746] font-mono">{yard.phone}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. CALL TO ACTION                                            */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-white border-t border-[#DFE8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F5F9FC] border border-[#DFE8F0] shadow-sm text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#368BD1] border border-[#DFE8F0] text-xs font-heading font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="h-4 w-4" />
              <span>Ready for Immediate Site Mobilization</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-heading font-black text-[#263746] tracking-tight">
              Ready to Hire Heavy Equipment for Your Project?
            </h2>

            <p className="text-xs sm:text-sm text-[#657786] max-w-2xl mx-auto leading-relaxed">
              Experience the difference of zero upfront deposits, verified equipment readiness, and dedicated Sri Lankan technical support. Reserve your equipment today or talk to our fleet dispatchers.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={Truck}
                onClick={() => navigate('/equipment')}
                className="shadow-sm px-8"
              >
                Browse Equipment Fleet
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={PhoneCall}
                onClick={() => navigate('/register')}
                className="px-8"
              >
                Register as Contractor
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
