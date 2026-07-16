import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Dumbbell, LogIn, LogOut, User } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  activePlanName?: string | null;
  currentUser?: { username: string; email: string } | null;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export default function Header({ 
  currentPath, 
  onNavigate, 
  activePlanName,
  currentUser,
  onLogout,
  onOpenAuth
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: 'home' },
    { name: 'About', path: 'about' },
    { name: 'Memberships', path: 'memberships' },
    { name: 'Nutrition Hub', path: 'nutrition' },
    { name: 'Calculators', path: 'calculators' },
    { name: 'Supplement Store', path: 'store' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 border-b border-zinc-250/60 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              id="header-logo"
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => handleNavClick('home')}
            >
              <div className="bg-zinc-900 text-gold-400 p-2 rounded-xl group-hover:bg-gold-500 group-hover:text-black transition-colors duration-300">
                <Dumbbell className="h-6 w-6 skew-x-3 rotate-12" />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-zinc-900 uppercase block">
                  Fit<span className="text-gold-600 font-black">Zone</span>
                </span>
                <span className="text-[9px] text-zinc-550 font-mono tracking-widest uppercase block -mt-1 group-hover:text-gold-600 transition-colors">
                  Knowledge Hub
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.path || (item.path !== 'home' && currentPath.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    id={`nav-link-${item.path}`}
                    onClick={() => handleNavClick(item.path)}
                    className={`px-3.5 py-2 rounded-lg font-sans text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-gold-700 bg-amber-50/70 border-b-2 border-gold-500 rounded-b-none'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Actions (Search, Mobile Toggle, Auth) */}
            <div className="flex items-center gap-3">
              {activePlanName && (
                <div 
                  id="active-membership-badge"
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-50 to-gold-100/50 border border-gold-500/30 text-gold-800 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-extrabold tracking-wider relative overflow-hidden shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-600 animate-pulse" />
                  <span>★ {activePlanName}</span>
                </div>
              )}

              {/* Secure Database Login Status Indicator */}
              {currentUser ? (
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                  <User size={14} className="text-gold-600" />
                  <span className="text-[11px] font-mono font-bold text-zinc-800 hidden md:inline">
                    {currentUser.username}
                  </span>
                  <button
                    onClick={onLogout}
                    title="Log Out"
                    className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-1.5 rounded-xl text-[11px] font-mono uppercase font-extrabold tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <LogIn size={13} className="text-gold-400" />
                  <span>Join / Sign In</span>
                </button>
              )}

              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-zinc-500 hover:text-gold-600 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X size={22} className="text-gold-600" /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-nav-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden bg-white border-b border-zinc-200 overflow-hidden shadow-inner"
            >
              <div className="px-4 pt-2 pb-6 space-y-1.5">
                {navItems.map((item) => {
                  const isActive = currentPath === item.path || (item.path !== 'home' && currentPath.startsWith(item.path));
                  return (
                    <button
                      key={item.path}
                      id={`mobile-nav-link-${item.path}`}
                      onClick={() => handleNavClick(item.path)}
                      className={`block w-full text-left px-4 py-3 rounded-xl font-display font-semibold text-sm tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'text-gold-700 bg-amber-50/50 border-l-4 border-gold-500 pl-3'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
