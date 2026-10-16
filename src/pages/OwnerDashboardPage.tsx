import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import type { Restaurant, MenuItem, Order, OrderStatus } from '../types/index.js';
import { OrderStatusBadge } from '../components/OrderStatusBadge.js';
import { ImageWithFallback } from '../components/ImageWithFallback.js';
import {
  Store,
  ShoppingBag,
  DollarSign,
  Plus,
  Trash2,
  Check,
  Power,
  RotateCcw,
  Utensils,
  X,
  Sparkles,
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');
  const [isLoading, setIsLoading] = useState(true);

  // New Menu Item Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceLkr, setPriceLkr] = useState('');
  const [category, setCategory] = useState('Rice & Curry');
  const [imageUrl, setImageUrl] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isSpicy, setIsSpicy] = useState(true);

  async function loadDashboard() {
    try {
      const [dashRes, ordersRes, menuRes] = await Promise.all([
        api.owner.getDashboard(),
        api.owner.getOrders(),
        api.owner.getMenu(),
      ]);

      setMetrics(dashRes.metrics);
      setRestaurants(dashRes.restaurants);
      setOrders(ordersRes.orders);
      setMenuItems(menuRes.menuItems);
    } catch (err) {
      console.error('Owner dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.owner.updateOrderStatus(orderId, status);
      await loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleToggleOpen = async (restaurantId: string) => {
    try {
      await api.owner.toggleOpen(restaurantId);
      await loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle kitchen open/close state');
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !priceLkr) return;

    try {
      await api.menu.create({
        restaurantId: restaurants[0]?.id || 'rest_1',
        name: name.trim(),
        description: description.trim(),
        priceLkr: Number(priceLkr),
        category,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isVegetarian,
        isSpicy,
        isHalal: true,
        preparationTimeMinutes: 25,
      });

      setAddModalOpen(false);
      setName('');
      setDescription('');
      setPriceLkr('');
      setImageUrl('');
      await loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to create menu item');
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu dish?')) return;
    try {
      await api.menu.delete(id);
      await loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to delete dish');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#293241] border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#94A3B8]">Loading Restaurant Partner Portal...</p>
      </div>
    );
  }

  const primaryRestaurant = restaurants[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      {/* Top Banner */}
      <div className="bg-[#151B23] rounded-3xl p-6 sm:p-8 border border-[#293241] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Restaurant Management Portal</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/40">
                Partner Hub
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Managing: <strong className="text-[#D4AF37]">{primaryRestaurant?.name || 'Partner Kitchens'}</strong>
            </p>
          </div>
        </div>

        {primaryRestaurant && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-[#F8FAFC] block">
                Kitchen Status: {primaryRestaurant.isOpen ? '🟢 Open for Orders' : '🔴 Closed'}
              </span>
              <span className="text-[10px] text-[#94A3B8]">Toggle live customer order intake</span>
            </div>
            <button
              onClick={() => handleToggleOpen(primaryRestaurant.id)}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                primaryRestaurant.isOpen
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60'
                  : 'bg-[#1C2530] text-[#94A3B8] border-[#293241] hover:bg-[#293241]'
              }`}
              title="Toggle Restaurant Open/Closed"
            >
              <Power className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Total Orders</span>
          <p className="text-2xl font-black text-[#F8FAFC]">{metrics?.totalOrders || 0}</p>
        </div>

        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Active In Kitchen</span>
          <p className="text-2xl font-black text-[#D4AF37]">{metrics?.activeOrdersCount || 0}</p>
        </div>

        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Delivered Revenue</span>
          <p className="text-2xl font-black text-emerald-400">
            Rs. {(metrics?.totalRevenueLkr || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-[#151B23] p-5 rounded-2xl border border-[#293241] shadow-xl space-y-1">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Active Dishes</span>
          <p className="text-2xl font-black text-[#F8FAFC]">{menuItems.length}</p>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-[#293241] gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition cursor-pointer ${
            activeTab === 'orders'
              ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Orders Management ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 transition cursor-pointer ${
            activeTab === 'menu'
              ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Menu & Dish Catalog ({menuItems.length})
        </button>
      </div>

      {/* Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#F8FAFC]">Live Customer Orders</h2>
            <button
              onClick={loadDashboard}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Refresh Orders
            </button>
          </div>

          <div className="bg-[#151B23] rounded-3xl border border-[#293241] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#94A3B8]">
                <thead className="bg-[#111720] text-[#F8FAFC] uppercase font-black tracking-wider text-[11px] border-b border-[#293241]">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Dishes</th>
                    <th className="p-4">Total (LKR)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Kitchen Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293241] font-medium">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#94A3B8]">
                        No orders currently in the queue.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#1C2530]/50 transition">
                        <td className="p-4 font-mono font-bold text-[#F8FAFC]">{ord.orderNumber}</td>
                        <td className="p-4">
                          <span className="font-bold text-[#F8FAFC] block">{ord.customerName}</span>
                          <span className="text-[11px] text-[#94A3B8]">{ord.deliveryAddress.city}</span>
                        </td>
                        <td className="p-4 max-w-xs truncate text-[#F8FAFC]">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="p-4 font-black text-[#D4AF37]">
                          Rs. {ord.totalLkr.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <OrderStatusBadge status={ord.status} size="sm" />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'confirmed')}
                                className="px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-[11px] transition cursor-pointer"
                              >
                                Accept Order
                              </button>
                            )}

                            {ord.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'preparing')}
                                className="px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-[11px] transition cursor-pointer"
                              >
                                Start Cooking
                              </button>
                            )}

                            {ord.status === 'preparing' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'ready_for_pickup')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0B0F14] font-black text-[11px] transition cursor-pointer"
                              >
                                Ready For Pickup
                              </button>
                            )}

                            {ord.status === 'ready_for_pickup' && (
                              <span className="text-[11px] text-[#94A3B8] font-semibold italic">
                                Awaiting Rider
                              </span>
                            )}

                            {ord.status === 'on_the_way' && (
                              <span className="text-[11px] text-[#D4AF37] font-bold">
                                Out for Delivery
                              </span>
                            )}

                            {ord.status === 'delivered' && (
                              <span className="text-[11px] text-emerald-400 font-bold">
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Menu Items Catalog */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#F8FAFC]">Menu Items for {primaryRestaurant?.name}</h2>
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#151B23] rounded-2xl p-4 border border-[#293241] shadow-xl flex items-start gap-3 hover:border-[#D4AF37]/40 transition"
              >
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.name}
                  fallbackType="food"
                  className="w-16 h-16 rounded-xl object-cover bg-[#1C2530] border border-[#293241] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#F8FAFC] text-xs truncate leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#D4AF37] font-black mt-0.5">
                    Rs. {item.priceLkr.toLocaleString()}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1C2530] text-[#94A3B8] border border-[#293241]">
                    {item.category}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteMenuItem(item.id)}
                  className="p-1.5 text-[#94A3B8] hover:text-red-400 transition cursor-pointer"
                  title="Delete dish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Dish Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0B0F14]/80 backdrop-blur-xs" onClick={() => setAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#151B23] border border-[#293241] rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-[#F8FAFC]">
            <div className="flex items-center justify-between pb-2 border-b border-[#293241]">
              <h3 className="font-bold text-base text-[#F8FAFC]">Add New Dish to Menu</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMenuItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cheese Crab Kottu"
                  className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Price in LKR (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={priceLkr}
                    onChange={(e) => setPriceLkr(e.target.value)}
                    placeholder="1500"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Category</label>
                  <select
                    aria-label="Dish Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] focus:outline-hidden focus:border-[#D4AF37]"
                  >
                    <option value="Rice & Curry">Rice & Curry</option>
                    <option value="Kottu Roti">Kottu Roti</option>
                    <option value="Hoppers & Roti">Hoppers & Roti</option>
                    <option value="Seafood Specialties">Seafood Specialties</option>
                    <option value="Biriyani & Pulao">Biriyani & Pulao</option>
                    <option value="Desserts & Fresh Juices">Desserts & Fresh Juices</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients, preparation style..."
                  className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-[#F8FAFC] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    className="accent-[#D4AF37] rounded"
                  />
                  <span>Vegetarian</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-[#F8FAFC] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpicy}
                    onChange={(e) => setIsSpicy(e.target.checked)}
                    className="accent-[#D4AF37] rounded"
                  />
                  <span>Spicy</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#293241]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black rounded-xl cursor-pointer"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
