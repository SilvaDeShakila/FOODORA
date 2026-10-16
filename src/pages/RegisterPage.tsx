import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { FoodoraLogo } from '../components/FoodoraLogo.js';
import { AlertCircle, Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+94 ');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0B0F14]">
      <div className="max-w-md w-full bg-[#151B23] rounded-3xl p-8 border border-[#293241] shadow-2xl space-y-6 text-[#F8FAFC]">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <FoodoraLogo size="lg" />
          </div>
          <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Create Customer Account</h2>
          <p className="text-xs text-[#94A3B8]">Order authentic Sri Lankan cuisine with real-time tracking</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#F8FAFC] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kasun Bandara"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#293241] bg-[#111720] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#D4AF37] transition"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-[#F8FAFC] mb-1.5">Phone Number (Sri Lanka)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#94A3B8] pt-2 border-t border-[#293241]">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Protected by Bcrypt encryption & JWT security</span>
        </div>

        <div className="text-center text-xs text-[#94A3B8]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#D4AF37] font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
