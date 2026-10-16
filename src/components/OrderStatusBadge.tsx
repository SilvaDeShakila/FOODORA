import React from 'react';
import type { OrderStatus } from '../types/index.js';
import { Clock, CheckCircle2, ChefHat, Package, Bike, XCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  const configMap: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ElementType }
  > = {
    pending: {
      label: 'Order Placed',
      bg: 'bg-amber-950/60',
      text: 'text-amber-400',
      border: 'border-amber-800/60',
      icon: Clock,
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-blue-950/60',
      text: 'text-blue-400',
      border: 'border-blue-800/60',
      icon: CheckCircle2,
    },
    preparing: {
      label: 'In Kitchen',
      bg: 'bg-[#1C2530]',
      text: 'text-[#D4AF37]',
      border: 'border-[#D4AF37]/50',
      icon: ChefHat,
    },
    ready_for_pickup: {
      label: 'Ready for Pickup',
      bg: 'bg-indigo-950/60',
      text: 'text-indigo-400',
      border: 'border-indigo-800/60',
      icon: Package,
    },
    picked_up: {
      label: 'Rider Collected',
      bg: 'bg-purple-950/60',
      text: 'text-purple-400',
      border: 'border-purple-800/60',
      icon: Bike,
    },
    on_the_way: {
      label: 'On The Way',
      bg: 'bg-[#1C2530]',
      text: 'text-[#E8C66A]',
      border: 'border-[#D4AF37]/60',
      icon: Bike,
    },
    delivered: {
      label: 'Delivered',
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-400',
      border: 'border-emerald-800/60',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-red-950/60',
      text: 'text-red-400',
      border: 'border-red-800/60',
      icon: XCircle,
    },
  };

  const current = configMap[status] || configMap.pending;
  const Icon = current.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
    </span>
  );
};
