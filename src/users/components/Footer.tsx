import React from 'react';
import { Dumbbell, Phone, Mail, MapPin, Instagram, Youtube, Facebook, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleNavClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 text-zinc-600 font-sans pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* About column */}
        <div id="footer-col-about" className="space-y-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => handleNavClick('home', e)}>
            <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
              <Dumbbell size={18} className="rotate-12" />
            </div>
            <span className="font-display font-black text-lg leading-tight uppercase tracking-tight text-zinc-900">
              Fit<span className="text-gold-600">Zone</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            FitZone Gym Knowledge Hub is an elite digital library serving high-performance methodologies, nutritional sciences, calculations, and supplement logs to strength seekers worldwide.
          </p>
          <div className="flex gap-3 pt-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white hover:bg-zinc-900 hover:text-white rounded-lg transition-colors text-zinc-600 border border-zinc-200 shadow-sm" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white hover:bg-zinc-900 hover:text-white rounded-lg transition-colors text-zinc-600 border border-zinc-200 shadow-sm" aria-label="YouTube">
              <Youtube size={16} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white hover:bg-zinc-900 hover:text-white rounded-lg transition-colors text-zinc-600 border border-zinc-200 shadow-sm" aria-label="Facebook">
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Navigation column */}
        <div id="footer-col-links" className="space-y-4">
          <h4 className="text-zinc-900 font-display text-sm font-bold tracking-wider uppercase">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#/about" onClick={(e) => handleNavClick('about', e)} className="text-zinc-500 hover:text-gold-700 font-medium transition-colors">
                Our Story & History
              </a>
            </li>
            <li>
              <a href="#/memberships" onClick={(e) => handleNavClick('memberships', e)} className="text-zinc-500 hover:text-gold-700 font-medium transition-colors">
                Informational Membership Plans
              </a>
            </li>
            <li>
              <a href="#/nutrition" onClick={(e) => handleNavClick('nutrition', e)} className="text-zinc-500 hover:text-gold-700 font-medium transition-colors">
                Protein, Calorie & Vitamin Hub
              </a>
            </li>
            <li>
              <a href="#/calculators" onClick={(e) => handleNavClick('calculators', e)} className="text-zinc-500 hover:text-gold-700 font-medium transition-colors">
                BMI, Calorie & Protein Calc
              </a>
            </li>
            <li>
              <a href="#/store" onClick={(e) => handleNavClick('store', e)} className="text-zinc-500 hover:text-gold-700 font-medium transition-colors">
                Premium Supplement Details
              </a>
            </li>
          </ul>
        </div>

        {/* Contact column */}
        <div id="footer-col-contact" className="space-y-4">
          <h4 className="text-zinc-900 font-display text-sm font-bold tracking-wider uppercase">FitZone Headquarters</h4>
          <ul className="space-y-3.5 text-xs text-zinc-500">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-gold-600 flex-shrink-0 mt-0.5" />
              <span>100 Performance Way, Elite Ward, Sector 9, Islamabad, Pakistan</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-gold-600 flex-shrink-0" />
              <span>+92 (300) 555-FITZONE</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-gold-600 flex-shrink-0" />
              <span>intel@fitzonehub.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter mockup column */}
        <div id="footer-col-newsletter" className="space-y-4">
          <h4 className="text-zinc-900 font-display text-sm font-bold tracking-wider uppercase">Weekly Insights</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Subscribe to receive evidence-based metabolic articles, fitness calculation models, and physical updates.
          </p>
          <form id="newsletter-form" onSubmit={(e) => e.preventDefault()} className="flex items-center gap-1.5">
            <input
              type="email"
              placeholder="Enter email address"
              className="bg-white border border-zinc-250 text-zinc-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-500 hover:border-zinc-300 flex-grow shadow-sm"
              required
            />
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-gold-600 hover:text-zinc-950 text-white p-2 rounded-lg transition-all cursor-pointer shadow-sm"
              title="Subscribe"
            >
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Copy footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-450 font-mono">
        <p>© {currentYear} FitZone Gym Knowledge Hub. All rights reserved. Strictly local scientific content catalog.</p>
        <div className="flex gap-4">
          <span className="hover:text-gold-700 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-gold-700 cursor-pointer">Terms of Information</span>
        </div>
      </div>
    </footer>
  );
}
