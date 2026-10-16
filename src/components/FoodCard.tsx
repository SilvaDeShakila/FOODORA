import React, { useState } from 'react';
import type { MenuItem, Restaurant } from '../types/index.js';
import { FoodDetailsModal } from './FoodDetailsModal.js';
import { ImageWithFallback } from './ImageWithFallback.js';
import { Plus, Flame, Leaf } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
  restaurant: Restaurant;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, restaurant }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group bg-[#151B23] rounded-3xl p-3.5 sm:p-4 border border-[#293241] hover:border-[#D4AF37] hover:shadow-2xl hover:shadow-[#D4AF37]/5 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between"
      >
        {/* Info Column */}
        <div className="flex-1 flex flex-col justify-between order-2 sm:order-1 min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {item.isVegetarian && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                  <Leaf className="w-2.5 h-2.5" /> Pure Veg
                </span>
              )}
              {item.isSpicy && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/40">
                  <Flame className="w-2.5 h-2.5" /> Spicy
                </span>
              )}
              {item.isHalal && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-950/60 text-sky-400 border border-sky-800/60">
                  Halal
                </span>
              )}
            </div>

            <h4 className="font-extrabold text-[#F8FAFC] text-sm sm:text-base group-hover:text-[#D4AF37] transition leading-snug line-clamp-1">
              {item.name}
            </h4>
            <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#293241]">
            <div>
              <span className="text-[#D4AF37] font-black text-sm sm:text-base block">
                Rs. {item.priceLkr.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#94A3B8] font-medium">
                ~{item.preparationTimeMinutes}m prep
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#1C2530] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B0F14] text-xs font-bold transition border border-[#D4AF37]/40 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* Image Column */}
        <div className="relative w-full sm:w-28 sm:h-28 h-36 rounded-2xl overflow-hidden bg-[#1C2530] flex-shrink-0 order-1 sm:order-2 shadow-2xs border border-[#293241]">
          <ImageWithFallback
            src={item.imageUrl}
            alt={item.name}
            fallbackType="food"
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-[#0B0F14]/80 flex items-center justify-center text-[11px] font-bold text-[#F8FAFC] uppercase backdrop-blur-xs">
              Sold Out
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <FoodDetailsModal
          item={item}
          restaurant={restaurant}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};
