import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useToast } from '../contexts/ToastContext.js';
import type { Restaurant, MenuItem, Review } from '../types/index.js';
import { FoodCard } from '../components/FoodCard.js';
import { ImageWithFallback } from '../components/ImageWithFallback.js';
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Phone,
  Search,
  MessageSquare,
  AlertCircle,
  X,
  Send,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const RestaurantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const [restRes, menuRes, reviewsRes] = await Promise.all([
          api.restaurants.getById(id),
          api.menu.getByRestaurant(id),
          api.reviews.getByRestaurant(id),
        ]);

        setRestaurant(restRes.restaurant);
        setCategories(['All', ...restRes.categories]);
        setMenuItems(menuRes.menuItems);
        setReviews(reviewsRes.reviews);
      } catch (err) {
        console.error('Failed to load restaurant details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.reviews.submit(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviews([res.review, ...reviews]);
      if (restaurant) {
        setRestaurant({
          ...restaurant,
          rating: res.updatedRestaurantRating,
          reviewCount: restaurant.reviewCount + 1,
        });
      }
      setReviewComment('');
      setReviewModalOpen(false);
      showToast('Thank you for your review! It has been posted.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-64 rounded-3xl bg-[#151B23] border border-[#293241] animate-pulse" />
        <div className="h-12 w-1/3 bg-[#151B23] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-[#151B23] rounded-3xl border border-[#293241] shadow-2xl">
        <AlertCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
        <h2 className="text-xl font-black text-[#F8FAFC]">Restaurant Not Found</h2>
        <p className="text-xs text-[#94A3B8] mt-1 mb-4">
          The restaurant you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/restaurants"
          className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black rounded-xl shadow-md"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      !menuSearch ||
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pb-20 space-y-8 text-[#F8FAFC]">
      {/* 1. Cover Image & Restaurant Header */}
      <div className="relative bg-[#0B0F14] text-[#F8FAFC]">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <ImageWithFallback
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            fallbackType="restaurant"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 -mt-24 sm:-mt-20 relative z-10">
          <div className="bg-[#151B23] rounded-3xl p-6 sm:p-8 text-[#F8FAFC] shadow-2xl border border-[#293241] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#1C2530] p-0.5 border border-[#293241] shadow-md flex-shrink-0">
                <ImageWithFallback
                  src={restaurant.logoUrl}
                  alt={`${restaurant.name} logo`}
                  fallbackType="restaurant"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] leading-tight">
                    {restaurant.name}
                  </h1>
                  {!restaurant.isOpen ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1C2530] text-[#94A3B8] text-xs font-bold border border-[#293241]">
                      Closed Now
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-bold border border-emerald-800/60 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Open Now
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#94A3B8] font-medium">{restaurant.tagline}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] pt-1">
                  <div className="flex items-center gap-1 text-[#F8FAFC] font-bold">
                    <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    <span>{restaurant.rating.toFixed(1)}</span>
                    <span className="text-[#94A3B8] font-normal">({restaurant.reviewCount} reviews)</span>
                  </div>

                  <span>•</span>

                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      {restaurant.address}, {restaurant.city}
                    </span>
                  </div>

                  <span>•</span>

                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>{restaurant.phone}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/30">
                    <ShieldCheck className="w-3 h-3" /> Foodora Verified Partner
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#1C2530] text-emerald-400 border border-emerald-500/30">
                    <Award className="w-3 h-3" /> 100% Sri Lankan Spices
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Delivery Metrics Card */}
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#111720] border border-[#293241] w-full md:w-auto justify-around shadow-md">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[#D4AF37] font-black text-sm sm:text-base">
                  <Clock className="w-4 h-4" />
                  <span>
                    {restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax}m
                  </span>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                  Est. Delivery
                </span>
              </div>

              <div className="w-px h-8 bg-[#293241]" />

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[#F8FAFC] font-black text-sm sm:text-base">
                  <Bike className="w-4 h-4 text-[#D4AF37]" />
                  <span>Rs. {restaurant.deliveryFeeLkr}</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                  Delivery Fee
                </span>
              </div>

              <div className="w-px h-8 bg-[#293241]" />

              <div className="text-center">
                <div className="font-black text-sm sm:text-base text-[#F8FAFC]">
                  Rs. {restaurant.minOrderLkr}
                </div>
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                  Min. Order
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Menu Section with Categories & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="sticky top-20 z-30 bg-[#111720]/95 backdrop-blur-md p-3 rounded-2xl border border-[#293241] shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {categories.map((c) => {
              const count =
                c === 'All'
                  ? menuItems.length
                  : menuItems.filter((i) => i.category === c).length;

              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === c
                      ? 'bg-[#D4AF37] text-[#0B0F14] shadow-md shadow-[#D4AF37]/20 font-black'
                      : 'bg-[#151B23] border border-[#293241] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#D4AF37]/50'
                  }`}
                >
                  <span>{c}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeCategory === c ? 'bg-[#0B0F14] text-[#D4AF37]' : 'bg-[#1C2530] text-[#94A3B8]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search inside menu */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Search in this menu..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#293241] bg-[#151B23] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC]"
            />
          </div>
        </div>

        {/* Menu Items Grid */}
        <div>
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#151B23] border border-[#293241] text-[#94A3B8]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm text-[#F8FAFC]">No dishes match your search.</p>
              <button
                onClick={() => {
                  setMenuSearch('');
                  setActiveCategory('All');
                }}
                className="text-xs text-[#D4AF37] font-bold hover:underline mt-2 cursor-pointer"
              >
                Clear menu filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <FoodCard key={item.id} item={item} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>

        {/* 3. Reviews & Ratings Section */}
        <section className="pt-10 border-t border-[#293241] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#F8FAFC] tracking-tight">
                Customer Reviews & Impressions
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Authentic dining reviews from patrons across Sri Lanka
              </p>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  showToast('Please sign in or switch to customer role to submit a review', 'warning');
                  return;
                }
                setReviewModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black transition shadow-md cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 col-span-2">
                No reviews posted yet for this restaurant. Be the first to try their dishes and leave feedback!
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-3xl bg-[#151B23] border border-[#293241] shadow-md space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F8FAFC]">{rev.customerName}</span>
                    <div className="flex text-[#D4AF37] gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#293241]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#94A3B8] italic leading-relaxed">&quot;{rev.comment}&quot;</p>
                  <span className="text-[10px] text-[#94A3B8] block pt-1 border-t border-[#293241]">
                    Verified Order • {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Review Submission Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0B0F14]/80 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#151B23] border border-[#293241] rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-[#F8FAFC]">
            <div className="flex items-center justify-between pb-2 border-b border-[#293241]">
              <h3 className="font-bold text-base text-[#F8FAFC]">Review {restaurant.name}</h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'text-[#D4AF37] fill-[#D4AF37]'
                            : 'text-[#293241]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Review Comments</label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about flavor, spice balance, portion size, and freshness..."
                  className="w-full p-3 text-xs rounded-xl border border-[#293241] bg-[#111720] focus:outline-hidden focus:border-[#D4AF37] text-[#F8FAFC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#293241]">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C2530] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 text-xs font-black bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
