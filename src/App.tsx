import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
  ChevronLeft,
  ChevronDown,
  DollarSign,
  ShoppingBag,
  Wallet,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Users,
  UserPlus,
  Shield,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { localDb, type Transaction, type Product, type Employee, type Role } from './db';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { syncData, startAutoSync } from './services/syncService';
import { 
  format, 
  startOfDay, 
  isSameDay, 
  addMonths, 
  subMonths, 
  subWeeks,
  subYears,
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  endOfDay,
  isSameMonth, 
  addDays, 
  eachDayOfInterval, 
  isWithinInterval, 
  getDay,
  parseISO
} from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants ---

const NOODLE_ITEMS = [
  { id: 'n1', name: 'Batchoy', cost: 45.00, price: 60.00, category: 'Noodles', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=30&w=200&h=200&auto=format&fit=crop', stock: 97, lowStock: 10, isExpired: true, barcode: '123456789', expiryDate: '2026-03-31', isActive: true },
  { id: 'n2', name: 'C2', cost: 15.00, price: 20.00, category: 'Drinks', image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=30&w=200&h=200&auto=format&fit=crop', stock: 44, lowStock: 5, isExpired: false, barcode: '987654321', expiryDate: '2026-12-31', isActive: true },
  { id: 'n3', name: 'Cheese', cost: 7.00, price: 10.00, category: 'Add-ons', image: 'https://images.unsplash.com/photo-1528283753224-3a248ad889af?q=30&w=200&h=200&auto=format&fit=crop', stock: 12, lowStock: 2, isExpired: false, barcode: '456789123', expiryDate: '2026-06-15', isActive: true },
  { id: 'n4', name: 'CHEESE ramen', cost: 100.00, price: 130.00, category: 'Ramen', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=30&w=200&h=200&auto=format&fit=crop', stock: 9, lowStock: 5, isExpired: true, barcode: '321654987', expiryDate: '2026-03-25', isActive: true },
  { id: 'n5', name: 'Stir-Fry', cost: 65.00, price: 85.00, category: 'Noodles', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=30&w=200&h=200&auto=format&fit=crop', stock: 25, lowStock: 10, isExpired: false, barcode: '789123456', expiryDate: '2026-08-20', isActive: true },
  { id: 'n6', name: 'Hotdog', cost: 25.00, price: 35.00, category: 'Add-ons', image: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?q=30&w=200&h=200&auto=format&fit=crop', stock: 18, lowStock: 5, isExpired: false, barcode: '654321789', expiryDate: '2026-05-10', isActive: true },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, isDark }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-none transition-all duration-300 ${
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
  <div className={`bg-slate-900/50 rounded-none shadow-sm border border-slate-800 p-4 ${className}`}>
    {children}
  </div>
);

const SummaryCard = ({ title, value, subtitle, icon: Icon, gradient, bgIcon: BgIcon }: any) => (
  <div className={`relative overflow-hidden rounded-none p-2 sm:p-4 text-white shadow-xl transition-transform hover:scale-[1.02] ${gradient} aspect-square flex flex-col justify-start text-left`}>
    <div className="relative z-10 w-full overflow-hidden">
      <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1 sm:mb-2">
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

const BarcodeScanner = ({ onScan, onClose }: { onScan: (decodedText: string) => void, onClose: () => void }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render((decodedText) => {
      onScan(decodedText);
      scanner.clear().then(() => {
        onClose();
      }).catch(err => {
        console.error("Failed to clear scanner", err);
        onClose();
      });
    }, (error) => {
      // Silently handle scan errors (common during active scanning)
    });

    return () => {
      scanner.clear().catch(err => console.error("Cleanup failed", err));
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Scan className="text-emerald-500" size={20} />
            <h3 className="text-white font-black uppercase tracking-widest text-sm">Scan Barcode</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div id="reader" className="w-full bg-black min-h-[300px]"></div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Align 1D barcode within the frame</p>
        </div>
      </div>
    </div>
  );
};

// --- Login Component ---

const Login = ({ onLogin }: { onLogin: (user: Employee) => void }) => {
  const [pin, setPin] = useState('');
  const [isCreatingFirstAdmin, setIsCreatingFirstAdmin] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkEmployees = async () => {
      const count = await localDb.employees.count();
      if (count === 0) {
        setIsCreatingFirstAdmin(true);
      }
    };
    checkEmployees();
  }, []);

  const handleNumberClick = (num: string) => {
    setError('');
    if (isCreatingFirstAdmin) {
      if (pin.length < 6) setPin(prev => prev + num);
      else if (confirmPin.length < 6) setConfirmPin(prev => prev + num);
    } else {
      if (pin.length < 6) setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    if (isCreatingFirstAdmin) {
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

  const handleSubmit = async () => {
    if (isCreatingFirstAdmin) {
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
      
      const firstAdmin: Employee = {
        id: crypto.randomUUID(),
        name: 'Admin',
        role: 'Admin',
        pin: pin,
        createdAt: new Date().toISOString()
      };
      
      await localDb.employees.add(firstAdmin);
      localStorage.setItem('pos_user_id', firstAdmin.id);
      onLogin(firstAdmin);
    } else {
      // Use toArray().find() for more robust matching in case of index issues
      const allEmployees = await localDb.employees.toArray();
      const employee = allEmployees.find(e => e.pin === pin);
      
      if (employee) {
        localStorage.setItem('pos_user_id', employee.id);
        onLogin(employee);
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    }
  };

  useEffect(() => {
    if (!isCreatingFirstAdmin && pin.length === 6) {
      handleSubmit();
    }
    if (isCreatingFirstAdmin && pin.length === 6 && confirmPin.length === 6) {
      handleSubmit();
    }
  }, [pin, confirmPin]);

  const handleResetAdminPin = async () => {
    try {
      const admins = await localDb.employees.where('role').equals('Admin').toArray();
      if (admins.length > 0) {
        // Reset all admins to be safe
        for (const admin of admins) {
          await localDb.employees.update(admin.id, { pin: '000000' });
        }
        setError('Admin PIN(s) reset to 000000');
        setPin('');
      } else {
        setError('No Admin account found');
      }
    } catch (err) {
      setError('Failed to reset PIN');
      console.error(err);
    }
  };

  const PinBoxes = ({ value }: { value: string }) => (
    <div className="flex justify-center space-x-2 my-10">
      {[...Array(6)].map((_, i) => {
        const isActive = i === value.length;
        const isFilled = i < value.length;
        return (
          <div 
            key={i} 
            className={`w-10 h-10 rounded-none border flex items-center justify-center transition-all duration-200 ${
              isActive 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-slate-800 bg-slate-800/30'
            }`}
          >
            {isFilled && (
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            )}
            {!isFilled && (
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
            {isCreatingFirstAdmin 
              ? (pin.length < 6 ? 'Create your 6-digit PIN' : 'Confirm your 6-digit PIN')
              : 'Enter PIN to start shift'}
          </p>
        </div>

        {/* Removed Admin Name input as per request */}

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center text-sm font-bold mb-4 ${error.includes('reset') ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {error}
          </motion.p>
        )}

        <PinBoxes value={isCreatingFirstAdmin && pin.length === 6 ? confirmPin : pin} />

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

        {!isCreatingFirstAdmin && (
          <div className="mt-8 text-center">
            <button
              onClick={handleResetAdminPin}
              className="text-slate-500 hover:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
            >
              Reset Admin PIN to 000000
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- Main App ---

// --- Components ---

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onRangeChange 
}: { 
  startDate: Date, 
  endDate: Date, 
  onRangeChange: (start: Date, end: Date) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(startDate);
  const popoverRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateClick = (date: Date) => {
    if (isSameDay(startDate, endDate)) {
      if (date < startDate) {
        onRangeChange(date, startDate);
      } else {
        onRangeChange(startDate, date);
      }
      setIsOpen(false);
    } else {
      onRangeChange(date, date);
    }
  };

  return (
    <div className="relative z-50" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-[10px] text-white hover:border-emerald-500 transition-colors"
      >
        <Calendar size={14} className="text-emerald-500" />
        <span>{format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}</span>
      </button>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 p-4 sm:p-6 bg-white rounded-2xl shadow-2xl z-50 w-[280px] sm:w-[320px] text-slate-800 font-sans border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-[#2d3748]">{format(viewDate, 'MMMM yyyy')}</h3>
            <div className="flex gap-6">
              <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day, i) => {
              const isSelectedStart = isSameDay(day, startDate);
              const isSelectedEnd = isSameDay(day, endDate);
              const isInRange = isWithinInterval(day, { 
                start: startDate < endDate ? startDate : endDate, 
                end: startDate < endDate ? endDate : startDate 
              });
              const isCurrentMonth = isSameMonth(day, viewDate);

              return (
                <div 
                  key={i}
                  className={cn(
                    "h-10 flex items-center justify-center relative",
                    isInRange && "bg-[#e3f2fd]",
                    isSelectedStart && "rounded-l-full",
                    isSelectedEnd && "rounded-r-full",
                    !isInRange && "bg-transparent"
                  )}
                >
                  <button
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "h-9 w-9 flex items-center justify-center text-sm rounded-full transition-all relative z-10",
                      !isCurrentMonth && "text-slate-300",
                      isCurrentMonth && !isInRange && "text-slate-600 hover:bg-slate-100",
                      (isSelectedStart || isSelectedEnd) ? "bg-[#1976d2] text-white shadow-md" : (isInRange ? "text-[#1976d2]" : "text-slate-600")
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'pos' | 'history' | 'products' | 'employees' | 'expenses'>('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState<Employee | null>({
    id: 'admin-1',
    name: 'Admin',
    role: 'Admin',
    pin: '000000',
    createdAt: new Date().toISOString()
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
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
    expiryDate: format(new Date(), 'yyyy-MM-dd'),
    isActive: true
  });

  // Employee Modal State
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: 'Cashier' as Role,
    pin: ''
  });

  // Transaction Details State
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isTransactionDetailsModalOpen, setIsTransactionDetailsModalOpen] = useState(false);
  
  // Expenses State
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'Utilities',
    timestamp: new Date().toISOString()
  });
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [posCategory, setPosCategory] = useState('All');
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [isAddingNewProductCategory, setIsAddingNewProductCategory] = useState(false);
  const [newProductCategoryName, setNewProductCategoryName] = useState('');
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'pos' | 'product'>('pos');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [historyStartDate, setHistoryStartDate] = useState(format(startOfDay(new Date()), 'yyyy-MM-dd'));
  const [historyEndDate, setHistoryEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dashboardStartDate, setDashboardStartDate] = useState(format(startOfDay(new Date()), 'yyyy-MM-dd'));
  const [dashboardEndDate, setDashboardEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    
    // Filter transactions by date range first
    const filteredTransactions = transactions.filter(t => {
      const tDate = new Date(t.timestamp);
      const start = new Date(historyStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(historyEndDate);
      end.setHours(23, 59, 59, 999);
      return tDate >= start && tDate <= end;
    });

    filteredTransactions.forEach(t => {
      const sid = t.session_id || t.id;
      if (!groups[sid]) {
        groups[sid] = [];
      }
      groups[sid].push(t);
    });
    
    return Object.entries(groups).map(([sessionId, items]) => {
      const firstItem = items[0];
      const total = items.reduce((sum, item) => sum + item.total, 0);
      return {
        sessionId,
        timestamp: firstItem.timestamp,
        total,
        items,
        user_id: firstItem.user_id
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, historyStartDate, historyEndDate]);

  const historySummary = useMemo(() => {
    const count = groupedTransactions.length;
    const total = groupedTransactions.reduce((sum, t) => sum + t.total, 0);
    return { count, total };
  }, [groupedTransactions]);

  useEffect(() => {
    const userId = localStorage.getItem('pos_user_id');
    if (userId) {
      localDb.employees.get(userId).then(user => {
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }
      });
    } else {
      // Ensure the default admin exists in the database
      const defaultAdmin: Employee = {
        id: 'admin-1',
        name: 'Admin',
        role: 'Admin',
        pin: '000000',
        createdAt: new Date().toISOString()
      };
      localDb.employees.get('admin-1').then(existing => {
        if (!existing) {
          localDb.employees.add(defaultAdmin);
        }
      });
    }
    
    loadTransactions();
    loadProducts();
    loadEmployees();
    loadExpenses();
    loadExpenseCategories();
    loadProductCategories();
    startAutoSync();
  }, []);

  const loadProductCategories = async () => {
    let data = await localDb.productCategories.toArray();
    if (data.length === 0) {
      const defaults = ['Noodles', 'Drinks', 'Add-ons', 'Ramen'];
      await localDb.productCategories.bulkAdd(defaults.map(name => ({ id: crypto.randomUUID(), name })));
      data = await localDb.productCategories.toArray();
    }
    setProductCategories(Array.from(new Set(data.map(c => c.name))));
  };

  const loadExpenseCategories = async () => {
    let data = await localDb.expenseCategories.toArray();
    if (data.length === 0) {
      const defaults = ['Utilities', 'Rent', 'Supplies', 'Salary', 'Maintenance', 'Other'];
      await localDb.expenseCategories.bulkAdd(defaults.map(name => ({ id: crypto.randomUUID(), name })));
      data = await localDb.expenseCategories.toArray();
    }
    setExpenseCategories(Array.from(new Set(data.map(c => c.name))));
  };

  const loadExpenses = async () => {
    const data = await localDb.expenses.orderBy('timestamp').reverse().toArray();
    setExpenses(data);
  };

  const loadEmployees = async () => {
    const data = await localDb.employees.toArray();
    setEmployees(data);
  };

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
      expiryDate: format(new Date(), 'yyyy-MM-dd'),
      isActive: true
    });
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      const updatedEmployee: Employee = {
        ...editingEmployee,
        ...newEmployee,
      };
      await localDb.employees.put(updatedEmployee);
    } else {
      const employee: Employee = {
        ...newEmployee,
        pin: newEmployee.pin || '000000',
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      await localDb.employees.add(employee);
    }
    await loadEmployees();
    setIsAddEmployeeModalOpen(false);
    setEditingEmployee(null);
    setNewEmployee({
      name: '',
      role: 'Cashier',
      pin: ''
    });
  };

  const handleDeleteEmployee = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee? This action cannot be undone.',
      onConfirm: async () => {
        await localDb.employees.delete(id);
        await loadEmployees();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
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
      expiryDate: product.expiryDate || format(new Date(), 'yyyy-MM-dd'),
      isActive: product.isActive !== undefined ? product.isActive : true
    });
    setIsAddProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: async () => {
        await localDb.products.delete(id);
        await loadProducts();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      const updatedExpense = {
        ...editingExpense,
        ...newExpense,
      };
      await localDb.expenses.put(updatedExpense);
    } else {
      const expense = {
        ...newExpense,
        id: crypto.randomUUID(),
        synced: 0
      };
      await localDb.expenses.add(expense);
    }
    await loadExpenses();
    setIsAddExpenseModalOpen(false);
    setEditingExpense(null);
    setNewExpense({
      description: '',
      amount: 0,
      category: 'Utilities',
      timestamp: new Date().toISOString()
    });
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setNewExpense({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      timestamp: expense.timestamp
    });
    setIsAddExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense? This action cannot be undone.',
      onConfirm: async () => {
        await localDb.expenses.delete(id);
        await loadExpenses();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
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
    if (item.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) return prev;
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
        const product = products.find(p => p.id === itemId);
        const maxStock = product ? product.stock : Infinity;
        const newQty = Math.max(1, Math.min(maxStock, c.quantity + delta));
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  const confirmCheckout = async () => {
    if (cart.length === 0) return;
    
    const sessionId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const newTransactions: Transaction[] = cart.map(c => ({
      id: crypto.randomUUID(),
      session_id: sessionId,
      item_name: c.item.name,
      quantity: c.quantity,
      price: c.item.price,
      total: c.item.price * c.quantity,
      timestamp: timestamp,
      user_id: currentUser?.id || '1',
      synced: 0
    }));

    await localDb.transactions.bulkAdd(newTransactions);

    // Update stock counts
    for (const cartItem of cart) {
      const product = await localDb.products.get(cartItem.item.id);
      if (product) {
        await localDb.products.update(cartItem.item.id, {
          stock: Math.max(0, product.stock - cartItem.quantity)
        });
      }
    }

    setCart([]);
    setIsCartOpen(false);
    setCheckoutSuccess(true);
    setTimeout(() => setCheckoutSuccess(false), 3000);
    await loadProducts();
    await loadTransactions();
    syncData();
  };

  const handleRestock = async (productId: string, amount: number) => {
    const product = await localDb.products.get(productId);
    if (product) {
      await localDb.products.update(productId, {
        stock: product.stock + amount
      });
      await loadProducts();
    }
  };

  const dashboardStats = useMemo(() => {
    const start = new Date(dashboardStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dashboardEndDate);
    end.setHours(23, 59, 59, 999);

    const filtered = transactions.filter(t => {
      const tDate = new Date(t.timestamp);
      return tDate >= start && tDate <= end;
    });

    const sales = filtered.reduce((sum, t) => sum + t.total, 0);
    // For now, keeping the 40% cost assumption as in the original code, 
    // but applying it to the filtered sales
    const cost = sales * 0.4;
    const grossProfit = sales - cost;
    
    const filteredExpenses = expenses.filter(e => {
      const eDate = new Date(e.timestamp);
      return eDate >= start && eDate <= end;
    });
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const actualProfit = grossProfit - totalExpenses;

    return {
      sales,
      cost,
      grossProfit,
      actualProfit,
      expenses: totalExpenses
    };
  }, [transactions, expenses, dashboardStartDate, dashboardEndDate]);

  const inventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  }, [products]);

  const todaySales = useMemo(() => {
    const today = startOfDay(new Date());
    return transactions
      .filter(t => isSameDay(new Date(t.timestamp), today))
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  const totalTransactions = transactions.length;

  if (!isLoggedIn) {
    return <Login onLogin={(user) => {
      setCurrentUser(user);
      setIsLoggedIn(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-[#0F172A] border-slate-800 border-r z-[80] transition-transform duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center space-x-3 mb-6 px-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <ShoppingCart size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SyncPOS</span>
          </div>

          <nav className="flex-1 space-y-1">
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
              label="Receipts" 
              active={view === 'history'} 
              isDark={true}
              onClick={() => { setView('history'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Wallet} 
              label="Expenses" 
              active={view === 'expenses'} 
              isDark={true}
              onClick={() => { setView('expenses'); setIsSidebarOpen(false); }} 
            />
            {(currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
              <SidebarItem 
                icon={Users} 
                label="Employees" 
                active={view === 'employees'} 
                isDark={true}
                onClick={() => { setView('employees'); setIsSidebarOpen(false); }} 
              />
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="flex items-center space-x-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500 font-bold border border-slate-700">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold truncate text-sm">{currentUser?.name}</span>
                <span className="text-slate-500 text-xs font-medium">{currentUser?.role}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => {
                  localStorage.removeItem('pos_user_id');
                  setIsLoggedIn(false);
                  setCurrentUser(null);
                }}
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 transition-colors duration-300 bg-[#0F172A]">
        {/* Header */}
        <header className="bg-[#0F172A] border-slate-800 border-b h-14 flex items-center justify-between px-3 lg:px-4 sticky top-0 z-30 transition-colors">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 bg-slate-800/50 rounded-none">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-black leading-tight text-emerald-500">
                {view === 'pos' ? 'POS' : view === 'dashboard' ? 'Dashboard' : view === 'products' ? 'Products' : view === 'employees' ? 'Employees' : 'Receipts'}
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
                <button 
                  onClick={() => setIsManageCategoriesModalOpen(true)}
                  className="p-2 text-slate-400 bg-slate-800/50 rounded-none hover:bg-slate-700"
                >
                  <ChevronDown size={20} />
                </button>
                <button 
                  onClick={() => {
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
                    setIsAddProductModalOpen(true);
                  }}
                  className="p-2 bg-indigo-600 text-white rounded-none hover:bg-indigo-700 shadow-lg shadow-indigo-900/20"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}

            {view === 'employees' && (
              <button 
                onClick={() => {
                  setEditingEmployee(null);
                  setNewEmployee({
                    name: '',
                    role: 'Cashier',
                    pin: ''
                  });
                  setIsAddEmployeeModalOpen(true);
                }}
                className="p-2 bg-emerald-600 text-white rounded-none hover:bg-emerald-700 shadow-lg shadow-emerald-900/20"
              >
                <UserPlus size={20} />
              </button>
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
        <div className="p-2 lg:p-4 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {view === 'pos' && (
              <motion.div 
                key="pos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3 h-full"
              >
                {/* Search & Filter Bar */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <select 
                      value={posCategory}
                      onChange={(e) => setPosCategory(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none pl-4 pr-10 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      {['All', ...Array.from(new Set(products.map(p => p.category))).filter(c => c !== 'All')].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="flex-[2] relative">
                    <input 
                      type="text"
                      placeholder="Search items or scan barcode..."
                      value={posSearchQuery}
                      onChange={(e) => setPosSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <button 
                    onClick={() => {
                      setScannerTarget('pos');
                      setIsScannerOpen(true);
                    }}
                    className="bg-slate-800/50 border border-slate-700/50 px-4 rounded-none text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center"
                    title="Scan Barcode"
                  >
                    <Scan size={20} />
                  </button>
                </div>

                {/* Items Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1">
                    {products
                      .filter(p => p.isActive !== false)
                      .filter(p => posCategory === 'All' || p.category === posCategory)
                      .filter(p => 
                        p.name.toLowerCase().includes(posSearchQuery.toLowerCase()) || 
                        (p.barcode && p.barcode.includes(posSearchQuery))
                      )
                      .map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={item.stock <= 0}
                        onClick={() => addToCart(item)}
                        className={`bg-[#1E293B] rounded-none overflow-hidden border border-slate-800 shadow-sm hover:shadow-md transition-all text-left flex flex-col ${item.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                      >
                        <div className="aspect-square relative overflow-hidden bg-slate-800">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            width="200"
                            height="200"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {item.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-black text-xs uppercase tracking-widest border-2 border-white px-2 py-1 rotate-[-12deg]">Out of Stock</span>
                            </div>
                          )}
                          {item.stock > 0 && item.stock <= (item.lowStock || 5) && (
                            <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-tighter shadow-lg">
                              Low Stock
                            </div>
                          )}
                        </div>
                        <div className="p-1 flex flex-col">
                          <h4 className="font-bold text-white text-[10px] line-clamp-1">{item.name}</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-white font-bold text-xs">₱{item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                              {item.isExpired && <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider">Expired</span>}
                              <span className={`font-bold text-[10px] ${item.stock <= (item.lowStock || 5) ? 'text-rose-500' : 'text-emerald-500'}`}>{item.stock}</span>
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
                <div className="flex gap-2">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search products..."
                      className="w-full bg-slate-800/30 border border-slate-800 rounded-none pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex-1 relative font-sans">
                    <select className="w-full bg-slate-800/30 border border-slate-800 rounded-none px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30">
                      <option value="All">All</option>
                      {productCategories.filter(cat => cat !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
                          <h4 className="text-white text-sm truncate flex items-center gap-2">
                            {item.name}
                            {item.isActive === false && (
                              <span className="text-[8px] font-black bg-slate-700 text-slate-400 px-1 py-0.5 uppercase tracking-tighter">Inactive</span>
                            )}
                          </h4>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(item);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all"
                              title="Edit Product"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(item.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-800 transition-all"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-white text-sm font-bold">₱{item.price.toFixed(2)}</p>
                          <span className="bg-emerald-900/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-sm">
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
                className="space-y-4 max-w-5xl mx-auto"
              >
                {/* Dashboard Header with Date Picker */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/50 p-2 border border-slate-800">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Overview</h3>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => {
                          setDashboardStartDate(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
                          setDashboardEndDate(format(new Date(), 'yyyy-MM-dd'));
                        }}
                        className="px-2 py-1 text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded text-white transition-colors"
                      >W</button>
                      <button 
                        onClick={() => {
                          setDashboardStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
                          setDashboardEndDate(format(new Date(), 'yyyy-MM-dd'));
                        }}
                        className="px-2 py-1 text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded text-white transition-colors"
                      >M</button>
                      <button 
                        onClick={() => {
                          setDashboardStartDate(format(startOfMonth(subMonths(new Date(), 12)), 'yyyy-MM-dd'));
                          setDashboardEndDate(format(new Date(), 'yyyy-MM-dd'));
                        }}
                        className="px-2 py-1 text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded text-white transition-colors"
                      >Y</button>
                    </div>
                  </div>
                  <DateRangePicker 
                    startDate={new Date(dashboardStartDate)}
                    endDate={new Date(dashboardEndDate)}
                    onRangeChange={(start, end) => {
                      setDashboardStartDate(format(start, 'yyyy-MM-dd'));
                      setDashboardEndDate(format(end, 'yyyy-MM-dd'));
                    }}
                  />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <SummaryCard 
                    title="Sales" 
                    value={dashboardStats.sales.toFixed(2)} 
                    subtitle="Revenue in period" 
                    icon={DollarSign} 
                    bgIcon={DollarSign}
                    gradient="bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-700"
                  />
                  <SummaryCard 
                    title="Cost of Items" 
                    value={dashboardStats.cost.toFixed(2)} 
                    subtitle="Cost in period" 
                    icon={ShoppingBag} 
                    bgIcon={ShoppingBag}
                    gradient="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"
                  />
                  <SummaryCard 
                    title="Gross Profit" 
                    value={dashboardStats.grossProfit.toFixed(2)} 
                    subtitle="Revenue - Item Cost" 
                    icon={TrendingUp} 
                    bgIcon={TrendingUp}
                    gradient="bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600"
                  />
                  <SummaryCard 
                    title="Inventory Val..." 
                    value={inventoryValue.toFixed(2)} 
                    subtitle="Total stock value" 
                    icon={Package} 
                    bgIcon={Package}
                    gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-rose-600"
                  />
                  <SummaryCard 
                    title="Actual Profit" 
                    value={dashboardStats.actualProfit.toFixed(2)} 
                    subtitle="Gross Profit - Expenses" 
                    icon={TrendingUp} 
                    bgIcon={TrendingUp}
                    gradient="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600"
                  />
                  <SummaryCard 
                    title="Expenses" 
                    value={dashboardStats.expenses.toFixed(2)} 
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
                  <div className="flex items-center gap-3 mb-8">
                    <TrendingDown className="text-rose-500" size={28} />
                    <h3 className="text-2xl font-bold text-white">Low Stock</h3>
                  </div>
                  <div className="space-y-6">
                    {products.filter(p => p.stock <= (p.lowStock || 5)).map((item) => (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">{item.name}</h4>
                          <p className="text-rose-500 text-sm font-bold">{item.stock} left</p>
                        </div>
                        <button 
                          onClick={() => handleRestock(item.id, 50)}
                          className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-none text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          Restock +50
                        </button>
                      </div>
                    ))}
                    {products.filter(p => p.stock <= (p.lowStock || 5)).length === 0 && (
                      <p className="text-slate-500 italic">All items well stocked</p>
                    )}
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
                className="max-w-4xl mx-auto font-mono overflow-visible"
                style={{ overflow: 'visible' }}
              >
                <div className="bg-slate-900/50 rounded-none border border-slate-800 shadow-sm overflow-visible">
                  <div className="px-4 py-3 text-sm font-bold text-white border-b border-slate-800 bg-slate-800/50 uppercase tracking-widest flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-visible">
                    <div className="flex items-center gap-4">
                      <span>Receipts</span>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            setHistoryStartDate(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
                            setHistoryEndDate(format(new Date(), 'yyyy-MM-dd'));
                          }}
                          className="px-2 py-1 text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded transition-colors"
                        >W</button>
                        <button 
                          onClick={() => {
                            setHistoryStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
                            setHistoryEndDate(format(new Date(), 'yyyy-MM-dd'));
                          }}
                          className="px-2 py-1 text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded transition-colors"
                        >M</button>
                        <button 
                          onClick={() => {
                            setHistoryStartDate(format(startOfMonth(subMonths(new Date(), 12)), 'yyyy-MM-dd'));
                            setHistoryEndDate(format(new Date(), 'yyyy-MM-dd'));
                          }}
                          className="px-2 py-1 text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded transition-colors"
                        >Y</button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium normal-case tracking-normal ml-2">
                        {historySummary.count}x ₱{historySummary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <DateRangePicker 
                      startDate={new Date(historyStartDate)}
                      endDate={new Date(historyEndDate)}
                      onRangeChange={(start, end) => {
                        setHistoryStartDate(format(start, 'yyyy-MM-dd'));
                        setHistoryEndDate(format(end, 'yyyy-MM-dd'));
                      }}
                    />
                  </div>
                  
                  <div className="divide-y divide-slate-800/30">
                    {groupedTransactions.map((group) => (
                      <button 
                        key={group.sessionId} 
                        onClick={() => {
                          setSelectedSessionId(group.sessionId);
                          setIsTransactionDetailsModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-500/10 transition-colors group flex items-center justify-between"
                      >
                        <div className="text-sm text-white font-mono">
                          trn-{format(new Date(group.timestamp), 'dd/MM/yy HH:mm')} ₱{group.total.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">
                            {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                          </span>
                          <ChevronRight size={14} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </button>
                    ))}
                    {groupedTransactions.length === 0 && (
                      <div className="p-10 text-center text-slate-600 italic text-sm">No receipts found</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'expenses' && (
              <motion.div 
                key="expenses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto font-mono"
              >
                <div className="bg-slate-900/50 rounded-none border border-slate-800 shadow-sm">
                  <div className="px-4 py-3 text-sm font-bold text-white border-b border-slate-800 bg-slate-800/50 uppercase tracking-widest flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span>Expenses</span>
                      <span className="text-[10px] text-slate-400 font-medium normal-case tracking-normal">
                        Total: ₱{expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingExpense(null);
                        setNewExpense({
                          description: '',
                          amount: 0,
                          category: 'Utilities',
                          timestamp: new Date().toISOString()
                        });
                        setIsAddExpenseModalOpen(true);
                      }}
                      className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded text-[10px] hover:bg-emerald-600 transition-colors"
                    >
                      <PlusCircle size={14} />
                      <span>Add Expense</span>
                    </button>
                  </div>
                  
                  <div className="divide-y divide-slate-800/30">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="px-4 py-3 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm text-white font-bold">{expense.description}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">{expense.category}</span>
                            <span className="text-[10px] text-slate-500">{format(new Date(expense.timestamp), 'dd/MM/yy HH:mm')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-sm text-white font-bold">₱{expense.amount.toFixed(2)}</span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditExpense(expense)}
                              className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-slate-800 rounded transition-all"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-800 rounded transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {expenses.length === 0 && (
                      <div className="p-10 text-center text-slate-600 italic text-sm">No expenses recorded</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'employees' && (
              <motion.div 
                key="employees"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search employees by name or role..."
                    value={employeeSearchQuery}
                    onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/30 border border-slate-800 rounded-none pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employees
                    .filter(emp => 
                      emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
                      emp.role.toLowerCase().includes(employeeSearchQuery.toLowerCase())
                    )
                    .map((emp) => (
                      <div key={emp.id} className="bg-slate-900/50 border border-slate-800 p-6 flex flex-col group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500 font-bold border border-slate-700 text-xl">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-white font-bold">{emp.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Shield size={12} className="text-emerald-500" />
                              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{emp.role}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingEmployee(emp);
                              setNewEmployee({
                                name: emp.name,
                                role: emp.role,
                                pin: emp.pin
                              });
                              setIsAddEmployeeModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          {emp.id !== currentUser?.id && (
                            <button 
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                        <span className="text-slate-600 text-[10px] font-mono">ID: {emp.id.slice(0, 8)}...</span>
                        <span className="text-slate-600 text-[10px] font-mono">Added: {format(new Date(emp.createdAt), 'dd/MM/yy')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {employees.length === 0 && (
                  <div className="text-center py-20 text-slate-600 italic">No employees found</div>
                )}
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
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
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

              <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-[300px] max-h-[60vh]">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-60 py-20">
                    <ShoppingCart size={48} strokeWidth={1} />
                    <p className="text-sm font-medium">Cart is empty</p>
                  </div>
                ) : (
                  cart.map((c) => (
                    <div key={c.item.id} className="flex items-center gap-4 py-2 border-b border-dashed border-slate-800 last:border-0">
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

              <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
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
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Package className="text-emerald-500" size={20} />
                    {editingProduct ? 'Edit' : 'New'}
                  </h3>
                  <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${newProduct.isActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {newProduct.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, isActive: !newProduct.isActive })}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                        newProduct.isActive ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                          newProduct.isActive ? 'translate-x-[18px]' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="p-4 space-y-3 overflow-y-auto max-h-[85vh]">
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 bg-slate-800/50 border-2 border-dashed border-slate-700/50 rounded-none flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-all overflow-hidden group shrink-0"
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
                          <ImageIcon className="text-white" size={20} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="text-slate-500 mb-1" size={20} />
                        <span className="text-slate-400 text-[8px] font-medium text-center px-1 uppercase">Image</span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                    <input 
                      required
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="e.g. Spicy Ramen"
                    />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={newProduct.cost}
                      onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock</label>
                    <input 
                      required
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Low Stock</label>
                    <input 
                      required
                      type="number"
                      value={newProduct.lowStock}
                      onChange={(e) => setNewProduct({...newProduct, lowStock: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <div className="relative">
                      <select 
                        value={newProduct.category}
                        onChange={(e) => {
                          if (e.target.value === 'ADD_NEW') {
                            setIsAddingNewProductCategory(true);
                          } else {
                            setNewProduct({...newProduct, category: e.target.value});
                          }
                        }}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        {productCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="ADD_NEW" className="text-emerald-400 font-bold">+ Add New Category...</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Barcode</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={newProduct.barcode}
                        onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Scan or enter barcode"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setScannerTarget('product');
                          setIsScannerOpen(true);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                        title="Scan Barcode"
                      >
                        <Scan size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {isAddingNewProductCategory && (
                  <div className="space-y-1 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-none animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">New Category Name</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newProductCategoryName}
                        onChange={(e) => setNewProductCategoryName(e.target.value)}
                        className="flex-1 bg-slate-800/50 border border-emerald-500/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Enter category name"
                        autoFocus
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newProductCategoryName.trim()) {
                              const exists = productCategories.some(c => c.toLowerCase() === newProductCategoryName.trim().toLowerCase());
                              if (!exists) {
                                await localDb.productCategories.add({ id: crypto.randomUUID(), name: newProductCategoryName.trim() });
                                await loadProductCategories();
                              }
                              setNewProduct({...newProduct, category: newProductCategoryName.trim()});
                              setNewProductCategoryName('');
                              setIsAddingNewProductCategory(false);
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          if (newProductCategoryName.trim()) {
                            const exists = productCategories.some(c => c.toLowerCase() === newProductCategoryName.trim().toLowerCase());
                            if (!exists) {
                              await localDb.productCategories.add({ id: crypto.randomUUID(), name: newProductCategoryName.trim() });
                              await loadProductCategories();
                            }
                            setNewProduct({...newProduct, category: newProductCategoryName.trim()});
                            setNewProductCategoryName('');
                            setIsAddingNewProductCategory(false);
                          }
                        }}
                        className="bg-emerald-600 text-white px-3 py-2 text-[10px] font-bold hover:bg-emerald-700 transition-colors uppercase tracking-widest"
                      >
                        Add
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddingNewProductCategory(false);
                          setNewProductCategoryName('');
                        }}
                        className="bg-slate-700 text-white px-3 py-2 text-[10px] font-bold hover:bg-slate-600 transition-colors uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                  <input 
                    type="date"
                    value={newProduct.expiryDate}
                    onChange={(e) => setNewProduct({...newProduct, expiryDate: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 rounded-none font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-2 uppercase tracking-widest text-xs"
                >
                  {editingProduct ? <RefreshCw size={16} /> : <Plus size={16} />}
                  <span>Save</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isManageCategoriesModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageCategoriesModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-none text-emerald-500">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Product Categories</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage your inventory groups</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsManageCategoriesModalOpen(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Add New Category */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add New Category</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newProductCategoryName}
                      onChange={(e) => setNewProductCategoryName(e.target.value)}
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="Category name..."
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && newProductCategoryName.trim()) {
                          const exists = productCategories.some(c => c.toLowerCase() === newProductCategoryName.trim().toLowerCase());
                          if (!exists) {
                            await localDb.productCategories.add({ id: crypto.randomUUID(), name: newProductCategoryName.trim() });
                            await loadProductCategories();
                            setNewProductCategoryName('');
                          }
                        }
                      }}
                    />
                    <button 
                      onClick={async () => {
                        if (newProductCategoryName.trim()) {
                          const exists = productCategories.some(c => c.toLowerCase() === newProductCategoryName.trim().toLowerCase());
                          if (!exists) {
                            await localDb.productCategories.add({ id: crypto.randomUUID(), name: newProductCategoryName.trim() });
                            await loadProductCategories();
                            setNewProductCategoryName('');
                          }
                        }
                      }}
                      className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700 transition-colors uppercase tracking-widest"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Categories List */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Categories</label>
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    {productCategories.map((cat) => (
                      <div 
                        key={cat}
                        className="flex items-center justify-between p-2 bg-slate-800/30 border border-slate-700/30 group hover:border-slate-600 transition-all"
                      >
                        <span className="text-sm text-slate-300">{cat}</span>
                        <button 
                          onClick={async () => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Delete Category',
                              message: `Are you sure you want to delete "${cat}"? Products in this category will remain but their category label will be outdated.`,
                              onConfirm: async () => {
                                const categoryDoc = await localDb.productCategories.where('name').equals(cat).first();
                                if (categoryDoc) {
                                  await localDb.productCategories.delete(categoryDoc.id);
                                  await loadProductCategories();
                                }
                                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="p-1 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                <button 
                  onClick={() => setIsManageCategoriesModalOpen(false)}
                  className="px-6 py-2 bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isScannerOpen && (
          <BarcodeScanner 
            onScan={(code) => {
              if (scannerTarget === 'pos') {
                setPosSearchQuery(code);
                // Optionally find item and add to cart automatically
                const foundProduct = products.find(p => p.barcode === code);
                if (foundProduct && foundProduct.stock > 0) {
                  addToCart(foundProduct);
                }
              } else {
                setNewProduct(prev => ({ ...prev, barcode: code }));
              }
              setIsScannerOpen(false);
            }}
            onClose={() => setIsScannerOpen(false)}
          />
        )}

        {isAddExpenseModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddExpenseModalOpen(false); setIsAddingNewCategory(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Wallet className="text-emerald-500" size={20} />
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <button 
                  onClick={() => { setIsAddExpenseModalOpen(false); setIsAddingNewCategory(false); }}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <input 
                    required
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="e.g. Electricity Bill"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <div className="relative">
                      <select 
                        value={newExpense.category}
                        onChange={(e) => {
                          if (e.target.value === 'ADD_NEW') {
                            setIsAddingNewCategory(true);
                          } else {
                            setNewExpense({...newExpense, category: e.target.value});
                          }
                        }}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        {expenseCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="ADD_NEW" className="text-emerald-400 font-bold">+ Add New Category...</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {isAddingNewCategory && (
                  <div className="space-y-1 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-none animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">New Category Name</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 bg-slate-800/50 border border-emerald-500/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Enter category name"
                        autoFocus
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newCategoryName.trim()) {
                              const exists = expenseCategories.some(c => c.toLowerCase() === newCategoryName.trim().toLowerCase());
                              if (!exists) {
                                await localDb.expenseCategories.add({ id: crypto.randomUUID(), name: newCategoryName.trim() });
                                await loadExpenseCategories();
                              }
                              setNewExpense({...newExpense, category: newCategoryName.trim()});
                              setNewCategoryName('');
                              setIsAddingNewCategory(false);
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          if (newCategoryName.trim()) {
                            const exists = expenseCategories.some(c => c.toLowerCase() === newCategoryName.trim().toLowerCase());
                            if (!exists) {
                              await localDb.expenseCategories.add({ id: crypto.randomUUID(), name: newCategoryName.trim() });
                              await loadExpenseCategories();
                            }
                            setNewExpense({...newExpense, category: newCategoryName.trim()});
                            setNewCategoryName('');
                            setIsAddingNewCategory(false);
                          }
                        }}
                        className="bg-emerald-600 text-white px-3 py-2 text-[10px] font-bold hover:bg-emerald-700 transition-colors uppercase tracking-widest"
                      >
                        Add
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddingNewCategory(false);
                          setNewCategoryName('');
                        }}
                        className="bg-slate-700 text-white px-3 py-2 text-[10px] font-bold hover:bg-slate-600 transition-colors uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                  <input 
                    type="datetime-local"
                    value={format(new Date(newExpense.timestamp), "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewExpense({...newExpense, timestamp: new Date(e.target.value).toISOString()})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 rounded-none font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-2 uppercase tracking-widest text-xs"
                >
                  {editingExpense ? <RefreshCw size={16} /> : <Plus size={16} />}
                  <span>{editingExpense ? 'Save' : 'Add Expense'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Trash2 className="text-red-500" size={20} />
                  {confirmModal.title}
                </h3>
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 text-center">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>

              <div className="p-4 border-t border-slate-800 flex gap-3 bg-slate-900/50">
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 uppercase tracking-widest"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Employee Modal */}
      <AnimatePresence>
        {isAddEmployeeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEmployeeModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden font-sans"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                  <UserPlus className="text-emerald-500" />
                  {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                </h3>
                <button 
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold"
                    placeholder="e.g. Juan Dela Cruz"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Role</label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as Role })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">6-Digit PIN (Optional)</label>
                  <input
                    type="text"
                    maxLength={6}
                    pattern="\d{6}"
                    value={newEmployee.pin}
                    onChange={(e) => setNewEmployee({ ...newEmployee, pin: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono font-bold tracking-[0.5em] text-center"
                    placeholder="000000"
                  />
                  <p className="text-[10px] text-slate-600 mt-1 italic">Defaults to 000000 if left blank</p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-none transition-all shadow-lg shadow-emerald-900/20 uppercase tracking-widest text-sm"
                  >
                    {editingEmployee ? 'Update Employee' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Transaction Details Modal */}
        {isTransactionDetailsModalOpen && selectedSessionId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTransactionDetailsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-none overflow-hidden shadow-2xl font-mono"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                <h3 className="text-white font-black uppercase tracking-widest">Receipt Details</h3>
                <button 
                  onClick={() => setIsTransactionDetailsModalOpen(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {(() => {
                const group = groupedTransactions.find(g => g.sessionId === selectedSessionId);
                if (!group) return null;
                
                return (
                  <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="text-center border-b border-dashed border-slate-800 pb-6">
                      <div className="text-emerald-500 font-black text-2xl mb-1 tracking-tighter">SyncPOS</div>
                      <div className="text-slate-500 text-[10px] uppercase tracking-widest">Official Receipt</div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 uppercase">Session ID</span>
                        <span className="text-white font-bold">{group.sessionId.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 uppercase">Date/Time</span>
                        <span className="text-white font-bold">{format(new Date(group.timestamp), 'dd/MM/yyyy HH:mm:ss')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 uppercase">Cashier</span>
                        <span className="text-white font-bold text-right">
                          {employees.find(e => e.id === group.user_id)?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div className="border-y border-dashed border-slate-800 py-4 space-y-2">
                      {group.items.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-white font-bold">{item.item_name}</span>
                            <span className="text-white">x{item.quantity}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>₱{item.price.toFixed(2)} each</span>
                            <span>₱{item.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-end pt-2">
                      <span className="text-slate-500 text-xs uppercase font-black">Total Amount</span>
                      <span className="text-white text-3xl font-black tracking-tighter">₱{group.total.toFixed(2)}</span>
                    </div>

                    <div className="pt-8 text-center">
                      <div className="text-[10px] text-slate-600 uppercase tracking-[0.2em] mb-4">Thank you for your purchase!</div>
                      <button 
                        onClick={() => setIsTransactionDetailsModalOpen(false)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-none transition-all uppercase tracking-widest text-xs"
                      >
                        Close Receipt
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
