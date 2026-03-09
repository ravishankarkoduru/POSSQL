import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Scan,
  Search,
  LayoutDashboard, 
  PlusCircle, 
  History, 
  LogOut, 
  Menu, 
  X, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Package,
  Store,
  Trash2,
  Edit,
  Minus,
  Plus,
  CheckCircle2,
  Calendar,
  ChevronDown,
  DollarSign,
  ShoppingBag,
  Wallet,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { localDb, type Transaction, type Product } from './db';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { syncData, startAutoSync } from './services/syncService';
import { format, startOfDay, isSameDay } from 'date-fns';

// --- Constants ---

const NOODLE_ITEMS = [
  { id: 'n1', name: 'Batchoy', cost: 45.00, price: 60.00, category: 'Noodles', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=30&w=200&h=200&auto=format&fit=crop', stock: 97, lowStock: 10, isExpired: true, barcode: '123456789', expiryDate: '2026-03-31' },
  { id: 'n2', name: 'C2', cost: 15.00, price: 20.00, category: 'Drinks', image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=30&w=200&h=200&auto=format&fit=crop', stock: 44, lowStock: 5, isExpired: false, barcode: '987654321', expiryDate: '2026-12-31' },
  { id: 'n3', name: 'Cheese', cost: 7.00, price: 10.00, category: 'Add-ons', image: 'https://images.unsplash.com/photo-1528283753224-3a248ad889af?q=30&w=200&h=200&auto=format&fit=crop', stock: 12, lowStock: 2, isExpired: false, barcode: '456789123', expiryDate: '2026-06-15' },
  { id: 'n4', name: 'CHEESE ramen', cost: 100.00, price: 130.00, category: 'Ramen', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=30&w=200&h=200&auto=format&fit=crop', stock: 9, lowStock: 5, isExpired: true, barcode: '321654987', expiryDate: '2026-03-25' },
  { id: 'n5', name: 'Stir-Fry', cost: 65.00, price: 85.00, category: 'Noodles', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=30&w=200&h=200&auto=format&fit=crop', stock: 25, lowStock: 10, isExpired: false, barcode: '789123456', expiryDate: '2026-08-20' },
  { id: 'n6', name: 'Hotdog', cost: 25.00, price: 35.00, category: 'Add-ons', image: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?q=30&w=200&h=200&auto=format&fit=crop', stock: 18, lowStock: 5, isExpired: false, barcode: '654321789', expiryDate: '2026-05-10' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, isDark }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 ${
      active 
        ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/50' 
        : isDark 
          ? 'text-slate-400 hover:bg-slate-800' 
          : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-slate-900/50 rounded-none shadow-sm border border-slate-800 p-6 ${className}`}>
    {children}
  </div>
);

const SummaryCard = ({ title, value, subtitle, icon: Icon, gradient, bgIcon: BgIcon }: any) => (
  <div className={`relative overflow-hidden rounded-none p-3 sm:p-6 text-white shadow-xl transition-transform hover:scale-[1.02] ${gradient} aspect-square flex flex-col justify-start text-left`}>
    <div className="relative z-10 w-full overflow-hidden">
      <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1.5 sm:mb-4">
        <Icon size={14} className="sm:w-6 sm:h-6" />
      </div>
      <h3 className="text-white font-semibold text-[10px] sm:text-xl mb-0 sm:mb-1 truncate">{title}</h3>
      <p className="text-[11px] sm:text-3xl font-black leading-tight mb-0 sm:mb-1 truncate">₱{value}</p>
      <p className="text-white/70 text-[8px] sm:text-sm font-medium line-clamp-1">{subtitle}</p>
    </div>
    <div className="absolute -top-4 -right-4 opacity-10 -rotate-12 pointer-events-none">
      <BgIcon size={120} />
    </div>
  </div>
);

// --- Login Component ---

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Force set PIN to 000000 as per user request
    localStorage.setItem('pos_pin', '000000');
    setStoredPin('000000');
    setIsCreating(false);
  }, []);

  const handleNumberClick = (num: string) => {
    setError('');
    if (isCreating) {
      if (pin.length < 6) setPin(prev => prev + num);
      else if (confirmPin.length < 6) setConfirmPin(prev => prev + num);
    } else {
      if (pin.length < 6) setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    if (isCreating) {
      if (confirmPin.length > 0) setConfirmPin(prev => prev.slice(0, -1));
      else setPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPin('');
    setConfirmPin('');
    setError('');
  };

  const handleSubmit = () => {
    if (isCreating) {
      if (pin.length !== 6 || confirmPin.length !== 6) {
        setError('PIN must be 6 digits');
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match');
        setPin('');
        setConfirmPin('');
        return;
      }
      localStorage.setItem('pos_pin', pin);
      localStorage.setItem('pos_user', 'admin');
      onLogin();
    } else {
      if (pin === storedPin) {
        localStorage.setItem('pos_user', 'admin');
        onLogin();
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    }
  };

  useEffect(() => {
    if (!isCreating && pin.length === 6) {
      handleSubmit();
    }
    if (isCreating && pin.length === 6 && confirmPin.length === 6) {
      handleSubmit();
    }
  }, [pin, confirmPin]);

  const PinBoxes = ({ value }: { value: string }) => (
    <div className="flex justify-center space-x-2 my-10">
      {[...Array(6)].map((_, i) => {
        const isActive = i === value.length;
        const isFilled = i < value.length;
        return (
          <div 
            key={i} 
            className={`w-12 h-16 rounded-none border-2 flex items-center justify-center transition-all duration-200 ${
              isActive 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-slate-800 bg-slate-800/50'
            }`}
          >
            {isFilled && (
              <div className="w-2 h-2 rounded-full bg-slate-400" />
            )}
            {!isFilled && !isActive && (
              <div className="w-1 h-1 rounded-full bg-slate-700" />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-4"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#4ADE80] mb-2 tracking-tight">
            Korean Ramen
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {isCreating 
              ? (pin.length < 6 ? 'Create your 6-digit PIN' : 'Confirm your 6-digit PIN')
              : 'Enter PIN to start shift'}
          </p>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-center text-sm font-bold mb-4"
          >
            {error}
          </motion.p>
        )}

        <PinBoxes value={isCreating && pin.length === 6 ? confirmPin : pin} />

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="h-24 rounded-none bg-slate-800/50 text-2xl font-bold text-white hover:bg-slate-700 active:scale-95 transition-all border border-slate-700/50"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-24 rounded-none bg-slate-800/50 text-lg font-bold text-white hover:bg-slate-700 active:scale-95 transition-all border border-slate-700/50 uppercase tracking-widest"
          >
            Clear
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-24 rounded-none bg-slate-800/50 text-2xl font-bold text-white hover:bg-slate-700 active:scale-95 transition-all border border-slate-700/50"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-24 rounded-none bg-slate-800/50 flex items-center justify-center text-white hover:bg-slate-700 active:scale-95 transition-all border border-slate-700/50"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'dashboard' | 'pos' | 'history' | 'products'>('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useOnlineStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // POS State
  const [cart, setCart] = useState<{ item: Product, quantity: number }[]>([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Add Product Modal State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    cost: 0,
    price: 0,
    category: 'Noodles',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=30&w=200&h=200&auto=format&fit=crop',
    stock: 0,
    lowStock: 5,
    barcode: '',
    expiryDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const user = localStorage.getItem('pos_user');
    if (user) setIsLoggedIn(true);
    
    loadTransactions();
    loadProducts();
    startAutoSync();
  }, []);

  const loadProducts = async () => {
    let data = await localDb.products.toArray();
    if (data.length === 0) {
      // Seed with initial items
      await localDb.products.bulkAdd(NOODLE_ITEMS);
      data = await localDb.products.toArray();
    }
    setProducts(data);
  };

  const loadTransactions = async () => {
    const data = await localDb.transactions.orderBy('timestamp').reverse().toArray();
    setTransactions(data);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        ...newProduct,
      };
      await localDb.products.put(updatedProduct);
    } else {
      const product: Product = {
        ...newProduct,
        id: crypto.randomUUID(),
        isExpired: false, // Default for new products
      };
      await localDb.products.add(product);
    }
    await loadProducts();
    setIsAddProductModalOpen(false);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      cost: 0,
      price: 0,
      category: 'Noodles',
      image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=30&w=200&h=200&auto=format&fit=crop',
      stock: 0,
      lowStock: 5,
      barcode: '',
      expiryDate: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      cost: product.cost || 0,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      lowStock: product.lowStock || 5,
      barcode: product.barcode || '',
      expiryDate: product.expiryDate || format(new Date(), 'yyyy-MM-dd')
    });
    setIsAddProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    // window.confirm can be problematic in iframes, so we'll just delete for now
    // In a real app, we'd use a custom modal
    await localDb.products.delete(id);
    await loadProducts();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncData();
    await loadTransactions();
    setIsSyncing(false);
  };

  const addToCart = (item: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.item.id === itemId) {
        const newQty = Math.max(1, c.quantity + delta);
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  const confirmCheckout = async () => {
    if (cart.length === 0) return;
    
    const newTransactions: Transaction[] = cart.map(c => ({
      id: crypto.randomUUID(),
      item_name: c.item.name,
      quantity: c.quantity,
      price: c.item.price,
      total: c.item.price * c.quantity,
      timestamp: new Date().toISOString(),
      user_id: '1',
      synced: 0
    }));

    await localDb.transactions.bulkAdd(newTransactions);
    setCart([]);
    setIsCartOpen(false);
    setCheckoutSuccess(true);
    setTimeout(() => setCheckoutSuccess(false), 3000);
    loadTransactions();
    syncData();
  };

  const todaySales = useMemo(() => {
    const today = startOfDay(new Date());
    return transactions
      .filter(t => isSameDay(new Date(t.timestamp), today))
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  const totalTransactions = transactions.length;

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-[#0F172A] border-slate-800 border-r z-50 transition-transform duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center space-x-3 mb-10 px-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <ShoppingCart size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SyncPOS</span>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem 
              icon={Store} 
              label="POS" 
              active={view === 'pos'} 
              isDark={true}
              onClick={() => { setView('pos'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Package} 
              label="Products" 
              active={view === 'products'} 
              isDark={true}
              onClick={() => { setView('products'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={view === 'dashboard'} 
              isDark={true}
              onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={History} 
              label="History" 
              active={view === 'history'} 
              isDark={true}
              onClick={() => { setView('history'); setIsSidebarOpen(false); }} 
            />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
            <button 
              onClick={() => { localStorage.removeItem('pos_user'); setIsLoggedIn(false); }}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
            <div className={`flex items-center justify-center w-10 h-10 rounded-none ${
              isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {isOnline ? <Wifi size={18} className="animate-pulse" /> : <WifiOff size={18} />}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 transition-colors duration-300 bg-[#0F172A]">
        {/* Header */}
        <header className="bg-[#0F172A] border-slate-800 border-b h-20 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-colors">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 bg-slate-800/50 rounded-none">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-black leading-tight text-emerald-500">
                {view === 'pos' ? 'POS' : view === 'dashboard' ? 'Dashboard' : view === 'products' ? 'Products' : 'History'}
              </h2>
              {view === 'pos' && <span className="text-xs text-slate-500 font-medium">Point of Sale</span>}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {view === 'pos' && cart.length > 0 && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-indigo-900/40 text-white px-4 py-2 rounded-none font-bold flex items-center gap-2 border border-indigo-500/30"
              >
                <span>{cart.reduce((s, c) => s + c.quantity, 0)}x</span>
                <span>₱{cartTotal.toFixed(2)}</span>
              </button>
            )}

            {view === 'products' && (
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 bg-slate-800/50 rounded-none hover:bg-slate-700">
                  <RefreshCw size={20} className="rotate-90" />
                </button>
                <button className="p-2 text-slate-400 bg-slate-800/50 rounded-none hover:bg-slate-700">
                  <ChevronDown size={20} />
                </button>
                <button className="p-2 text-slate-400 bg-slate-800/50 rounded-none hover:bg-slate-700">
                  <Package size={20} />
                </button>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProduct({
                      name: '',
                      price: 0,
                      category: 'Noodles',
                      image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=30&w=200&h=200&auto=format&fit=crop',
                      stock: 0,
                      barcode: '',
                      expiryDate: format(new Date(), 'yyyy-MM-dd')
                    });
                    setIsAddProductModalOpen(true);
                  }}
                  className="p-2 bg-indigo-600 text-white rounded-none hover:bg-indigo-700 shadow-lg shadow-indigo-900/20"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}

            {view === 'dashboard' && (
              <div className="hidden md:flex items-center bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-2 text-slate-300 text-sm gap-3">
                <Calendar size={16} className="text-indigo-400" />
                <span className="font-medium">09/03/2026 - 09/03/2026</span>
                <ChevronDown size={14} className="text-slate-500" />
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-8 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {view === 'pos' && (
              <motion.div 
                key="pos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6 h-full"
              >
                {/* Search & Filter Bar */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <select className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                      <option>All items</option>
                      <option>Ramen</option>
                      <option>Drinks</option>
                      <option>Add-ons</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <button className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-none text-slate-300 hover:bg-slate-700 transition-colors">
                    <Scan size={24} />
                  </button>
                  <button className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-none text-slate-300 hover:bg-slate-700 transition-colors">
                    <Search size={24} />
                  </button>
                </div>

                {/* Items Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-[6px]">
                    {products.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(item)}
                        className="bg-[#1E293B] rounded-none overflow-hidden border border-slate-800 shadow-sm hover:shadow-md transition-all text-left flex flex-col"
                      >
                        <div className="aspect-square overflow-hidden bg-slate-800">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            width="200"
                            height="200"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-1 flex flex-col">
                          <h4 className="font-bold text-white text-xs line-clamp-1">{item.name}</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-white font-bold text-sm">₱{item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                              {item.isExpired && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Expired</span>}
                              <span className="text-emerald-500 font-bold text-xs">{item.stock}</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                {/* Search & Filter Row */}
                <div className="flex gap-3">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search products..."
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-sans"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="w-48 relative font-sans">
                    <select className="w-full h-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                      <option>All</option>
                      <option>Noodles</option>
                      <option>Drinks</option>
                      <option>Add-ons</option>
                      <option>Ramen</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Product List */}
                <div className="space-y-[2px] font-sans">
                  {products.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-[#1E293B] border border-slate-800 rounded-none p-2 flex items-center gap-2.5 group hover:border-slate-700 transition-all"
                    >
                      <div className="w-12 h-12 rounded-none overflow-hidden bg-slate-800 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          width="80"
                          height="80"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-0">
                          <h4 className="text-white text-sm truncate">{item.name}</h4>
                          <div className="flex items-center gap-0">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(item);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-none transition-all"
                              title="Edit Product"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(item.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-800 rounded-none transition-all"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-white text-base">₱{item.price.toFixed(2)}</p>
                          <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-1.5 py-0.5 rounded-none">
                            {item.stock} left
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 max-w-5xl mx-auto"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                  <SummaryCard 
                    title="Sales" 
                    value={todaySales.toFixed(2)} 
                    subtitle="Revenue in period" 
                    icon={DollarSign} 
                    bgIcon={DollarSign}
                    gradient="bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-700"
                  />
                  <SummaryCard 
                    title="Cost of Items" 
                    value={(todaySales * 0.4).toFixed(2)} 
                    subtitle="Cost in period" 
                    icon={ShoppingBag} 
                    bgIcon={ShoppingBag}
                    gradient="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"
                  />
                  <SummaryCard 
                    title="Gross Profit" 
                    value={(todaySales * 0.6).toFixed(2)} 
                    subtitle="Revenue - Item Cost" 
                    icon={TrendingUp} 
                    bgIcon={TrendingUp}
                    gradient="bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600"
                  />
                  <SummaryCard 
                    title="Inventory Val..." 
                    value="2922.00" 
                    subtitle="Total stock value" 
                    icon={Package} 
                    bgIcon={Package}
                    gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-rose-600"
                  />
                  <SummaryCard 
                    title="Actual Profit" 
                    value={(todaySales * 0.6).toFixed(2)} 
                    subtitle="Gross Profit - Expenses" 
                    icon={TrendingUp} 
                    bgIcon={TrendingUp}
                    gradient="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600"
                  />
                  <SummaryCard 
                    title="Expenses" 
                    value="0.00" 
                    subtitle="Expenses in period" 
                    icon={Wallet} 
                    bgIcon={Wallet}
                    gradient="bg-gradient-to-br from-orange-500 via-red-500 to-red-600"
                  />
                </div>

                {/* Expiring Soon */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-none p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <AlertTriangle className="text-orange-500" size={28} />
                    <h3 className="text-2xl font-bold text-white">Expiring Soon</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      { name: 'DS Ube Cheese', date: '31/03/2026' },
                      { name: 'NOB UBe stick', date: '31/03/2026' },
                      { name: 'Strawberry Yakult', date: '04/04/2026' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">{item.name}</h4>
                          <p className="text-slate-500 text-sm">Expires: {item.date}</p>
                        </div>
                        <ChevronRight className="text-slate-700 group-hover:text-slate-400 transition-colors" size={24} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-none p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingDown className="text-rose-500" size={28} />
                    <h3 className="text-2xl font-bold text-white">Low Stock</h3>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-slate-900/50 rounded-none border border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800/50 border-b border-slate-800">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sync</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-400">{format(new Date(t.timestamp), 'MMM d, HH:mm')}</td>
                            <td className="px-6 py-4 font-bold text-white">{t.item_name}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">{t.quantity}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">₱{t.price.toFixed(2)}</td>
                            <td className="px-6 py-4 font-bold text-emerald-500">₱{t.total.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              {t.synced ? (
                                <div className="text-emerald-500 bg-emerald-500/10 w-6 h-6 rounded-full flex items-center justify-center">
                                  <Wifi size={12} />
                                </div>
                              ) : (
                                <div className="text-slate-600 bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center">
                                  <RefreshCw size={12} />
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {transactions.length === 0 && (
                      <div className="p-20 text-center text-slate-600 italic">No transaction history found</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <ShoppingCart className="text-emerald-500" />
                  Current Order
                </h3>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-2 min-h-[300px] max-h-[60vh]">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-60 py-20">
                    <ShoppingCart size={48} strokeWidth={1} />
                    <p className="text-sm font-medium">Cart is empty</p>
                  </div>
                ) : (
                  cart.map((c) => (
                    <div key={c.item.id} className="flex items-center gap-4 py-4 border-b border-dashed border-slate-800 last:border-0">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-white truncate uppercase tracking-tight">{c.item.name}</h5>
                        <p className="text-xs text-emerald-500 font-mono mt-1 font-bold">₱{c.item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 p-1">
                          <button 
                            onClick={() => updateCartQuantity(c.item.id, -1)}
                            className="p-1 hover:text-white text-slate-500 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-mono font-bold w-4 text-center text-white">{c.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(c.item.id, 1)}
                            className="p-1 hover:text-white text-slate-500 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(c.item.id)}
                          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-white font-bold">₱{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-emerald-500 font-black">₱{cartTotal.toFixed(2)}</span>
                </div>
                
                <button 
                  disabled={cart.length === 0}
                  onClick={confirmCheckout}
                  className={`w-full py-4 rounded-none font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    cart.length > 0 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20' 
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  <ShoppingCart size={20} />
                  <span>End Sale</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddProductModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Package className="text-emerald-500" />
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button 
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                {/* Image Upload Placeholder */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 bg-slate-800/50 border-2 border-dashed border-slate-700/50 rounded-none flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-all overflow-hidden group"
                  >
                    {newProduct.image ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={newProduct.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ImageIcon className="text-white" size={24} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="text-slate-500 mb-1" size={24} />
                        <span className="text-slate-400 text-[10px] font-medium text-center px-1">Upload Image</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                  <input 
                    required
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="e.g. Spicy Ramen"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={newProduct.cost}
                      onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</label>
                    <input 
                      required
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock</label>
                    <input 
                      required
                      type="number"
                      value={newProduct.lowStock}
                      onChange={(e) => setNewProduct({...newProduct, lowStock: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option>Noodles</option>
                    <option>Drinks</option>
                    <option>Add-ons</option>
                    <option>Ramen</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Barcode</label>
                  <input 
                    type="text"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Scan or enter barcode"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                  <input 
                    type="date"
                    value={newProduct.expiryDate}
                    onChange={(e) => setNewProduct({...newProduct, expiryDate: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-none font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-4"
                >
                  {editingProduct ? <RefreshCw size={20} /> : <Plus size={20} />}
                  <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
