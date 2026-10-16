import React from 'react';
import type { OrderStatus, OrderTimelineEvent } from '../types/index.js';
import { Check, Clock, ChefHat, Bike, Home, AlertCircle } from 'lucide-react';

interface OrderTimelineProps {
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, timeline }) => {
  const isCancelled = status === 'cancelled';

  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
    { key: 'pending', label: 'Order Submitted', desc: 'Received by FOODORA', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', desc: 'Accepted by kitchen', icon: Check },
    { key: 'preparing', label: 'Preparing Food', desc: 'Cooking fresh', icon: ChefHat },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Packed at counter', icon: Check },
    { key: 'on_the_way', label: 'Out for Delivery', desc: 'Rider on the road', icon: Bike },
    { key: 'delivered', label: 'Delivered', desc: 'Enjoy your food!', icon: Home },
  ];

  const getStepIndex = (s: OrderStatus) => {
    if (s === 'picked_up') return 4;
    return steps.findIndex((step) => step.key === s);
  };

  const currentStepIdx = getStepIndex(status);

  if (isCancelled) {
    return (
      <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center gap-3 text-red-300">
        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs text-red-400">This order has been cancelled and cannot proceed further.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Horizontal / Flow Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIdx || status === 'delivered';
          const isCurrent = idx === currentStepIdx && status !== 'delivered';
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                isCurrent
                  ? 'border-[#D4AF37] bg-[#1C2530] text-[#D4AF37] font-bold shadow-lg shadow-[#D4AF37]/10'
                  : isDone
                  ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300 font-semibold'
                  : 'border-[#293241] bg-[#111720]/60 text-[#94A3B8]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition ${
                  isCurrent
                    ? 'bg-[#D4AF37] text-[#0B0F14] animate-pulse font-bold'
                    : isDone
                    ? 'bg-emerald-600 text-[#0B0F14] font-bold'
                    : 'bg-[#1C2530] text-[#94A3B8]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight line-clamp-1">{step.label}</span>
              <span className="text-[10px] text-[#94A3B8] leading-tight mt-0.5 line-clamp-1">{step.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Detailed Timeline Events List */}
      <div className="border-t border-[#293241] pt-4">
        <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider mb-3">Live Status History</h4>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#293241]">
          {timeline.map((event, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#D4AF37] ring-4 ring-[#1C2530]" />
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="text-xs font-bold text-[#F8FAFC] capitalize">
                  {event.status.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">{event.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
