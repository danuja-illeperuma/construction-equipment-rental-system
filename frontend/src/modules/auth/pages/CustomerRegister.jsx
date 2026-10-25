import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { authApi } from '../api/authApi';
import { Button } from '../../../components/common/Button';
import { CUSTOMER_TYPE, BRAND } from '../../../utils/constants';
import { handleImageError } from '../../../utils/equipmentImages';
import backhoeLoaderImg from '../../../assets/images/equipment/backhoe-loader/backhoe-loader-01.jpg';
import {
  HardHat,
  ShieldCheck,
  Truck,
  ArrowLeft,
  User,
  Lock,
  Mail,
  Phone,
  FileText,
  MapPin,
  CheckCircle2,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const CustomerRegister = () => {
  const [form, setForm] = useState({
    customerType: CUSTOMER_TYPE.INDIVIDUAL,
    name: '',
    nicOrBrNumber: '',
    phone: '',
    email: '',
    password: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error, success } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.registerCustomer(form);
      if (res.success) {
        success('Contractor account created successfully! Please sign in to reserve machinery.');
        const redirect = searchParams.get('redirect') || location.state?.from;
        navigate(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login');
      }
    } catch (err) {
      error(err.message || 'Failed to create customer account. Please review the details provided.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex selection:bg-brand-400 selection:text-white font-sans">
      {/* Left Column: Construction Machine Branding Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-slate-900 border-r border-[#DFE8F0]">
        <img
          src={backhoeLoaderImg}
          alt="Heavy Construction Plant"
          onError={(e) => handleImageError(e, backhoeLoaderImg)}
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C5D94] via-[#2473B5]/85 to-[#368BD1]/70" />

        <div className="relative z-10 p-12 flex flex-col justify-between w-full h-full text-white">
          {/* Top Brand Link */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="p-2.5 rounded-xl bg-white text-[#368BD1] font-black shadow-md group-hover:bg-[#F5F9FC] transition-colors">
                <HardHat className="h-6 w-6" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-white text-lg tracking-tight group-hover:text-sky-200 transition-colors">
                  {BRAND.name}
                </span>
                <span className="block text-3xs font-heading font-bold uppercase tracking-widest text-sky-200">
                  Customer Registration
                </span>
              </div>
            </Link>
          </div>

          {/* Value Proposition */}
          <div className="space-y-6 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-xs font-heading font-bold uppercase tracking-wider text-white">
              <Building2 className="h-3.5 w-3.5" />
              <span>Direct Machinery Hire Account</span>
            </div>

            <h1 className="text-3xl font-heading font-black tracking-tight leading-tight text-white">
              Power Your Project with Sri Lanka's Modern Machinery Fleet
            </h1>

            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              Open your client account in under 2 minutes. Gain immediate access to real-time equipment availability, pre-approved zero-deposit booking, and rapid island-wide lowbed transport.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-white">
                <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0 mt-0.5" />
                <span>Zero Security Deposit upfront on standard machinery rentals</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-white">
                <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0 mt-0.5" />
                <span>Transparent Sri Lankan Rupee pricing without hidden depot fees</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-white">
                <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0 mt-0.5" />
                <span>Same-day lowbed transport dispatch across Western, Central & Southern provinces</span>
              </div>
            </div>
          </div>

          {/* Yard Contact */}
          <div className="pt-6 border-t border-white/20 text-xs text-sky-100 flex items-center justify-between">
            <span>Direct Contractor Support</span>
            <span className="text-white font-heading font-semibold">+94 77 123 4567</span>
          </div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-xl space-y-6 my-auto">
          {/* Back link */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#657786] hover:text-[#368BD1] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Homepage</span>
            </Link>

            <Link
              to="/login"
              className="text-xs font-semibold text-[#657786] hover:text-[#368BD1]"
            >
              Already registered? <strong className="text-[#368BD1] font-heading font-bold">Sign In</strong>
            </Link>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#263746] tracking-tight">
              Create Client / Contractor Account
            </h2>
            <p className="text-xs sm:text-sm text-[#657786] mt-1.5">
              Register as an individual home builder, independent contractor, or construction enterprise.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Entity Type Selection */}
            <div className="space-y-1.5">
              <label className="block text-2xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                Customer Entity Type *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: CUSTOMER_TYPE.INDIVIDUAL, label: 'Individual' },
                  { value: CUSTOMER_TYPE.CONTRACTOR, label: 'Contractor' },
                  { value: CUSTOMER_TYPE.COMPANY, label: 'Company' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, customerType: type.value })}
                    className={`py-2 px-3 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                      form.customerType === type.value
                        ? 'bg-[#368BD1] text-white border-[#368BD1] shadow-xs'
                        : 'bg-white text-[#657786] border-[#DFE8F0] hover:bg-[#F5F9FC] hover:text-[#263746]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-2xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                {form.customerType === CUSTOMER_TYPE.COMPANY
                  ? 'Company / Enterprise Legal Name *'
                  : 'Full Contact Name *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657786]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={
                    form.customerType === CUSTOMER_TYPE.COMPANY
                      ? 'Lanka Builders Consortium (Pvt) Ltd'
                      : 'Kamal Perera'
                  }
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#DFE8F0] rounded-xl text-sm text-[#263746] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5BA9E6] focus:border-[#368BD1] transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* NIC / BR + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-2xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                  {form.customerType === CUSTOMER_TYPE.COMPANY
                    ? 'Business Reg. (BR) Number'
                    : 'NIC / Passport Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657786]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="nicOrBrNumber"
                    value={form.nicOrBrNumber}
                    onChange={handleChange}
                    placeholder={
                      form.customerType === CUSTOMER_TYPE.COMPANY ? 'PV-98765' : '199212345678'
                    }
                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#DFE8F0] rounded-xl text-sm text-[#263746] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5BA9E6] focus:border-[#368BD1] transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-2xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                  Mobile / Contact Phone *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657786]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#DFE8F0] rounded-xl text-sm text-[#263746] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5BA9E6] focus:border-[#368BD1] transition-colors shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Email + Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-2xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                  Email Address (Login ID) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657786]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="builder@domain.lk"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#DFE8F0] rounded-xl text-sm text-[#263746] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5BA9E6] focus:border-[#368BD1] transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-2xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                  Secure Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657786]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full pl-10 pr-10 py-2 bg-white border border-[#DFE8F0] rounded-xl text-sm text-[#263746] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5BA9E6] focus:border-[#368BD1] transition-colors shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#657786] hover:text-[#263746] cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Physical / Yard Address */}
            <div className="space-y-1.5">
              <label className="block text-2xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                Delivery Site or Office Address
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-3.5 pointer-events-none text-[#657786]">
                  <MapPin className="h-4 w-4" />
                </div>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="No. 45, Kandy Road, Kadawatha, Sri Lanka"
                  rows={2}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#DFE8F0] rounded-xl text-sm text-[#263746] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5BA9E6] focus:border-[#368BD1] transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* Terms note */}
            <p className="text-3xs text-[#657786] leading-relaxed">
              By registering, you agree to LK Construction Equipment Rental terms of equipment hire, standard return inspections, and zero-deposit rental guidelines under Sri Lankan commercial law.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-heading font-bold uppercase tracking-wider shadow-md cursor-pointer"
              loading={loading}
            >
              Complete Registration & Continue
            </Button>
          </form>

          {/* Bottom link */}
          <div className="text-center text-xs text-[#657786] pt-2">
            Already have an active account?{' '}
            <Link
              to={searchParams.get('redirect') ? `/login?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '/login'}
              className="font-heading font-bold text-[#368BD1] hover:text-[#2473B5] hover:underline transition-colors"
            >
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
