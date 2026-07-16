import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { username: string; email: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin) {
      if (!email.trim()) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin 
        ? { username, password } 
        : { username, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (isLogin) {
        setSuccessMsg('Welcome back! Logging in...');
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
          setLoading(false);
          resetForm();
        }, 1200);
      } else {
        setSuccessMsg('Account registered successfully! Please login to continue.');
        setTimeout(() => {
          setIsLogin(true);
          setLoading(false);
          setPassword('');
          setConfirmPassword('');
          setError(null);
          setSuccessMsg(null);
        }, 1800);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white border border-zinc-200 p-8 shadow-2xl text-zinc-900 z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-zinc-850 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-150"
            >
              <X size={18} />
            </button>

            {/* Header Logos & Branding */}
            <div className="text-center mb-8">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1 font-bold">
                FitZone Secure Database Portal
              </span>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight text-zinc-900">
                {isLogin ? 'Member Sign In' : 'Create Athlete Profile'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                {isLogin 
                  ? 'Access your training logs, order history and membership passes' 
                  : 'Enroll in the FitZone registry to track physical performance and checkouts'}
              </p>
            </div>

            {/* Tab Switches */}
            <div className="flex bg-zinc-100 p-1.5 rounded-2xl mb-6 border border-zinc-200">
              <button
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs uppercase font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  isLogin 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs uppercase font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  !isLogin 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Status alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl text-xs mb-5 font-sans"
              >
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs mb-5 font-sans"
              >
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              {/* Username Input */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-zinc-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter athlete username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="w-full bg-white border border-zinc-250 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Email Input (Sign Up Only) */}
              {!isLogin && (
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-zinc-400">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="athlete@fitzone.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full bg-white border border-zinc-250 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-colors shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">
                  Secure Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-zinc-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-white border border-zinc-250 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Confirm Password (Sign Up Only) */}
              {!isLogin && (
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-zinc-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="w-full bg-white border border-zinc-250 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-colors shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 hover:bg-gold-600 hover:text-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-mono font-bold uppercase tracking-wider text-xs py-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Synchronizing Portal...</span>
                  </>
                ) : (
                  <span>{isLogin ? 'Sign In Securely' : 'Complete Registration'}</span>
                )}
              </button>
            </form>

            {/* Note */}
            <div className="text-center mt-6">
              <span className="text-[10px] font-mono text-zinc-500 block font-medium">
                All data registered live to FitZone MongoDB filesystem collection
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
