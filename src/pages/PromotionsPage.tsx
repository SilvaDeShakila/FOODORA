import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.js';
import type { Promotion } from '../types/index.js';
import { Tag, Copy, Check, Sparkles, Clock, AlertCircle } from 'lucide-react';

export const PromotionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    api.promotions
      .getAll()
      .then((res) => setPromotions(res.promotions))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Voucher code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#F8FAFC]">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C2530] text-[#D4AF37] text-xs font-bold mb-3 border border-[#D4AF37]/30">
          <Tag className="w-3.5 h-3.5" /> FOODORA SRI LANKA DEALS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">
          Vouchers & Discount Codes
        </h1>
        <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
          Apply these verified promo vouchers at checkout to save on authentic Sri Lankan rice & curry, kottu feasts, seafood platters, and desserts.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-[#151B23] border border-[#293241] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-[#151B23] rounded-3xl p-6 border border-[#293241] hover:border-[#D4AF37]/60 shadow-xl transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black px-3 py-1 rounded-xl bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/40 tracking-wider">
                    {promo.code}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="font-black text-[#F8FAFC] text-base leading-snug group-hover:text-[#D4AF37] transition">
                  {promo.discountType === 'percentage'
                    ? `${promo.discountValue}% OFF Total Order`
                    : `Flat Rs. ${promo.discountValue} OFF`}
                </h3>

                <p className="text-xs text-[#94A3B8] leading-relaxed">{promo.description}</p>
              </div>

              <div className="pt-3 border-t border-[#293241] space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>Min order: Rs. {promo.minOrderLkr.toLocaleString()}</span>
                  <span>Expires: {new Date(promo.validUntil).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => handleCopy(promo.code)}
                  className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    copiedCode === promo.code
                      ? 'bg-emerald-500 text-[#0B0F14]'
                      : 'bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] shadow-md shadow-[#D4AF37]/20'
                  }`}
                >
                  {copiedCode === promo.code ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Code Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
