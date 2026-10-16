import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { FoodoraLogo } from '../components/FoodoraLogo.js';
import { AlertCircle, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0B0F14]">
      <div className="max-w-md w-full bg-[#151B23] rounded-3xl p-8 border border-[#293241] shadow-2xl space-y-6 text-[#F8FAFC]">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <FoodoraLogo size="lg" />
          </div>
          <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Welcome Back</h2>
          <p className="text-xs text-[#94A3B8]">Sign in to your FOODORA Sri Lanka account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#F8FAFC] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F8FAFC] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] font-black text-sm shadow-lg shadow-[#D4AF37]/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#0B0F14] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Fill Buttons */}
        <div className="pt-4 border-t border-[#293241] space-y-2">
          <p className="text-[11px] font-bold text-[#94A3B8] text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Quick Fill Demo Accounts:</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFillDemo('customer@foodora.lk')}
              className="p-2.5 rounded-xl bg-[#1C2530] hover:bg-[#293241] border border-[#293241] hover:border-[#D4AF37]/50 text-[#F8FAFC] font-semibold text-left transition cursor-pointer"
            >
              👤 Customer (Colombo)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('owner@foodora.lk')}
              className="p-2.5 rounded-xl bg-[#1C2530] hover:bg-[#293241] border border-[#293241] hover:border-[#D4AF37]/50 text-[#F8FAFC] font-semibold text-left transition cursor-pointer"
            >
              🏪 Restaurant Owner
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('rider@foodora.lk')}
              className="p-2.5 rounded-xl bg-[#1C2530] hover:bg-[#293241] border border-[#293241] hover:border-[#D4AF37]/50 text-[#F8FAFC] font-semibold text-left transition cursor-pointer"
            >
              🛵 Delivery Rider
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin@foodora.lk')}
              className="p-2.5 rounded-xl bg-[#1C2530] hover:bg-[#293241] border border-[#293241] hover:border-[#D4AF37]/50 text-[#F8FAFC] font-semibold text-left transition cursor-pointer"
            >
              🛡️ Super Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#94A3B8] pt-2">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="text-[#D4AF37] font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
