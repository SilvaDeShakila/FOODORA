import React, { useState, useEffect } from 'react';
import type { OrderStatus } from '../types/index.js';
import { Bike, MapPin, Store, Navigation, Radio, Compass, Phone, MessageSquare, X, Send } from 'lucide-react';

interface LiveRouteMapProps {
  status: OrderStatus;
  restaurantName: string;
  restaurantAddress: string;
  destinationAddress: string;
  riderName?: string;
  riderPhone?: string;
}

export const LiveRouteMap: React.FC<LiveRouteMapProps> = ({
  status,
  restaurantName,
  restaurantAddress,
  destinationAddress,
  riderName = 'Roshan Gunasekara',
  riderPhone = '+94 77 982 3411',
}) => {
  const getProgress = (s: OrderStatus): number => {
    switch (s) {
      case 'pending':
        return 5;
      case 'confirmed':
        return 15;
      case 'preparing':
        return 30;
      case 'ready_for_pickup':
        return 45;
      case 'picked_up':
        return 60;
      case 'on_the_way':
        return 82;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 10;
    }
  };

  const [simulatedEtaMinutes, setSimulatedEtaMinutes] = useState(18);
  const [etaSeconds, setEtaSeconds] = useState(45);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'rider'; text: string; time: string }[]>([
    {
      sender: 'rider',
      text: `Ayubowan! I am ${riderName}, your Foodora express rider. I have your order carefully packed in the thermal insulated container.`,
      time: 'Just now',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    if (status === 'delivered' || status === 'cancelled') return;

    const interval = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev > 0) return prev - 1;
        setSimulatedEtaMinutes((m) => Math.max(1, m - 1));
        return 59;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const newMsg = {
      sender: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    setTimeout(() => {
      let reply = 'Got it! Following your delivery instructions.';
      const lower = userText.toLowerCase();
      if (lower.includes('gate') || lower.includes('door')) {
        reply = 'Understood! I will ring the intercom at your gate once I arrive.';
      } else if (lower.includes('call') || lower.includes('phone')) {
        reply = 'Sure thing, I will give you a missed call 2 minutes before reaching.';
      } else if (lower.includes('where') || lower.includes('time')) {
        reply = 'Just navigating through the Kollupitiya junction right now. Almost there!';
      } else if (lower.includes('change') || lower.includes('cash')) {
        reply = 'No problem, I have change for LKR 5000 ready in my pouch.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'rider',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const progress = getProgress(status);
  const pathD = 'M 80 220 C 180 180, 240 120, 360 160 C 460 190, 520 100, 640 90';
  const t = Math.max(0.05, Math.min(0.95, progress / 100));
  const riderX = 80 + t * 560;
  const riderY = 220 - Math.sin(t * Math.PI) * 70 - t * 60;

  return (
    <div className="bg-[#151B23] rounded-3xl border border-[#293241] overflow-hidden shadow-2xl space-y-4 text-[#F8FAFC]">
      {/* Top Map Header & Live Status Bar */}
      <div className="p-4 sm:p-6 bg-[#111720] border-b border-[#293241] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C2530] text-[#D4AF37] text-xs font-bold border border-[#D4AF37]/30">
              <Radio className="w-3 h-3 animate-pulse text-[#D4AF37]" />
              DELIVERY STATUS UPDATES
            </span>
            <span className="text-xs text-[#94A3B8]">Colombo Express Corridor</span>
          </div>
          <h3 className="text-xl font-black text-[#F8FAFC] tracking-tight">
            {status === 'delivered' ? 'Order Successfully Delivered!' : 'Rider Navigating to Destination'}
          </h3>
        </div>

        {/* ETA Counter Box */}
        {status !== 'delivered' && status !== 'cancelled' && (
          <div className="flex items-center gap-3 bg-[#1C2530] border border-[#293241] px-4 py-2 rounded-2xl shadow-md">
            <Compass className="w-5 h-5 text-[#D4AF37] animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-bold">Estimated Delivery</span>
              <span className="text-base sm:text-lg font-black text-[#D4AF37] font-mono">
                ~{simulatedEtaMinutes}m {etaSeconds < 10 ? `0${etaSeconds}` : etaSeconds}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dark Luxury Styled Colombo Map Canvas */}
      <div className="relative h-64 sm:h-76 w-full bg-[#0B0F14] overflow-hidden select-none border-y border-[#293241]">
        <svg className="w-full h-full" viewBox="0 0 720 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#E8C66A" />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#D4AF37" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Dark Streets Grid */}
          <path d="M 0 60 L 720 70 M 0 140 L 720 150 M 0 230 L 720 220" stroke="#1C2530" strokeWidth="14" />
          <path d="M 120 0 L 140 300 M 280 0 L 290 300 M 450 0 L 440 300 M 600 0 L 610 300" stroke="#1C2530" strokeWidth="12" />

          {/* Secondary streets */}
          <path d="M 0 100 Q 360 80 720 110" stroke="#151B23" strokeWidth="8" />
          <path d="M 180 300 Q 360 210 540 300" stroke="#151B23" strokeWidth="8" />

          {/* Indian Ocean Coastline */}
          <path d="M 0 0 L 45 300" stroke="#1E293B" strokeWidth="28" strokeOpacity="0.4" />
          <text x="12" y="160" fill="#94A3B8" fontSize="10" fontWeight="bold" transform="rotate(-90 12 160)" opacity="0.6">
            INDIAN OCEAN (COLOMBO COAST)
          </text>

          {/* Base Inactive Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#293241"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Active Gold Route Path with Pulse */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGoldGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className="animate-pulse"
            filter="url(#goldGlow)"
          />

          {/* Restaurant Landmark Marker */}
          <g transform="translate(80, 220)">
            <circle r="18" fill="#D4AF37" fillOpacity="0.2" className="animate-ping" />
            <circle r="13" fill="#D4AF37" />
            <foreignObject x="-10" y="-10" width="20" height="20">
              <div className="w-full h-full flex items-center justify-center text-[#0B0F14]">
                <Store className="w-3.5 h-3.5" />
              </div>
            </foreignObject>
            <text x="0" y="24" textAnchor="middle" fill="#F8FAFC" fontSize="11" fontWeight="bold">
              {restaurantName.length > 18 ? `${restaurantName.substring(0, 18)}...` : restaurantName}
            </text>
            <text x="0" y="35" textAnchor="middle" fill="#94A3B8" fontSize="9">
              Kitchen (Pickup)
            </text>
          </g>

          {/* Customer Destination Marker */}
          <g transform="translate(640, 90)">
            <circle r="18" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
            <circle r="13" fill="#10B981" />
            <foreignObject x="-10" y="-10" width="20" height="20">
              <div className="w-full h-full flex items-center justify-center text-[#0B0F14]">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </foreignObject>
            <text x="0" y="24" textAnchor="middle" fill="#F8FAFC" fontSize="11" fontWeight="bold">
              Your Location
            </text>
            <text x="0" y="35" textAnchor="middle" fill="#94A3B8" fontSize="9">
              Delivery Drop-off
            </text>
          </g>

          {/* Dynamic Moving Rider Avatar */}
          <g transform={`translate(${riderX}, ${riderY})`}>
            <circle r="22" fill="#D4AF37" fillOpacity="0.3" className="animate-ping" />
            <circle r="16" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="2" filter="url(#goldGlow)" />
            <foreignObject x="-12" y="-12" width="24" height="24">
              <div className="w-full h-full flex items-center justify-center text-[#0B0F14]">
                <Bike className="w-4 h-4 transform -scale-x-100" />
              </div>
            </foreignObject>
            <text x="0" y="-22" textAnchor="middle" fill="#E8C66A" fontSize="10" fontWeight="bold">
              ðŸ›µ {riderName.split(' ')[0]}
            </text>
          </g>
        </svg>

        {/* Floating Route Telemetry Card */}
        <div className="absolute bottom-3 left-3 bg-[#151B23]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#293241] shadow-xl text-xs space-y-0.5 pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold text-[#F8FAFC]">
            <Navigation className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Marine Drive & Galle Rd Route</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Illustrative speed: 38 km/h - Vehicle: TVS King Express (WP BBD-4592)
          </p>
        </div>
      </div>

      {/* Rider Actions Bar */}
      <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1C2530] text-[#D4AF37] border border-[#293241] flex items-center justify-center font-bold">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-[#F8FAFC]">{riderName}</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                Rider Details
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">FOODORA Colombo Express Delivery Partner</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {riderPhone && (
            <a
              href={`tel:${riderPhone}`}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#293241] bg-[#111720] hover:bg-[#1C2530] text-[#F8FAFC] font-bold text-xs transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Call Rider</span>
            </a>
          )}

          <button
            onClick={() => setChatOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-xs transition shadow-md cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat with Rider</span>
          </button>
        </div>
      </div>

      {/* Live Rider Chat Modal Drawer */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0B0F14]/80 backdrop-blur-sm" onClick={() => setChatOpen(false)} />
          <div className="relative w-full max-w-md bg-[#151B23] border border-[#293241] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col h-[520px]">
            {/* Chat Header */}
            <div className="p-4 bg-[#111720] border-b border-[#293241] text-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1C2530] text-[#D4AF37] border border-[#293241] flex items-center justify-center font-bold">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight text-[#F8FAFC]">{riderName}</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Delivery in Progress
                  </span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B0F14]/60">
              <div className="text-center">
                <span className="text-[10px] bg-[#1C2530] text-[#94A3B8] border border-[#293241] px-2.5 py-1 rounded-full font-semibold">
                  Messages are end-to-end simulated for delivery instructions
                </span>
              </div>

              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#D4AF37] text-[#0B0F14] font-semibold rounded-br-none shadow-md'
                        : 'bg-[#1C2530] text-[#F8FAFC] border border-[#293241] rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] mt-1 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            <div className="px-3 py-2 bg-[#111720] border-t border-[#293241] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['Please ring the gate bell', 'Leave with security guard', 'I will meet at road'].map((quick) => (
                <button
                  key={quick}
                  onClick={() => setInputMsg(quick)}
                  className="px-2.5 py-1 rounded-lg bg-[#151B23] hover:bg-[#1C2530] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#293241] text-[11px] font-medium whitespace-nowrap transition cursor-pointer"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#111720] border-t border-[#293241] flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Message your delivery rider..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#293241] focus:outline-hidden focus:border-[#D4AF37] bg-[#151B23] text-[#F8FAFC]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] transition shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
