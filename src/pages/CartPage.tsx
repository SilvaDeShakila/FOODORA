import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.js';
import { api } from '../services/api.js';
import { ImageWithFallback } from '../components/ImageWithFallback.js';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  AlertCircle,
  Tag,
  Check,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    items,
    restaurantName,
    restaurantId,
    subtotalLkr,
    minOrderLkr,
    deliveryFeeLkr,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountLkr: number;
    description: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsValidatingPromo(true);
    setPromoError(null);
    try {
      const res = await api.promotions.validate(promoInput.trim(), subtotalLkr);
      if (res.valid) {
        setAppliedPromo({
          code: res.code,
          discountLkr: res.discountLkr,
          description: res.description,
        });
      }
    } catch (err: any) {
      setPromoError(err.message || 'Invalid promotion code.');
      setAppliedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const discountLkr = appliedPromo ? appliedPromo.discountLkr : 0;
  const totalLkr = Math.max(0, subtotalLkr + deliveryFeeLkr - discountLkr);
  const minOrderMet = subtotalLkr >= minOrderLkr;
  const remainingForMin = minOrderLkr - subtotalLkr;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-[#151B23] rounded-3xl border border-[#293241] shadow-2xl space-y-4 text-[#F8FAFC]">
        <div className="w-20 h-20 rounded-2xl bg-[#1C2530] text-[#D4AF37] border border-[#293241] mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-[#F8FAFC]">Your Cart is Empty</h2>
        <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
          Explore delicious authentic dishes from our partner kitchens across Sri Lanka.
        </p>
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-xs shadow-md transition cursor-pointer"
        >
          <span>Find Restaurants</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      <div>
        <h1 className="text-3xl font-black text-[#F8FAFC] tracking-tight">Your Cart</h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Ordering from <strong className="text-[#D4AF37]">{restaurantName}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#151B23] rounded-3xl p-6 border border-[#293241] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#293241]">
              <span className="font-bold text-sm text-[#F8FAFC]">{items.length} Dishes Selected</span>
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            </div>

            <div className="divide-y divide-[#293241] space-y-4">
              {items.map((item) => (
                <div key={item.menuItem.id} className="pt-4 first:pt-0 flex items-start gap-4">
                  <ImageWithFallback
                    src={item.menuItem.imageUrl}
                    alt={item.menuItem.name}
                    fallbackType="food"
                    className="w-20 h-20 rounded-2xl object-cover bg-[#1C2530] border border-[#293241] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#F8FAFC] text-base leading-snug">
                      {item.menuItem.name}
                    </h3>
                    <p className="text-xs text-[#D4AF37] font-black mt-0.5">
                      Rs. {item.menuItem.priceLkr.toLocaleString()}
                    </p>

                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                      <p className="text-xs text-[#94A3B8] mt-1">
                        Addons: {item.selectedCustomizations.join(', ')}
                      </p>
                    )}

                    {item.instructions && (
                      <p className="text-xs text-[#94A3B8] italic mt-0.5">
                        &quot;{item.instructions}&quot;
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-[#293241] rounded-xl bg-[#111720] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C2530] transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#F8FAFC] min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C2530] transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.menuItem.id)}
                        className="text-[#94A3B8] hover:text-red-400 p-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-[#F8FAFC] text-sm sm:text-base">
                      Rs. {(item.menuItem.priceLkr * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          {/* Coupon input */}
          <div className="bg-[#151B23] rounded-3xl p-6 border border-[#293241] shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-[#F8FAFC] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#D4AF37]" />
              <span>Apply Promo Code</span>
            </h3>

            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="e.g. FOODORA20"
                className="flex-1 px-3.5 py-2 text-xs uppercase font-mono rounded-xl border border-[#293241] bg-[#111720] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC]"
              />
              <button
                type="submit"
                disabled={isValidatingPromo}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-xs rounded-xl transition cursor-pointer"
              >
                Apply
              </button>
            </form>

            {appliedPromo && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>{appliedPromo.code}</strong> applied (-Rs. {appliedPromo.discountLkr})
                  </span>
                </div>
                <button
                  onClick={() => setAppliedPromo(null)}
                  className="text-emerald-300 hover:underline font-bold text-[11px] cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {promoError && (
              <p className="text-xs text-red-400 font-medium">{promoError}</p>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-[#151B23] rounded-3xl p-6 border border-[#293241] shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-[#F8FAFC]">Order Summary</h3>

            {!minOrderMet && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>
                  Minimum order is <strong>Rs. {minOrderLkr.toLocaleString()}</strong>. Please add{' '}
                  <strong>Rs. {remainingForMin.toLocaleString()}</strong> more.
                </span>
              </div>
            )}

            <div className="space-y-2 text-xs text-[#94A3B8]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#F8FAFC]">Rs. {subtotalLkr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee ({restaurantName})</span>
                <span className="font-bold text-[#F8FAFC]">Rs. {deliveryFeeLkr.toLocaleString()}</span>
              </div>
              {discountLkr > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount ({appliedPromo?.code})</span>
                  <span>-Rs. {discountLkr.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#F8FAFC] pt-3 border-t border-[#293241]">
                <span>Total Amount (LKR)</span>
                <span className="text-[#D4AF37] text-xl font-black">
                  Rs. {totalLkr.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              disabled={!minOrderMet}
              onClick={() => {
                navigate('/checkout', { state: { promoCode: appliedPromo?.code } });
              }}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                minOrderMet
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#E8C66A] to-[#B89628] hover:opacity-95 text-[#0B0F14] shadow-[#D4AF37]/20 cursor-pointer'
                  : 'bg-[#1C2530] text-[#94A3B8] border border-[#293241] cursor-not-allowed'
              }`}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
