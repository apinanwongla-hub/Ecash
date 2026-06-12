/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Category, BudgetConfig } from './types';

export const initialCategories: Category[] = [
  { id: 'cat1', name: 'ค่าสาธารณูปโภค', color: '#3b82f6', budgetLimit: 400000 },
  { id: 'cat2', name: 'ค่าตอบแทน', color: '#10b981', budgetLimit: 350000 },
  { id: 'cat3', name: 'ค่าใช้สอย', color: '#84cc16', budgetLimit: 300000 },
  { id: 'cat4', name: 'ค่าวัสดุ', color: '#f97316', budgetLimit: 255000 },
  { id: 'cat5', name: 'ค่าครุภัณฑ์และอื่นๆ', color: '#ef4444', budgetLimit: 195000 },
];

const currentBEYear = '2569';
const yearMinus1 = '2568';
const yearMinus2 = '2567';

export const initialBudgetConfigs: BudgetConfig[] = [
  { fiscalYear: currentBEYear, totalBudget: 1500000 },
  { fiscalYear: yearMinus1, totalBudget: 1200000 },
  { fiscalYear: yearMinus2, totalBudget: 1000000 },
];

export const initialTransactions: Transaction[] = [];
