/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  MinusCircle,
  CheckSquare,
  Layers,
  TrendingUp,
  Users,
  Settings as SettingsIcon,
  Calendar,
  Bell,
  Search,
  HelpCircle,
  ChevronDown,
  Download,
  Trash2,
  Plus,
  X,
  ChevronRight,
  UserCheck,
  Coins,
  FileText,
  Check,
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Printer,
  Edit2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Transaction, Category, BudgetConfig } from './types';
import { initialTransactions, initialCategories, initialBudgetConfigs } from './data';
import { motion, AnimatePresence } from 'motion/react';
import PdfExportModal from './components/PdfExportModal';

export default function App() {
  // --- Persisted State ---
  const [currentYear, setCurrentYear] = useState<string>(() => {
    const saved = localStorage.getItem('sa_current_year');
    if (saved === '2566') {
      return '2569';
    }
    return saved || '2569';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sa_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialTransactions;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('sa_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialCategories;
  });

  const [budgetConfigs, setBudgetConfigs] = useState<BudgetConfig[]>(() => {
    const saved = localStorage.getItem('sa_budget_configs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialBudgetConfigs;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);

  // --- Modals State ---
  const [showAddTransactionModal, setShowAddTransactionModal] = useState<boolean>(false);
  const [transactionFormType, setTransactionFormType] = useState<'income' | 'expense'>('income');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState<boolean>(false);

  // --- Operators Name & Role State with Local Retention ---
  const [officerName, setOfficerName] = useState<string>(() => localStorage.getItem('sa_officer_name') || 'นายสมชาย ใจดี');
  const [officerRole, setOfficerRole] = useState<string>(() => localStorage.getItem('sa_officer_role') || 'เจ้าหน้าที่การเงินและบัญชีกองทุน');
  const [directorName, setDirectorName] = useState<string>(() => localStorage.getItem('sa_director_name') || 'นางสมศรี สร้อยคอทอง');
  const [directorRole, setDirectorRole] = useState<string>(() => localStorage.getItem('sa_director_role') || 'เหรัญญิกกองทุนหมู่บ้านฉลีก');
  const [mayorName, setMayorName] = useState<string>(() => localStorage.getItem('sa_mayor_name') || 'นายฉลีก ศรีสุวรรณ');
  const [mayorRole, setMayorRole] = useState<string>(() => localStorage.getItem('sa_mayor_role') || 'ประธานคณะกรรมการกองทุนหมู่บ้านฉลีก');

  const [isEditingUser1, setIsEditingUser1] = useState<boolean>(false);
  const [isEditingUser2, setIsEditingUser2] = useState<boolean>(false);
  const [isEditingUser3, setIsEditingUser3] = useState<boolean>(false);

  // --- Inline Budget & Categories Editing State ---
  const [isEditingTotalBudget, setIsEditingTotalBudget] = useState<boolean>(false);
  const [tempTotalBudget, setTempTotalBudget] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [tempCategoryLimit, setTempCategoryLimit] = useState<string>('');

  // --- Beautiful Toast & Custom Confirm States ---
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'error' | 'info' }[]>([]);
  
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    onConfirm: () => {},
  });

  // --- Form States ---
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxDate, setNewTxDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [newTxCategory, setNewTxCategory] = useState('');
  const [newTxPayerPayee, setNewTxPayerPayee] = useState('');
  const [newTxStatus, setNewTxStatus] = useState<'approved' | 'pending'>('approved');
  const [newTxDescription, setNewTxDescription] = useState('');
  const [newTxAttachment, setNewTxAttachment] = useState<string>('');

  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  // --- Save State to Local Storage ---
  useEffect(() => {
    localStorage.setItem('sa_current_year', currentYear);
  }, [currentYear]);

  useEffect(() => {
    localStorage.setItem('sa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('sa_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sa_budget_configs', JSON.stringify(budgetConfigs));
  }, [budgetConfigs]);

  useEffect(() => {
    localStorage.setItem('sa_officer_name', officerName);
  }, [officerName]);

  useEffect(() => {
    localStorage.setItem('sa_officer_role', officerRole);
  }, [officerRole]);

  useEffect(() => {
    localStorage.setItem('sa_director_name', directorName);
  }, [directorName]);

  useEffect(() => {
    localStorage.setItem('sa_director_role', directorRole);
  }, [directorRole]);

  useEffect(() => {
    localStorage.setItem('sa_mayor_name', mayorName);
  }, [mayorName]);

  useEffect(() => {
    localStorage.setItem('sa_mayor_role', mayorRole);
  }, [mayorRole]);

  // --- Calculations based on state & active year ---
  const yearTransactions = useMemo(() => {
    return transactions.filter(t => t.fiscalYear === currentYear);
  }, [transactions, currentYear]);

  const totalBudget = useMemo(() => {
    const found = budgetConfigs.find(b => b.fiscalYear === currentYear);
    return found ? found.totalBudget : 1000000;
  }, [budgetConfigs, currentYear]);

  const approvedIncomes = useMemo(() => {
    return yearTransactions.filter(t => t.type === 'income' && t.status === 'approved');
  }, [yearTransactions]);

  const totalIncomesSum = useMemo(() => {
    return approvedIncomes.reduce((acc, t) => acc + t.amount, 0);
  }, [approvedIncomes]);

  const approvedExpenses = useMemo(() => {
    return yearTransactions.filter(t => t.type === 'expense' && t.status === 'approved');
  }, [yearTransactions]);

  const totalExpensesSum = useMemo(() => {
    return approvedExpenses.reduce((acc, t) => acc + t.amount, 0);
  }, [approvedExpenses]);

  const pendingTransactions = useMemo(() => {
    return yearTransactions.filter(t => t.status === 'pending');
  }, [yearTransactions]);

  const totalPendingSum = useMemo(() => {
    return pendingTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [pendingTransactions]);

  const remainingBalance = useMemo(() => {
    return totalBudget - totalExpensesSum;
  }, [totalBudget, totalExpensesSum]);

  // Percentage stats
  const incomesPercent = useMemo(() => {
    return ((totalIncomesSum / totalBudget) * 100).toFixed(2);
  }, [totalIncomesSum, totalBudget]);

  const expensesPercent = useMemo(() => {
    return ((totalExpensesSum / totalBudget) * 100).toFixed(2);
  }, [totalExpensesSum, totalBudget]);

  const balancePercent = useMemo(() => {
    return ((remainingBalance / totalBudget) * 100).toFixed(2);
  }, [remainingBalance, totalBudget]);

  // Category wise expenses for currentYear
  const categoryExpenses = useMemo(() => {
    const breakdown: Record<string, number> = {};
    // Initialize standard categories
    categories.forEach(c => {
      breakdown[c.name] = 0;
    });

    approvedExpenses.forEach(t => {
      if (!breakdown[t.category]) {
        breakdown[t.category] = 0;
      }
      breakdown[t.category] += t.amount;
    });

    const dataset = Object.entries(breakdown).map(([name, value]) => {
      const foundCat = categories.find(c => c.name === name);
      return {
        id: foundCat ? foundCat.id : name,
        name,
        value,
        color: foundCat ? foundCat.color : '#6b7280',
        limit: foundCat ? foundCat.budgetLimit : 200000,
        percent: totalExpensesSum > 0 ? ((value / totalExpensesSum) * 100).toFixed(2) : '0.00'
      };
    }).sort((a, b) => b.value - a.value);

    return dataset;
  }, [approvedExpenses, categories, totalExpensesSum]);

  // Monthly breakdown for recharts
  const monthlyData = useMemo(() => {
    // We group by month. Fiscal year months range from October (ต.ค.) to September (ก.ย.)
    const months = [
      { key: '10', name: 'ต.ค.' },
      { key: '11', name: 'พ.ย.' },
      { key: '12', name: 'ธ.ค.' },
      { key: '01', name: 'ม.ค.' },
      { key: '02', name: 'ก.พ.' },
      { key: '03', name: 'มี.ค.' },
      { key: '04', name: 'เม.ย.' },
      { key: '05', name: 'พ.ค.' },
      { key: '06', name: 'มิ.ย.' },
      { key: '07', name: 'ก.ค.' },
      { key: '08', name: 'ส.ค.' },
      { key: '09', name: 'ก.ย.' }
    ];

    return months.map(m => {
      const incSum = approvedIncomes
        .filter(t => t.date.split('-')[1] === m.key)
        .reduce((sum, t) => sum + t.amount, 0);

      const expSum = approvedExpenses
        .filter(t => t.date.split('-')[1] === m.key)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: m.name,
        'รายรับ (บาท)': incSum,
        'รายจ่าย (บาท)': expSum
      };
    });
  }, [approvedIncomes, approvedExpenses]);

  // Form submission handler
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxTitle || !newTxAmount || !newTxDate || !newTxCategory) {
      showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error');
      return;
    }

    const value = parseFloat(newTxAmount);
    if (isNaN(value) || value <= 0) {
      showToast('กรุณาระบุจำนวนเงินให้ถูกต้อง', 'error');
      return;
    }

    // คำนวณปีงบประมาณจากวันที่รายการเดินทาง (newTxDate)
    let txFiscalYear = currentYear;
    if (newTxDate) {
      const dateParts = newTxDate.split('-');
      if (dateParts.length === 3) {
        const gregorianYear = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        // ในระบบปีงบประมาณไทย เริ่มต้นวันที่ 1 ตุลาคม ของปีก่อนหน้า จนถึง 30 กันยายน ของปีปัจจุบัน
        // เช่น วันที่ 1 ต.ค. 2025 - 30 ก.ย. 2026 จะเป็นปีงบประมาณ 2569
        // ปี พ.ศ. = ค.ศ. + 543
        // ถ้าเดือน >= 10 (ต.ค., พ.ย., ธ.ค.) ปีงบประมาณจะบวกเพิ่มไปอีก 1 ปี
        const yearBE = gregorianYear + 543;
        if (month >= 10) {
          txFiscalYear = String(yearBE + 1);
        } else {
          txFiscalYear = String(yearBE);
        }
      }
    }

    // ตรวจสอบและลงทะเบียนปีงบประมาณใหม่ลงใน budgetConfigs หากยังไม่มีระบบคุมงบสำหรับปีนี้
    setBudgetConfigs(prev => {
      const exists = prev.some(b => b.fiscalYear === txFiscalYear);
      if (!exists) {
        return [...prev, { fiscalYear: txFiscalYear, totalBudget: 1500000 }].sort((a, b) => b.fiscalYear.localeCompare(a.fiscalYear));
      }
      return prev;
    });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: newTxTitle,
      type: transactionFormType,
      amount: value,
      date: newTxDate,
      category: newTxCategory,
      description: newTxDescription,
      payerOrPayee: newTxPayerPayee || (transactionFormType === 'income' ? 'กรมส่งเสริมท้องถิ่น' : 'ไม่ระบุ'),
      status: transactionFormType === 'income' ? 'approved' : newTxStatus,
      fiscalYear: txFiscalYear,
      attachmentName: newTxAttachment
    };

    setTransactions(prev => [newTx, ...prev]);
    setCurrentYear(txFiscalYear);

    // Reset Form
    setNewTxTitle('');
    setNewTxAmount('');
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setNewTxDate(`${year}-${month}-${day}`);
    setNewTxCategory('');
    setNewTxPayerPayee('');
    setNewTxStatus('approved');
    setNewTxDescription('');
    setNewTxAttachment('');
    setShowAddTransactionModal(false);

    showToast('บันทึกรายการสำเร็จแล้ว!', 'success');
  };

  // Add Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) {
      showToast('กรุณากรอกชื่อหมวดหมู่', 'error');
      return;
    }

    const limit = 200000; // default fallout limit since category limits are discarded

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      color: newCatColor,
      budgetLimit: limit
    };

    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    setNewCatLimit('');
    setNewCatColor('#3b82f6');
    setShowAddCategoryModal(false);
    showToast('เพิ่มหมวดหมู่ใหม่สำเร็จแล้ว!', 'success');
  };

  // Approve a pending transaction
  const handleApprove = (id: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'approved' as const } : t))
    );
    showToast('อนุมัติการเบิกจ่ายเรียบร้อยแล้ว!', 'success');
  };

  // Approve all pending transactions
  const handleApproveAll = () => {
    if (pendingTransactions.length === 0) {
      showToast('ไม่มีรายการรออนุมัติในขณะนี้', 'info');
      return;
    }
    const ids = pendingTransactions.map(t => t.id);
    setTransactions(prev =>
      prev.map(t => (ids.includes(t.id) ? { ...t, status: 'approved' as const } : t))
    );
    showToast(`อนุมัติรายการรออนุมัติทั้งหมด ${ids.length} รายการแล้ว!`, 'success');
  };

  // Reject a pending transaction
  const handleReject = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ต้องการปฏิเสธรายการเบิกจ่าย?',
      message: 'คุณต้องการปฏิเสธรายการเบิกจ่ายนี้ใช่หรือไม่?',
      confirmText: 'ปฏิเสธรายการ',
      cancelText: 'ยกเลิก',
      onConfirm: () => {
        setTransactions(prev =>
          prev.map(t => (t.id === id ? { ...t, status: 'rejected' as const } : t))
        );
        showToast('ปฏิเสธรายการเรียบร้อยแล้ว', 'warning');
      }
    });
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ต้องการลบรายการถาวร?',
      message: 'คุณต้องการลบรายการนี้อย่างถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้ภายหลัง',
      confirmText: 'ลบรายการ',
      cancelText: 'ยกเลิก',
      onConfirm: () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        showToast('ลบรายการคลังสำเร็จแล้ว', 'success');
      }
    });
  };

  // Reset to default seeding
  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'ต้องการรีเซ็ตฐานข้อมูล?',
      message: 'คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตามที่ระบบกำหนดไว้ใช่หรือไม่? ข้อมูลที่คุณเพิ่งเพิ่มจะสูญหาย.',
      confirmText: 'รีเซ็ตข้อมูล',
      cancelText: 'ยกเลิก',
      onConfirm: () => {
        setTransactions(initialTransactions);
        setCategories(initialCategories);
        setBudgetConfigs(initialBudgetConfigs);
        setCurrentYear('2569');
        setActiveTab('dashboard');
        showToast('รีเซ็ตข้อมูลสู่ระบบเริ่มต้นเรียบร้อยแล้ว!', 'success');
      }
    });
  };

  // Helper info on category click
  const handleCategoryClick = (cat: any) => {
    setSelectedCategoryFilter(cat.name);
    setActiveTab(transactionFormType === 'income' ? 'income' : 'expense');
  };

  // Notification helper click
  const triggerNotificationClick = (msg: string) => {
    showToast(msg, 'info');
    setShowNotifications(false);
  };

  // File change simulator
  const handleFileChangeSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewTxAttachment(e.target.files[0].name);
      showToast(`แนบไฟล์จำลอง: ${e.target.files[0].name} สำเร็จ`, 'info');
    }
  };

  // Update budget configuration
  const handleUpdateYearBudget = (year: string, amount: number) => {
    setBudgetConfigs(prev =>
      prev.map(b => (b.fiscalYear === year ? { ...b, totalBudget: amount } : b))
    );
  };

  const handleUpdateCategoryLimit = (catId: string, limit: number) => {
    setCategories(prev =>
      prev.map(c => (c.id === catId ? { ...c, budgetLimit: limit } : c))
    );
  };

  // Export CSV simulation
  const handleExportCSV = () => {
    const headers = ['วันที่', 'รหัสรายการ', 'ชื่อรายการ', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'ผู้รับ/จ่าย', 'สถานะ'];
    const rows = yearTransactions.map(t => [
      t.date,
      t.id,
      t.title,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      t.category,
      t.amount.toFixed(2),
      t.payerOrPayee || '-',
      t.status === 'approved' ? 'อนุมัติแล้ว' : t.status === 'pending' ? 'รออนุมัติ' : 'ปฏิเสธ'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `รายงานการเงิน_กองทุนหมู่บ้านฉลีก_ปี_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering transactions for custom views
  const filteredIncomes = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== 'income') return false;
      if (t.fiscalYear !== currentYear) return false;
      if (selectedCategoryFilter !== 'all' && t.category !== selectedCategoryFilter) return false;

      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.payerOrPayee && t.payerOrPayee.toLowerCase().includes(q))
      );
    });
  }, [transactions, currentYear, selectedCategoryFilter, searchQuery]);

  const filteredExpenses = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== 'expense') return false;
      if (t.fiscalYear !== currentYear) return false;
      if (selectedCategoryFilter !== 'all' && t.category !== selectedCategoryFilter) return false;

      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.payerOrPayee && t.payerOrPayee.toLowerCase().includes(q))
      );
    });
  }, [transactions, currentYear, selectedCategoryFilter, searchQuery]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#1e3a5f] text-white flex flex-col fixed h-full z-20 shadow-xl" id="main-sidebar">
        {/* Brand Header */}
        <div className="p-6 border-b border-blue-900/60 flex items-center space-x-3 bg-[#112d4e]">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center overflow-hidden">
              <span className="text-sm font-bold text-blue-200">กองทุน</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1e3a5f] rounded-full"></span>
          </div>
          <div>
            <h1 className="text-xs font-semibold leading-tight tracking-wide text-slate-100">กองทุนหมู่บ้านฉลีก</h1>
            <p className="text-[10px] text-blue-300 font-light mt-0.5">ระบบบันทึกรายจ่ายองค์กร</p>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
          {/* Dashboard Tab */}
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedCategoryFilter('all'); }}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition duration-200 ${
              activeTab === 'dashboard' ? 'bg-blue-600 font-medium text-white shadow-md shadow-blue-900/50' : 'text-slate-300 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">หน้าหลัก</span>
          </button>

          {/* Income Tab */}
          <button
            onClick={() => { setActiveTab('income'); setSelectedCategoryFilter('all'); }}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition duration-200 ${
              activeTab === 'income' ? 'bg-blue-600 font-medium text-white shadow-md shadow-blue-900/50' : 'text-slate-300 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <PlusCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span className="text-sm">บันทึกรายรับ</span>
          </button>

          {/* Expense Tab */}
          <button
            onClick={() => { setActiveTab('expense'); setSelectedCategoryFilter('all'); }}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition duration-200 ${
              activeTab === 'expense' ? 'bg-blue-600 font-medium text-white shadow-md shadow-blue-900/50' : 'text-slate-300 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <MinusCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span className="text-sm">บันทึกรายจ่าย</span>
          </button>

          {/* Approval Queue Tab */}
          <button
            onClick={() => { setActiveTab('approvals'); setSelectedCategoryFilter('all'); }}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition duration-200 ${
              activeTab === 'approvals' ? 'bg-blue-600 font-medium text-white shadow-md shadow-blue-900/50' : 'text-slate-300 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-5 h-5 flex-shrink-0 text-orange-400" />
              <span className="text-sm">รายการรออนุมัติ</span>
            </div>
            {pendingTransactions.length > 0 && (
              <span className="bg-orange-500 font-semibold text-[10px] px-2 py-0.5 rounded-full text-white animate-pulse">
                {pendingTransactions.length}
              </span>
            )}
          </button>

          <div className="pt-4 pb-2 px-2">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-blue-300/60 font-mono">โครงสร้างค่าใช้จ่าย</span>
          </div>

          {/* Categories Tab */}
          <button
            onClick={() => { setActiveTab('categories'); setSelectedCategoryFilter('all'); }}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition duration-200 ${
              activeTab === 'categories' ? 'bg-blue-600 font-medium text-white shadow-md shadow-blue-900/50' : 'text-slate-300 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">หมวดหมู่ค่าใช้จ่าย</span>
          </button>

          {/* Budget Config Tab (Disabled/Hidden by request) */}

          <div className="pt-4 pb-2 px-2">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-blue-300/60 font-mono">ระบบจัดการ</span>
          </div>

          {/* Users Tab */}
          <button
            onClick={() => { setActiveTab('users'); setSelectedCategoryFilter('all'); }}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition duration-200 ${
              activeTab === 'users' ? 'bg-blue-600 font-medium text-white shadow-md shadow-blue-900/50' : 'text-slate-300 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">ผู้ใช้งานระบบ</span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => { setActiveTab('settings'); setSelectedCategoryFilter('all'); }}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition duration-200 ${
              activeTab === 'settings' ? 'bg-blue-600 font-medium text-white shadow-md shadow-blue-900/50' : 'text-slate-300 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">ตั้งค่าระบบ</span>
          </button>
        </nav>

        {/* Sidebar Footer Details */}
        <div className="p-4 bg-[#112d4e] border-t border-blue-900/40 space-y-2">
          <div className="text-[10px] tracking-wider font-semibold text-blue-300/60 uppercase">ข้อมูลติดต่อองค์กร</div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">กองทุนหมู่บ้านฉลีก</p>
        </div>
      </aside>

      {/* 2. MAIN HUB VIEWPORT */}
      <div className="ml-64 flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* UPPER BAR HEADER */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 cursor-pointer">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {activeTab === 'dashboard' && 'หน้าหลักภาพรวม'}
                {activeTab === 'income' && 'ระบบรายงานรายรับ'}
                {activeTab === 'expense' && 'ระบบรายงานรายจ่าย'}
                {activeTab === 'approvals' && 'งานตรวจสอบและอนุมัติจ่าย'}
                {activeTab === 'categories' && 'บริหารหมวดหมู่รหัสงบประมาณ'}
                {activeTab === 'budget' && 'จัดสรรงบประมาณประจำปี'}
                {activeTab === 'users' && 'สิทธิ์ผู้ใช้งานระบบคลัง'}
                {activeTab === 'settings' && 'การตั้งค่าระบบ'}
              </h2>
              <p className="text-xs text-slate-400 font-normal">
                {activeTab === 'dashboard' && 'ติดตามและวิเคราะห์ดุลการเงิน กองทุนหมู่บ้านฉลีก'}
                {activeTab === 'income' && 'บันทึกเอกสารและรายรับหมวดต่าง ๆ ประจำปี'}
                {activeTab === 'expense' && 'เบิกจ่ายงบประมาณโครงการ จัดซื้อจัดจ้าง'}
                {activeTab === 'approvals' && `${pendingTransactions.length} รายการที่รอเจ้าหน้าที่พิจารณาลงนาม`}
                {activeTab === 'categories' && 'จำกัดเพดานควบคุมรายจ่ายหมวดหมู่ต่าง ๆ'}
                {activeTab === 'budget' && 'ตรวจสอบและแก้ไขงบประมาณประจำงวด'}
                {activeTab === 'users' && 'รายชื่อและกลุ่มผู้รับสิทธิ์คีย์ตรวจสอบและลงนาม'}
                {activeTab === 'settings' && 'รีเซ็ตข้อมูลและทดสอบฐานข้อมูลจำลอง'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            {/* Direct Add Transaction button */}
            <button
              onClick={() => {
                setTransactionFormType('expense');
                setShowAddTransactionModal(true);
              }}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกรายการด่วน</span>
            </button>

            {/* Notification Bell Panel */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-slate-400 hover:text-blue-600 relative p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <Bell className="w-5 h-5" />
                {pendingTransactions.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
                    {pendingTransactions.length}
                  </span>
                )}
              </button>

              {/* Dropdown notifications list */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">แจ้งเตือนระบบล่าสุด ({pendingTransactions.length})</span>
                        <span className="text-[10px] text-blue-600 cursor-pointer hover:underline" onClick={handleApproveAll}>อนุมัติทั้งหมด</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                        {pendingTransactions.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            ไม่มีรายการแจ้งเตือนใหม่ในขณะนี้
                          </div>
                        ) : (
                          pendingTransactions.map(tx => (
                            <div key={tx.id} className="p-3 hover:bg-slate-50 transition text-left cursor-pointer" onClick={() => triggerNotificationClick(`รายการ "${tx.title}" ยอดเงิน ${tx.amount.toLocaleString()} บาท รอการตรวจสอบคลัง`)}>
                              <p className="text-xs font-medium text-slate-700 truncate">{tx.title}</p>
                              <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400">
                                <span className="bg-orange-50 text-orange-600 px-1 py-0.5 rounded">รออนุมัติจ่าย</span>
                                <span>{tx.amount.toLocaleString()} บาท</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                        <button onClick={() => { setActiveTab('approvals'); setShowNotifications(false); }} className="text-[10px] text-blue-600 font-medium hover:underline">
                          ดูรายการรออนุมัติทั้งหมด
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>


          </div>
        </header>

        {/* 3. DYNAMIC BODY VIEWS */}
        <div className="p-8 flex-1 space-y-6">

          {/* DYNAMIC TOP FILTER ROW */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">ปีงบประมาณที่ต้องการตรวจสอบ:</span>
              <div className="relative">
                <button
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                  className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>ปีงบประมาณ {currentYear}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showYearDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowYearDropdown(false)}></div>
                    <div className="absolute left-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-35 overflow-hidden">
                      <div className="py-1">
                        {budgetConfigs.map(b => (
                          <button
                            key={b.fiscalYear}
                            onClick={() => {
                              setCurrentYear(b.fiscalYear);
                              setShowYearDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs transition hover:bg-blue-50 hover:text-blue-600 block ${
                              currentYear === b.fiscalYear ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'
                            }`}
                          >
                            ปีงบประมาณ {b.fiscalYear}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหารายการ, หมวดหมู่, แหล่งทุน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 w-full sm:w-64 transition"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-605 flex items-center space-x-1.5 transition shadow-xs"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>ส่งออกรายงาน CSV</span>
              </button>

              <button
                onClick={() => setShowPdfExportModal(true)}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 flex items-center space-x-1.5 transition shadow-xs"
                title="พิมพ์รายงานสรุปสาระสำคัญเป็น PDF ภาษาไทยอย่างเป็นทางการ"
              >
                <Printer className="w-4 h-4 text-blue-500" />
                <span>พิมพ์รายงาน / PDF</span>
              </button>
            </div>
          </div>


          {/* 3.1 VIEW: DASHBOARD TABLEAU */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* FIVE METRIC CARDS HEADER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {/* 1. Annual allocated Budget */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between group/card hover:border-blue-200 transition duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-slate-400 tracking-wider">งบประมาณจัดได้รับ</p>
                      
                      {isEditingTotalBudget ? (
                        <div className="mt-1 space-y-1.5 z-10 relative">
                          <input
                            type="number"
                            value={tempTotalBudget}
                            onChange={(e) => setTempTotalBudget(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const amt = parseFloat(tempTotalBudget);
                                if (isNaN(amt) || amt < 0) {
                                  showToast('กรุณากรอกยอดเงินงบประมาณที่ถูกต้อง', 'warning');
                                  return;
                                }
                                handleUpdateYearBudget(currentYear, amt);
                                setIsEditingTotalBudget(false);
                                showToast(`ปรับแก้ขีดจำกัดงบประมาณปี ${currentYear} สำเร็จ`, 'success');
                              } else if (e.key === 'Escape') {
                                setIsEditingTotalBudget(false);
                              }
                            }}
                            className="bg-slate-50 border border-blue-400 text-slate-800 text-xs font-bold px-2 py-1 rounded w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="ระบุงบจัดสรร..."
                            autoFocus
                          />
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                const amt = parseFloat(tempTotalBudget);
                                if (isNaN(amt) || amt < 0) {
                                  showToast('กรุณากรอกยอดเงินงบประมาณที่ถูกต้อง', 'warning');
                                  return;
                                }
                                handleUpdateYearBudget(currentYear, amt);
                                setIsEditingTotalBudget(false);
                                showToast(`ปรับแก้ขีดจำกัดงบประมาณปี ${currentYear} สำเร็จ`, 'success');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] px-1.5 py-0.5 rounded transition"
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={() => setIsEditingTotalBudget(false)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-[9px] px-1.5 py-0.5 rounded transition"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 group/value mt-1">
                          <h3 className="text-xl font-bold text-slate-800">
                            {totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </h3>
                          <button
                            onClick={() => {
                              setTempTotalBudget(totalBudget.toString());
                              setIsEditingTotalBudget(true);
                            }}
                            className="opacity-0 group-hover/value:opacity-100 p-0.5 hover:bg-slate-100 rounded text-blue-600 transition"
                            title="แก้ไขงบงบประมาณจัดสรร"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-slate-400 font-medium">บาท</p>
                    </div>
                    <div className="bg-blue-600/10 text-blue-600 p-2.5 rounded-xl group-hover/card:scale-105 transition">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">ปีงบประมาณ {currentYear}</span>
                    <button
                      onClick={() => {
                        setTempTotalBudget(totalBudget.toString());
                        setIsEditingTotalBudget(true);
                      }}
                      className="text-blue-600 font-semibold hover:underline flex items-center space-x-0.5"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>แก้ยอดงบ</span>
                    </button>
                  </div>
                </div>

                {/* 2. Cumulative Incomes */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-emerald-200 transition duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 tracking-wider font-sans">รายรับจริงรวม</p>
                      <h3 className="text-xl font-bold text-slate-800 mt-1">{totalIncomesSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                      <p className="text-[10px] text-slate-400 font-medium">บาท</p>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-600 p-2.5 rounded-xl group-hover:scale-105 transition">
                      <PlusCircle className="w-5 h-5 border-emerald-400 text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(parseFloat(incomesPercent), 100)}%` }}></div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px]">
                      <span className="font-bold text-emerald-600">{incomesPercent}%</span>
                      <span className="text-slate-400 font-light">เทียบกับงบประมาณ</span>
                    </div>
                  </div>
                </div>

                {/* 3. Confirmed Expenses */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-red-200 transition duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 tracking-wider">รายจ่ายที่อนุมัติแล้ว</p>
                      <h3 className="text-xl font-bold text-slate-800 mt-1">{totalExpensesSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                      <p className="text-[10px] text-slate-400 font-medium">บาท</p>
                    </div>
                    <div className="bg-red-500/10 text-red-600 p-2.5 rounded-xl group-hover:scale-105 transition">
                      <MinusCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(parseFloat(expensesPercent), 100)}%` }}></div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px]">
                      <span className="font-bold text-red-600">{expensesPercent}%</span>
                      <span className="text-slate-400">ของการใช้จ่ายจริง</span>
                    </div>
                  </div>
                </div>

                {/* 4. Leftover funds */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-amber-200 transition duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 tracking-wider">งบประมาณคงเหลือจริง</p>
                      <h3 className={`text-xl font-bold mt-1 ${remainingBalance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                        {remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">บาท</p>
                    </div>
                    <div className="bg-amber-500/10 text-amber-600 p-2.5 rounded-xl group-hover:scale-105 transition">
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(parseFloat(balancePercent), 100))}%` }}></div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px]">
                      <span className="font-bold text-amber-600">{balancePercent}%</span>
                      <span className="text-slate-400 font-light">โควต้าใช้สอยที่เหลือ</span>
                    </div>
                  </div>
                </div>

                {/* 5. Awaiting Signoff Count */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-purple-200 transition duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 tracking-wider">จำนวนธุรกรรมรออนุมัติ</p>
                      <h3 className="text-xl font-bold text-purple-600 mt-1">{pendingTransactions.length}</h3>
                      <p className="text-[10px] text-slate-400 font-medium">รายการ</p>
                    </div>
                    <div className="bg-purple-500/10 text-purple-600 p-2.5 rounded-xl group-hover:scale-105 transition">
                      <CheckSquare className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 truncate">รวม ({totalPendingSum.toLocaleString()} บาท)</span>
                    <button onClick={() => setActiveTab('approvals')} className="text-purple-600 font-semibold hover:underline">ตรวจหนี้</button>
                  </div>
                </div>
              </div>

              {/* CORE VISUAL CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Bar chart monthly flow */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-700">รายรับเทียบรายจ่ายรายเดือน (ปีงบประมาณ-เดือนช่วง)</h4>
                      <div className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-lg">
                        ต.ค. - ก.ย.
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-4 font-normal">เปรียบเทียบการได้รับทุนรัฐร่วมกับการชำระโครงการเบิกรอบต่าง ๆ</p>
                  </div>

                  <div className="h-64 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} strokeLinecap="round" />
                        <YAxis stroke="#94a3b8" fontSize={11} width={45} />
                        <Tooltip
                          contentStyle={{ background: '#1e293b', color: '#f8fafc', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                          formatter={(value) => [`${parseFloat(value as string).toLocaleString()} บาท`]}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                        <Bar dataKey="รายรับ (บาท)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="รายจ่าย (บาท)" fill="#f87171" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                    <span>ตระหนักรู้: ค่าใช้จ่ายส่วนใหญ่กระจุกตัวเดือนเมษายนและสิงหาคมตามงวดงานก่อสร้างหลัก</span>
                    <span className="font-semibold text-blue-600 cursor-pointer" onClick={() => setActiveTab('expense')}>ส่องประวัติ {`>`}</span>
                  </div>
                </div>

                {/* 2. Expenses breakdown donuts */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">งบรายจ่ายตามกลุ่มหมวดหมู่</h4>
                    <p className="text-[11px] text-slate-400 mb-4">แสดงสัดส่วนจากยอดรายจ่าย {totalExpensesSum.toLocaleString()} บาท</p>
                  </div>

                  <div className="relative flex items-center justify-center py-2">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={categoryExpenses}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryExpenses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#1e293b', color: '#f8fafc', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                          formatter={(value) => [`${parseFloat(value as string).toLocaleString()} บาท`]}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">รายจ่ายรวม</span>
                      <span className="text-sm font-bold text-slate-800">{(totalExpensesSum / 1000).toFixed(1)}k</span>
                      <span className="text-[9px] text-slate-400">บาท</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1 mt-4">
                    {categoryExpenses.map((cat, index) => (
                      <div
                        key={index}
                        onClick={() => handleCategoryClick(cat)}
                        className="flex items-center justify-between text-xs hover:bg-slate-50 p-1.5 rounded-lg transition cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                          <span className="text-slate-600 truncate max-w-[120px]">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-800 font-semibold">{cat.percent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Budget state gauges & notification highlights */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">ความคืบหน้างบประมาณ</h4>
                    <p className="text-[11px] text-slate-400 mb-4">อัตราส่วนการเบิกจ่ายงบประจำงปี {currentYear}</p>
                  </div>

                  {/* Circular visual stroke representation */}
                  <div className="flex justify-center flex-col items-center py-1">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" fill="transparent" r="62" stroke="#f1f5f9" strokeWidth="11" />
                        <circle
                          cx="72"
                          cy="72"
                          fill="transparent"
                          r="62"
                          stroke="#10b981"
                          strokeWidth="11"
                          strokeDasharray={389.5}
                          strokeDashoffset={389.5 - (389.5 * Math.min(parseFloat(expensesPercent), 100)) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-800">{expensesPercent}%</span>
                        <span className="text-[10px] text-slate-400 font-medium">เบิกจ่ายส่วนนี้</span>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <p className="text-xs text-slate-600 font-semibold">
                        เบิกออกแล้ว {totalExpensesSum.toLocaleString()} บาท
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">คงเหลือจำกัด {remainingBalance.toLocaleString()} บาท</p>
                    </div>
                  </div>

                  {/* Quick Alert Highlights */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">เหตุการณ์สำคัญภัย</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2.5 text-xs text-slate-600">
                        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                        <span className="truncate">งบส่วนสะสมปีสูง มีการชะลอการผูกขาด</span>
                      </div>
                      <div className="flex items-center space-x-2.5 text-xs text-slate-600">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="truncate">ค่าใช้สอยคงเหลือต่ำกว่า 20% ของเพดาน</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RECENT TRANSACTIONS SMALL DATA GRID */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">รายการเคลื่อนไหวการคลังล่าสุด 5 รายการ</h4>
                    <p className="text-xs text-slate-400">ธุรกรรมรายรับและจ่ายที่นำเข้าล่าสุด</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('expense')}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    ดูคำร้องขอนำส่งทั้งหมด
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">วันที่</th>
                        <th className="p-3">ชื่อรายการ</th>
                        <th className="p-3">ประเภท</th>
                        <th className="p-3">หมวดหมู่</th>
                        <th className="p-3">ผู้จ่าย/รับ</th>
                        <th className="p-3 text-right">จำนวนเงิน (บาท)</th>
                        <th className="p-3 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {yearTransactions.slice(0, 5).map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3 whitespace-nowrap font-mono text-[11px]">{tx.date}</td>
                          <td className="p-3 font-medium text-slate-800">{tx.title}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">{tx.category}</td>
                          <td className="p-3 truncate max-w-[150px]">{tx.payerOrPayee || '-'}</td>
                          <td className="p-3 text-right font-bold font-mono text-slate-800">{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                              tx.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                              tx.status === 'pending' ? 'bg-orange-100 text-orange-850' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {tx.status === 'approved' && 'อนุมัติจ่ายแล้ว'}
                              {tx.status === 'pending' && 'รออนุมัติ'}
                              {tx.status === 'rejected' && 'ปฏิเสธคำขอ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {yearTransactions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-slate-400">
                            ยังไม่มีรายการเคลื่อนไหวในปีงบประมาณนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* 3.2 VIEW: INCOMES REGISTRY */}
          {activeTab === 'income' && (
            <div className="space-y-6">
              
              {/* TOP HEADER WITH TRIGGER ACTION */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">รายการนำส่งรายรับองค์กร</h3>
                  <p className="text-xs text-slate-400">เงินภาษี, เงินปันผลราชการ, รายได้อุดหนุนและสิทธิพิเศษปีกรม</p>
                </div>
                <button
                  onClick={() => {
                    setTransactionFormType('income');
                    setNewTxCategory('เงินอุดหนุนรัฐบาล');
                    setShowAddTransactionModal(true);
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition flex items-center space-x-1 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>บันทึกนำรับรายการใหม่</span>
                </button>
              </div>

              {/* INCOME DATA TABLE */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">วันที่นำส่ง</th>
                        <th className="p-3">ชื่อธุรกรรมรายรับ</th>
                        <th className="p-3">ประเภทหลัก</th>
                        <th className="p-3">กรมกองแหล่งทุน</th>
                        <th className="p-3 text-right">จำนวนเงิน (บาท)</th>
                        <th className="p-3 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIncomes.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3 font-mono font-medium">{tx.date}</td>
                          <td className="p-3 font-semibold text-slate-800">{tx.title}</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">
                              {tx.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{tx.payerOrPayee || '-'}</td>
                          <td className="p-3 text-right font-bold text-emerald-600 font-mono text-[13px]">
                            +{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-slate-100 rounded transition"
                              title="ลบธุรกรรม"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredIncomes.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center p-12 text-slate-400 italic">
                            ไม่พบข้อมูลรายการรายรับรายจ่ายใด ๆ ที่ตรงตามเงื่อนไขค้นหา
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* 3.3 VIEW: EXPENSES MANAGEMENT */}
          {activeTab === 'expense' && (
            <div className="space-y-6">
              
              {/* TOP HEADER WITH TRIGGER ACTION */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">ระบบขออนุมัติและชำระรายจ่าย</h3>
                  <p className="text-xs text-slate-400 font-normal">จัดการการจัดซื้อจัดจ้าง โครงการซ่อมแซมพัฒนาพื้นที่ และเงินงดประจำ</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setTransactionFormType('expense');
                      setNewTxCategory('ค่าใช้สอย');
                      setShowAddTransactionModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition flex items-center space-x-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>สร้างใบคำร้องเบิกจ่าย</span>
                  </button>
                </div>
              </div>

              {/* FILTERS OR CATEGORIES TABS SHORTCUT */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full border transition ${
                    selectedCategoryFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ทั้งหมด
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.name)}
                    className={`px-3 py-1 text-xs rounded-full border transition flex items-center space-x-1.5 ${
                      selectedCategoryFilter === cat.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* MAIN EXPENSES LIST */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">วันที่</th>
                        <th className="p-3">ชื่อรายการ/โครงการการเบิกจ่าย</th>
                        <th className="p-3">หมวดหมู่คุมงบ</th>
                        <th className="p-3">ผู้ประกอบการ/เจ้าหนี้</th>
                        <th className="p-3 text-right">จำนวนชำระ (บาท)</th>
                        <th className="p-3 text-center">เอกสารอ้างอิง</th>
                        <th className="p-3 text-center">สถานะคลัง</th>
                        <th className="p-3 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExpenses.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3 font-mono text-[11px] whitespace-nowrap">{tx.date}</td>
                          <td className="p-3 font-semibold text-slate-800">
                            <div>{tx.title}</div>
                            {tx.description && <div className="text-[10px] text-slate-400 font-normal mt-0.5">{tx.description}</div>}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                              {tx.category}
                            </span>
                          </td>
                          <td className="p-3 truncate max-w-[150px]">{tx.payerOrPayee || '-'}</td>
                          <td className="p-3 text-right font-bold text-red-600 font-mono text-[13px] whitespace-nowrap">
                            -{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            {tx.attachmentName ? (
                              <span className="inline-flex items-center text-blue-600 hover:underline cursor-pointer" onClick={() => showToast(`ดาวน์โหลด/จำลองการเปิดไฟล์เอกสาร: ${tx.attachmentName}`, 'success')}>
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                <span className="text-[10px] truncate max-w-[80px]">{tx.attachmentName}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 font-light">- ไม่มี -</span>
                            )}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tx.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              tx.status === 'pending' ? 'bg-orange-50 text-orange-850 border border-orange-200' :
                              'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {tx.status === 'approved' ? 'อนุมัติชำระสำเร็จ' : tx.status === 'pending' ? 'รอกรรมการลงนาม' : 'ปฏิเสธไม่อนุมัติ'}
                            </span>
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1">
                              {tx.status === 'pending' && (
                                <button
                                  onClick={() => handleApprove(tx.id)}
                                  className="text-emerald-600 hover:text-emerald-850 p-1 hover:bg-slate-100 rounded transition"
                                  title="ตรวจเช็กและอนุมัติทันที"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="text-red-500 hover:text-red-700 p-1 hover:bg-slate-100 rounded transition"
                                title="ลบรายการ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredExpenses.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center p-12 text-slate-400 italic">
                            ไม่มีรายการเบิกจ่ายงบที่ค้นหาในช่วงนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* 3.4 VIEW: WAIT FOR SIGNATURE / APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start space-x-3 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">แผงคำสั่งตรวจสอบคลังและพิจารณาอนุมัติสั่งจ่าย</h4>
                  <p className="text-xs text-amber-800 leading-relaxed mt-1">
                    กรุณาตรวจสอบเอกสารสัญญาจ้างและใบสำคัญสั่งจ่ายของผู้ยื่นความจำนงเบิกค่าอุปกรณ์ให้ดีก่อนทำสัญลักษณ์อนุมัติ คุณสามารถลงมติเป็นเอกฉันท์ <strong>"อนุมัติทั้งหมด"</strong> ได้ในกรณีรายการทั้งหมดเข้าระบบถูกต้อง
                  </p>
                </div>
              </div>

              {/* ACTION TOGGLES */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-600">
                  พบรายการค้างการพิจารณาทั้งสิ้น <span className="text-blue-600 font-bold">{pendingTransactions.length}</span> รายการ มูลค่า <span className="text-red-600 font-bold">{totalPendingSum.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
                </div>
                <button
                  onClick={handleApproveAll}
                  disabled={pendingTransactions.length === 0}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  ลงมติอนุมัติรายการทั้งหมดล่วงหน้า
                </button>
              </div>

              {/* APPROVALS CARDS SCROLL */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTransactions.map(tx => (
                  <div key={tx.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition duration-250 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">ID: {tx.id}</span>
                        <span className="bg-orange-50 text-orange-650 px-2 py-0.5 rounded text-[9px] font-bold">รอการสั่งจ่าย</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-2 line-clamp-2">{tx.title}</h4>
                      
                      <div className="space-y-1.5 mt-3 text-[11px] text-slate-500 border-t border-slate-50 pt-2.5">
                        <div className="flex justify-between">
                          <span>หมวดหมู่คุมงบ:</span>
                          <span className="font-medium text-slate-700">{tx.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ผู้ขอรับเงินทุน:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[130px]">{tx.payerOrPayee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>วันที่นำคำส่ง:</span>
                          <span className="font-medium text-slate-700">{tx.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-red-600 font-mono">
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[10px] font-normal text-slate-400">บ.</span>
                      </span>

                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleReject(tx.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
                        >
                          ปฏิเสธ
                        </button>
                        <button
                          onClick={() => handleApprove(tx.id)}
                          className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition shadow-sm flex items-center space-x-0.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>อนุมัติจ่าย</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingTransactions.length === 0 && (
                  <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center">
                    <UserCheck className="w-12 h-12 text-blue-500/20 mb-3" />
                    <h4 className="text-sm font-bold text-slate-700">ไม่มีภาระงานรอตรวจสอบค้างคา!</h4>
                    <p className="text-xs text-slate-400 mt-1">งบประมาณและใบคำสั่งชำระทั้งหมดสำหรับปีงบ {currentYear} ได้รับการอนุมัติ/ปฏิเสธลงมติครบถ้วนแล้ว</p>
                  </div>
                )}
              </div>

            </div>
          )}


          {/* 3.5 VIEW: EXPENSE CATEGORIES LIMITS */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">ขีดจำกัดหมวดหมู่ค่าใช้จ่าย</h3>
                  <p className="text-xs text-slate-400">ควบคุมและกักกันยอดรายจ่ายไม่เกินเพดานที่ได้รับการเสนอชอบจากที่ประชุมกรรมการ</p>
                </div>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                >
                  เพิ่มหมวดหมู่ใหม่
                </button>
              </div>

              {/* LIST OF CATEGORIES AS CARDS WITH PROGRESS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryExpenses.map((cat, idx) => {
                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                          <h4 className="text-sm font-bold text-slate-800">{cat.name}</h4>
                        </div>
                      </div>

                      <div className="space-y-3 font-sans">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>ใช้ไปแล้ว:</span>
                          <span className="font-semibold text-slate-800">{cat.value.toLocaleString()} บาท</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}


          {/* 3.6 VIEW: BUDGET CONFIGURATION */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-2">กำหนดเพดานงบประมาณจัดสรรประจำปี</h3>
                <p className="text-xs text-slate-400 mb-6">คุณสามารถจำลองการเพิ่มหรือลดงบประมาณทั้งหมด เพื่อดูผลกระทบต่อภาระสัดส่วนคงเหลือในหน้าหลัก</p>

                <div className="space-y-6 mt-4">
                  {budgetConfigs.map(b => (
                    <div key={b.fiscalYear} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">ปีงบประมาณ {b.fiscalYear}</h4>
                        <p className="text-xs text-slate-400 mt-1">งบประมาณเริ่มต้นได้รับจัดสรรจากจังหวัด</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-400">วงเงินงบประมาณสภา:</span>
                        <input
                          type="number"
                          value={b.totalBudget}
                          onChange={(e) => handleUpdateYearBudget(b.fiscalYear, parseFloat(e.target.value) || 0)}
                          className="bg-white border border-slate-200 px-3 py-1.5 text-xs text-right font-semibold text-slate-800 rounded-lg w-44 focus:outline-none focus:border-blue-400"
                        />
                        <span className="text-xs text-slate-600">บาท</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={() => { setActiveTab('dashboard'); showToast('บันทึกแผนปรับปรุงเรียบร้อยแล้ว!', 'success'); }} className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                    ยืนยันงบประมาณจำลอง
                  </button>
                </div>
              </div>

            </div>
          )}


          {/* 3.7 VIEW: USERS MANAGEMENT & DISPATCH */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">ผู้ปฏิบัติการระบบคลัง กองทุนหมู่บ้านฉลีก</h3>
                    <p className="text-xs text-slate-400">ผู้มีสิทธิ์เข้าถึง การตรวจสอบ นำส่งเสนอญัตติอนุมัติงบ และลงนามผู้บริหาร (คุณสามารถคลิกปุ่มแก้ไขเพื่อปรับเปลี่ยนรายนามและตำแหน่งได้)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* User 1 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md">


                    {isEditingUser1 ? (
                      <div className="mt-4 space-y-3 w-full text-left">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                          <input
                            type="text"
                            value={officerName}
                            onChange={(e) => setOfficerName(e.target.value)}
                            className="w-full bg-white border border-slate-200 mt-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="ระบุชื่อ-นามสกุล"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ตำแหน่งหน้าที่</label>
                          <input
                            type="text"
                            value={officerRole}
                            onChange={(e) => setOfficerRole(e.target.value)}
                            className="w-full bg-white border border-slate-200 mt-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="ระบุตำแหน่งหน้าที่"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!officerName.trim() || !officerRole.trim()) {
                              showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
                              return;
                            }
                            setIsEditingUser1(false);
                            showToast('บันทึกข้อมูลผู้ปฏิบัติการเสร็จสิ้น', 'success');
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg transition"
                        >
                          บันทึกข้อมูล
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 w-full flex flex-col items-center">
                        <h4 className="text-sm font-bold text-slate-700 leading-snug">{officerName}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 min-h-[16px]">{officerRole}</p>
                        
                        <div className="mt-4 flex items-center justify-between w-full border-t border-slate-200/60 pt-3">
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            เจ้าหน้าที่จัดทำ
                          </span>
                          <button
                            onClick={() => setIsEditingUser1(true)}
                            className="p-1 px-2 hover:bg-slate-200 text-slate-500 hover:text-blue-600 rounded-lg transition flex items-center space-x-1.5 text-[10px] font-bold"
                            title="แก้ไขชื่อและตำแหน่ง"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User 2 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md">


                    {isEditingUser2 ? (
                      <div className="mt-4 space-y-3 w-full text-left">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                          <input
                            type="text"
                            value={directorName}
                            onChange={(e) => setDirectorName(e.target.value)}
                            className="w-full bg-white border border-slate-200 mt-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="ระบุชื่อ-นามสกุล"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ตำแหน่งหน้าที่</label>
                          <input
                            type="text"
                            value={directorRole}
                            onChange={(e) => setDirectorRole(e.target.value)}
                            className="w-full bg-white border border-slate-200 mt-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="ระบุตำแหน่งหน้าที่"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!directorName.trim() || !directorRole.trim()) {
                              showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
                              return;
                            }
                            setIsEditingUser2(false);
                            showToast('บันทึกข้อมูลผู้ตรวจสอบตรวจสอบเสร็จสิ้น', 'success');
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg transition"
                        >
                          บันทึกข้อมูล
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 w-full flex flex-col items-center">
                        <h4 className="text-sm font-bold text-slate-700 leading-snug">{directorName}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 min-h-[16px]">{directorRole}</p>
                        
                        <div className="mt-4 flex items-center justify-between w-full border-t border-slate-200/60 pt-3">
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            เหรัญญิกตรวจสอบ
                          </span>
                          <button
                            onClick={() => setIsEditingUser2(true)}
                            className="p-1 px-2 hover:bg-slate-200 text-slate-500 hover:text-emerald-600 rounded-lg transition flex items-center space-x-1.5 text-[10px] font-bold"
                            title="แก้ไขชื่อและตำแหน่ง"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User 3 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md">


                    {isEditingUser3 ? (
                      <div className="mt-4 space-y-3 w-full text-left">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                          <input
                            type="text"
                            value={mayorName}
                            onChange={(e) => setMayorName(e.target.value)}
                            className="w-full bg-white border border-slate-200 mt-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="ระบุชื่อ-นามสกุล"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ตำแหน่งหน้าที่</label>
                          <input
                            type="text"
                            value={mayorRole}
                            onChange={(e) => setMayorRole(e.target.value)}
                            className="w-full bg-white border border-slate-200 mt-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="ระบุตำแหน่งหน้าที่"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!mayorName.trim() || !mayorRole.trim()) {
                              showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
                              return;
                            }
                            setIsEditingUser3(false);
                            showToast('บันทึกข้อมูลประธานผู้ลงนามเสร็จสิ้น', 'success');
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg transition"
                        >
                          บันทึกข้อมูล
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 w-full flex flex-col items-center">
                        <h4 className="text-sm font-bold text-slate-700 leading-snug">{mayorName}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 min-h-[16px]">{mayorRole}</p>
                        
                        <div className="mt-4 flex items-center justify-between w-full border-t border-slate-200/60 pt-3">
                          <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            ประธานอนุมัติหลัก
                          </span>
                          <button
                            onClick={() => setIsEditingUser3(true)}
                            className="p-1 px-2 hover:bg-slate-200 text-slate-500 hover:text-purple-600 rounded-lg transition flex items-center space-x-1.5 text-[10px] font-bold"
                            title="แก้ไขชื่อและตำแหน่ง"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}


          {/* 3.8 VIEW: SYSTEM SETTINGS OVERRIDE */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-800">เครื่องมือวิศวกรรมระบบจำลอง</h3>
                <p className="text-xs text-slate-400 mb-4">หากการทดลองแก้ไขงบประมาณหรือรายการต่าง ๆ เบี่ยงเบนไปจากหลักฐานจริง คุณสามารถกดปุ่มรีเซ็ตเพื่อย้อนกลับเป็นค่าเริ่มต้นตามที่ระบุในภาพร่างข้อเสนอได้ตลอดเวลา</p>

                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-red-700">รีเซ็ตบัญชีงบฐานระบบเริ่มต้น</h4>
                    <p className="text-[11px] text-red-650 mt-1">นี่จะเป็นการล้างรายการธุรกรรมที่เพิ่มเติมเข้ามาทั้งหมด และคืนค่าตัวเลข 1,500,000 บาท เข้าสู่ตัวแปรระบบ</p>
                  </div>
                  <button
                    onClick={handleResetData}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-700 transition flex items-center space-x-1 whitespace-nowrap"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>รีเซ็ตล้างคืนตารางเริ่มต้น</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>


      {/* 4. MODALS CONTAINER */}
      
      {/* 4.1 ADD TRANSACTION MODAL */}
      <AnimatePresence>
        {showAddTransactionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60"
              onClick={() => setShowAddTransactionModal(false)}
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg z-10 shadow-2xl relative overflow-hidden font-sans border border-slate-100"
            >
              <button
                onClick={() => setShowAddTransactionModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center space-x-2">
                <span>บันทึกบัญชีรายการนำส่งการเงินด่วน</span>
              </h3>
              <p className="text-xs text-slate-400 mb-5">นำเข้าข้อมูลรายรับหรือแจ้งตั้งเบิกจ่ายค่าบำรุงรักษา</p>

              <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
                
                {/* Switch between Income and Expense tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTransactionFormType('income')}
                    className={`py-1.5 rounded-lg text-center font-bold transition ${
                      transactionFormType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    ประเภทยอด: รายรับ
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionFormType('expense')}
                    className={`py-1.5 rounded-lg text-center font-bold transition ${
                      transactionFormType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    ประเภทยอด: รายจ่าย
                  </button>
                </div>

                {/* Title Input */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">ชื่อเอกสาร / รายชื่อโครงการ *</label>
                  <input
                    type="text"
                    required
                    placeholder={transactionFormType === 'income' ? 'เช่น เงินอุดหนุนกองทัพ, ภาษีป้ายโฆษณา' : 'เช่น ซื้อปากกา ดินสอ หมึกพิมพ์ กวาดถนน'}
                    value={newTxTitle}
                    onChange={(e) => setNewTxTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Amount and Date Box */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">มูลค่า (บาท) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      placeholder="เช่น 1500"
                      value={newTxAmount}
                      onChange={(e) => setNewTxAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 text-right font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">วันที่รายการเดินทาง *</label>
                    <input
                      type="date"
                      required
                      value={newTxDate}
                      onChange={(e) => setNewTxDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">กลุ่มและหมวดหมู่คุมงบ *</label>
                  {transactionFormType === 'income' ? (
                    <select
                      value={newTxCategory}
                      onChange={(e) => setNewTxCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400"
                    >
                      <option value="">-- เลือกกลุ่มรายรับ --</option>
                      <option value="เงินอุดหนุนรัฐบาล">เงินอุดหนุนรัฐบาล</option>
                      <option value="รายได้ภาษีบำรุงท้องที่">รายได้ภาษีบำรุงท้องที่</option>
                      <option value="ค่าธรรมเนียมและสิทธิ">ค่าธรรมเนียมและสิทธิ</option>
                      <option value="รายรับอื่น ๆ">รายรับอื่น ๆ</option>
                    </select>
                  ) : (
                    <select
                      value={newTxCategory}
                      onChange={(e) => setNewTxCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400"
                    >
                      <option value="">-- เลือกหมวดหมู่รายจ่าย --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Payer or Payee */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">
                    {transactionFormType === 'income' ? 'หน่วยงานผู้นำส่งเงินทุน' : 'เจ้าหนี้ / ร้านค้าปลายทางผู้รับเงิน'}
                  </label>
                  <input
                    type="text"
                    placeholder={transactionFormType === 'income' ? 'กรมบังคับคลัง, ภาษีบำรุง' : 'หจก. เมืองทองวัสดุก่อสร้าง'}
                    value={newTxPayerPayee}
                    onChange={(e) => setNewTxPayerPayee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* File/Attachment Attachment simulator (For Craftsman quality experience) */}
                {transactionFormType === 'expense' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600">สถานะเริ่มต้นคลัง</label>
                      <select
                        value={newTxStatus}
                        onChange={(e) => setNewTxStatus(e.target.value as 'approved' | 'pending')}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 font-semibold"
                      >
                        <option value="approved">อนุมัติเรียบร้อย</option>
                        <option value="pending">รอเจ้าหน้าที่เซ็นอนุมัติ</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600">จำลองอัพใบเสร็จ (PDF/IMG)</label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
                        <input
                          type="file"
                          id="tx-file"
                          className="hidden"
                          onChange={handleFileChangeSimulate}
                        />
                        <label htmlFor="tx-file" className="cursor-pointer bg-slate-200 px-2 py-1 rounded hover:bg-slate-300 font-bold text-[10px] whitespace-nowrap text-slate-600">
                          แนบภาพใบเสร็จ
                        </label>
                        <span className="ml-2 text-[9px] text-slate-500 truncate max-w-[120px]">
                          {newTxAttachment || 'ไม่ได้เลือกไฟล์'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Textarea */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">บันทึกช่วยจำรายละเอียดเพิ่มเติม</label>
                  <textarea
                    rows={2}
                    placeholder="ระบุข้อเท็จจริงประกอบเพื่อใช้ค้นทีหลัง"
                    value={newTxDescription}
                    onChange={(e) => setNewTxDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTransactionModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-xl transition"
                  >
                    ยกเลิกกล่องนี้
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
                  >
                    บันทึกข้อมูลเข้าสู่เซิร์ฟเวอร์
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4.2 ADD CATEGORY MODAL */}
      <AnimatePresence>
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60"
              onClick={() => setShowAddCategoryModal(false)}
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm z-10 shadow-2xl relative overflow-hidden font-sans"
            >
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-slate-800 mb-4">เพิ่มหมวดหมู่รหัสค่าใช้จ่ายใหม่</h3>

              <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">ชื่อหมวดหมู่รหัส *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ค่าใช้จ่ายพนักงานฝึกอบรม"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">สีประจำกลุ่มเอกสาร</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-10 h-8 rounded border-none cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400 font-mono">{newCatColor}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-bold"
                  >
                    ปิดปากกล่อง
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                  >
                    ยืนยันการเพิ่มหมวดหมู่
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4.3 PDF EXPORT MODAL REPORT BUILDER */}
      <PdfExportModal
        isOpen={showPdfExportModal}
        onClose={() => setShowPdfExportModal(false)}
        transactions={transactions}
        categories={categories}
        budgetConfigs={budgetConfigs}
        currentYear={currentYear}
        activeTab={activeTab}
        officerName={officerName}
        setOfficerName={setOfficerName}
        officerRole={officerRole}
        setOfficerRole={setOfficerRole}
        directorName={directorName}
        setDirectorName={setDirectorName}
        directorRole={directorRole}
        setDirectorRole={setDirectorRole}
        mayorName={mayorName}
        setMayorName={setMayorName}
        mayorRole={mayorRole}
        setMayorRole={setMayorRole}
      />

      {/* 4.4 BEAUTIFUL FLOATING TOASTS NOTIFICATION PANEL */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`p-4 rounded-2xl shadow-xl flex items-start space-x-3 pointer-events-auto border font-sans text-xs ${
                toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {toast.type === 'success' && <Check className="w-4 h-4 text-emerald-600" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {toast.type === 'info' && <Bell className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="flex-1 font-medium leading-relaxed">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4.5 BEAUTIFUL NATIVE-FREE CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0"
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 z-10 shadow-2xl border border-slate-100 flex flex-col text-slate-800"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{confirmDialog.title}</h3>
                  <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wide">โปรดยืนยันการดำเนินการ</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed mb-6 font-medium whitespace-pre-line">
                {confirmDialog.message}
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition"
                >
                  {confirmDialog.cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-950/10"
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
