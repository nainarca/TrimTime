import { Component } from '@angular/core';

interface Expense {
  date: Date;
  category: string;
  amount: number;
  note?: string;
}

interface Purchase {
  date: Date;
  vendor: string;
  amount: number;
  note?: string;
}

interface SalaryItem {
  name: string;
  role: string;
  amount: number;
}

@Component({
  selector: 'tt-finance-page',
  templateUrl: './finance.page.html',
  styleUrls: ['./finance.page.scss'],
})
export class FinancePageComponent {
  // Expenses
  expenses: Expense[] = [];
  expensesDialogVisible = false;
  newExpense: Expense = { date: new Date(), category: '', amount: 0, note: '' };

  // Purchases
  purchases: Purchase[] = [];
  purchasesDialogVisible = false;
  newPurchase: Purchase = { date: new Date(), vendor: '', amount: 0, note: '' };

  // Salaries
  salaries: SalaryItem[] = [];
  salariesDialogVisible = false;
  newSalary: SalaryItem = { name: '', role: '', amount: 0 };

  // Profit summary chart (placeholder data)
  profitChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Profit',
        data: [1200, 900, 1500, 1300, 1700, 1900],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  profitChartOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { ticks: { color: '#64748b' } },
      y: { ticks: { color: '#64748b' } },
    },
  };

  // CRUD helpers (currently client-side only; wire to GraphQL later)
  saveExpense(): void {
    this.expenses.push({ ...this.newExpense });
    this.expensesDialogVisible = false;
    this.newExpense = { date: new Date(), category: '', amount: 0, note: '' };
  }

  savePurchase(): void {
    this.purchases.push({ ...this.newPurchase });
    this.purchasesDialogVisible = false;
    this.newPurchase = { date: new Date(), vendor: '', amount: 0, note: '' };
  }

  saveSalary(): void {
    this.salaries.push({ ...this.newSalary });
    this.salariesDialogVisible = false;
    this.newSalary = { name: '', role: '', amount: 0 };
  }
}

