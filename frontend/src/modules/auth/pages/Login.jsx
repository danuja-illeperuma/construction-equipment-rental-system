import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { BRAND } from '../../../utils/constants';
import { handleImageError } from '../../../utils/equipmentImages';
import excavatorImg from '../../../assets/images/equipment/excavator/excavator-01.jpg';
import {
  HardHat,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Lock,
  Mail,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(email, password);
      success('Welcome back, ' + (userData.name || 'User'));
      const targetRedirect = searchParams.get('redirect') || location.state?.from || '/dashboard';
      navigate(targetRedirect);
    } catch (err) {
      error(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex selection:bg-brand-400 selection:text-white font-sans">
      {/* Left Column: Visual Construction Machinery Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 border-r border-[#DFE8F0]">
        <img
          src={excavatorImg}
          alt="Heavy Construction Excavator"
          onError={(e) => handleImageError(e, excavatorImg)}
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        {/* Light Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C5D94] via-[#2473B5]/85 to-[#368BD1]/70" />

        {/* Content over image */}
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
                  Sri Lanka Fleet Operations
                </span>
              </div>
            </Link>
          </div>

          {/* Center Brand Statements */}
          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-xs font-heading font-bold uppercase tracking-wider text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Commercial & Industrial Machinery Hire</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-heading font-black tracking-tight leading-tight text-white">
              "{BRAND.tagline}"
            </h1>

            <p className="text-sm text-sky-100 leading-relaxed">
              Empowering construction contractors, engineering firms, and infrastructure developers across Sri Lanka with modern heavy plant machinery.
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-white">
                <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0" />
                <span>Zero Upfront Security Deposit on Equipment Hires</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white">
                <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0" />
                <span>Transparent LKR Daily, Weekly & Monthly Rates</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white">
                <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0" />
                <span>Rapid Island-Wide Lowbed Transportation</span>
              </div>
            </div>
          </div>

          {/* Bottom Yard Info */}
          <div className="pt-6 border-t border-white/20 text-xs text-sky-100 flex items-center justify-between">
            <span>Colombo Central Depot &bull; Island-wide Transport</span>
            <span className="text-white font-heading font-semibold">+94 11 234 5678</span>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Back Link */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#657786] hover:text-[#368BD1] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Public Homepage</span>
            </Link>
          </div>

          {/* Form Header */}
          <div>
            <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-4 group cursor-pointer">
              <div className="p-2 rounded-lg bg-[#368BD1] text-white font-black group-hover:bg-[#2473B5] transition-colors">
                <HardHat className="h-5 w-5" />
              </div>
              <span className="font-heading font-extrabold text-[#263746] text-base group-hover:text-[#368BD1] transition-colors">
                {BRAND.name}
              </span>
            </Link>

            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#263746] tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-[#657786] mt-2">
              Enter your registered corporate or personal email credentials to access the rental portal.
            </p>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657786]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cerms.lk or contractor@domain.lk"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DFE8F0] rounded-xl text-sm text-[#263746] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5BA9E6] focus:border-[#368BD1] transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657786]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#DFE8F0] rounded-xl text-sm text-[#263746] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5BA9E6] focus:border-[#368BD1] transition-colors shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#657786] hover:text-[#263746] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-heading font-bold uppercase tracking-wider shadow-md cursor-pointer"
              loading={loading}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Registration Prompt */}
          <div className="p-4 rounded-xl bg-[#F5F9FC] border border-[#DFE8F0] text-center text-xs text-[#657786] space-y-2">
            <p>
              New equipment hirer or contractor?{' '}
              <Link
                to={searchParams.get('redirect') ? `/register?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '/register'}
                className="font-heading font-bold text-[#368BD1] hover:text-[#2473B5] hover:underline transition-colors uppercase tracking-wider"
              >
                Register as Customer &rarr;
              </Link>
            </p>
            <p className="text-3xs text-[#657786]">
              Real-time machinery reservations &bull; Zero upfront deposit &bull; Verified credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
