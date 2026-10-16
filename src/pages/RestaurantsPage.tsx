import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import type { Restaurant } from '../types/index.js';
import { RestaurantCard } from '../components/RestaurantCard.js';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';

export const RestaurantsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filter states
  const search = searchParams.get('search') || '';
  const cuisine = searchParams.get('cuisine') || '';
  const city = searchParams.get('city') || '';
  const minRating = searchParams.get('minRating') || '';
  const maxDeliveryFee = searchParams.get('maxDeliveryFee') || '';
  const sortBy = searchParams.get('sortBy') || 'rating';

  const cuisinesList = [
    'All Cuisines',
    'Rice & Curry',
    'Kottu Roti',
    'Hoppers & Roti',
    'Biriyani & Pulao',
    'Seafood Specialties',
    'Short Eats & Snacks',
    'Burgers & Fast Food',
    'Pizza & Pasta',
    'Desserts & Fresh Juices',
  ];

  const citiesList = [
    'All Cities',
    'Colombo',
    'Dehiwala',
    'Nugegoda',
    'Kandy',
    'Galle',
    'Negombo',
    'Kurunegala',
    'Matara',
  ];

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All Cuisines' || value === 'All Cities') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  useEffect(() => {
    async function fetchRestaurants() {
      setIsLoading(true);
      try {
        const res = await api.restaurants.getAll({
          search: search || undefined,
          cuisine: cuisine && cuisine !== 'All Cuisines' ? cuisine : undefined,
          city: city && city !== 'All Cities' ? city : undefined,
          minRating: minRating || undefined,
          maxDeliveryFee: maxDeliveryFee || undefined,
          sortBy,
        });
        setRestaurants(res.restaurants);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRestaurants();
  }, [search, cuisine, city, minRating, maxDeliveryFee, sortBy]);

  const hasActiveFilters = Boolean(search || cuisine || city || minRating || maxDeliveryFee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F8FAFC]">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F8FAFC] tracking-tight">Explore Restaurants</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Discover top-rated Sri Lankan spots delivering authentic flavor to your table
          </p>
        </div>

        {/* Search Bar & Mobile Filter Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search by restaurant or dish..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#151B23] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37] transition"
            />
            {search && (
              <button
                onClick={() => updateParam('search', '')}
                className="absolute right-3 top-3.5 text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="md:hidden p-2.5 rounded-xl border border-[#293241] bg-[#151B23] text-[#F8FAFC] flex items-center gap-1.5 text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Cuisine Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {cuisinesList.map((c) => {
          const isActive = (!cuisine && c === 'All Cuisines') || cuisine === c;
          return (
            <button
              key={c}
              onClick={() => updateParam('cuisine', c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#D4AF37] text-[#0B0F14] shadow-md shadow-[#D4AF37]/20 font-black'
                  : 'bg-[#151B23] border border-[#293241] text-[#94A3B8] hover:border-[#D4AF37]/50 hover:text-[#F8FAFC]'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Main Layout: Filter Sidebar + Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6 bg-[#151B23] p-6 rounded-3xl border border-[#293241] h-fit sticky top-28 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#293241]">
            <h3 className="font-extrabold text-sm text-[#F8FAFC] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">City / District</label>
            <select
              aria-label="Filter by City / District"
              value={city || 'All Cities'}
              onChange={(e) => updateParam('city', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#293241] bg-[#111720] font-medium text-[#F8FAFC] focus:outline-hidden focus:border-[#D4AF37]"
            >
              {citiesList.map((cty) => (
                <option key={cty} value={cty} className="bg-[#151B23] text-[#F8FAFC]">
                  {cty}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">Rating</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: '', label: 'Any' },
                { val: '4.5', label: '4.5★+' },
                { val: '4.8', label: '4.8★+' },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => updateParam('minRating', r.val)}
                  className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    minRating === r.val
                      ? 'bg-[#1C2530] border-[#D4AF37] text-[#D4AF37] shadow-sm'
                      : 'bg-[#111720] border-[#293241] text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Maximum Delivery Fee */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">Max Delivery Fee (LKR)</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: '', label: 'Any' },
                { val: '200', label: '≤ Rs. 200' },
                { val: '250', label: '≤ Rs. 250' },
              ].map((f) => (
                <button
                  key={f.label}
                  onClick={() => updateParam('maxDeliveryFee', f.val)}
                  className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    maxDeliveryFee === f.val
                      ? 'bg-[#1C2530] border-[#D4AF37] text-[#D4AF37] shadow-sm'
                      : 'bg-[#111720] border-[#293241] text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div className="space-y-2 pt-2 border-t border-[#293241]">
            <label className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">Sort Results By</label>
            <select
              aria-label="Sort Results By"
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#293241] bg-[#111720] font-medium text-[#F8FAFC] focus:outline-hidden focus:border-[#D4AF37]"
            >
              <option value="rating" className="bg-[#151B23]">Highest Rated</option>
              <option value="popular" className="bg-[#151B23]">Most Popular</option>
              <option value="deliveryTime" className="bg-[#151B23]">Fastest Delivery</option>
              <option value="deliveryFee" className="bg-[#151B23]">Lowest Delivery Fee</option>
            </select>
          </div>
        </aside>

        {/* Restaurant Grid & Results Count */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>
              Showing <strong className="text-[#F8FAFC]">{restaurants.length}</strong> restaurants
              {city && city !== 'All Cities' && ` in ${city}`}
              {cuisine && cuisine !== 'All Cuisines' && ` for "${cuisine}"`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-[#151B23] border border-[#293241] animate-pulse" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#151B23] border border-[#293241] space-y-3 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-[#1C2530] text-[#D4AF37] border border-[#293241] mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-[#F8FAFC]">No restaurants match your filters</h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                Try widening your search terms or clearing your location and cuisine filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black rounded-xl transition cursor-pointer shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
