import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Eye,
  FileText,
  Sliders,
  CheckCircle,
  Clock,
  User,
  HelpCircle,
  Coins,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { Transaction, Category, BudgetConfig } from '../types';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  budgetConfigs: BudgetConfig[];
  currentYear: string;
  activeTab: string;
  officerName: string;
  setOfficerName: (val: string) => void;
  officerRole: string;
  setOfficerRole: (val: string) => void;
  directorName: string;
  setDirectorName: (val: string) => void;
  directorRole: string;
  setDirectorRole: (val: string) => void;
  mayorName: string;
  setMayorName: (val: string) => void;
  mayorRole: string;
  setMayorRole: (val: string) => void;
}

export default function PdfExportModal({
  isOpen,
  onClose,
  transactions,
  categories,
  budgetConfigs,
  currentYear,
  activeTab,
  officerName,
  setOfficerName,
  officerRole,
  setOfficerRole,
  directorName,
  setDirectorName,
  directorRole,
  setDirectorRole,
  mayorName,
  setMayorName,
  mayorRole,
  setMayorRole
}: PdfExportModalProps) {
  // --- States ---
  const [reportType, setReportType] = useState<'all' | 'income' | 'expense'>(() => {
    if (activeTab === 'income') return 'income';
    if (activeTab === 'expense') return 'expense';
    return 'all';
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [showSeal, setShowSeal] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [reportTitle, setReportTitle] = useState<string>(() => {
    return `รายงานสรุปบัญชีและประวัติรายจ่าย-รายรับ กองทุนหมู่บ้านฉลีก`;
  });

  if (!isOpen) return null;

  // --- Calculations ---
  const currentBudget = useMemo(() => {
    const config = budgetConfigs.find(b => b.fiscalYear === currentYear);
    return config ? config.totalBudget : 1000000;
  }, [budgetConfigs, currentYear]);

  // Filter items based on configuration
  const filteredReportTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Fiscal year
      if (t.fiscalYear !== currentYear) return false;
      
      // Type
      if (reportType === 'income' && t.type !== 'income') return false;
      if (reportType === 'expense' && t.type !== 'expense') return false;
      
      // Category
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      
      // Status
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentYear, reportType, selectedCategory, selectedStatus]);

  // Stats summaries
  const stats = useMemo(() => {
    const items = filteredReportTransactions;
    const incomeItems = items.filter(t => t.type === 'income');
    const expenseItems = items.filter(t => t.type === 'expense');
    
    const totalIncome = incomeItems.reduce((sum, t) => sum + (t.status === 'approved' ? t.amount : 0), 0);
    const totalExpense = expenseItems.reduce((sum, t) => sum + (t.status === 'approved' ? t.amount : 0), 0);
    const pendingExpense = expenseItems.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalCount: items.length,
      totalIncome,
      totalExpense,
      pendingExpense,
      netBalance: totalIncome - totalExpense
    };
  }, [filteredReportTransactions]);

  // Trigger browser print
  const handlePrint = () => {
    // Inject print styles dynamically to ensure they're exactly localized
    const printStyleId = 'dynamic-print-styles';
    let styleElement = document.getElementById(printStyleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = printStyleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.innerHTML = `
      @media print {
        body {
          background-color: white !important;
          color: black !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        /* Hide entire web layout */
        body > div:not(#printable-report-area) {
          display: none !important;
          visibility: hidden !important;
        }
        #main-sidebar, header, .fixed, .modal-backdrop, #main-viewport, .no-print {
          display: none !important;
          visibility: hidden !important;
        }
        /* Show report container fullscreen */
        #printable-report-container-root {
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          background: white !important;
          visibility: visible !important;
          display: block !important;
        }
        #printable-report-area {
          visibility: visible !important;
          display: block !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          background: white !important;
        }
        @page {
          size: A4 portrait;
          margin: 1.5cm;
        }
        table {
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
      }
    `;

    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto" id="pdf-modal-root">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} id="pdf-modal-backdrop"></div>
      
      {/* Modal Box */}
      <div className="bg-slate-100 rounded-3xl w-full max-w-6xl z-10 shadow-2xl flex flex-col lg:flex-row h-[90vh] overflow-hidden border border-slate-200" id="pdf-modal-content">
        
        {/* Left Options controller Panel */}
        <div className="w-full lg:w-[350px] bg-white border-r border-slate-200 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar no-print" id="pdf-modal-sidebar">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Sliders className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800 text-sm">ตัวเลือกการออกใบรายงาน</span>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* Title override */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">ชื่อหัวข้อรายงาน</label>
              <textarea
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 transition focus:outline-none"
                rows={2}
                placeholder="พิมพ์กำหนดหัวข้อรายงาน..."
              />
            </div>

            {/* Filter 1: Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">ประเภทความเคลื่อนไหว</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setReportType('all'); setSelectedCategory('all'); }}
                  className={`py-1.5 rounded-lg text-[10px] text-center font-bold transition ${
                    reportType === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => { setReportType('income'); setSelectedCategory('all'); }}
                  className={`py-1.5 rounded-lg text-[10px] text-center font-bold transition ${
                    reportType === 'income' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  รายรับ
                </button>
                <button
                  type="button"
                  onClick={() => { setReportType('expense'); setSelectedCategory('all'); }}
                  className={`py-1.5 rounded-lg text-[10px] text-center font-bold transition ${
                    reportType === 'expense' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  รายจ่าย
                </button>
              </div>
            </div>

            {/* Filter 2: Category list */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">หมวดหมู่งบที่กรอง</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              >
                <option value="all">ทั้งหมดทุกหมวดหมู่</option>
                {reportType !== 'expense' && (
                  <>
                    <option value="เงินอุดหนุนรัฐบาล">เงินอุดหนุนรัฐบาล</option>
                    <option value="รายได้ภาษีบำรุงท้องที่">รายได้ภาษีบำรุงท้องที่</option>
                    <option value="ค่าธรรมเนียมและสิทธิ">ค่าธรรมเนียมและสิทธิ</option>
                    <option value="รายรับอื่น ๆ">รายรับอื่น ๆ</option>
                  </>
                )}
                {reportType !== 'income' && categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Filter 3: Status */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">สถานะทางคลัง</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              >
                <option value="all">ทั้งหมดทุกสถานะ</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="pending">รอการลงนามตรวจสอบ</option>
                <option value="rejected">ปฏิเสธไม่อนุมัติ</option>
              </select>
            </div>

            <hr className="border-slate-100" />

            {/* Layout Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">แสดงตรากองทุนหมู่บ้าน</p>
                  <p className="text-[10px] text-slate-400">แสดงวงตราน้ำเงินกองทุนด้านบน</p>
                </div>
                <input
                  type="checkbox"
                  checked={showSeal}
                  onChange={(e) => setShowSeal(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">แสดงกล่องพยานลงนาม</p>
                  <p className="text-[10px] text-slate-400">แสดงสามแถบลายเซ็นด้านท้ายกระดาษ</p>
                </div>
                <input
                  type="checkbox"
                  checked={showSignatures}
                  onChange={(e) => setShowSignatures(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Signatory Names */}
            {showSignatures && (
              <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100" id="signatory-names-container">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase">แก้ไขรายนามผู้ลงนามด้านล่าง</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">1. ผู้จัดทำ (ชื่อ / ตำแหน่ง)</label>
                  <div className="grid grid-cols-1 gap-1">
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      placeholder="ชื่อผู้จัดทำ"
                      className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={officerRole}
                      onChange={(e) => setOfficerRole(e.target.value)}
                      placeholder="ตำแหน่งผู้จัดทำ"
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded text-[10px] text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">2. ผู้ตรวจสอบ (ชื่อ / ตำแหน่ง)</label>
                  <div className="grid grid-cols-1 gap-1">
                    <input
                      type="text"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      placeholder="ชื่อผู้ตรวจสอบ"
                      className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={directorRole}
                      onChange={(e) => setDirectorRole(e.target.value)}
                      placeholder="ตำแหน่งผู้ตรวจสอบ"
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded text-[10px] text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">3. ผู้รับรอง/อนุมัติ (ชื่อ / ตำแหน่ง)</label>
                  <div className="grid grid-cols-1 gap-1">
                    <input
                      type="text"
                      value={mayorName}
                      onChange={(e) => setMayorName(e.target.value)}
                      placeholder="ชื่อผู้อนุมัติ"
                      className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={mayorRole}
                      onChange={(e) => setMayorRole(e.target.value)}
                      placeholder="ตำแหน่งผู้อนุมัติ"
                      className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded text-[10px] text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">หมายเหตุท้ายรายงาน (ถ้ามี)</label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="เช่น ข้อมูลนี้ยังไม่ถูกสรุปปิดยอดทางการประจำปี..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handlePrint}
              className="w-full bg-[#1e3a5f] hover:bg-[#112d4e] text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-blue-900/10"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงาน / บันทึก PDF (ไทย)</span>
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl text-xs font-semibold transition text-center"
            >
              กลับหน้าระบบควบคุมหลัก
            </button>
          </div>
        </div>

        {/* Right Preview Panel (Simulated A4 Paper Sheet Sheet) */}
        <div className="flex-1 bg-slate-500 p-8 overflow-y-auto flex justify-center custom-scrollbar" id="printable-report-container-root">
          
          <div 
            id="printable-report-area" 
            className="w-[21cm] min-h-[29.7cm] bg-white p-12 shadow-2xl relative text-black font-sans box-border flex flex-col justify-between"
            style={{ fontFamily: '"Prompt", "Inter", sans-serif' }}
          >
            
            <div className="space-y-6">
              {/* Report Header Block */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center space-x-4">
                  {showSeal ? (
                    <div className="w-16 h-16 rounded-full border-4 border-double border-[#1e3a5f] flex items-center justify-center bg-[#1e3a5f]/5 text-center flex-shrink-0">
                      <div className="text-[8px] font-extrabold text-[#1a365d] leading-none">
                        กองทุนหมู่บ้าน<br />
                        <span className="text-[6px] tracking-tighter">บ้านฉลีก</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-1d flex items-center justify-center opacity-30">
                      <FileText className="w-12 h-12" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 tracking-wider">เอกสารรายงานทางการกองทุนหมู่บ้าน</p>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">แบบรายงานดุลการเงินและสถิติ</h2>
                    <p className="text-[11px] text-slate-600 leading-normal font-medium">กองทุนหมู่บ้านฉลีก อ.เมือง จ.กาญจนบุรี 71000</p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500">
                  <p className="font-semibold text-slate-700">ปีงบประมาณ พ.ศ. {parseInt(currentYear) + 543} ({currentYear})</p>
                  <p className="mt-1">วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.</p>
                  <p>ประเภท: {reportType === 'all' ? 'บัญชีรายรับ-รายจ่ายทั้งหมด' : reportType === 'income' ? 'บัญชีแยกรายรับ' : 'บัญชีแยกรายจ่าย'}</p>
                </div>
              </div>

              {/* Main Custom Title */}
              <div className="text-center py-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-relaxed">{reportTitle}</h1>
                <p className="text-[11px] text-slate-500">สอดคล้องตามแผนคลังและงบประมาณกองทุนหมู่บ้านที่ระบุ {currentBudget.toLocaleString()} บาท</p>
              </div>

              {/* Quick Summary Cards (Grid) */}
              <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-left">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">1. รายรับสะสมจริง</span>
                  <span className="text-xs font-bold text-emerald-700 block mt-1">+{stats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })} บ.</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">อนุมัติเรียบร้อย</span>
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">2. รายจ่ายเบิกจริง</span>
                  <span className="text-xs font-bold text-red-650 block mt-1">-{stats.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })} บ.</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">สั่งจ่ายสมบูรณ์</span>
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">3. ดุลยอดเงินสะสม</span>
                  <span className={`text-xs font-bold block mt-1 ${stats.netBalance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    {stats.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} บ.
                  </span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">รายรับสุทธิ</span>
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">4. วงเงินรออนุมัติ</span>
                  <span className="text-xs font-bold text-orange-650 block mt-1">{stats.pendingExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })} บ.</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">รอส่งตรวจ</span>
                </div>
              </div>

              {/* Transaction entries details table */}
              <div>
                <table className="w-full text-left text-[11px] text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-black text-black font-bold uppercase">
                      <th className="py-2 text-center w-8">ลำดับ</th>
                      <th className="py-2 w-20">วันที่</th>
                      <th className="py-2">โครงการ / รายการธุรกรรม</th>
                      <th className="py-2 w-24">หมวดหมู่</th>
                      <th className="py-2 w-32">แหล่งรับ/ผู้เบิกเงิน</th>
                      <th className="py-2 text-center w-20">สถานะ</th>
                      <th className="py-2 text-right w-24">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReportTransactions.map((tx, idx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 font-mono text-slate-500">{tx.date}</td>
                        <td className="py-2.5">
                          <span className="font-bold text-slate-900">{tx.title}</span>
                          {tx.description && <span className="block text-[9px] text-slate-400 mt-0.5">{tx.description}</span>}
                        </td>
                        <td className="py-2.5">
                          <span className="text-[10px] font-semibold text-slate-600">{tx.category}</span>
                        </td>
                        <td className="py-2.5 text-slate-500 truncate max-w-[140px]">{tx.payerOrPayee || '-'}</td>
                        <td className="py-2.5 text-center">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            tx.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' :
                            tx.status === 'pending' ? 'bg-amber-50 text-amber-800 border border-amber-150' :
                            'bg-red-50 text-red-800 border border-red-150'
                          }`}>
                            {tx.status === 'approved' ? 'อนุมัติแล้ว' : tx.status === 'pending' ? 'รออนุมัติ' : 'ปฏิเสธ'}
                          </span>
                        </td>
                        <td className={`py-2.5 text-right font-bold font-mono text-[11px] ${tx.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                          {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {filteredReportTransactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                          -- ไม่พบรายการประวัติและเอกสารใด ๆ ตรงตามขอบข่ายการพิมพ์ที่กำหนด --
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Notes block */}
              {customNotes && (
                <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 text-[10px] text-slate-600 leading-relaxed">
                  <strong>หมายเหตุแนบท้ายเอกสารรายงาน:</strong> {customNotes}
                </div>
              )}
            </div>

            {/* Signature Block (bottom of page layout) */}
            {showSignatures && (
              <div className="grid grid-cols-3 gap-8 text-center text-[10.5px] mt-16 pt-8 border-t border-slate-100" id="report-signatures-print-section">
                
                {/* Signatory 1 */}
                <div className="flex flex-col justify-between h-28">
                  <p className="text-slate-500">ลงชื่อ......................................................ผู้จัดทำ</p>
                  <div>
                    <h5 className="font-bold text-slate-900">({officerName})</h5>
                    <p className="text-slate-400 text-[9px] mt-0.5">ตำแหน่ง {officerRole}</p>
                  </div>
                  <p className="text-slate-400 text-[9px]">วันที่........../........../..........</p>
                </div>

                {/* Signatory 2 */}
                <div className="flex flex-col justify-between h-28">
                  <p className="text-slate-500">ลงชื่อ......................................................ผู้ตรวจ</p>
                  <div>
                    <h5 className="font-bold text-slate-900">({directorName})</h5>
                    <p className="text-slate-400 text-[9px] mt-0.5">ตำแหน่ง {directorRole}</p>
                  </div>
                  <p className="text-slate-400 text-[9px]">วันที่........../........../..........</p>
                </div>

                {/* Signatory 3 */}
                <div className="flex flex-col justify-between h-28">
                  <p className="text-slate-500">ลงชื่อ......................................................อนุมัติ</p>
                  <div>
                    <h5 className="font-bold text-slate-900">({mayorName})</h5>
                    <p className="text-slate-400 text-[9px] mt-0.5">ตำแหน่ง {mayorRole}</p>
                  </div>
                  <p className="text-slate-400 text-[9px]">วันที่........../........../..........</p>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
