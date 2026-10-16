import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Sparkles, ChevronDown, ChevronUp, Store, Bike, ShieldCheck, User } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { user, switchDemoRole, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const roles = [
    { id: 'customer', label: 'Customer (Colombo)', icon: User, desc: 'Nimal Perera' },
    { id: 'customer_kandy', label: 'Customer (Kandy)', icon: User, desc: 'Dilani J.' },
    { id: 'restaurant_owner', label: 'Restaurant Owner', icon: Store, desc: 'Sunil (Raja Bojun)' },
    { id: 'rider', label: 'Delivery Rider', icon: Bike, desc: 'Roshan G.' },
    { id: 'admin', label: 'Super Admin', icon: ShieldCheck, desc: 'Anura S.' },
  ] as const;

  return (
    <div className="bg-[#111720] text-[#94A3B8] border-b border-[#293241] text-xs px-3 py-1.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-[#D4AF37] bg-[#1C2530] px-2.5 py-0.5 rounded-lg border border-[#D4AF37]/30">
            <Sparkles className="w-3.5 h-3.5" />
            DEMO TESTER MODE
          </span>
          <span className="hidden sm:inline text-[#94A3B8]">
            Active: <strong className="text-[#F8FAFC]">{user ? `${user.name} (${user.role})` : 'Guest'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!collapsed && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[#94A3B8] mr-1 hidden md:inline">Quick Switch:</span>
              {roles.map((r) => {
                const Icon = r.icon;
                const isActive =
                  r.id === 'customer'
                    ? user?.role === 'customer' && user.email === 'customer@foodora.lk'
                    : r.id === 'customer_kandy'
                    ? user?.role === 'customer' && user.email === 'dilani@foodora.lk'
                    : user?.role === r.id;

                return (
                  <button
                    key={r.id}
                    disabled={isLoading}
                    onClick={() => switchDemoRole(r.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
                      isActive
                        ? 'bg-[#D4AF37] text-[#0B0F14] font-bold shadow-md shadow-[#D4AF37]/20'
                        : 'bg-[#151B23] hover:bg-[#1C2530] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#293241]'
                    }`}
                    title={r.desc}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] ml-1 rounded-lg hover:bg-[#151B23] cursor-pointer"
            title={collapsed ? 'Expand Demo Switcher' : 'Collapse Demo Switcher'}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
