import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import type { User, Restaurant, Order } from '../types/index.js';
import { OrderStatusBadge } from '../components/OrderStatusBadge.js';
import {
  ShieldCheck,
  Users,
  Store,
  RotateCcw,
  CheckCircle,
  AlertOctagon,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'restaurants' | 'orders'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function loadAdminData() {
    try {
      const [dashRes, usersRes, restRes, ordersRes] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getUsers(),
        api.admin.getRestaurants(),
        api.admin.getOrders(),
      ]);

      setDashboard(dashRes);
      setUsers(usersRes.users);
      setRestaurants(restRes.restaurants);
      setOrders(ordersRes.orders);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.admin.updateUserStatus(user.id, nextStatus);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleUpdateRestaurantStatus = async (restaurantId: string, status: string) => {
    try {
      await api.admin.updateRestaurantStatus(restaurantId, status);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update restaurant status');
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all JSON storage files to default Sri Lankan demo seed dataset?')) return;
    setIsResetting(true);
    try {
      const res = await api.admin.resetDemoData();
      setResetMessage(res.message);
      await loadAdminData();
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#293241] border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#94A3B8]">Loading Platform Administration Console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      {/* Top Banner */}
      <div className="bg-[#151B23] rounded-3xl p-6 sm:p-8 border border-[#293241] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Foodora Admin Operations</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/40">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">Platform moderation, data persistence, and system health</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-4 py-2 rounded-xl bg-[#1C2530] hover:bg-[#293241] text-[#D4AF37] border border-[#D4AF37]/30 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Re-seed demo JSON database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* High-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Registered Accounts</span>
          <p className="text-2xl font-black text-[#F8FAFC]">{dashboard?.metrics?.totalUsers || 0}</p>
        </div>

        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Partner Restaurants</span>
          <p className="text-2xl font-black text-[#D4AF37]">{dashboard?.metrics?.totalRestaurants || 0}</p>
        </div>

        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Total Orders</span>
          <p className="text-2xl font-black text-[#E8C66A]">{dashboard?.metrics?.totalOrders || 0}</p>
        </div>

        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Gross Delivered Volume</span>
          <p className="text-2xl font-black text-emerald-400">
            Rs. {(dashboard?.metrics?.deliveredRevenueLkr || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#293241] gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition cursor-pointer ${
            activeTab === 'overview' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Overview Breakdown
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition cursor-pointer ${
            activeTab === 'users' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Users & Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`pb-3 transition cursor-pointer ${
            activeTab === 'restaurants' ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Restaurants ({restaurants.length})
        </button>
      </div>

      {/* Tab 1: Overview Breakdown */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#151B23] rounded-3xl p-6 border border-[#293241] shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-[#F8FAFC]">Orders by Status</h3>
            <div className="space-y-3">
              {Object.entries(dashboard?.ordersByStatus || {}).map(([status, count]: [string, any]) => (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#94A3B8] capitalize">
                    <span className="text-[#F8FAFC]">{status.replace(/_/g, ' ')}</span>
                    <span className="text-[#D4AF37]">{count} orders</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#111720] overflow-hidden border border-[#293241]">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E8C66A] rounded-full"
                      style={{
                        width: `${Math.min(100, ((count as number) / Math.max(1, dashboard?.metrics?.totalOrders || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#151B23] rounded-3xl p-6 border border-[#293241] shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-[#F8FAFC]">Users by Role</h3>
            <div className="space-y-3">
              {Object.entries(dashboard?.usersByRole || {}).map(([role, count]: [string, any]) => (
                <div key={role} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#94A3B8] capitalize">
                    <span className="text-[#F8FAFC]">{role.replace(/_/g, ' ')}</span>
                    <span className="text-[#D4AF37]">{count} accounts</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#111720] overflow-hidden border border-[#293241]">
                    <div
                      className="h-full bg-[#D4AF37] rounded-full"
                      style={{
                        width: `${Math.min(100, ((count as number) / Math.max(1, dashboard?.metrics?.totalUsers || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-[#151B23] rounded-3xl border border-[#293241] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#94A3B8]">
              <thead className="bg-[#111720] text-[#F8FAFC] uppercase font-black tracking-wider text-[11px] border-b border-[#293241]">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293241] font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1C2530]/50 transition">
                    <td className="p-4 font-bold text-[#F8FAFC]">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.phone}</td>
                    <td className="p-4">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] capitalize">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] capitalize ${
                          u.status === 'active'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-red-950/60 text-red-400 border border-red-800/60'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-800/60'
                              : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60'
                          }`}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Restaurants Management */}
      {activeTab === 'restaurants' && (
        <div className="bg-[#151B23] rounded-3xl border border-[#293241] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#94A3B8]">
              <thead className="bg-[#111720] text-[#F8FAFC] uppercase font-black tracking-wider text-[11px] border-b border-[#293241]">
                <tr>
                  <th className="p-4">Restaurant</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Open Status</th>
                  <th className="p-4">Approval</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293241] font-medium">
                {restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-[#1C2530]/50 transition">
                    <td className="p-4 font-bold text-[#F8FAFC]">{r.name}</td>
                    <td className="p-4">{r.city}</td>
                    <td className="p-4 font-bold text-[#D4AF37]">{r.rating.toFixed(1)}★</td>
                    <td className="p-4">
                      <span className={r.isOpen ? 'text-emerald-400 font-bold' : 'text-[#94A3B8]'}>
                        {r.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] capitalize ${
                          r.status === 'approved'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : r.status === 'suspended'
                            ? 'bg-red-950/60 text-red-400 border border-red-800/60'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'approved' ? (
                        <button
                          onClick={() => handleUpdateRestaurantStatus(r.id, 'suspended')}
                          className="px-3 py-1 rounded-xl text-red-400 hover:bg-red-950/60 text-[11px] font-bold border border-red-800/60 cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateRestaurantStatus(r.id, 'approved')}
                          className="px-3 py-1 rounded-xl text-emerald-400 hover:bg-emerald-950/60 text-[11px] font-bold border border-emerald-800/60 cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
