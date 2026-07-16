import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Users,
  ShoppingBag,
  TrendingUp,
  Database,
  Lock,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Smartphone,
  CreditCard,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  AlertCircle,
  X,
  Sparkles,
  BarChart2,
  RefreshCw,
  Search,
  BookOpen,
  Sun,
  Moon,
  LogOut,
  Sliders,
  Check
} from 'lucide-react';
import { Product } from '../../types';

interface Order {
  orderId: string;
  date: string;
  itemName: string;
  price: string;
  method: 'Stripe' | 'Easypaisa';
  status: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  planId: string;
  planName: string;
  assignedTrainer: string;
  status: 'Active' | 'Pending' | 'Expired';
  expiryDate: string;
  joinedDate: string;
}

interface AdminDashboardProps {
  products: Product[];
  onProductsChange: (newProducts: Product[]) => void;
  orders: Order[];
  onAddOrder: (order: Order) => void;
  activePlanName?: string | null;
  activePlanExpiry?: string | null;
  onNavigateHome: () => void;
}

export default function AdminDashboard({
  products,
  onProductsChange,
  orders,
  onAddOrder,
  activePlanName,
  activePlanExpiry,
  onNavigateHome
}: AdminDashboardProps) {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fitzone_admin_theme') !== 'light';
  });

  // Login Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fitzone_admin_logged') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab: stats, members, supplements, billing, audit
  const [currentTab, setCurrentTab] = useState<'stats' | 'members' | 'supplements' | 'billing' | 'audit'>('stats');

  // Dynamic Members State
  const [members, setMembers] = useState<Member[]>([]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<{ id: string; time: string; action: string; category: string }[]>([]);

  // Save theme selection
  useEffect(() => {
    localStorage.setItem('fitzone_admin_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Sync state with backend database on mount
  useEffect(() => {
    const fetchDB = async () => {
      try {
        const memRes = await fetch('/api/members');
        if (memRes.ok) {
          const memData = await memRes.json();
          if (memData && memData.length > 0) {
            setMembers(memData);
          } else {
            // Seed initial mock members to MongoDB
            const initialMembers: Member[] = [
              {
                id: 'mem_1',
                name: 'Asim Qureshy',
                email: 'asim.q@gmail.com',
                planId: 'm-gold',
                planName: 'Gold Member Pass',
                assignedTrainer: 'Mustafa Malik',
                status: 'Active',
                expiryDate: 'June 25, 2026',
                joinedDate: 'May 25, 2026'
              },
              {
                id: 'mem_2',
                name: 'Sara Khan',
                email: 'sara.k88@outlook.com',
                planId: 'y-vip',
                planName: 'VIP Compound Pass',
                assignedTrainer: 'Sophia Vance',
                status: 'Active',
                expiryDate: 'May 30, 2027',
                joinedDate: 'May 10, 2026'
              },
              {
                id: 'mem_3',
                name: 'Zainab Jameel',
                email: 'zainab.j@yahoo.com',
                planId: 'm-starter',
                planName: 'Starter Base Pass',
                assignedTrainer: 'Adnan Siddiqui',
                status: 'Expired',
                expiryDate: 'May 15, 2026',
                joinedDate: 'April 15, 2026'
              }
            ];
            setMembers(initialMembers);
            for (const m of initialMembers) {
              await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(m)
              });
            }
          }
        }
      } catch (e) {
        console.warn("Failed fetching members from MongoDB database", e);
      }

      try {
        const logRes = await fetch('/api/logs');
        if (logRes.ok) {
          const logData = await logRes.json();
          if (logData && logData.length > 0) {
            setAuditLogs(logData);
          } else {
            // Seed initial logs to MongoDB
            const initialLogs = [
              { id: 'log_1', time: '10:14 AM', action: 'Admin logged into central security portal', category: 'Security' },
              { id: 'log_2', time: 'Yesterday', action: 'Stripe transaction verified: PK-CH-9941PK', category: 'Transaction' },
              { id: 'log_3', time: 'Yesterday', action: 'New membership plan added to database', category: 'Database' }
            ];
            setAuditLogs(initialLogs);
            for (const l of initialLogs) {
              await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(l)
              });
            }
          }
        }
      } catch (e) {
        console.warn("Failed fetching logs from MongoDB database", e);
      }
    };

    fetchDB();
  }, []);

  // State for adding a product
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Protein');
  const [newProdPrice, setNewProdPrice] = useState('Rs 9,500');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdProtein, setNewProdProtein] = useState('24g');
  const [newProdCalories, setNewProdCalories] = useState('120 kcal');

  // State for member manual controls
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemEmail, setNewMemEmail] = useState('');
  const [newMemPlan, setNewMemPlan] = useState('m-gold');

  // Load and inject checkout events as audit logs on change
  useEffect(() => {
    if (orders.length > 0) {
      const latest = orders[0];
      const match = auditLogs.find(l => l.action.includes(latest.orderId));
      if (!match) {
        const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const text = `Incoming payment verified (${latest.method}) for product '${latest.itemName}' of ${latest.price}`;
        addAudit(text, 'Transaction');
      }
    }
  }, [orders]);

  // Sync user's active membership status if present in the main UI
  useEffect(() => {
    if (activePlanName && !members.some(m => m.email === 'user@fitzone.com')) {
      const liveUser: Member = {
        id: 'mem_user',
        name: 'You (Active Session)',
        email: 'user@fitzone.com',
        planId: 'active-session-id',
        planName: activePlanName,
        assignedTrainer: 'Mustafa Malik',
        status: 'Active',
        expiryDate: activePlanExpiry || 'Next Month',
        joinedDate: 'Today'
      };
      const updated = [liveUser, ...members];
      setMembers(updated);
      
      // Save user to backend members database
      fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(liveUser)
      }).catch(e => console.warn("Failed syncing user's membership to database", e));
    }
  }, [activePlanName, activePlanExpiry]);

  const addAudit = async (actionText: string, categoryName: string) => {
    const formattedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newLogItem = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      time: formattedTime,
      action: actionText,
      category: categoryName
    };
    setAuditLogs(prev => [newLogItem, ...prev]);

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLogItem)
      });
    } catch (e) {
      console.warn("Failed logging audit action to database", e);
    }
  };

  // Credentials validator
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('fitzone_admin_logged', 'true');
        addAudit('Administrator logged in through secure authentication', 'Security');
      } else {
        setLoginError(data.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setLoginError('Failed to communicate with secure authentication gateway.');
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    localStorage.removeItem('fitzone_admin_logged');
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.warn("Failed calling admin logout API", e);
    }
  };

  // Revoke/Activate Plan manually
  const toggleMemberStatus = async (id: string) => {
    const updated = members.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'Active' ? 'Expired' : 'Active';
        addAudit(`Updated member '${m.name}' status to '${nextStatus}'`, 'Members');
        return { ...m, status: nextStatus as 'Active' | 'Expired' };
      }
      return m;
    });
    setMembers(updated);
    
    const changedMember = updated.find(m => m.id === id);
    if (changedMember) {
      try {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changedMember)
        });
      } catch (e) {
        console.warn("Failed syncing manual status switch", e);
      }
    }
  };

  // Add Member
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName.trim() || !newMemEmail.trim()) return;

    const planOpts: Record<string, string> = {
      'm-starter': 'Starter Base Pass',
      'm-gold': 'Gold Member Pass',
      'm-platinum': 'Platinum Pro Pass',
      'y-vip': 'VIP Compound Pass'
    };

    const newM: Member = {
      id: 'mem_' + Math.random().toString(36).substring(2, 9),
      name: newMemName,
      email: newMemEmail,
      planId: newMemPlan,
      planName: planOpts[newMemPlan] || 'Standard Active Pass',
      assignedTrainer: 'Sophia Vance',
      status: 'Active',
      expiryDate: newMemPlan.startsWith('y-') ? 'June 03, 2027' : 'July 03, 2026',
      joinedDate: 'June 03, 2026'
    };

    const nextM = [newM, ...members];
    setMembers(nextM);
    addAudit(`Registered new member profile: ${newMemName}`, 'Members');

    try {
      await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newM)
      });
    } catch (e) {
      console.warn("Failed saving newly enrolled member", e);
    }

    setNewMemName('');
    setNewMemEmail('');
    setShowAddMember(false);
  };

  // Remove Member
  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete member '${name}'?`)) return;
    const nextM = members.filter(m => m.id !== id);
    setMembers(nextM);
    addAudit(`Member '${name}' permanently removed from system database`, 'Members');

    try {
      await fetch(`/api/members/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn("Failed deleting member", e);
    }
  };

  // Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdBrand.trim()) return;

    const newP: Product = {
      id: 'prod_' + Math.random().toString(36).substring(2, 9),
      name: newProdName,
      brand: newProdBrand,
      category: newProdCategory,
      image: newProdImage,
      description: newProdDesc || 'Premium grade metabolism and synthesis compound formulation.',
      price: newProdPrice,
      nutritionFacts: {
        servingSize: '1 serving dose',
        protein: newProdProtein,
        calories: newProdCalories,
        carbs: '4g',
        fat: '1g'
      },
      ingredients: ['Active isolate proteins', 'Amino complex segments', 'Digestive enzymes'],
      benefits: ['Supports physical recovery', 'Enhances energy and nutrient absorption'],
      usage: 'Mix 1 scoop with 250ml of water or skimmed milk. Consume once daily.'
    };

    const nextP = [newP, ...products];
    onProductsChange(nextP);
    localStorage.setItem('fitzone_products', JSON.stringify(nextP));
    
    addAudit(`Added new supplement range to catalog: ${newProdName}`, 'Database');

    // Reset Form
    setNewProdName('');
    setNewProdBrand('');
    setNewProdPrice('Rs 9,500');
    setNewProdDesc('');
    setNewProdProtein('24g');
    setNewProdCalories('120 kcal');
    setShowAddForm(false);
  };

  // Remove product
  const handleRemoveProduct = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete '${name}'?`)) return;
    const filtered = products.filter(p => p.id !== id);
    onProductsChange(filtered);
    localStorage.setItem('fitzone_products', JSON.stringify(filtered));
    addAudit(`Supplement '${name}' deleted from database`, 'Database');
  };

  // Update product price
  const handleUpdatePrice = (id: string, currentPrice: string) => {
    const input = prompt(`Enter new price for this product:`, currentPrice);
    if (input === null || input.trim() === '') return;
    
    let formatted = input.trim();
    if (!formatted.toLowerCase().startsWith('rs') && !formatted.includes('$')) {
      formatted = 'Rs ' + formatted;
    }

    const updated = products.map(p => {
      if (p.id === id) {
        addAudit(`Supplement '${p.name}' price changed from ${p.price} to ${formatted}`, 'Database');
        return { ...p, price: formatted };
      }
      return p;
    });

    onProductsChange(updated);
    localStorage.setItem('fitzone_products', JSON.stringify(updated));
  };

  const countActiveMembers = members.filter(m => m.status === 'Active').length;
  
  // Dynamic revenue aggregator
  const calculateAggregateRevenue = () => {
    let totalPKR = 250000; 
    let totalUSD = 850;

    orders.forEach(o => {
      const matchDigits = o.price.replace(/[^\d]/g, '');
      const parsedNum = parseInt(matchDigits, 10) || 0;
      if (o.price.includes('$')) {
        totalUSD += parsedNum;
      } else {
        totalPKR += parsedNum;
      }
    });

    return `Rs ${totalPKR.toLocaleString()} + $${totalUSD.toLocaleString()}`;
  };

  // CSS theme helpers
  const themeBg = isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900';
  const themeCard = isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm';
  const themeSubCard = isDarkMode ? 'bg-zinc-950/60 border border-zinc-900' : 'bg-zinc-50/80 border border-zinc-150';
  const themeBorder = isDarkMode ? 'border-zinc-800' : 'border-zinc-200';
  const themeTextMuted = isDarkMode ? 'text-zinc-400' : 'text-zinc-500';
  const themeTextTitle = isDarkMode ? 'text-white' : 'text-zinc-900';
  const themeInput = isDarkMode 
    ? 'bg-zinc-950 border border-zinc-850 text-white placeholder-zinc-650 focus:border-amber-500' 
    : 'bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-500';

  return (
    <div id="admin-module-host" className={`${themeBg} min-h-screen font-sans selection:bg-amber-500 selection:text-black select-text transition-colors duration-300`}>
      
      {/* AUTHENTICATION PORTAL GATEWAY */}
      {!isAuthenticated ? (
        <section className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-400' : 'bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200 shadow-sm'
              }`}
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <motion.div
            id="admin-auth-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-md rounded-3xl p-8 space-y-6 transition-all ${themeCard}`}
          >
            <div className="text-center space-y-2">
              <div className="bg-amber-500/10 text-amber-500 p-3.5 rounded-2xl border border-amber-500/20 w-fit mx-auto text-center flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase block font-black">
                Authorized Personnel Only
              </span>
              <h2 className={`text-2xl font-black tracking-tight uppercase ${themeTextTitle}`}>
                FitZone Control Center
              </h2>
              <p className={`text-xs ${themeTextMuted}`}>
                Enter the administration credentials below to access and manage site parameters.
              </p>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-2 text-left">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-red-500 font-bold text-xs">Login Failed</span>
                  <p className="text-red-400 text-xs mt-0.5">{loginError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`rounded-xl pl-8 pr-4 py-3 text-sm w-full outline-none transition-all font-mono ${themeInput}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`rounded-xl px-10 py-3 text-sm w-full outline-none transition-all font-mono ${themeInput}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all cursor-pointer text-center"
              >
                Authenticate Entrance
              </button>
            </form>

            <div className="flex items-center justify-between border-t border-zinc-200/40 dark:border-zinc-800/60 pt-4 text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM STATUS: ACTIVE
              </span>
              <span>PORT: 3000</span>
            </div>

            <button
              onClick={onNavigateHome}
              className={`text-xs font-semibold hover:underline block mx-auto pt-1 transition-all ${themeTextMuted} hover:text-amber-500`}
            >
              ← Back to Client Homepage
            </button>
          </motion.div>
        </section>
      ) : (
        
        // SECURE AUTHENTICATED CONTROL BOARD
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Admin Station Header Banner */}
          <div className={`rounded-3xl p-6 flex flex-wrap items-center justify-between gap-6 transition-all ${themeCard}`}>
            <div className="text-left flex items-center gap-4">
              <div className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl border border-amber-500/20">
                <Database className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-black bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                    Central Admin
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-[10px] font-mono ${themeTextMuted}`}>Host: localhost:3000</span>
                </div>
                <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${themeTextTitle}`}>
                  FitZone <span className="text-amber-500">Management Studio</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle in header */}
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-amber-400' 
                    : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600 shadow-sm'
                }`}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                type="button"
                onClick={onNavigateHome}
                className={`px-4 py-2.5 rounded-xl text-xs uppercase tracking-wide font-bold cursor-pointer transition-all border ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white' 
                    : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700 shadow-sm'
                }`}
              >
                Client Site
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wide font-bold cursor-pointer transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick Realtime Stats Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className={`rounded-2xl p-5 text-left relative overflow-hidden group hover:border-amber-500/30 transition-all ${themeCard}`}>
              <div className="absolute right-4 top-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                <DollarSign size={28} />
              </div>
              <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${themeTextMuted}`}>Total Vault Revenue</span>
              <h3 className={`text-lg font-black tracking-tight mt-1 border-b pb-2 ${themeTextTitle} ${themeBorder}`}>
                {calculateAggregateRevenue()}
              </h3>
              <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1 pt-2">
                <span>★ Simulated startup pool + orders</span>
              </p>
            </div>

            {/* Metric 2 */}
            <div className={`rounded-2xl p-5 text-left relative overflow-hidden group hover:border-amber-500/30 transition-all ${themeCard}`}>
              <div className="absolute right-4 top-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                <Users size={28} />
              </div>
              <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${themeTextMuted}`}>Active Members</span>
              <h3 className={`text-xl font-black mt-1 border-b pb-2 ${themeTextTitle} ${themeBorder}`}>
                {countActiveMembers} / {members.length} Total
              </h3>
              <p className="text-[10px] text-amber-500 font-mono flex items-center gap-1 pt-2">
                <span>✔ Synced with backend database</span>
              </p>
            </div>

            {/* Metric 3 */}
            <div className={`rounded-2xl p-5 text-left relative overflow-hidden group hover:border-amber-500/30 transition-all ${themeCard}`}>
              <div className="absolute right-4 top-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                <ShoppingBag size={28} />
              </div>
              <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${themeTextMuted}`}>Supplement Catalog</span>
              <h3 className={`text-xl font-black mt-1 border-b pb-2 ${themeTextTitle} ${themeBorder}`}>
                {products.length} Products
              </h3>
              <p className="text-[10px] text-amber-500 font-mono flex items-center gap-1 pt-2">
                <span>⚡ Editable stock item listing</span>
              </p>
            </div>

            {/* Metric 4 */}
            <div className={`rounded-2xl p-5 text-left relative overflow-hidden group hover:border-amber-500/30 transition-all ${themeCard}`}>
              <div className="absolute right-4 top-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                <CreditCard size={28} />
              </div>
              <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${themeTextMuted}`}>Total Completed Orders</span>
              <h3 className={`text-xl font-black mt-1 border-b pb-2 ${themeTextTitle} ${themeBorder}`}>
                {orders.length} Transactions
              </h3>
              <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1 pt-2">
                <span>💸 Direct Stripe & Easypaisa</span>
              </p>
            </div>

          </div>

          {/* Module Selector TABS bar */}
          <div className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl ${themeCard}`}>
            <button
              onClick={() => setCurrentTab('stats')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'stats'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : `${themeTextMuted} hover:text-amber-500 hover:bg-amber-500/10`
              }`}
            >
              <BarChart2 size={14} />
              <span>Analytics Overview</span>
            </button>

            <button
              onClick={() => setCurrentTab('members')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'members'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : `${themeTextMuted} hover:text-amber-500 hover:bg-amber-500/10`
              }`}
            >
              <Users size={14} />
              <span>Members Registry ({members.length})</span>
            </button>

            <button
              onClick={() => setCurrentTab('supplements')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'supplements'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : `${themeTextMuted} hover:text-amber-500 hover:bg-amber-500/10`
              }`}
            >
              <ShoppingBag size={14} />
              <span>Manage Inventory ({products.length})</span>
            </button>

            <button
              onClick={() => setCurrentTab('billing')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'billing'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : `${themeTextMuted} hover:text-amber-500 hover:bg-amber-500/10`
              }`}
            >
              <CreditCard size={14} />
              <span>Transaction History ({orders.length})</span>
            </button>

            <button
              onClick={() => setCurrentTab('audit')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'audit'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : `${themeTextMuted} hover:text-amber-500 hover:bg-amber-500/10`
              }`}
            >
              <FileText size={14} />
              <span>System Activity Logs ({auditLogs.length})</span>
            </button>
          </div>

          {/* DYNAMIC TAB COMPONENT OUTPUTS */}
          <div className={`rounded-3xl p-6 md:p-8 transition-all ${themeCard}`}>
            
            {/* STATS VIEW */}
            {currentTab === 'stats' && (
              <div className="space-y-8 text-left animate-fadeIn">
                <div className="flex flex-col gap-1">
                  <h3 className={`font-black text-xl uppercase ${themeTextTitle}`}>Earnings & Gateways Performance</h3>
                  <p className={`text-xs ${themeTextMuted}`}>
                    Simple visual summaries representing incoming client registration orders, Stripe checkouts, and Easypaisa wallet collections.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Revenue Chart */}
                  <div className={`rounded-2xl p-6 space-y-4 ${themeSubCard}`}>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-amber-500" />
                      <span className={`text-[11px] font-mono uppercase tracking-wider block font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        Monthly Revenue Growth Index (PKR)
                      </span>
                    </div>
                    
                    {/* Visual graph simulator using CSS grid and bars */}
                    <div className="h-[200px] flex items-end justify-between gap-3 pt-6 border-b border-l border-zinc-200 dark:border-zinc-800 pl-3 pb-1">
                      {[
                        { label: 'Jan', val: 30, value: 'Rs 115k' },
                        { label: 'Feb', val: 45, value: 'Rs 180k' },
                        { label: 'Mar', val: 40, value: 'Rs 155k' },
                        { label: 'Apr', val: 65, value: 'Rs 240k' },
                        { label: 'May', val: 85, value: 'Rs 310k' },
                        { label: 'Jun', val: 100, value: 'Rs 420k' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end">
                          <span className="text-[9px] font-mono text-amber-500 scale-90 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap block font-bold">
                            {item.value}
                          </span>
                          <div 
                            style={{ height: `${item.val}%` }}
                            className="bg-amber-500/80 hover:bg-amber-500 w-full rounded-t-md transition-all duration-300 relative"
                          >
                            <div className="absolute inset-0 bg-white/10 h-full w-full opacity-0 hover:opacity-100 transition-all rounded-t-md" />
                          </div>
                          <span className={`text-[10px] font-mono mt-1 block uppercase ${themeTextMuted}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className={`text-[11px] leading-relaxed ${themeTextMuted}`}>
                      Hover over individual bars to view calculated monthly estimates of compound pass signups and supplement transactions.
                    </p>
                  </div>

                  {/* Gateway Breakdown Share */}
                  <div className={`rounded-2xl p-6 space-y-6 ${themeSubCard}`}>
                    <div className="flex items-center gap-2">
                      <Sliders size={16} className="text-amber-500" />
                      <span className={`text-[11px] font-mono uppercase tracking-wider block font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        Preferred Gateway Share
                      </span>
                    </div>

                    <div className="space-y-6">
                      {/* Stripe share */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-1.5 font-bold uppercase">
                            <CreditCard size={14} className="text-amber-500" />
                            Stripe Credit Cards
                          </span>
                          <span className="font-mono text-amber-500 font-bold">62% Share</span>
                        </div>
                        <div className="bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full w-[62%]" />
                        </div>
                      </div>

                      {/* Easypaisa share */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-1.5 font-bold uppercase">
                            <Smartphone size={14} className="text-emerald-500" />
                            Easypaisa Wallet
                          </span>
                          <span className="font-mono text-emerald-500 font-bold">38% Share</span>
                        </div>
                        <div className="bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full w-[38%]" />
                        </div>
                      </div>
                    </div>

                    {/* Fun facts list */}
                    <div className={`pt-4 border-t grid grid-cols-2 gap-4 text-xs ${themeBorder}`}>
                      <div>
                        <span className={`font-mono text-[9px] block uppercase ${themeTextMuted}`}>Average Card Value</span>
                        <span className={`text-base font-black block ${themeTextTitle}`}>Rs 14,200</span>
                      </div>
                      <div>
                        <span className={`font-mono text-[9px] block uppercase ${themeTextMuted}`}>Average Wallet Transfer</span>
                        <span className={`text-base font-black block ${themeTextTitle}`}>Rs 8,500</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex items-start gap-3.5`}>
                  <Sparkles className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-bold uppercase text-amber-500">Beginner Tip: Admin Controls</h4>
                    <p className={`text-xs mt-1 leading-relaxed ${themeTextMuted}`}>
                      You can instantly modify individual site catalog item prices or register offline members using the simple database interface tabs above. System statistics automatically synchronize.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MEMBERS REGISTRY */}
            {currentTab === 'members' && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className={`font-black text-xl uppercase ${themeTextTitle}`}>Members Registry Panel</h3>
                    <p className={`text-xs ${themeTextMuted}`}>
                      Check and audit memberships. Easily toggle active passes or add new registrations manually.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-3.5 w-3.5" />
                      <input
                        type="text"
                        placeholder="Search member by email or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`rounded-xl pl-9 pr-4 py-2 text-xs outline-none w-64 ${themeInput}`}
                      />
                    </div>
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-wider cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Register Member</span>
                    </button>
                  </div>
                </div>

                {/* Add member form */}
                <AnimatePresence>
                  {showAddMember && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleCreateMember}
                      className={`rounded-2xl p-5 space-y-4 max-w-2xl overflow-hidden ${themeSubCard}`}
                    >
                      <div className="flex justify-between items-center border-b pb-2.5 dark:border-zinc-800 border-zinc-200">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block">
                          Manual Registration Form
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setShowAddMember(false)}
                          className={`hover:text-amber-500 transition-all ${themeTextMuted}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Full Name</label>
                          <input
                            type="text"
                            required
                            value={newMemName}
                            onChange={(e) => setNewMemName(e.target.value)}
                            placeholder="e.g. Zain Malik"
                            className={`rounded-lg p-2.5 text-xs w-full outline-none ${themeInput}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Email Address</label>
                          <input
                            type="email"
                            required
                            value={newMemEmail}
                            onChange={(e) => setNewMemEmail(e.target.value)}
                            placeholder="e.g. zain@gmail.com"
                            className={`rounded-lg p-2.5 text-xs w-full outline-none ${themeInput}`}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Membership Pass Class</label>
                          <select
                            value={newMemPlan}
                            onChange={(e) => setNewMemPlan(e.target.value)}
                            className={`rounded-lg p-2.5 text-xs w-full outline-none appearance-none ${themeInput}`}
                          >
                            <option value="m-starter">Starter Base Pass (Rs 6,550)</option>
                            <option value="m-gold">Gold Member Pass (Rs 12,050)</option>
                            <option value="m-platinum">Platinum Pro Pass (Rs 18,500)</option>
                            <option value="y-vip">VIP Compound Pass (Rs 115,000)</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold cursor-pointer"
                        >
                          Register Active Member
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Database Table layout */}
                <div className="overflow-x-auto border rounded-2xl dark:border-zinc-800 border-zinc-200">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className={`uppercase tracking-wider font-bold text-[10px] border-b ${isDarkMode ? 'bg-zinc-900/50 text-zinc-300 border-zinc-800' : 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
                        <th className="p-4 font-mono">Member ID</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Membership Pass Details</th>
                        <th className="p-4 text-center">Membership Status</th>
                        <th className="p-4 text-right">Database Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800 divide-zinc-200">
                      {members
                        .filter(m => 
                          m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.email.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((m) => (
                          <tr key={m.id} className="hover:bg-zinc-500/5 transition-colors">
                            <td className="p-4 font-mono font-semibold text-zinc-500">{m.id}</td>
                            <td className={`p-4 font-bold ${themeTextTitle}`}>{m.name}</td>
                            <td className={`p-4 ${themeTextMuted}`}>{m.email}</td>
                            <td className="p-4">
                              <span className="text-amber-500 font-bold block">{m.planName}</span>
                              <span className={`block text-[10px] ${themeTextMuted}`}>Joined: {m.joinedDate} • Expiry: {m.expiryDate}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase inline-block border ${
                                m.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-500 border-red-500/20'
                              }`}>
                                {m.status}
                              </span>
                            </td>
                            <td className="p-4 text-right flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => toggleMemberStatus(m.id)}
                                className={`text-[10px] uppercase tracking-wide font-bold cursor-pointer px-3 py-2 rounded-lg border transition-all ${
                                  m.status === 'Active' 
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20' 
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                                }`}
                              >
                                {m.status === 'Active' ? 'Revoke Pass' : 'Activate Pass'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(m.id, m.name)}
                                className="text-[10px] uppercase tracking-wide font-bold cursor-pointer px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all"
                              >
                                <Trash2 size={13} className="inline mr-1 -mt-0.5" />
                                Delete
                              </button>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* PRODUCT STOCK INVENTORY */}
            {currentTab === 'supplements' && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className={`font-black text-xl uppercase ${themeTextTitle}`}>Supplements Catalog</h3>
                    <p className={`text-xs ${themeTextMuted}`}>
                      Add, remove, or modify product details and catalog pricing below. Keep your clients updated.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs uppercase font-black tracking-wider cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add New Supplement</span>
                  </button>
                </div>

                {/* Add product form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddProduct}
                      className={`rounded-2xl p-5 space-y-4 max-w-3xl overflow-hidden ${themeSubCard}`}
                    >
                      <div className="flex justify-between items-center border-b pb-2.5 dark:border-zinc-800 border-zinc-200">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block">Create Supplement Compound Database Asset</span>
                        <button type="button" onClick={() => setShowAddForm(false)} className={`hover:text-amber-500 transition-all ${themeTextMuted}`}>
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Product Brand Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Optimum Nutrition"
                            required
                            value={newProdBrand}
                            onChange={(e) => setNewProdBrand(e.target.value)}
                            className={`rounded-lg p-2.5 text-xs w-full outline-none ${themeInput}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Product Compound Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Whey Isolate Protein 2.2kg"
                            required
                            value={newProdName}
                            onChange={(e) => setNewProdName(e.target.value)}
                            className={`rounded-lg p-2.5 text-xs w-full outline-none ${themeInput}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Category Class</label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value)}
                            className={`rounded-lg p-2.5 text-xs w-full outline-none appearance-none ${themeInput}`}
                          >
                            <option value="Protein">Protein Core</option>
                            <option value="Energy">Energy Boosters</option>
                            <option value="Strength">Strength Amplifiers</option>
                            <option value="Health & Vitality">Health & Vitality</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Pricing tag (Rs or $)</label>
                          <input
                            type="text"
                            required
                            placeholder="Rs 9,500"
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(e.target.value)}
                            className={`rounded-lg p-2.5 text-xs w-full outline-none ${themeInput}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Image URL</label>
                          <input
                            type="text"
                            required
                            value={newProdImage}
                            onChange={(e) => setNewProdImage(e.target.value)}
                            className={`rounded-lg p-2.5 text-xs w-full outline-none ${themeInput}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Protein Content</label>
                          <input
                            type="text"
                            value={newProdProtein}
                            onChange={(e) => setNewProdProtein(e.target.value)}
                            className={`rounded-lg p-2.5 text-xs w-full outline-none ${themeInput}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Calories Score</label>
                          <input
                            type="text"
                            value={newProdCalories}
                            onChange={(e) => setNewProdCalories(e.target.value)}
                            className={`rounded-lg p-2.5 text-xs w-full outline-none ${themeInput}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Description Summary</label>
                        <textarea
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          placeholder="Brief information about this supplement range benefits..."
                          rows={2}
                          className={`rounded-lg p-2.5 text-xs w-full outline-none ${themeInput}`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all cursor-pointer"
                      >
                        Insert Supplement compound to Catalog
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Grid Layout of Supplements */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className={`rounded-2xl p-4 flex flex-col justify-between transition-all group ${themeSubCard} hover:border-amber-500/20`}
                    >
                      <div className="flex gap-3.5">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover bg-neutral-950 border dark:border-zinc-800 border-zinc-200"
                        />
                        <div className="text-left space-y-1 min-w-0 flex-1">
                          <span className={`text-[9px] font-mono block uppercase tracking-wide ${themeTextMuted}`}>{p.brand} ({p.category})</span>
                          <h4 className={`text-sm font-bold uppercase truncate ${themeTextTitle}`} title={p.name}>{p.name}</h4>
                          <span className="text-sm text-amber-500 block font-bold font-mono">{p.price}</span>
                        </div>
                      </div>

                      <p className={`text-[11px] font-sans text-left mt-3 line-clamp-2 ${themeTextMuted}`}>
                        {p.description}
                      </p>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t dark:border-zinc-800/60 border-zinc-200 justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded">
                          {p.nutritionFacts.protein && <span>Prot: {p.nutritionFacts.protein}</span>}
                          {p.nutritionFacts.calories && <span> • Cal: {p.nutritionFacts.calories}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdatePrice(p.id, p.price)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isDarkMode 
                                ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-amber-500 text-zinc-400' 
                                : 'bg-white border-zinc-250 hover:bg-zinc-50 hover:text-amber-600 text-zinc-600 shadow-sm'
                            }`}
                            title="Update Price Tag"
                          >
                            <Edit2 size={13} className="inline mr-1" />
                            <span className="text-[10px] font-bold uppercase">Price</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(p.id, p.name)}
                            className="p-2 text-red-500 hover:text-white hover:bg-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-xs cursor-pointer transition-all"
                            title="Erase Product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TRANSACTION HISTORY */}
            {currentTab === 'billing' && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="flex flex-col gap-1">
                  <h3 className={`font-black text-xl uppercase ${themeTextTitle}`}>Transaction History Ledger</h3>
                  <p className={`text-xs ${themeTextMuted}`}>
                    View completed checkouts, selected payment methods, and receipt records processed on the site.
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className={`py-16 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 ${themeSubCard}`}>
                    <CreditCard className={`h-10 w-10 animate-pulse ${themeTextMuted}`} />
                    <div>
                      <h4 className={`text-xs font-mono uppercase tracking-widest font-black ${themeTextTitle}`}>No transactions yet</h4>
                      <p className={`text-xs max-w-sm mt-1 leading-relaxed ${themeTextMuted}`}>
                        Transactions will automatically display here once a client registers for a pass or orders nutritional items.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto border rounded-2xl dark:border-zinc-800 border-zinc-200">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className={`uppercase tracking-wider font-bold text-[10px] border-b ${isDarkMode ? 'bg-zinc-900/50 text-zinc-300 border-zinc-800' : 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
                          <th className="p-4 font-mono">Transaction ID</th>
                          <th className="p-4">Payment Method</th>
                          <th className="p-4">Item/Plan Billed</th>
                          <th className="p-4 text-center">Amount (Rs / $)</th>
                          <th className="p-4">Checkout Date</th>
                          <th className="p-4 text-right">Database Sync</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-zinc-800 divide-zinc-200">
                        {orders.map((o) => (
                          <tr key={o.orderId} className="hover:bg-zinc-500/5 transition-colors">
                            <td className="p-4 font-mono font-semibold text-zinc-500">{o.orderId}</td>
                            <td className="p-4 font-bold">
                              {o.method === 'Stripe' ? (
                                <span className="text-blue-500 flex items-center gap-1">
                                  <CreditCard size={12} />
                                  Stripe API
                                </span>
                              ) : (
                                <span className="text-emerald-500 flex items-center gap-1">
                                  <Smartphone size={12} />
                                  Easypaisa PK
                                </span>
                              )}
                            </td>
                            <td className={`p-4 font-bold ${themeTextTitle}`}>{o.itemName}</td>
                            <td className="p-4 text-center text-amber-500 font-bold font-mono">{o.price}</td>
                            <td className={`p-4 font-mono text-[11px] ${themeTextMuted}`}>{o.date}</td>
                            <td className="p-4 text-right">
                              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase inline-block">
                                <Check size={10} className="inline mr-1" />
                                Confirmed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SYSTEM ACTIVITY LOGS */}
            {currentTab === 'audit' && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className={`font-black text-xl uppercase ${themeTextTitle}`}>System Activity Logs</h3>
                    <p className={`text-xs ${themeTextMuted}`}>
                      Check the secure activity history generated by client logins, signups, payments, and admin updates.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to completely clear activity log history?")) {
                        try {
                          const res = await fetch('/api/logs', { method: 'DELETE' });
                          if (res.ok) {
                            setAuditLogs([]);
                          }
                        } catch (e) {
                          console.warn("Failed deleting audit logs", e);
                          setAuditLogs([]);
                        }
                      }
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-400 uppercase underline cursor-pointer"
                  >
                    Clear Log History
                  </button>
                </div>

                <div className={`rounded-2xl p-4 max-h-[400px] overflow-y-auto space-y-2.5 font-mono text-xs ${themeSubCard}`}>
                  {auditLogs.length === 0 ? (
                    <div className={`text-center py-8 ${themeTextMuted}`}>All logs cleared. Waiting for system events...</div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 border-b dark:border-zinc-850/60 border-zinc-200 pb-2.5 hover:bg-zinc-500/5 transition-colors">
                        <span className={`text-[10px] font-semibold ${themeTextMuted}`}>[{log.time}]</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase flex-shrink-0 border ${
                          log.category === 'Security'
                            ? 'bg-red-500/10 text-red-500 border-red-500/15'
                            : log.category === 'Transaction' || log.category === 'Finance'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/15'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/15'
                        }`}>
                          {log.category}
                        </span>
                        <span className={`leading-relaxed text-left ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{log.action}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className={`text-[10px] font-mono text-center italic ${themeTextMuted}`}>
                  Logs are persisted in local json databases.
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
