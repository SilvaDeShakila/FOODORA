import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.js';
import { ImageWithFallback } from './ImageWithFallback.js';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, AlertCircle } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    restaurantName,
    subtotalLkr,
    minOrderLkr,
    deliveryFeeLkr,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const minOrderMet = subtotalLkr >= minOrderLkr;
  const remainingForMin = minOrderLkr - subtotalLkr;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0F14]/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#151B23] border-l border-[#293241] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 text-[#F8FAFC]">
        {/* Header */}
        <div className="p-4 border-b border-[#293241] flex items-center justify-between bg-[#111720]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h2 className="font-extrabold text-[#F8FAFC] leading-tight">Your Order</h2>
              {restaurantName && (
                <p className="text-xs text-[#94A3B8] font-medium truncate max-w-[220px]">
                  from {restaurantName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-[#94A3B8] hover:text-red-400 px-2 py-1 rounded-lg hover:bg-[#1C2530] transition cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg hover:bg-[#1C2530] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#94A3B8]">
              <div className="w-16 h-16 rounded-2xl bg-[#1C2530] border border-[#293241] flex items-center justify-center text-[#D4AF37] mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-[#F8FAFC] text-lg mb-1">Your cart is empty</h3>
              <p className="text-sm text-[#94A3B8] max-w-xs mb-4">
                Explore delicious Sri Lankan dishes from top partner restaurants and add items to your cart.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/restaurants');
                }}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black rounded-xl transition shadow-md cursor-pointer"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="flex items-start justify-between gap-3 p-3.5 rounded-2xl border border-[#293241] bg-[#111720]/80 transition hover:border-[#D4AF37]/40"
                >
                  <ImageWithFallback
                    src={item.menuItem.imageUrl}
                    alt={item.menuItem.name}
                    fallbackType="food"
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-[#293241]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#F8FAFC] text-sm leading-tight truncate">
                      {item.menuItem.name}
                    </h4>
                    <p className="text-xs text-[#D4AF37] font-black mt-0.5">
                      Rs. {item.menuItem.priceLkr.toLocaleString()}
                    </p>
                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                      <p className="text-[10px] text-[#94A3B8] font-medium truncate mt-0.5">
                        {item.selectedCustomizations.join(' • ')}
                      </p>
                    )}
                    {item.instructions && (
                      <p className="text-xs text-[#94A3B8] italic truncate mt-0.5">
                        &quot;{item.instructions}&quot;
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-[#293241] rounded-xl bg-[#151B23] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C2530] transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#F8FAFC] min-w-[20px] text-center">
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
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-[#F8FAFC]">
                      Rs. {(item.menuItem.priceLkr * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Calculations */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#293241] bg-[#111720] space-y-3">
            {!minOrderMet && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-2 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>
                  Add <strong>Rs. {remainingForMin.toLocaleString()}</strong> more to reach the minimum order of{' '}
                  <strong>Rs. {minOrderLkr.toLocaleString()}</strong>.
                </span>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-[#94A3B8]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#F8FAFC]">Rs. {subtotalLkr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-[#F8FAFC]">Rs. {deliveryFeeLkr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#F8FAFC] pt-1.5 border-t border-[#293241]">
                <span>Estimated Total</span>
                <span className="text-[#D4AF37] font-black text-base">
                  Rs. {(subtotalLkr + deliveryFeeLkr).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={!minOrderMet}
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className={`flex-1 py-3.5 px-4 rounded-xl font-black flex items-center justify-center gap-2 text-sm transition shadow-lg ${
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
        )}
      </div>
    </div>
  );
};
