import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import type { Order, OrderStatus } from '../types/index.js';
import { OrderStatusBadge } from '../components/OrderStatusBadge.js';
import {
  Bike,
  MapPin,
  Phone,
  CheckCircle,
  Package,
  RotateCcw,
  Banknote,
  Navigation,
  Compass,
} from 'lucide-react';

export const RiderDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadRiderData() {
    try {
      const res = await api.rider.getDashboard();
      setMetrics(res.metrics);
      setActiveOrders(res.activeOrders);
      setAvailableTasks(res.availableTasks);
      setCompletedOrders(res.completedOrders);
    } catch (err) {
      console.error('Failed to load rider dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRiderData();
  }, []);

  const handleAcceptTask = async (orderId: string) => {
    try {
      await api.rider.acceptTask(orderId);
      await loadRiderData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept task');
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await api.rider.updateStatus(orderId, nextStatus);
      await loadRiderData();
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery status');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#293241] border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#94A3B8]">Loading Delivery Rider Portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      {/* Rider Header */}
      <div className="bg-[#151B23] rounded-3xl p-6 sm:p-8 border border-[#293241] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold shadow-lg">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Rider Delivery Hub</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                Active On Duty
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">Colombo & Western Province Express Dispatch Zone</p>
          </div>
        </div>

        <button
          onClick={loadRiderData}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#1C2530] hover:bg-[#293241] text-[#D4AF37] border border-[#D4AF37]/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Rider KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Active Deliveries</span>
          <p className="text-2xl font-black text-[#D4AF37]">{metrics?.activeOrdersCount || 0}</p>
        </div>

        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Available Pickups</span>
          <p className="text-2xl font-black text-[#E8C66A]">{metrics?.availableTasksCount || 0}</p>
        </div>

        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Completed Trips</span>
          <p className="text-2xl font-black text-emerald-400">{metrics?.totalDeliveries || 0}</p>
        </div>

        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Demo Earnings</span>
          <p className="text-2xl font-black text-[#F8FAFC]">
            Rs. {(metrics?.demoTotalEarningsLkr || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Section 1: Active Assigned Orders */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#F8FAFC] flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#D4AF37]" />
          <span>My Active Deliveries ({activeOrders.length})</span>
        </h2>

        {activeOrders.length === 0 ? (
          <div className="p-8 text-center bg-[#151B23] rounded-3xl border border-[#293241] text-xs text-[#94A3B8]">
            No active deliveries currently in transit. Accept an available task below to start riding.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-[#151B23] rounded-3xl p-6 border border-[#D4AF37]/50 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-[#F8FAFC]">{ord.orderNumber}</span>
                  <OrderStatusBadge status={ord.status} size="sm" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#111720] border border-[#293241] space-y-1">
                    <span className="font-bold text-[#F8FAFC] block">🏪 Pickup From: {ord.restaurantName}</span>
                    <p className="text-[#94A3B8]">{ord.restaurantAddress}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1C2530] border border-[#293241] space-y-1">
                    <span className="font-bold text-[#F8FAFC] block">📍 Deliver To: {ord.customerName}</span>
                    <p className="text-[#94A3B8] font-medium">{ord.deliveryAddress.addressLine}, {ord.deliveryAddress.city}</p>
                    <p className="text-[#D4AF37]">Phone: {ord.customerPhone}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#293241]">
                  <div className="text-xs">
                    <span className="text-[#94A3B8]">Collect: </span>
                    <strong className="text-[#F8FAFC] font-black">
                      Rs. {ord.totalLkr.toLocaleString()} ({ord.paymentMethod === 'cod' ? 'Cash' : 'Paid'})
                    </strong>
                  </div>

                  {ord.status === 'picked_up' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'on_the_way')}
                      className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-xs transition shadow-md cursor-pointer"
                    >
                      Start En Route
                    </button>
                  )}

                  {ord.status === 'on_the_way' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0B0F14] font-black text-xs transition shadow-md cursor-pointer"
                    >
                      Mark Delivered (COD)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Available Pickup Tasks in City */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#F8FAFC] flex items-center gap-2">
          <Package className="w-5 h-5 text-[#D4AF37]" />
          <span>Available Tasks Looking For Rider ({availableTasks.length})</span>
        </h2>

        <div className="bg-[#151B23] rounded-3xl border border-[#293241] overflow-hidden shadow-2xl">
          <div className="divide-y divide-[#293241]">
            {availableTasks.length === 0 ? (
              <p className="p-8 text-center text-xs text-[#94A3B8]">
                No orders waiting for riders right now. New orders will appear here automatically.
              </p>
            ) : (
              availableTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#1C2530]/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#F8FAFC]">{task.orderNumber}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/30">
                        {task.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#F8FAFC]">
                      From: {task.restaurantName} ({task.restaurantAddress})
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      Destination: {task.deliveryAddress.city} • Recipient: {task.customerName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <span className="text-xs font-black text-[#D4AF37]">
                      Payout: Rs. 250
                    </span>
                    <button
                      onClick={() => handleAcceptTask(task.id)}
                      className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-xs transition shadow-md cursor-pointer"
                    >
                      Accept Task
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
