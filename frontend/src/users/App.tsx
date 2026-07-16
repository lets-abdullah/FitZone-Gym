import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  Clock,
  Phone,
  Compass,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Cpu,
  Bookmark,
  Target,
  Award,
  Users,
  Utensils,
  BookOpen,
  Calendar,
  AlertCircle,
  Sparkles,
  Info,
  Check,
  ChevronDown,
  Dumbbell
} from 'lucide-react';

// Custom Hooks & Client components
import { useRoute } from '../hooks/useRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import QuickNav from './components/QuickNav';
import CalculatorCard from './components/CalculatorCard';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';

// Load local JSON Data sources
import plansData from '../../data/plans.json';
import productsData from '../../data/products.json';
import articlesData from '../../data/articles.json';

// Shared types
import { Plan, Product, Article } from '../types';

// Convert raw JSON assets into fully-typed entities
const plans = plansData as Plan[];
const initialProducts = productsData as Product[];
const articles = articlesData as Article[];

// Markdown to React Element Converter for articles
function renderArticleContent(text: string) {
  return text.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-3" />;
    
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="font-display font-bold text-xl text-zinc-900 mt-8 mb-3 uppercase tracking-wide border-b border-zinc-200 pb-1">
          {trimmed.slice(4)}
        </h3>
      );
    }
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} className="font-display font-bold text-base text-gold-700 mt-5 mb-2 uppercase">
          {trimmed.slice(5)}
        </h4>
      );
    }
    if (trimmed.startsWith('* ')) {
      return (
        <li key={idx} className="ml-5 list-disc text-sm text-zinc-600 leading-relaxed mb-2.5 font-sans font-medium">
          {trimmed.slice(2)}
        </li>
      );
    }
    return (
      <p key={idx} className="text-sm md:text-base text-zinc-650 leading-relaxed mb-5 font-sans font-normal">
        {line}
      </p>
    );
  });
}

export default function App() {
  const { path, param, navigate } = useRoute();

  // Secure user login state
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(() => {
    try {
      const stored = localStorage.getItem('fitzone_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Local state for dynamically synced product ranges managed by admin
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Local state for order history
  const [orders, setOrders] = useState<any[]>([]);

  // Fetch products and orders from MongoDB backend database on load
  useEffect(() => {
    const loadData = async () => {
      try {
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData && prodData.length > 0) {
            setProducts(prodData);
          }
        }
      } catch (e) {
        console.warn("Failed fetching products from MongoDB database, using fallback", e);
      }

      try {
        const ordRes = await fetch('/api/orders');
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders(ordData);
        }
      } catch (e) {
        console.warn("Failed fetching orders from MongoDB database, using fallback", e);
      }
    };

    loadData();
  }, []);

  // Local state for memberships page filter toggle
  const [membershipTier, setMembershipTier] = useState<'monthly' | 'yearly'>('monthly');

  // Local state for supplements page filter selection
  const [activeSupplementFilter, setActiveSupplementFilter] = useState<string>('All');

  // Local state for nutrition hub sub-tag selection
  const [activeArticleTag, setActiveArticleTag] = useState<string>('All');

  // Local state for Supplement purchase instructions dialog modal
  const [purchaseModalProduct, setPurchaseModalProduct] = useState<Product | null>(null);

  // Local state for Checkout Modal
  const [checkoutItem, setCheckoutItem] = useState<{
    type: 'plan' | 'product';
    id: string;
    name: string;
    price: string;
    brandOrCategory?: string;
    details?: string;
  } | null>(null);

  // Local state for active member status
  const [activePlan, setActivePlan] = useState<string | null>(() => {
    return localStorage.getItem('fitzone_active_plan');
  });

  const [activePlanName, setActivePlanName] = useState<string | null>(() => {
    return localStorage.getItem('fitzone_active_plan_name');
  });

  const [activePlanExpiry, setActivePlanExpiry] = useState<string | null>(() => {
    return localStorage.getItem('fitzone_active_plan_expiry');
  });

  const handlePaymentSuccess = async (receipt: {
    transactionId: string;
    method: 'Stripe' | 'Easypaisa';
    amount: string;
    date: string;
    itemType: 'plan' | 'product';
    itemId: string;
    itemName: string;
  }) => {
    const newOrder = {
      orderId: receipt.transactionId,
      date: receipt.date,
      itemName: receipt.itemName,
      price: receipt.amount,
      method: receipt.method,
      status: 'Completed'
    };

    try {
      // Save checkout/payment directly to the MongoDB backend
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const latestOrders = await res.json();
        if (latestOrders && Array.isArray(latestOrders.orders)) {
          setOrders(latestOrders.orders);
        } else {
          setOrders(prev => [newOrder, ...prev]);
        }
      } else {
        setOrders(prev => [newOrder, ...prev]);
      }
    } catch (e) {
      console.warn("Failed syncing order with database, falling back", e);
      setOrders(prev => [newOrder, ...prev]);
    }

    if (receipt.itemType === 'plan') {
      localStorage.setItem('fitzone_active_plan', receipt.itemId);
      localStorage.setItem('fitzone_active_plan_name', receipt.itemName);
      
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + (receipt.itemId.startsWith('y-') ? 12 : 1));
      const expiryStr = expiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      localStorage.setItem('fitzone_active_plan_expiry', expiryStr);
      
      setActivePlan(receipt.itemId);
      setActivePlanName(receipt.itemName);
      setActivePlanExpiry(expiryStr);

      // Also register this user into the MongoDB database members collection
      try {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 'mem_' + Date.now(),
            name: currentUser?.username || 'Active Athlete',
            email: currentUser?.email || 'user@fitzone.com',
            planId: receipt.itemId,
            planName: receipt.itemName,
            assignedTrainer: 'Mustafa Malik',
            status: 'Active',
            expiryDate: expiryStr,
            joinedDate: receipt.date
          })
        });
      } catch (e) {
        console.warn("Failed enrolling member into database collection", e);
      }
    }
  };

  const handleCancelPlan = () => {
    localStorage.removeItem('fitzone_active_plan');
    localStorage.removeItem('fitzone_active_plan_name');
    localStorage.removeItem('fitzone_active_plan_expiry');
    setActivePlan(null);
    setActivePlanName(null);
    setActivePlanExpiry(null);
  };

  // Filter categories for supplement products
  const supplementCategories = ['All', 'Protein', 'Energy', 'Strength', 'Health & Vitality'];

  const filteredProducts = activeSupplementFilter === 'All'
    ? products
    : products.filter(p => p.category.toLowerCase() === activeSupplementFilter.toLowerCase());

  // Filter tag categories for nutrition articles
  const articleTags = ['All', 'Protein Guide', 'Calories Guide', 'Vitamins Guide', 'Nutrition Articles'];

  const filteredArticles = activeArticleTag === 'All'
    ? articles
    : articles.filter(a => a.category === activeArticleTag);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans selection:bg-zinc-900 selection:text-white flex flex-col justify-between">
      
      {/* Dynamic Navigation Header */}
      <Header 
        currentPath={path} 
        onNavigate={(p) => navigate(p)} 
        activePlanName={activePlanName}
        currentUser={currentUser}
        onLogout={async () => {
          localStorage.removeItem('fitzone_user');
          setCurrentUser(null);
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch (e) {
            console.warn("Failed calling auth logout endpoint", e);
          }
        }}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Dynamic View Layout */}
      <main className="flex-grow">
        
        {/* HOMEPAGE VIEW */}
        {path === 'home' && (
          <div className="space-y-0">
            {/* HERO SECTION */}
            <Hero onNavigate={(p) => navigate(p)} />

            {/* QUICK NAVIGATION SECTION */}
            <QuickNav onNavigate={(p) => navigate(p)} />

            {/* FEATURED ARTICLES SECTION - SHOWS ONLY 3 */}
            <section className="py-24 bg-white border-t border-zinc-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header title */}
                <div className="text-center mb-16 space-y-3">
                  <span className="text-xs font-mono text-gold-700 font-bold uppercase tracking-widest block">
                    Metabolic Science Logs
                  </span>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-zinc-900 tracking-tight uppercase">
                    Featured <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-gold-600">Knowledge Reads</span>
                  </h2>
                  <p className="max-w-xl mx-auto text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    Peer-reviewed digests detailing cellular protein synthesis, calorie equations, muscular density adaptors, and recovery indices.
                  </p>
                </div>

                {/* Featured Triple Article Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {articles.slice(0, 3).map((article, index) => (
                    <motion.article
                      key={article.id}
                      id={`featured-article-card-${article.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-gold-600 hover:shadow-lg transition-all duration-300 group flex flex-col h-full shadow-sm"
                    >
                      {/* Image Preview */}
                      <div className="relative aspect-video overflow-hidden bg-zinc-50">
                        <img
                          src={article.image}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-zinc-850 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm font-bold">
                          {article.category}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="p-6 flex-grow flex flex-col justify-between bg-white">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono font-medium">
                            <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                            <span>•</span>
                            <span>{article.publishedDate}</span>
                          </div>
                          
                          <h3 className="text-zinc-900 group-hover:text-gold-700 transition-colors font-display font-bold text-lg leading-snug uppercase tracking-tight line-clamp-2">
                            {article.title}
                          </h3>
                          
                          <p className="text-xs text-zinc-500 font-normal leading-relaxed line-clamp-3">
                            {article.summary}
                          </p>
                        </div>

                        {/* Read Link */}
                        <div className="pt-6 border-t border-zinc-200 mt-6 flex items-center justify-between text-xs font-mono font-bold">
                          <span className="text-zinc-400">Authored by &nbsp;<span className="text-zinc-700">{article.author.split(',')[0]}</span></span>
                          <button
                            id={`read-article-btn-${article.id}`}
                            onClick={() => navigate(`article/${article.id}`)}
                            className="text-gold-700 group-hover:text-zinc-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            Read Article <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* More articles link */}
                <div className="text-center mt-12">
                  <button
                    id="view-all-articles-btn"
                    onClick={() => navigate('nutrition')}
                    className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-gold-600 hover:text-zinc-950 border border-transparent text-white font-display text-xs uppercase tracking-wider font-bold py-3.5 px-7 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Enter Nutrition Hub <BookOpen size={14} />
                  </button>
                </div>

              </div>
            </section>
          </div>
        )}


        {/* ABOUT US PAGE */}
        {path === 'about' && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 select-none">
            
            {/* Introductory Hero header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-mono text-gold-700 font-bold uppercase tracking-widest block">
                Human Adaptation Pillars
              </span>
              <h1 className="text-3xl md:text-5xl font-display font-black text-zinc-900 uppercase tracking-tight">
                Our History & <span className="text-gold-700">Biological Mission</span>
              </h1>
              <p className="text-sm md:text-base text-zinc-600 font-normal leading-relaxed font-sans">
                FitZone Gym isn't just a space with heavy iron; it's a structural laboratory representing the absolute baseline of personal adaptational progression.
              </p>
            </div>

            {/* History Column & Grid details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-mono text-gold-700 font-bold uppercase tracking-wider">The Chrono Heritage</span>
                <h2 className="text-2xl md:text-3xl font-display font-black text-zinc-900 uppercase">
                  Thirteen Years of <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-gold-600">Pure Adapt Adaptations</span>
                </h2>
                <div className="text-sm text-zinc-650 leading-relaxed space-y-4 font-sans font-normal">
                  <p>
                    Founded in 2013 in Sector 9, FitZone began when three strength-coaches decided the fitness industry had devolved into marketing gimmicks. Gym-goers were buying untested powders and using suboptimal training structures that ignored bio-energetic thermodynamics.
                  </p>
                  <p>
                    We set out to establish an uncompromising structural forge. By importing certified training platforms, curved aerodynamic woodway treadmills, and creating a certified clinical nourishment bar, we paired elite mechanical resistance with peer-reviewed guidance.
                  </p>
                  <p>
                    Today, FitZone is the preeminent regional hub for high-performance outcomes. We serve over 1,200 active hybrid seekers, supporting their fitness adapts with an unyielding atmosphere of absolute luxury.
                  </p>
                </div>
              </div>

              {/* Decorative side image */}
              <div className="relative aspect-video sm:aspect-square bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800"
                  alt="Elite Fitness Facility"
                  className="w-full h-full object-cover grayscale contrast-110 brightness-95 scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent text-left p-6 flex flex-col justify-end">
                  <span className="text-xs font-mono text-gold-700 font-bold uppercase tracking-widest block mb-0.5">Physical Hub</span>
                  <h4 className="text-zinc-900 font-display text-lg font-black uppercase">The Main Dumbbell Turf Zone</h4>
                </div>
              </div>
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div id="about-mission-card" className="bg-white border border-zinc-200 p-8 rounded-2xl space-y-4 shadow-md">
                <div className="bg-gold-50 text-gold-700 w-12 h-12 flex items-center justify-center rounded-xl">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-display font-black text-zinc-900 uppercase">Our Central Mission</h3>
                <p className="text-sm text-zinc-650 font-sans leading-relaxed font-normal">
                  To eliminate visual gimmicks and replace them with high-fidelity, evidence-based adaptational support. We fuel physical progression by matching first-principles metabolic diagnostics with high-grade physical apparatuses.
                </p>
              </div>

              <div id="about-vision-card" className="bg-white border border-zinc-200 p-8 rounded-2xl space-y-4 shadow-md">
                <div className="bg-gold-50 text-gold-700 w-12 h-12 flex items-center justify-center rounded-xl">
                  <Compass size={24} />
                </div>
                <h3 className="text-xl font-display font-black text-zinc-900 uppercase">Our Adaptational Vision</h3>
                <p className="text-sm text-zinc-650 font-sans leading-relaxed font-normal">
                  To serve as a globally recognized offline-first model of fitness science. We aim to show that elite physique adaptations require no deceptive subscription traps or database integrations—only unyielding persistence and hard, clean biomechanics.
                </p>
              </div>
            </div>

            {/* Facilities & Equipment Overview section */}
            <div className="space-y-8 bg-zinc-100/40 p-8 md:p-12 rounded-3xl border border-zinc-200 relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 text-zinc-200/40">
                <Dumbbell size={250} className="rotate-45" />
              </div>
              
              <div className="max-w-2xl relative z-10 space-y-4">
                <span className="text-xs font-mono text-gold-700 font-bold uppercase tracking-widest block">The Concrete Asset Sheet</span>
                <h2 className="text-2xl md:text-3xl font-display font-black text-zinc-900 uppercase">
                  World-Class Facilities & Hardware Specs
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed font-sans">
                  We maintain a pristine, clinical physical compound that is kept strictly sanitary and perfectly zoned for maximal work outputs:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pt-4">
                <div className="bg-white border border-zinc-250/70 p-5 rounded-2xl space-y-2 shadow-sm">
                  <span className="text-gold-700 font-mono text-xs font-bold uppercase tracking-widest block">Platform 01</span>
                  <h4 className="text-zinc-900 font-display font-black uppercase text-sm">Compound Platforms</h4>
                  <p className="text-xs text-zinc-500 font-normal font-sans">8 Olympic-grade platform decks with solid oak floorcores and calibrated bumper weight plates.</p>
                </div>

                <div className="bg-white border border-zinc-250/70 p-5 rounded-2xl space-y-2 shadow-sm">
                  <span className="text-gold-700 font-mono text-xs font-bold uppercase tracking-widest block">Platform 02</span>
                  <h4 className="text-zinc-900 font-display font-black uppercase text-sm">Aerobic Deck</h4>
                  <p className="text-xs text-zinc-500 font-normal font-sans">Specialized motor-free curved treadmills and heavy air-assisted dual resistance bikes.</p>
                </div>

                <div className="bg-white border border-zinc-250/70 p-5 rounded-2xl space-y-2 shadow-sm">
                  <span className="text-gold-700 font-mono text-xs font-bold uppercase tracking-widest block">Platform 03</span>
                  <h4 className="text-zinc-900 font-display font-black uppercase text-sm">Supplement Bar</h4>
                  <p className="text-xs text-zinc-500 font-normal font-sans">A custom stainless-steel nutrition desk preparing instant, pre-weighted organic amino-acids.</p>
                </div>

                <div className="bg-white border border-zinc-250/70 p-5 rounded-2xl space-y-2 shadow-sm">
                  <span className="text-gold-700 font-mono text-xs font-bold uppercase tracking-widest block">Platform 04</span>
                  <h4 className="text-zinc-900 font-display font-black uppercase text-sm">Sauna & Cold Plunge</h4>
                  <p className="text-xs text-zinc-500 font-normal font-sans">Authentic wood-scented dry cedar rooms and chilled recovery tanks running at 42°F.</p>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <h3 className="text-xl md:text-2xl font-display font-black text-zinc-900 uppercase">
                Why Uncompromising Seekers Choose Us
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="flex gap-3">
                  <div className="bg-zinc-900 text-white p-1 h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-zinc-900 text-xs uppercase tracking-wide">No Database, No Traps</h5>
                    <p className="text-xs text-zinc-500 mt-1 font-sans">We do not store, leak, or sell user telemetry. All scientific charts and calculators run locally inside your browser.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="bg-zinc-900 text-white p-1 h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-zinc-900 text-xs uppercase tracking-wide">Strictly Certified Roster</h5>
                    <p className="text-xs text-zinc-500 mt-1 font-sans">Every training consultant has over 7 years of active coaching experience with CSCS, Precision Nutrition, or RD titles.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="bg-zinc-900 text-white p-1 h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-zinc-900 text-xs uppercase tracking-wide">Premium Sanitization Block</h5>
                    <p className="text-xs text-zinc-500 mt-1 font-sans">Our facility monitors indoor climate and humidity index meticulously, ensuring pristine lifting air and surfaces.</p>
                  </div>
                </div>
              </div>
            </div>

          </section>
        )}


        {/* INFORMATIONAL MEMBERSHIPS PAGE */}
        {path === 'memberships' && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Introductory Header text */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-mono text-gold-700 font-bold uppercase tracking-widest block">
                Zero Purchase Obligation
              </span>
              <h1 className="text-3xl md:text-5xl font-display font-black text-zinc-900 uppercase tracking-tight">
                Membership <span className="text-gold-700">Tier Arrangements</span>
              </h1>
              <p className="text-sm text-zinc-600 font-normal leading-relaxed font-sans">
                Review our comprehensive, transparent pricing tiers for Monthly and Year-long regimes. Note: All transactions are processed strictly at the front desk of our Sector 9 facility.
              </p>
            </div>

            {/* Monthly vs Yearly toggle switcher */}
            <div className="flex justify-center">
              <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                <button
                  id="membership-tier-monthly"
                  type="button"
                  onClick={() => setMembershipTier('monthly')}
                  className={`px-6 py-3 rounded-lg font-display text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    membershipTier === 'monthly' ? 'bg-zinc-900 text-white font-bold shadow-md' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Monthly Commits
                </button>
                <button
                  id="membership-tier-yearly"
                  type="button"
                  onClick={() => setMembershipTier('yearly')}
                  className={`px-6 py-3 rounded-lg font-display text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    membershipTier === 'yearly' ? 'bg-zinc-900 text-white font-bold shadow-md' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Annual Commits (Save ~20%)
                </button>
              </div>
            </div>

            {/* Plans Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans
                .filter((p) => p.category === membershipTier)
                .map((plan, index) => {
                  return (
                    <motion.div
                      key={plan.id}
                      id={`plan-card-${plan.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`relative bg-white border rounded-2xl p-7 flex flex-col justify-between overflow-hidden shadow-sm ${
                        plan.popular
                          ? 'border-gold-600 shadow-[0_12px_45px_rgba(212,175,55,0.08)] bg-white'
                          : 'border-zinc-200 hover:border-gold-500'
                      }`}
                    >
                      {/* Popular ribbon */}
                      {plan.popular && (
                        <div className="absolute top-4 right-4 bg-gold-600 text-zinc-950 font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">
                          Most Balanced
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Title and cost */}
                        <div>
                          <span className="text-zinc-450 font-mono text-[10px] tracking-widest uppercase block mb-1">
                            {plan.category} tier
                          </span>
                          <h3 className="text-zinc-900 font-display font-black text-xl uppercase tracking-wide">
                            {plan.name}
                          </h3>
                        </div>

                        {/* Cost visual */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl md:text-5xl font-display font-black text-zinc-900 tracking-tight">
                            {plan.price}
                          </span>
                          <span className="text-zinc-500 font-mono text-xs">/ {plan.duration}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-zinc-650 font-normal leading-relaxed font-sans border-b border-zinc-150 pb-5">
                          {plan.description}
                        </p>

                        {/* Features checklist */}
                        <ul className="space-y-3.5 pt-1">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex gap-2.5 text-xs text-zinc-650 font-medium">
                              <Check size={14} className="text-gold-700 flex-shrink-0 mt-0.5 stroke-[3]" />
                              <span className="font-sans">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Informational Action */}
                      <div className="pt-8 mt-8 border-t border-zinc-150">
                        {activePlan === plan.id ? (
                          <div className="space-y-3">
                            <span className="bg-gold-50 border border-gold-400 text-gold-800 rounded-xl py-3 text-[10px] uppercase font-bold tracking-wider block text-center animate-pulse">
                              ★ Your Active Plan ★
                            </span>
                            <span className="block text-[9px] text-zinc-500 text-center font-mono uppercase mt-1">
                              Expires: {activePlanExpiry}
                            </span>
                            <button
                              id={`cancel-renewal-btn-${plan.id}`}
                              type="button"
                              onClick={handleCancelPlan}
                              className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 py-3 rounded-xl text-[10px] uppercase tracking-wider font-display font-bold transition-all cursor-pointer"
                            >
                              Cancel Plan Renewal
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              id={`purchase-membership-btn-${plan.id}`}
                              type="button"
                              onClick={() => setCheckoutItem({
                                type: 'plan',
                                id: plan.id,
                                name: plan.name,
                                price: plan.price,
                                brandOrCategory: plan.category
                              })}
                              className="w-full bg-zinc-900 hover:bg-gold-600 hover:text-zinc-950 text-white hover:scale-[1.01] border border-transparent px-4 py-3.5 rounded-xl font-display text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer shadow-md"
                            >
                              {activePlan ? 'Upgrade Plan (Stripe/Easypaisa)' : 'Buy Membership (Stripe/EP)'}
                            </button>
                            <span className="block text-[9px] text-zinc-450 text-center font-mono uppercase mt-2">
                              Instant digital membership pass activation
                            </span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            {/* Terms outline card */}
            <div className="bg-white border border-zinc-250 p-6 text-center max-w-xl mx-auto space-y-2 shadow-sm rounded-2xl">
              <span className="inline-flex items-center gap-1.5 text-gold-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Info size={14} /> Local Integrity Notice
              </span>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                As an educational and first-principles gym community, we do not require card deposits, database accounts, or third-party checkouts online. Reviewing these structures helps you decide before meeting with our Sector 9 staff.
              </p>
            </div>

          </section>
        )}


        {/* NUTRITION KNOWLEDGE HUB PAGE */}
        {path === 'nutrition' && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header info */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-mono text-gold-700 font-bold uppercase tracking-widest block">
                Evidence-Based Metabolic Science
              </span>
              <h1 className="text-3xl md:text-5xl font-display font-black text-zinc-900 uppercase tracking-tight">
                The Nutrition <span className="text-gold-700">Knowledge Hub</span>
              </h1>
              <p className="text-sm text-zinc-650 font-normal leading-relaxed font-sans">
                Explore calculated nutrient digests compiled by our certified sports dietitians. Discover exact amino thresholds, caloric balance, and trace element restoration protocols.
              </p>
            </div>

            {/* Category selection Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-zinc-100 border border-zinc-200 rounded-2xl p-2.5 max-w-3xl mx-auto shadow-sm">
              {articleTags.map((tag) => (
                <button
                  key={tag}
                  id={`article-tag-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setActiveArticleTag(tag)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl font-display text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    activeArticleTag === tag
                      ? 'bg-zinc-900 text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Articles vertical / list grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => {
                return (
                  <motion.article
                    key={article.id}
                    id={`article-digest-${article.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-gold-600 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      {/* Thumbnail photo */}
                      <div className="relative aspect-video overflow-hidden bg-zinc-100">
                        <img
                          src={article.image}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-zinc-200 text-zinc-800 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded-lg font-bold shadow-sm">
                          {article.category}
                        </span>
                      </div>

                      {/* Header copy details */}
                      <div className="p-6 space-y-3.5">
                        <div className="flex items-center gap-2.5 text-[10px] text-zinc-550 font-mono font-medium">
                          <span>{article.readTime}</span>
                          <span>•</span>
                          <span>{article.publishedDate}</span>
                        </div>

                        <h3 className="text-zinc-900 group-hover:text-gold-700 font-display font-bold text-lg leading-snug uppercase tracking-tight transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-xs text-zinc-600 font-normal leading-relaxed line-clamp-3">
                          {article.summary}
                        </p>
                      </div>
                    </div>

                    {/* View bottom details Link */}
                    <div className="p-6 pt-0 border-t border-zinc-150 flex items-center justify-between text-xs font-mono font-bold bg-white">
                      <span className="text-zinc-400">Author: <span className="text-zinc-700">{article.author.split(',')[0]}</span></span>
                      <button
                        id={`read-hub-article-btn-${article.id}`}
                        onClick={() => navigate(`article/${article.id}`)}
                        className="text-gold-700 font-bold group-hover:text-zinc-900 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Read Post <ChevronRight size={14} />
                      </button>
                    </div>

                  </motion.article>
                );
              })}
            </div>

          </section>
        )}


        {/* NUTRITION HUB DYNAMIC ARTICLE VIEW */}
        {path === 'article' && param && (
          <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 select-none font-sans">
            {(() => {
              const article = articles.find(a => a.id === param);
              if (!article) {
                return (
                  <div className="text-center py-24 select-none space-y-4">
                    <p className="text-lg text-zinc-800 font-display">Article "{param}" not resolved</p>
                    <button
                      id="article-back-nutrition-hub-btn"
                      onClick={() => navigate('nutrition')}
                      className="bg-zinc-900 text-white px-4 py-2 rounded-lg font-bold"
                    >
                      Return to Nutrition Hub
                    </button>
                  </div>
                );
              }

              // Filter out 2 related articles in the same category
              const relatedArticles = articles
                .filter(a => a.category === article.category && a.id !== article.id)
                .slice(0, 2);

              return (
                <div className="space-y-10">
                  {/* Top back button */}
                  <button
                    id="article-hub-back-btn"
                    onClick={() => navigate('nutrition')}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-550 hover:text-gold-700 transition-colors py-2 cursor-pointer"
                  >
                    <ArrowLeft size={16} /> Back to Science Articles
                  </button>

                  {/* Scientific Content Block Container */}
                  <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden p-6 md:p-10 shadow-lg space-y-8">
                    
                    {/* Header credentials */}
                    <div className="space-y-4">
                      <span className="bg-gold-50 border border-gold-300 text-gold-800 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg inline-block">
                        {article.category}
                      </span>
                      
                      <h1 className="text-2xl md:text-4xl font-display font-black text-zinc-900 leading-tight uppercase tracking-tight">
                        {article.title}
                      </h1>

                      {/* By-line details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-600 border-t border-b border-zinc-200 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="bg-gold-50 text-gold-700 p-1.5 rounded-full">
                            <Clock size={12} />
                          </div>
                          <span>Read Time: <b>{article.readTime}</b></span>
                        </div>
                        <span>•</span>
                        <div>
                          <span>Published: <b>{article.publishedDate}</b></span>
                        </div>
                        <span>•</span>
                        <div>
                          <span>Clinical Editor: <b>{article.author}</b></span>
                        </div>
                      </div>
                    </div>

                    {/* Cinematic image cover */}
                    <div className="aspect-video bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover grayscale contrast-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Long Form Article Body details */}
                    <div className="max-w-none text-zinc-750">
                      {renderArticleContent(article.content)}
                    </div>

                  </div>

                  {/* Related Articles Panel */}
                  {relatedArticles.length > 0 && (
                    <div className="space-y-5 pt-8 border-t border-zinc-200">
                      <h3 className="font-display font-black text-lg text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={16} className="text-gold-700" /> Related Scientific Guides
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {relatedArticles.map(rel => (
                          <div
                            key={rel.id}
                            id={`related-article-${rel.id}`}
                            onClick={() => navigate(`article/${rel.id}`)}
                            className="bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-gold-500 p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
                          >
                            <div className="space-y-2">
                              <span className="text-[9px] font-mono tracking-widest text-gold-700 font-bold uppercase">{rel.category}</span>
                              <h4 className="text-zinc-900 group-hover:text-gold-700 transition-colors uppercase font-display font-black text-sm line-clamp-2 leading-relaxed">
                                {rel.title}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between mt-4 text-[10px] font-mono text-zinc-500 pt-3 border-t border-zinc-150 font-bold">
                              <span>{rel.readTime}</span>
                              <span className="text-gold-700 group-hover:text-zinc-900 transition-colors">Read Guide →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}
          </section>
        )}


        {/* CLIENT INTERACTIVE CALCULATORS PAGE */}
        {path === 'calculators' && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 select-none">
            
            {/* Header copy details */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-mono text-gold-700 font-bold uppercase tracking-widest block">
                Scientific Diagnostics Engine
              </span>
              <h1 className="text-3xl md:text-5xl font-display font-black text-zinc-900 uppercase tracking-tight">
                Physique adaptation <span className="text-gold-700">Calculators</span>
              </h1>
              <p className="text-sm text-zinc-650 font-normal leading-relaxed font-sans">
                Avoid guesswork. Use our local client multipliers to immediately formulate calorie breakdowns, baseline BMR rates, protein distributions, and sweat replacement indices.
              </p>
            </div>

            {/* Inject the comprehensive Calculators Component */}
            <CalculatorCard />

            {/* Note about equations used */}
            <div className="bg-white border border-zinc-200 p-8 rounded-2xl max-w-2xl mx-auto space-y-4 shadow-sm">
              <span className="text-xs font-mono text-gold-700 uppercase tracking-widest block font-bold">
                Clinical Formulas Implemented
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal font-sans text-zinc-600">
                <div className="space-y-1">
                  <h5 className="font-display font-black text-zinc-900 uppercase">1. Mifflin-St Jeor TDEE</h5>
                  <p className="leading-relaxed text-zinc-500">Recognized as the sports-science gold standard to evaluate basal metabolics prior to physical coefficient products.</p>
                </div>
                <div className="space-y-1">
                  <h5 className="font-display font-black text-zinc-900 uppercase">2. Sweating Fluid Coefficient</h5>
                  <p className="leading-relaxed text-zinc-500">Adds baseline cellular weights (35ml/kg) with exercise sweat offsets (15ml/min) representing optimal rehydration.</p>
                </div>
              </div>
            </div>

          </section>
        )}


        {/* SUPPLEMENT STORE INFORMATION PAGE */}
        {path === 'store' && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header text info */}
            <div className="text-center max-w-3xl mx-auto space-y-4 animate-fadeIn">
              <span className="text-[10px] font-mono text-gold-800 uppercase tracking-widest block font-extrabold bg-gold-50 py-1.5 px-3.5 border border-gold-300 rounded-full w-fit mx-auto shadow-sm">
                Secure SSL Online Billing Enabled
              </span>
              <h1 className="text-3xl md:text-5xl font-display font-black text-zinc-900 uppercase tracking-tight">
                Premium <span className="text-gold-700">Supplements store</span>
              </h1>
              <p className="text-sm text-zinc-650 font-normal leading-relaxed font-sans max-w-2xl mx-auto">
                Securely order certified high-grade metabolic supplements using **Stripe Direct Credit Card** checkout or **Easypaisa Mobile Wallet**. Instant PKR conversions and digital compound confirmations will dispatch to your delivery details.
              </p>
            </div>

            {/* Dynamic Card for order history */}
            {orders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-3xl mx-auto space-y-4 shadow-md"
              >
                <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-gold-700 uppercase tracking-widest font-black">
                      Your Digital Ledger Receipts ({orders.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('fitzone_orders');
                      setOrders([]);
                    }}
                    className="text-[10px] font-mono text-red-600 hover:text-red-500 uppercase underline cursor-pointer font-bold"
                  >
                    Clear History
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] text-zinc-600 min-w-[500px]">
                    <thead>
                      <tr className="text-[9px] text-zinc-450 uppercase tracking-wider border-b border-zinc-200">
                        <th className="pb-2 font-black">Order Ref</th>
                        <th className="pb-2 font-black">Product Details</th>
                        <th className="pb-2 font-black text-center">Amount Paid</th>
                        <th className="pb-2 font-black">Gateway</th>
                        <th className="pb-2 font-black text-right">Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.orderId} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                          <td className="py-3 text-zinc-900 font-extrabold">{o.orderId.split('_').pop().substring(0, 8)}</td>
                          <td className="py-3 text-zinc-700 font-sans font-medium">{o.itemName}</td>
                          <td className="py-3 text-gold-700 font-black text-center">{o.price}</td>
                          <td className="py-3 text-zinc-500 uppercase font-bold text-[10px]">{o.method}</td>
                          <td className="py-3 text-right">
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 text-[9px] font-black uppercase tracking-wider inline-block">
                              Dispatched
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Category selection Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-zinc-100 border border-zinc-200 rounded-2xl p-2.5 max-w-2xl mx-auto shadow-sm">
              {supplementCategories.map((cat) => (
                <button
                  key={cat}
                  id={`supplement-tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setActiveSupplementFilter(cat)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl font-display text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    activeSupplementFilter === cat
                      ? 'bg-zinc-900 text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => {
                return (
                  <motion.div
                    key={product.id}
                    id={`supplement-card-${product.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-gold-600 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative aspect-square overflow-hidden bg-zinc-50 p-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500 rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-4 left-4 bg-zinc-900 text-white text-[9px] font-mono uppercase tracking-wider px-2 py-1.5 rounded-lg font-bold shadow-md">
                          {product.price}
                        </span>
                      </div>

                      {/* Text Specifications info */}
                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 block font-bold">
                            {product.brand}
                          </span>
                          <h3 className="text-zinc-900 group-hover:text-gold-700 transition-colors font-display font-black text-base uppercase tracking-tight mt-0.5 line-clamp-1">
                            {product.name}
                          </h3>
                        </div>

                        <p className="text-xs text-zinc-600 font-normal leading-relaxed line-clamp-3">
                          {product.description}
                        </p>

                        {/* Nutrition Highlight bullet */}
                        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-[10px] font-mono text-zinc-650 space-y-1 shadow-inner">
                          <span className="text-gold-800 block font-bold uppercase tracking-wide">Key Nutritional Specs:</span>
                          <p>• Serving: {product.nutritionFacts.servingSize}</p>
                          {product.nutritionFacts.protein && <p>• Protein: {product.nutritionFacts.protein}</p>}
                          {product.nutritionFacts.lCitrulline && <p>• L-Citrulline: {product.nutritionFacts.lCitrulline}</p>}
                          {product.nutritionFacts.creatineMonohydrate && <p>• Creapure: {product.nutritionFacts.creatineMonohydrate}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-5 pt-0 mt-2 space-y-2">
                      <button
                        id={`product-purchase-checkout-${product.id}`}
                        onClick={() => setCheckoutItem({
                          type: 'product',
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          brandOrCategory: product.brand
                        })}
                        className="w-full bg-zinc-900 hover:bg-gold-600 hover:text-zinc-950 text-white py-3 rounded-xl font-display text-[10px] uppercase font-black tracking-wider cursor-pointer transition-all block text-center shadow-md"
                      >
                        Buy Now (Stripe / EP)
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id={`product-learn-more-${product.id}`}
                          onClick={() => navigate(`product/${product.id}`)}
                          className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 py-2.5 rounded-lg font-display text-[9px] uppercase font-bold tracking-wider cursor-pointer transition-colors block text-center font-bold"
                        >
                          Details Spec
                        </button>
                        <button
                          id={`product-desk-info-${product.id}`}
                          onClick={() => setPurchaseModalProduct(product)}
                          className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-800 py-2.5 rounded-lg font-display text-[9px] uppercase font-bold tracking-wider cursor-pointer transition-colors block text-center"
                        >
                          Desk Desk
                        </button>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>

          </section>
        )}


        {/* SUPPLEMENT DYNAMIC DETAIL VIEW */}
        {path === 'product' && param && (
          <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {(() => {
              const product = products.find(p => p.id === param);
              if (!product) {
                return (
                  <div className="text-center py-24 select-none space-y-4">
                    <p className="text-lg text-zinc-800 font-display">Supplement "{param}" not resolved</p>
                    <button
                      id="product-back-supplements-btn"
                      onClick={() => navigate('store')}
                      className="bg-zinc-900 text-white px-4 py-2 rounded-lg font-bold"
                    >
                      Return to Store
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-8 select-none font-sans">
                  {/* Back button */}
                  <button
                    id="product-back-btn"
                    onClick={() => navigate('store')}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-550 hover:text-gold-700 transition-colors py-2 cursor-pointer"
                  >
                    <ArrowLeft size={16} /> Back to Supplement Catalog
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 overflow-hidden shadow-md">
                    {/* Left Column Image and Purchase triggers */}
                    <div className="md:col-span-5 space-y-6">
                      <div className="aspect-square bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 shadow-md p-6">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-300 rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Cost details */}
                      <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex items-center justify-between text-left">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-450 uppercase tracking-widest block font-bold">In-Stock Price</span>
                          <span className="block text-2xl font-display font-black text-zinc-900">{product.price}</span>
                        </div>
                        <button
                          id="product-detail-purchase-cta"
                          onClick={() => setCheckoutItem({
                            type: 'product',
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            brandOrCategory: product.brand
                          })}
                          className="bg-zinc-900 hover:bg-gold-600 hover:text-zinc-950 text-white px-5 py-3.5 rounded-xl font-display text-[10px] uppercase tracking-wider font-black transition-all cursor-pointer shadow-md"
                        >
                          Buy with Stripe / EP
                        </button>
                      </div>
                    </div>

                    {/* Right Column Nutrition Tables and details */}
                    <div className="md:col-span-7 space-y-6">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-gold-700 font-bold uppercase">
                          {product.brand} Brand Catalog
                        </span>
                        <h1 className="text-2xl md:text-3xl font-display font-black text-zinc-900 uppercase tracking-tight mt-0.5">
                          {product.name}
                        </h1>
                      </div>

                      <p className="text-sm font-normal text-zinc-650 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Nutrition facts clinical tables */}
                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3.5">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-800 font-bold border-b border-zinc-200 pb-2">
                          Clinical Nutrition Facts Table
                        </h4>
                        
                        <div className="space-y-2 text-xs font-mono text-zinc-600">
                          {Object.entries(product.nutritionFacts).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-zinc-150 pb-1.5 capitalize">
                              <span className="text-zinc-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-zinc-800 font-bold">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits & Instructions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <h4 className="text-xs font-mono uppercase text-gold-700 font-bold tracking-wider">Major Adaptation Benefits:</h4>
                          <ul className="space-y-2 text-xs text-zinc-600 font-sans font-medium">
                            {product.benefits.map((benefit, bIdx) => (
                              <li key={bIdx} className="flex gap-2">
                                <span className="text-gold-700 flex-shrink-0 font-bold">•</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-mono uppercase text-gold-700 font-bold tracking-wider">Recommended Usage:</h4>
                          <p className="text-xs text-zinc-600 leading-relaxed font-normal font-sans">
                            {product.usage}
                          </p>
                        </div>
                      </div>

                      {/* Ingredients */}
                      <div className="space-y-2 pt-2 border-t border-zinc-200">
                        <h4 className="text-xs font-mono uppercase text-zinc-800 font-bold tracking-widest">Active Formula Ingredients:</h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {product.ingredients.map((ing, iIdx) => (
                            <span key={iIdx} className="bg-zinc-50 border border-zinc-200 text-zinc-600 text-[10px] font-mono px-3 py-1.5 rounded-lg font-bold">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        )}

      </main>

      {/* Dynamic footer component */}
      <Footer onNavigate={(p) => navigate(p)} />


      {/* SUPPLEMENT STORE "CONTACT FOR PURCHASE" LOCAL EXPLAIN PANEL OVERLAY MODAL */}
      <AnimatePresence>
        {purchaseModalProduct && (
          <motion.div
            id="purchase-instructions-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              id="purchase-instructions-panel"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 max-w-xl w-full text-left space-y-6 relative overflow-hidden shadow-2xl"
            >
              {/* Top title */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gold-700 font-bold uppercase tracking-widest block mb-0.5">Physical Counter Checkout</span>
                  <h3 className="text-xl font-display font-black text-zinc-900 uppercase tracking-tight">Supplements Purchase Instructions</h3>
                </div>
                <button
                  id="close-purchase-modal-btn"
                  onClick={() => setPurchaseModalProduct(null)}
                  className="p-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-md text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Product specifications label */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 flex items-center gap-4 shadow-inner">
                <img
                  src={purchaseModalProduct.image}
                  alt={purchaseModalProduct.name}
                  className="w-14 h-14 object-cover rounded-lg bg-zinc-200 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-zinc-450 block font-bold">{purchaseModalProduct.brand}</span>
                  <h4 className="text-zinc-900 font-display text-base uppercase font-black truncate">{purchaseModalProduct.name}</h4>
                  <span className="text-[11px] text-gold-700 font-mono font-bold block mt-0.5">Quote ID: fitzone-{purchaseModalProduct.id} • {purchaseModalProduct.price}</span>
                </div>
              </div>

              {/* Checkout steps mapping */}
              <div className="space-y-4">
                <p className="text-xs text-zinc-650 leading-relaxed font-sans font-normal">
                  Because we are a local first-principles gym community dedicated to premium privacy safeguards, all supplement sales are finalized individually at our central front counter:
                </p>

                <div className="space-y-3 font-sans">
                  <div className="flex gap-2.5 text-xs text-zinc-700 font-medium">
                    <span className="bg-zinc-100 border border-zinc-250 h-6 w-6 text-[10px] font-mono rounded-md flex items-center justify-center font-bold text-gold-700 flex-shrink-0">Step 1</span>
                    <p className="leading-relaxed">Proceed to the main **FitZone Welcome Lobby & Shakes Desk** inside Sector 9 HQ.</p>
                  </div>
                  <div className="flex gap-2.5 text-xs text-zinc-700 font-medium">
                    <span className="bg-zinc-100 border border-zinc-250 h-6 w-6 text-[10px] font-mono rounded-md flex items-center justify-center font-bold text-gold-700 flex-shrink-0">Step 2</span>
                    <p className="leading-relaxed">Provide the desk agent with the product details: **{purchaseModalProduct.name}**.</p>
                  </div>
                  <div className="flex gap-2.5 text-xs text-zinc-700 font-medium">
                    <span className="bg-zinc-100 border border-zinc-250 h-6 w-6 text-[10px] font-mono rounded-md flex items-center justify-center font-bold text-gold-700 flex-shrink-0">Step 3</span>
                    <p className="leading-relaxed">Complete your transaction at the physical terminal using credit card, debit, or member balances.</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-zinc-150 flex items-center justify-end gap-3">
                <button
                  id="dismiss-purchase-modal"
                  onClick={() => setPurchaseModalProduct(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider px-5 py-3 rounded-lg cursor-pointer transition-colors font-bold shadow-md"
                >
                  Close
                </button>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono font-medium">
                  <span>Concierge open 24/7 daily</span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={checkoutItem !== null}
        onClose={() => setCheckoutItem(null)}
        purchaseItem={checkoutItem}
        onSuccess={handlePaymentSuccess}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          localStorage.setItem('fitzone_user', JSON.stringify(user));
          setCurrentUser(user);
        }}
      />

    </div>
  );
}
