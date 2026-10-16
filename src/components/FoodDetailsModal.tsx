import React, { useState } from 'react';
import type { MenuItem, Restaurant } from '../types/index.js';
import { useCart } from '../contexts/CartContext.js';
import { useToast } from '../contexts/ToastContext.js';
import { ImageWithFallback } from './ImageWithFallback.js';
import { X, Plus, Minus, Flame, Leaf, Check } from 'lucide-react';

interface FoodDetailsModalProps {
  item: MenuItem | null;
  restaurant: Restaurant;
  onClose: () => void;
}

export const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({ item, restaurant, onClose }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [portionSize, setPortionSize] = useState<'Regular' | 'Large' | 'Family'>('Regular');
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Ceylon Hot'>('Medium');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  if (!item) return null;

  // Portion pricing logic
  const portionPriceDeltas: Record<'Regular' | 'Large' | 'Family', number> = {
    Regular: 0,
    Large: 350,
    Family: 850,
  };

  // Standard Sri Lankan Add-ons
  const standardAddons = [
    { label: 'Fresh Pol Sambol (Coconut & Chili)', priceDelta: 80 },
    { label: 'Crispy Fried Egg (Bullseye / Sunny Side)', priceDelta: 100 },
    { label: 'Extra Rich Curry Gravy Cup', priceDelta: 120 },
    { label: 'Spicy Fish Cutlet (1 pc)', priceDelta: 150 },
    { label: 'Papadam Crisps Pack', priceDelta: 90 },
  ];

  const handleAddonToggle = (label: string) => {
    setSelectedAddons((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  // Calculate total unit price including portion and add-ons
  const addonsTotal = selectedAddons.reduce((sum, label) => {
    const addon = standardAddons.find((a) => a.label === label);
    return sum + (addon ? addon.priceDelta : 0);
  }, 0);

  const unitPrice = item.priceLkr + portionPriceDeltas[portionSize] + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const combinedCustomizations = [
      `Portion: ${portionSize}`,
      `Spice: ${spiceLevel}`,
      ...selectedAddons,
    ];

    const success = addItem(
      {
        ...item,
        priceLkr: unitPrice,
      },
      restaurant,
      quantity,
      instructions.trim(),
      combinedCustomizations
    );

    if (success) {
      setAdded(true);
      showToast(
        `Added ${quantity}x ${item.name} (${portionSize}) to order`,
        'success',
        'Added to Cart'
      );
      setTimeout(() => {
        onClose();
      }, 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#0B0F14]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#151B23] border border-[#293241] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] text-[#F8FAFC]">
        {/* Cover Header */}
        <div className="relative h-56 w-full bg-[#1C2530] flex-shrink-0">
          <ImageWithFallback
            src={item.imageUrl}
            alt={item.name}
            fallbackType="food"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151B23] via-[#151B23]/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#0B0F14]/70 hover:bg-[#0B0F14] text-[#F8FAFC] transition border border-[#293241] cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-[#F8FAFC]">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {item.isVegetarian && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  <Leaf className="w-3 h-3" /> Pure Veg
                </span>
              )}
              {item.isSpicy && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/50">
                  <Flame className="w-3 h-3" /> Spicy Recipe
                </span>
              )}
              {item.isHalal && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-400 border border-sky-800/80">
                  Halal Certified
                </span>
              )}
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#1C2530] text-[#94A3B8] border border-[#293241]">
                {restaurant.name}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black leading-tight text-[#F8FAFC]">{item.name}</h3>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Description & Base info */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[#D4AF37] font-black text-2xl">
                Rs. {unitPrice.toLocaleString()}
              </span>
              <span className="text-xs text-[#94A3B8] font-medium">
                Prep: ~{item.preparationTimeMinutes} mins
              </span>
            </div>
            <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed">{item.description}</p>
          </div>

          {/* 1. Portion Size Options */}
          <div className="space-y-2 pt-2 border-t border-[#293241]">
            <label className="block text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
              1. Choose Portion Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Regular', label: 'Regular', delta: 0, desc: 'Single serving' },
                { id: 'Large', label: 'Large (+Rs. 350)', delta: 350, desc: 'Generous portion' },
                { id: 'Family', label: 'Family (+Rs. 850)', delta: 850, desc: 'Serves 2-3 people' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPortionSize(p.id as any)}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                    portionSize === p.id
                      ? 'border-[#D4AF37] bg-[#1C2530] text-[#D4AF37] font-bold shadow-md'
                      : 'border-[#293241] hover:border-[#D4AF37]/40 text-[#94A3B8] bg-[#111720]'
                  }`}
                >
                  <span className="block text-xs font-bold">{p.label}</span>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Spice Level Selector */}
          <div className="space-y-2 pt-2 border-t border-[#293241]">
            <label className="block text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
              2. Sri Lankan Spice Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Mild', label: 'Mild', desc: 'Gentle, light spice' },
                { id: 'Medium', label: 'Medium', desc: 'Standard island heat' },
                { id: 'Ceylon Hot', label: 'Ceylon Hot 🔥', desc: 'Authentic village heat' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSpiceLevel(s.id as any)}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                    spiceLevel === s.id
                      ? 'border-[#D4AF37] bg-[#1C2530] text-[#D4AF37] font-bold shadow-md'
                      : 'border-[#293241] hover:border-[#D4AF37]/40 text-[#94A3B8] bg-[#111720]'
                  }`}
                >
                  <span className="block text-xs font-bold">{s.label}</span>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Sri Lankan Extras & Add-ons */}
          <div className="space-y-2 pt-2 border-t border-[#293241]">
            <label className="block text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
              3. Delicious Sri Lankan Add-ons
            </label>
            <div className="space-y-1.5">
              {standardAddons.map((addon) => {
                const isSelected = selectedAddons.includes(addon.label);
                return (
                  <label
                    key={addon.label}
                    onClick={() => handleAddonToggle(addon.label)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#1C2530] text-[#F8FAFC] font-semibold'
                        : 'border-[#293241] hover:border-[#D4AF37]/40 text-[#94A3B8] bg-[#111720]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="accent-[#D4AF37] rounded w-4 h-4"
                      />
                      <span className="font-medium text-[#F8FAFC]">{addon.label}</span>
                    </div>
                    <span className="font-bold text-[#D4AF37]">+Rs. {addon.priceDelta}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Special Instructions */}
          <div className="space-y-2 pt-2 border-t border-[#293241]">
            <label className="block text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
              4. Special Kitchen Notes
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Pack gravy in a separate tub, extra lime wedge..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC]"
              maxLength={150}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#293241] bg-[#111720] flex items-center justify-between gap-4 flex-shrink-0">
          {/* Quantity Counter */}
          <div className="flex items-center border border-[#293241] rounded-2xl bg-[#151B23] shadow-2xs overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C2530] transition cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-bold text-[#F8FAFC] min-w-[28px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C2530] transition cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
              added
                ? 'bg-emerald-600 text-[#0B0F14]'
                : 'bg-gradient-to-r from-[#D4AF37] via-[#E8C66A] to-[#B89628] hover:opacity-95 text-[#0B0F14] shadow-[#D4AF37]/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <span>Add to Cart</span>
                <span>•</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
