import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import type { Restaurant, MenuItem, Promotion } from '../types/index.js';
import { RestaurantCard } from '../components/RestaurantCard.js';
import { FoodCard } from '../components/FoodCard.js';
import { useToast } from '../contexts/ToastContext.js';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Star,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [popularDishes, setPopularDishes] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState<string>('All');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [restRes, menuRes, promoRes] = await Promise.all([
          api.restaurants.getAll({ featured: true }),
          api.menu.getByRestaurant(),
          api.promotions.getAll(),
        ]);

        setFeaturedRestaurants(restRes.restaurants);
        setPopularDishes(menuRes.menuItems.slice(0, 8));
        setPromotions(promoRes.promotions);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  const categories = [
    { name: 'Rice & Curry', count: '15+ authentic spots', icon: '🍛' },
    { name: 'Kottu Roti', count: 'Cheese & Dolphin', icon: '🥘' },
    { name: 'Hoppers & Roti', count: 'Egg hoppers & sambol', icon: '🥞' },
    { name: 'Biriyani & Pulao', count: 'Dum pots & roast chicken', icon: '🍚' },
    { name: 'Seafood Specialties', count: 'Lagoon crab & prawns', icon: '🦀' },
    { name: 'Short Eats & Snacks', count: 'Ceylon bakery rolls', icon: '🥐' },
    { name: 'Burgers & Fast Food', count: 'Smash burgers & fries', icon: '🍔' },
    { name: 'Desserts & Fresh Juices', count: 'Watalappan & Falooda', icon: '🍧' },
  ];

  const displayedDishes = popularDishes.filter((dish) => {
    if (selectedDiet === 'Veg') return dish.isVegetarian;
    if (selectedDiet === 'Spicy') return dish.isSpicy;
    if (selectedDiet === 'Halal') return dish.isHalal;
    return true;
  });

  return (
    <div className="space-y-16 pb-20 text-[#F8FAFC]">
      {/* 1. Hero Section (Black & Gold Luxury) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#111720] via-[#0B0F14] to-[#0B0F14] pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[#293241]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C2530] text-[#D4AF37] text-xs font-black tracking-wider shadow-md border border-[#D4AF37]/30">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>SRI LANKA’S #1 PREMIUM FOOD DELIVERY PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F8FAFC] tracking-tight leading-[1.1]">
              Your Cravings, <br />
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#E8C66A] to-[#B89628] bg-clip-text text-transparent">
                Delivered in Real Time.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed font-medium">
              Order authentic hot Lamprais, sizzling cheese kottu, crispy egg hoppers, Jaffna lagoon crab, and gourmet dishes across Colombo, Kandy, Galle, and beyond.
            </p>

            {/* Prominent Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-[#151B23] shadow-2xl border border-[#293241] max-w-2xl mx-auto"
            >
              <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5">
                <Search className="w-5 h-5 text-[#94A3B8] flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search restaurants, dishes, or cuisines (e.g. Lamprais, Kottu, Crab)..."
                  className="w-full text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8C66A] to-[#B89628] hover:opacity-95 text-[#0B0F14] font-black text-sm shadow-md shadow-[#D4AF37]/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Find Food</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick City Filter Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-[#94A3B8]">
              <span className="font-bold text-[#F8FAFC] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Hot spots:
              </span>
              {['Colombo 03', 'Dehiwala', 'Nugegoda', 'Kandy City', 'Galle Fort', 'Negombo'].map((city) => (
                <button
                  key={city}
                  onClick={() => navigate(`/restaurants?city=${encodeURIComponent(city)}`)}
                  className="px-3 py-1 rounded-full bg-[#151B23] border border-[#293241] hover:border-[#D4AF37] hover:text-[#D4AF37] text-[#94A3B8] transition font-semibold cursor-pointer"
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Platform Trust Highlights Bar */}
            <div className="pt-6 grid grid-cols-3 gap-2 max-w-xl mx-auto text-[#94A3B8] border-t border-[#293241]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#F8FAFC]">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>~25 Min Fast Delivery</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#F8FAFC]">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>100% Authentic Sri Lankan</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#F8FAFC]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Cash on Delivery (LKR)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Food Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">Popular Sri Lankan Cuisines</h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Explore iconic island recipes and international cravings</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs sm:text-sm font-bold text-[#D4AF37] hover:text-[#E8C66A] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/restaurants?cuisine=${encodeURIComponent(cat.name)}`)}
              className="group p-4 rounded-3xl bg-[#151B23] border border-[#293241] hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-3.5 shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1C2530] border border-[#293241] group-hover:scale-105 group-hover:border-[#D4AF37]/50 transition-all flex items-center justify-center text-2xl flex-shrink-0">
                {cat.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-[#F8FAFC] text-sm group-hover:text-[#D4AF37] transition truncate">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Special Promotions Banner */}
      {promotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#1C2530] via-[#151B23] to-[#111720] border border-[#D4AF37]/30 p-6 sm:p-10 text-[#F8FAFC] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C2530] text-[#D4AF37] text-xs font-bold border border-[#D4AF37]/40">
                  <Tag className="w-3.5 h-3.5" /> FOODORA SPECIAL OFFERS
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
                  Save on Sri Lanka’s Tastiest Feasts
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Use coupon code <strong className="text-[#D4AF37] font-mono font-black tracking-wider">{promotions[0].code}</strong> at checkout to get {promotions[0].description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-[#0B0F14] border border-[#293241] flex items-center gap-3">
                  <span className="text-xs text-[#94A3B8]">Coupon:</span>
                  <span className="font-mono text-base font-black text-[#D4AF37] tracking-wider">
                    {promotions[0].code}
                  </span>
                </div>
                <Link
                  to="/promotions"
                  className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-xs sm:text-sm transition shadow-lg cursor-pointer"
                >
                  View All Deals
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Sri Lankan Kitchens */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">Featured Partner Kitchens</h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Highest rated culinary masters delivering across the island</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs sm:text-sm font-bold text-[#D4AF37] hover:text-[#E8C66A] flex items-center gap-1"
          >
            <span>Explore all ({featuredRestaurants.length}+)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-[#151B23] border border-[#293241] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.slice(0, 6).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Popular Dishes Showcase with Dietary Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">Most Loved Dishes</h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Authentic island favorites ordered again and again</p>
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-[#151B23] rounded-2xl border border-[#293241] self-start sm:self-auto">
            {['All', 'Veg', 'Spicy', 'Halal'].map((diet) => (
              <button
                key={diet}
                onClick={() => setSelectedDiet(diet)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedDiet === diet
                    ? 'bg-[#D4AF37] text-[#0B0F14] shadow-sm font-black'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {diet === 'All' ? 'All Dishes' : diet}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedDishes.map((dish) => {
            const sampleRest =
              featuredRestaurants.find((r) => r.id === dish.restaurantId) ||
              featuredRestaurants[0] || {
                id: dish.restaurantId,
                name: 'FOODORA Kitchen',
                deliveryFeeLkr: 200,
                minOrderLkr: 800,
              };

            return (
              <FoodCard
                key={dish.id}
                item={dish}
                restaurant={sampleRest as Restaurant}
              />
            );
          })}
        </div>
      </section>

      {/* 6. How FOODORA Works in Sri Lanka */}
      <section className="bg-[#111720] py-16 border-y border-[#293241]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
              How FOODORA Works in Sri Lanka
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2">
              From island kitchen to your doorstep in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#151B23] p-8 rounded-3xl border border-[#293241] shadow-md text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1C2530] text-[#D4AF37] font-black text-2xl mx-auto flex items-center justify-center border border-[#D4AF37]/40">
                1
              </div>
              <h3 className="font-black text-[#F8FAFC] text-lg">Choose Your Feast</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Browse authentic Sri Lankan village curries, seafood shacks, or fast food favourites across your city.
              </p>
            </div>

            <div className="bg-[#151B23] p-8 rounded-3xl border border-[#293241] shadow-md text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1C2530] text-[#D4AF37] font-black text-2xl mx-auto flex items-center justify-center border border-[#D4AF37]/40">
                2
              </div>
              <h3 className="font-black text-[#F8FAFC] text-lg">Fresh Live Preparation</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Partner chefs sizzle, wok-fry, and wrap your food in fresh banana leaves or thermal insulated boxes.
              </p>
            </div>

            <div className="bg-[#151B23] p-8 rounded-3xl border border-[#293241] shadow-md text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1C2530] text-emerald-400 font-black text-2xl mx-auto flex items-center justify-center border border-emerald-500/40">
                3
              </div>
              <h3 className="font-black text-[#F8FAFC] text-lg">Speedy Delivery & COD</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Our trusted express riders navigate Colombo, Kandy, or Galle traffic to deliver hot meals with cash on delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">Loved by Diners Across Sri Lanka</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Real ratings from authentic island food lovers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Nimal Perera',
              location: 'Colombo 03 (Kollupitiya)',
              quote: 'The Lamprais arrived piping hot wrapped in double banana leaf. Best food delivery experience in Colombo!',
              rating: 5,
            },
            {
              name: 'Dilani Jayawardena',
              location: 'Kandy City',
              quote: 'The Dum Biriyani from Royal Kandy is so fragrant. Fast delivery even during hill country evening rain.',
              rating: 5,
            },
            {
              name: 'Kavinda Silva',
              location: 'Galle Fort',
              quote: 'Crispy egg hoppers and seeni sambol delivered right inside the Fort ramparts. Great UI and order tracking!',
              rating: 5,
            },
          ].map((t, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[#151B23] border border-[#293241] shadow-md space-y-3">
              <div className="flex text-[#D4AF37] gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <p className="text-xs text-[#94A3B8] italic leading-relaxed">&quot;{t.quote}&quot;</p>
              <div className="pt-2 border-t border-[#293241]">
                <p className="text-xs font-bold text-[#F8FAFC]">{t.name}</p>
                <p className="text-[11px] text-[#94A3B8]">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Newsletter Subscription */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#151B23] border border-[#293241] text-center space-y-4 max-w-3xl mx-auto shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">Get Exclusive Sri Lankan Food Deals</h3>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            Subscribe to our weekly newsletter for weekend discounts, new restaurant launches in your district, and flash promo codes.
          </p>

          {newsletterSubscribed ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 text-emerald-400 font-bold text-xs inline-flex items-center gap-2 border border-emerald-800/60">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Thank you! You are subscribed to FOODORA weekly alerts.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newsletterEmail.includes('@')) {
                  setNewsletterSubscribed(true);
                  showToast('Subscribed to FOODORA weekly promo alerts!', 'success');
                }
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-3 rounded-2xl border border-[#293241] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#D4AF37] bg-[#111720]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-xs transition cursor-pointer shadow-md"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
