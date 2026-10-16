import React from 'react';
import { Link } from 'react-router-dom';
import type { Restaurant } from '../types/index.js';
import { ImageWithFallback } from './ImageWithFallback.js';
import { Star, Clock, Bike, MapPin, Sparkles } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group bg-[#151B23] rounded-3xl overflow-hidden border border-[#293241] hover:border-[#D4AF37] hover:shadow-2xl hover:shadow-[#D4AF37]/5 transition-all duration-300 flex flex-col"
    >
      {/* Cover Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#1C2530]">
        <ImageWithFallback
          src={restaurant.coverImageUrl}
          alt={restaurant.name}
          fallbackType="restaurant"
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151B23] via-[#151B23]/20 to-transparent" />

        {/* Status / Featured Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {restaurant.featured && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D4AF37] text-[#0B0F14] text-[10px] font-black shadow-md tracking-wider">
              <Sparkles className="w-3 h-3" />
              TOP PICK
            </span>
          )}
          {!restaurant.isOpen && (
            <span className="px-2.5 py-1 rounded-full bg-[#0B0F14]/90 backdrop-blur-xs text-[#94A3B8] text-[11px] font-bold border border-[#293241]">
              Closed Now
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0B0F14]/90 backdrop-blur-md border border-[#293241] shadow-md text-xs font-bold text-[#F8FAFC]">
          <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
          <span>{restaurant.rating.toFixed(1)}</span>
          <span className="text-[#94A3B8] font-normal text-[11px]">({restaurant.reviewCount})</span>
        </div>

        {/* Logo Avatar */}
        <div className="absolute -bottom-4 left-4 w-12 h-12 rounded-2xl bg-[#1C2530] p-0.5 shadow-md overflow-hidden border border-[#293241]">
          <ImageWithFallback
            src={restaurant.logoUrl}
            alt={`${restaurant.name} logo`}
            fallbackType="restaurant"
            className="w-full h-full rounded-xl object-cover"
          />
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 pt-6 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-[#F8FAFC] text-base group-hover:text-[#D4AF37] transition truncate">
              {restaurant.name}
            </h3>
          </div>
          <p className="text-xs text-[#94A3B8] font-medium line-clamp-1 mt-0.5">
            {restaurant.tagline}
          </p>

          {/* Cuisine Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {restaurant.cuisine.slice(0, 3).map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 rounded-lg bg-[#1C2530] text-[#94A3B8] text-[10px] font-semibold border border-[#293241]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-[#293241] flex items-center justify-between text-xs text-[#94A3B8] font-medium">
          <div className="flex items-center gap-1 text-[#F8FAFC] font-bold">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax}m</span>
          </div>

          <div className="flex items-center gap-1 text-[#F8FAFC] font-bold">
            <Bike className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Rs. {restaurant.deliveryFeeLkr}</span>
          </div>

          <div className="flex items-center gap-1 text-[#94A3B8] truncate max-w-[110px]">
            <MapPin className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
            <span className="truncate">{restaurant.city}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
