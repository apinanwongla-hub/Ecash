/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: string;
  description?: string;
  payerOrPayee?: string;
  status: 'approved' | 'pending' | 'rejected';
  fiscalYear: string; // e.g., "2566", "2565", "2564"
  attachmentName?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color, e.g. "bg-blue-500", or HEX
  budgetLimit: number;
}

export interface BudgetConfig {
  fiscalYear: string;
  totalBudget: number;
}
