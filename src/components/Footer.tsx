import React from 'react';
import { Link } from 'react-router-dom';
import { FoodoraLogo } from './FoodoraLogo.js';
import { MapPin, Phone, Mail, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0F14] text-[#94A3B8] pt-16 pb-12 border-t border-[#293241]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#293241]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <FoodoraLogo size="lg" />
            <p className="text-sm text-[#94A3B8] max-w-sm leading-relaxed">
              Sri Lanka’s premier food delivery platform. From sizzling Colombo cheese kottu to historic Galle Fort hoppers and fragrant Kandy dum biriyani, we deliver your cravings with real-time tracking.
            </p>
            <div className="space-y-2.5 text-xs text-[#94A3B8] pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>50 Nawam Mawatha, Colombo 02, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>+94 11 777 5678 (24/7 Island Hotline)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>support@foodora.lk</span>
              </div>
            </div>
          </div>

          {/* Sri Lankan Cities */}
          <div>
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>Cities We Serve</span>
            </h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li><Link to="/restaurants?city=colombo" className="hover:text-[#D4AF37] transition">Colombo (01 - 15)</Link></li>
              <li><Link to="/restaurants?city=dehiwala" className="hover:text-[#D4AF37] transition">Dehiwala & Mount Lavinia</Link></li>
              <li><Link to="/restaurants?city=nugegoda" className="hover:text-[#D4AF37] transition">Nugegoda & Kotte</Link></li>
              <li><Link to="/restaurants?city=kandy" className="hover:text-[#D4AF37] transition">Kandy City</Link></li>
              <li><Link to="/restaurants?city=galle" className="hover:text-[#D4AF37] transition">Galle Fort & Coastal</Link></li>
              <li><Link to="/restaurants?city=negombo" className="hover:text-[#D4AF37] transition">Negombo Lagoon Area</Link></li>
              <li><Link to="/restaurants?city=kurunegala" className="hover:text-[#D4AF37] transition">Kurunegala Town</Link></li>
              <li><Link to="/restaurants?city=matara" className="hover:text-[#D4AF37] transition">Matara Beachfront</Link></li>
            </ul>
          </div>

          {/* Cuisines */}
          <div>
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider mb-4">Top Cuisines</h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li><Link to="/restaurants?cuisine=Rice%20%26%20Curry" className="hover:text-[#D4AF37] transition">Village Rice & Curry</Link></li>
              <li><Link to="/restaurants?cuisine=Kottu%20Roti" className="hover:text-[#D4AF37] transition">Cheese & Dolphin Kottu</Link></li>
              <li><Link to="/restaurants?cuisine=Hoppers%20%26%20Roti" className="hover:text-[#D4AF37] transition">Egg Hoppers & Pol Roti</Link></li>
              <li><Link to="/restaurants?cuisine=Biriyani%20%26%20Pulao" className="hover:text-[#D4AF37] transition">Dum Biriyani & Pulao</Link></li>
              <li><Link to="/restaurants?cuisine=Seafood%20Specialties" className="hover:text-[#D4AF37] transition">Lagoon Crab & Seafood</Link></li>
              <li><Link to="/restaurants?cuisine=Short%20Eats%20%26%20Snacks" className="hover:text-[#D4AF37] transition">Ceylon Bakery Short Eats</Link></li>
              <li><Link to="/restaurants?cuisine=Desserts%20%26%20Fresh%20Juices" className="hover:text-[#D4AF37] transition">Watalappan & Falooda</Link></li>
            </ul>
          </div>

          {/* Partner & Account */}
          <div>
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider mb-4">Portals & Links</h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li><Link to="/promotions" className="hover:text-[#D4AF37] transition">Active Promo Codes</Link></li>
              <li><Link to="/account" className="hover:text-[#D4AF37] transition">My Account & Orders</Link></li>
              <li><Link to="/owner/dashboard" className="hover:text-[#D4AF37] transition">Restaurant Partner Hub</Link></li>
              <li><Link to="/rider/dashboard" className="hover:text-[#D4AF37] transition">Delivery Rider Portal</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-[#D4AF37] transition">Admin Operations Console</Link></li>
              <li>
                <span className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-[#151B23] text-xs font-bold text-[#D4AF37] border border-[#293241]">
                  Currency: LKR (Rs.)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom notes */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#94A3B8] gap-4">
          <p>© {new Date().getFullYear()} FOODORA Sri Lanka Ltd. All rights reserved. Cravings, Delivered in Real Time.</p>
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            <span>for Sri Lanka • Zero Database JSON Persistence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
