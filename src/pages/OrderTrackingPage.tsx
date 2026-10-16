import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api.js';
import type { Order } from '../types/index.js';
import { useToast } from '../contexts/ToastContext.js';
import { OrderTimeline } from '../components/OrderTimeline.js';
import { OrderStatusBadge } from '../components/OrderStatusBadge.js';
import { LiveRouteMap } from '../components/LiveRouteMap.js';
import { InvoiceModal } from '../components/InvoiceModal.js';
import {
  ShoppingBag,
  Bike,
  MapPin,
  Phone,
  Clock,
  RotateCw,
  AlertTriangle,
  Play,
  CheckCircle,
  Printer,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play a soft pleasant notification chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {}
  };

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      try {
        const res = await api.orders.getById(id);
        setOrder(res.order);
      } catch (err: any) {
        console.error('Fetch order error:', err);
        setError(err.message || 'Failed to fetch order.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleSimulateNextStep = async () => {
    if (!order) return;
    setIsSimulating(true);
    try {
      const res = await api.orders.simulateStep(order.id);
      setOrder(res.order);
      playChime();
      showToast(`Order status updated to: ${res.order.status.replace(/_/g, ' ')}`, 'info');

      if (res.order.status === 'delivered') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F43F5E', '#F97316', '#10B981', '#FBBF24'],
        });
        showToast('Your food has arrived! Enjoy your meal.', 'success', 'Order Delivered!');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not simulate step', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    setIsCancelling(true);
    try {
      const res = await api.orders.cancel(order.id);
      setOrder(res.order);
      showToast('Order has been cancelled.', 'warning');
    } catch (err: any) {
      showToast(err.message || 'Could not cancel order', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
          Connecting to FOODORA live order stream...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-stone-200 space-y-3 shadow-md">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-stone-900">Order Not Found</h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          {error || 'This order does not exist or you do not have permission to view it.'}
        </p>
        <Link
          to="/restaurants"
          className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl inline-block shadow-md hover:bg-rose-700 transition"
        >
          Explore Restaurants
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const isComplete = order.status === 'delivered';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Order {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>

          <p className="text-xs text-stone-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • From{' '}
            <strong className="text-stone-800">{order.restaurantName}</strong>
          </p>
        </div>

        {/* Action Controls & Simulator */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition cursor-pointer"
            title={soundEnabled ? 'Mute notification sound' : 'Enable notification sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>

          <button
            onClick={() => setShowInvoice(true)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Invoice Receipt</span>
          </button>

          {!isComplete && order.status !== 'cancelled' && (
            <button
              onClick={handleSimulateNextStep}
              disabled={isSimulating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
              title="Advance order lifecycle status for test verification"
            >
              {isSimulating ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Simulate Next Step</span>
            </button>
          )}

          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* 1. Live Interactive Route Map Visualizer */}
      <LiveRouteMap
        status={order.status}
        restaurantName={order.restaurantName}
        restaurantAddress={order.restaurantAddress}
        destinationAddress={`${order.deliveryAddress.addressLine}, ${order.deliveryAddress.city}`}
        riderName={order.riderName || 'Roshan Gunasekara'}
        riderPhone={order.riderPhone || '+94 77 982 3411'}
      />

      {/* 2. Order Progress Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-600" />
            <span>Order Milestone Timeline</span>
          </h2>
          {isComplete && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" /> Order Completed & Enjoyed
            </span>
          )}
        </div>

        <OrderTimeline status={order.status} timeline={order.timeline} />
      </div>

      {/* 3. Details Grid: Delivery Address & Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Delivery Destination Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>Delivery Destination in Sri Lanka</span>
          </h3>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
            <div>
              <span className="font-bold text-stone-900 text-sm block">
                {order.deliveryAddress.addressLine}
              </span>
              <p className="text-stone-600">
                {order.deliveryAddress.city}, {order.deliveryAddress.district} District
              </p>
            </div>

            {order.deliveryAddress.landmark && (
              <div className="pt-2 border-t border-stone-200/70 text-stone-600">
                <strong className="text-stone-800">Landmark / Instructions: </strong>
                <span>&quot;{order.deliveryAddress.landmark}&quot;</span>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200/70 text-stone-600">
              <strong className="text-stone-800">Contact Number: </strong>
              <span>{order.customerPhone}</span>
            </div>

            {order.notes && (
              <div className="pt-2 border-t border-stone-200/70 text-stone-600 italic">
                <strong className="text-stone-800 not-italic">Rider Note: </strong>
                <span>&quot;{order.notes}&quot;</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items & Totals Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-600" />
              <span>Items in this Order ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
            </h3>
            <span className="text-xs text-stone-400 font-semibold">{order.restaurantName}</span>
          </div>

          <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 flex items-start justify-between text-xs gap-3">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-stone-900 block truncate">
                    {item.quantity}x {item.name}
                  </span>
                  {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                    <span className="text-[10px] text-stone-500 block truncate">
                      {item.selectedCustomizations.join(' • ')}
                    </span>
                  )}
                  {item.instructions && (
                    <span className="text-[10px] text-stone-400 italic block truncate">
                      &quot;{item.instructions}&quot;
                    </span>
                  )}
                </div>
                <span className="font-bold text-stone-900 flex-shrink-0">
                  Rs. {(item.priceLkr * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-stone-900">Rs. {order.subtotalLkr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-stone-900">Rs. {order.deliveryFeeLkr.toLocaleString()}</span>
            </div>
            {order.discountLkr > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({order.promoCode || 'Voucher'})</span>
                <span>-Rs. {order.discountLkr.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-100">
              <div>
                <span>Total Amount</span>
                <span className="text-[10px] text-stone-400 block font-normal uppercase">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                </span>
              </div>
              <span className="text-rose-600 font-black text-xl">
                Rs. {order.totalLkr.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
    </div>
  );
};
