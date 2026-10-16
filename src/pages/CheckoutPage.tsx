import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useCart } from '../contexts/CartContext.js';
import { useToast } from '../contexts/ToastContext.js';
import { api } from '../services/api.js';
import type { Address } from '../types/index.js';
import {
  MapPin,
  Phone,
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowRight,
  AlertCircle,
  Compass,
  Smartphone,
  Heart,
  Check,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { items, restaurantId, restaurantName, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const passedPromo = (location.state as any)?.promoCode || '';

  // Form states
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Colombo 03 (Kollupitiya)');
  const [district, setDistrict] = useState('Colombo');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstruction, setDeliveryInstruction] = useState('Ring the gate bell');
  const [phone, setPhone] = useState(user?.phone || '+94 77 123 4567');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card_demo' | 'frimi_demo'>('cod');
  const [needChangeFor5000, setNeedChangeFor5000] = useState(false);
  const [riderTipLkr, setRiderTipLkr] = useState<number>(100);

  // Promo code validation
  const [promoInput, setPromoInput] = useState(passedPromo);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Card demo fields
  const [cardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder] = useState(user?.name || 'NIMAL PERERA');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.users
        .getAddresses()
        .then((res) => {
          setSavedAddresses(res.addresses);
          if (res.addresses.length > 0) {
            const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setAddressLine(defaultAddr.addressLine);
            setCity(defaultAddr.city);
            setDistrict(defaultAddr.district);
            setLandmark(defaultAddr.landmark || '');
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleDetectLocation = () => {
    showToast('Detecting current GPS location in Sri Lanka...', 'info');
    setTimeout(() => {
      setAddressLine('48/2, R.A. De Mel Mawatha, Kollupitiya');
      setCity('Colombo 03');
      setDistrict('Colombo');
      setLandmark('Near Liberty Plaza / Mahanama College junction');
      showToast('Location accurately detected in Colombo 03', 'success');
    }, 600);
  };

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setDistrict(addr.district);
    setLandmark(addr.landmark || '');
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    try {
      const res = await api.promotions.validate(promoInput.trim(), subtotal);
      if (res.valid) {
        setAppliedPromo({
          code: res.code,
          description: res.description,
          discountType: res.discountType,
          discountValue: res.discountValue,
          discountLkr: res.discountLkr,
        });
        showToast(
          `Promo "${res.code}" applied: ${res.description}`,
          'success',
          'Coupon Applied!'
        );
      } else {
        showToast('Invalid or expired voucher code', 'error');
      }
    } catch {
      showToast('Could not validate promo code', 'error');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in or register before checking out.', 'warning');
      navigate('/login');
      return;
    }

    if (!restaurantId || items.length === 0) {
      navigate('/cart');
      return;
    }

    if (!addressLine.trim() || !city.trim()) {
      setError('Please provide a complete street address and city in Sri Lanka.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const deliveryAddress: Address = {
      id: selectedAddressId || `addr_${Date.now()}`,
      label: 'Delivery Location',
      addressLine: addressLine.trim(),
      city: city.trim(),
      district: district.trim(),
      landmark: landmark.trim() || undefined,
      isDefault: false,
    };

    const combinedNotes = [
      deliveryInstruction ? `Instruction: ${deliveryInstruction}` : '',
      needChangeFor5000 ? 'Rider note: Please bring change for Rs. 5,000' : '',
      riderTipLkr > 0 ? `Rider Tip: Rs. ${riderTipLkr} added` : '',
      notes.trim() ? `User note: ${notes.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const orderPayload = {
      restaurantId,
      items: items.map((i) => ({
        menuItemId: i.menuItem.id,
        quantity: i.quantity,
        instructions: i.instructions,
        selectedCustomizations: i.selectedCustomizations,
      })),
      deliveryAddress,
      paymentMethod: paymentMethod === 'frimi_demo' ? 'card_demo' : paymentMethod,
      promoCode: appliedPromo?.code || undefined,
      notes: combinedNotes || undefined,
    };

    try {
      const res = await api.orders.create(orderPayload);
      clearCart();
      showToast(`Order ${res.order.orderNumber} successfully placed!`, 'success', 'Order Confirmed');
      navigate(`/orders/${res.order.id}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to place order.');
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = items.reduce((s, i) => s + i.menuItem.priceLkr * i.quantity, 0);
  const deliveryFee = 250;

  let discountLkr = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discountLkr = Math.min(
        Math.round((subtotal * appliedPromo.discountValue) / 100),
        appliedPromo.maxDiscountLkr || 1000
      );
    } else {
      discountLkr = appliedPromo.discountValue;
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee - discountLkr + riderTipLkr);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      <div>
        <h1 className="text-3xl font-black text-[#F8FAFC] tracking-tight">Checkout</h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Review your Sri Lankan delivery details for <strong className="text-[#D4AF37]">{restaurantName}</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-[#151B23] rounded-3xl p-6 sm:p-8 border border-[#293241] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-[#F8FAFC] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <span>1. Delivery Address in Sri Lanka</span>
              </h2>

              <button
                type="button"
                onClick={handleDetectLocation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C2530] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B0F14] text-xs font-bold transition border border-[#D4AF37]/30 cursor-pointer shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Use Current Location</span>
              </button>
            </div>

            {/* Saved addresses selector */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#94A3B8]">Choose from saved addresses:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? 'border-[#D4AF37] bg-[#1C2530] text-[#D4AF37] font-bold shadow-md'
                          : 'border-[#293241] hover:border-[#D4AF37]/40 text-[#94A3B8] bg-[#111720]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#F8FAFC]">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#293241] text-[#D4AF37] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[#94A3B8] mt-1 line-clamp-1">{addr.addressLine}</p>
                      <p className="text-[11px] text-[#94A3B8]/70">
                        {addr.city}, {addr.district}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">
                  Street Address & House / Flat No. <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. 42/B, Galle Road, Kollupitiya"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] focus:bg-[#151B23] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#F8FAFC] mb-1">
                    City / Area <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Colombo 03, Kandy City, Galle Fort"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] focus:bg-[#151B23] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F8FAFC] mb-1">District</label>
                  <select
                    aria-label="District selection"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] focus:outline-hidden focus:border-[#D4AF37]"
                  >
                    {[
                      'Colombo',
                      'Gampaha',
                      'Kalutara',
                      'Kandy',
                      'Galle',
                      'Matara',
                      'Kurunegala',
                      'Negombo',
                    ].map((d) => (
                      <option key={d} value={d} className="bg-[#151B23]">
                        {d} District
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">
                  Landmark / Building Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Liberty Plaza, Blue gate, Next to Bank of Ceylon"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] focus:bg-[#151B23] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC]"
                />
              </div>
            </div>
          </div>

          {/* 2. Contact Phone & Delivery Instructions */}
          <div className="bg-[#151B23] rounded-3xl p-6 sm:p-8 border border-[#293241] shadow-2xl space-y-4">
            <h2 className="font-extrabold text-base text-[#F8FAFC] flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#D4AF37]" />
              <span>2. Recipient Phone & Delivery Instructions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">
                  Recipient Contact Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">
                  Delivery Option
                </label>
                <select
                  aria-label="Delivery Option"
                  value={deliveryInstruction}
                  onChange={(e) => setDeliveryInstruction(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] focus:outline-hidden"
                >
                  <option value="Ring the gate bell" className="bg-[#151B23]">Ring the gate bell</option>
                  <option value="Leave with security guard" className="bg-[#151B23]">Leave with security desk</option>
                  <option value="Call upon arrival" className="bg-[#151B23]">Call upon arrival</option>
                  <option value="Meet outside at road" className="bg-[#151B23]">Meet outside at road</option>
                  <option value="Do not ring bell (Baby sleeping)" className="bg-[#151B23]">Do not ring bell (Silent)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F8FAFC] mb-1">
                Additional Notes for Rider
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please ring intercom #402, use side stairs"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC]"
              />
            </div>
          </div>

          {/* 3. Sri Lankan Payment Method */}
          <div className="bg-[#151B23] rounded-3xl p-6 sm:p-8 border border-[#293241] shadow-2xl space-y-4">
            <h2 className="font-extrabold text-base text-[#F8FAFC] flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[#D4AF37]" />
              <span>3. Sri Lankan Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* COD */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-[#D4AF37] bg-[#1C2530] text-[#D4AF37] font-bold shadow-md'
                    : 'border-[#293241] hover:border-[#D4AF37]/40 text-[#94A3B8] bg-[#111720]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-black text-sm text-[#F8FAFC]">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Cash on Delivery</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#D4AF37]"
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8] font-normal">
                  Pay our rider in cash (LKR) when your hot food arrives.
                </p>
              </label>

              {/* LankaPay / Card */}
              <label
                onClick={() => setPaymentMethod('card_demo')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === 'card_demo'
                    ? 'border-[#D4AF37] bg-[#1C2530] text-[#D4AF37] font-bold shadow-md'
                    : 'border-[#293241] hover:border-[#D4AF37]/40 text-[#94A3B8] bg-[#111720]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-black text-sm text-[#F8FAFC]">
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    <span>Visa / LankaPay</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card_demo'}
                    onChange={() => setPaymentMethod('card_demo')}
                    className="accent-[#D4AF37]"
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8] font-normal">
                  Debit / Credit card gateway simulation (Visa, Mastercard, Amex).
                </p>
              </label>

              {/* FriMi / Digital Wallet */}
              <label
                onClick={() => setPaymentMethod('frimi_demo')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === 'frimi_demo'
                    ? 'border-[#D4AF37] bg-[#1C2530] text-[#D4AF37] font-bold shadow-md'
                    : 'border-[#293241] hover:border-[#D4AF37]/40 text-[#94A3B8] bg-[#111720]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-black text-sm text-[#F8FAFC]">
                    <Smartphone className="w-4 h-4 text-orange-400" />
                    <span>FriMi / Genie</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'frimi_demo'}
                    onChange={() => setPaymentMethod('frimi_demo')}
                    className="accent-[#D4AF37]"
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8] font-normal">
                  Instant mobile wallet checkout (Nations Trust FriMi / Dialog Genie).
                </p>
              </label>
            </div>

            {/* COD Change Note */}
            {paymentMethod === 'cod' && (
              <div className="p-3.5 rounded-2xl bg-[#111720] border border-[#293241] flex items-center justify-between text-xs text-[#94A3B8]">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={needChangeFor5000}
                    onChange={(e) => setNeedChangeFor5000(e.target.checked)}
                    className="accent-[#D4AF37] rounded"
                  />
                  <span>I will pay with a <strong className="text-[#F8FAFC]">Rs. 5,000 note</strong> (Rider brings change)</span>
                </label>
              </div>
            )}

            {/* Card Simulator Graphic */}
            {paymentMethod === 'card_demo' && (
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#111720] via-[#151B23] to-[#1C2530] border border-[#D4AF37]/30 text-[#F8FAFC] space-y-3 shadow-md max-w-sm">
                <div className="flex justify-between items-center text-xs text-[#94A3B8]">
                  <span>LankaPay Secured Checkout</span>
                  <span className="font-bold text-[#D4AF37]">VISA / MASTERCARD</span>
                </div>
                <p className="font-mono text-base tracking-widest font-black text-[#F8FAFC]">{cardNumber}</p>
                <div className="flex justify-between text-[11px] text-[#94A3B8]">
                  <span>Card Holder: {cardHolder}</span>
                  <span>Exp: 08/29</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Tip Your Sri Lankan Rider */}
          <div className="bg-[#151B23] rounded-3xl p-6 border border-[#293241] shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#F8FAFC] uppercase tracking-wide flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span>Tip Your Delivery Rider (100% goes to rider)</span>
              </span>
              <span className="text-xs font-black text-[#D4AF37]">
                {riderTipLkr > 0 ? `+Rs. ${riderTipLkr}` : 'No Tip'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0, 100, 200, 500].map((tip) => (
                <button
                  type="button"
                  key={tip}
                  onClick={() => setRiderTipLkr(tip)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    riderTipLkr === tip
                      ? 'bg-[#D4AF37] text-[#0B0F14] shadow-md font-black'
                      : 'bg-[#111720] border border-[#293241] text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {tip === 0 ? 'No Tip' : `Rs. ${tip}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Sticky Column */}
        <div className="space-y-6">
          <div className="bg-[#151B23] rounded-3xl p-6 border border-[#293241] shadow-2xl space-y-4 sticky top-28">
            <h3 className="font-black text-sm text-[#F8FAFC]">Order Summary</h3>

            {/* Promo Code Form */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">
                Apply Voucher Code
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="e.g. FOODORA20"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#293241] bg-[#111720] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC] font-mono font-bold uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo}
                  className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black transition cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-[11px] text-emerald-400 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {appliedPromo.code} Applied
                  </span>
                  <button
                    type="button"
                    onClick={() => setAppliedPromo(null)}
                    className="text-emerald-300 underline text-[10px] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="max-h-56 overflow-y-auto space-y-2 divide-y divide-[#293241] pr-1">
              {items.map((i) => (
                <div key={i.menuItem.id} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-[#F8FAFC] block truncate">
                      {i.quantity}x {i.menuItem.name}
                    </span>
                    {i.selectedCustomizations && i.selectedCustomizations.length > 0 && (
                      <span className="text-[10px] text-[#94A3B8] block truncate">
                        {i.selectedCustomizations.join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[#D4AF37] flex-shrink-0">
                    Rs. {(i.menuItem.priceLkr * i.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-[#293241] space-y-2 text-xs text-[#94A3B8]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#F8FAFC]">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Island Delivery Fee</span>
                <span className="font-bold text-[#F8FAFC]">Rs. {deliveryFee.toLocaleString()}</span>
              </div>
              {discountLkr > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Voucher Discount</span>
                  <span>-Rs. {discountLkr.toLocaleString()}</span>
                </div>
              )}
              {riderTipLkr > 0 && (
                <div className="flex justify-between text-[#D4AF37] font-bold">
                  <span>Rider Tip</span>
                  <span>+Rs. {riderTipLkr.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#F8FAFC] pt-2 border-t border-[#293241]">
                <span>Total Amount</span>
                <span className="text-[#D4AF37] font-black text-xl">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#E8C66A] to-[#B89628] hover:opacity-95 text-[#0B0F14] shadow-lg shadow-[#D4AF37]/20 transition cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#0B0F14] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Confirm Order (Rs. {grandTotal.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 justify-center text-[11px] text-[#94A3B8]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safe & Secure Sri Lankan Foodora Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
