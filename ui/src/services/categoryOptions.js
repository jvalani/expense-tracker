export const incomeCategories = [
  'Salary',
  'Freelance',
  'Business',
  'Bonus',
  'Investments',
  'Rental',
  'Gift',
  'Other Income',
];

export const expenseCategories = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Shopping',
  'Healthcare',
  'Entertainment',
  'Education',
  'Travel',
  'Insurance',
  'Bills',
  'Other Expense',
];

export const allCategories = Array.from(
  new Set([...incomeCategories, ...expenseCategories])
);
