export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  user_id: string | null;
  created_at: string;
}

export interface Transfer {
  id: string;
  user_id: string;
  amount: number;
  transfer_date: string;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  transfer_id: string | null;
  category_id: string | null;
  description: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

export interface ExpenseWithCategory extends Expense {
  categories: Category | null;
}

export interface CategorySummary {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithCategory extends Budget {
  categories: Category;
}

export interface BudgetStatus {
  budget: BudgetWithCategory;
  spent: number;
  remaining: number;
  percentage: number;
  isOver: boolean;
}

export interface MonthlyStats {
  month: string;
  totalExpense: number;
  totalIncome: number;
  balance: number;
  categoryBreakdown: CategorySummary[];
}

export interface SpendingInsight {
  type: "highest_category" | "spending_change" | "budget_warning" | "saving_streak" | "daily_average";
  title: string;
  description: string;
  severity: "info" | "warning" | "success" | "danger";
  value?: number;
}

export interface DailySpending {
  date: string;
  total: number;
}

export type PeriodType = "week" | "month" | "custom";
