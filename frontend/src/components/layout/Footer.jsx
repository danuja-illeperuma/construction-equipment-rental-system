import React from 'react';
import { Link } from 'react-router-dom';
import {
  HardHat,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { BRAND } from '../../utils/constants';

export const Footer = () => {
  return (
    <footer className="bg-[#F5F9FC] text-[#657786] border-t border-[#DFE8F0] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#DFE8F0]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#368BD1] text-white font-black shadow-sm">
                <HardHat className="h-6 w-6" />
              </div>
              <div>
                <span className="font-heading font-bold text-[#263746] text-lg tracking-tight">
                  {BRAND.name}
                </span>
                <span className="block text-3xs font-heading font-bold uppercase tracking-widest text-[#368BD1]">
                  Sri Lanka Machinery Solutions
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#263746] font-medium max-w-sm leading-relaxed">
              "{BRAND.tagline}"
            </p>
            <p className="text-xs text-[#657786] max-w-sm leading-relaxed">
              Sri Lanka's trusted partner for heavy machinery hire. Excavators, backhoe loaders, road rollers, concrete mixers, generators, and dewatering pumps ready for immediate site dispatch.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DFE8F0] text-2xs text-[#263746] font-semibold font-heading shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-[#368BD1]" />
                <span>Zero Upfront Deposit</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DFE8F0] text-2xs text-[#263746] font-semibold font-heading shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Island-wide Dispatch</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#263746]">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-[#368BD1] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/equipment" className="hover:text-[#368BD1] transition-colors">
                  Equipment Fleet
                </Link>
              </li>
              <li>
                <a href="/#why-us" className="hover:text-[#368BD1] transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#368BD1] transition-colors">
                  About Our Company
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#368BD1] transition-colors">
                  Client Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#368BD1] transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#263746]">Services</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1 text-[#657786]">
                <span>Heavy Excavation Hire</span>
              </li>
              <li className="flex items-center gap-1 text-[#657786]">
                <span>Road & Soil Compaction</span>
              </li>
              <li className="flex items-center gap-1 text-[#657786]">
                <span>Concrete Machinery</span>
              </li>
              <li className="flex items-center gap-1 text-[#657786]">
                <span>Mobile Power Generators</span>
              </li>
              <li className="flex items-center gap-1 text-[#657786]">
                <span>Dewatering & Slurry Pumps</span>
              </li>
              <li className="flex items-center gap-1 text-[#657786]">
                <span>Island-Wide Lowbed Logistics</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#263746]">Sri Lanka Operations</h4>
            <ul className="space-y-2.5 text-xs text-[#657786]">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#368BD1] shrink-0 mt-0.5" />
                <span>
                  Island-wide Operations Yard<br />
                  Colombo Industrial Hub, Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#368BD1] shrink-0" />
                <span>+94 11 234 5678 / +94 77 123 4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#368BD1] shrink-0" />
                <span>support@cerms.lk</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#368BD1] shrink-0" />
                <span>Mon – Sat: 7:00 AM – 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#657786] gap-4">
          <p>
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved. Powering Projects Across Sri Lanka.
          </p>
          <div className="flex items-center gap-6">
            <span>Transparent LKR Pricing</span>
            <span>&bull;</span>
            <span>Zero Deposit Policy</span>
            <span>&bull;</span>
            <span>Certified Machinery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
