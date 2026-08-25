import * as XLSX from 'xlsx';

export const exportToCSV = (expenses = [], filename = 'daily_expenses_report.csv') => {
  if (!expenses.length) return;

  const headers = ['ID', 'Date', 'Category', 'Amount (INR)', 'Payment Method', 'Payer/Member', 'Shared', 'Note'];
  const rows = expenses.map(e => [
    e.id,
    e.date,
    e.category,
    e.amount,
    e.paymentMethod,
    e.member || 'Self',
    e.isShared ? 'Yes' : 'No',
    `"${(e.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (expenses = [], filename = 'daily_expenses_report.xlsx') => {
  if (!expenses.length) return;

  const formattedData = expenses.map(e => ({
    'Date': e.date,
    'Category': e.category,
    'Amount (₹)': e.amount,
    'Payment Method': e.paymentMethod,
    'Member': e.member || 'Self',
    'Shared': e.isShared ? 'Yes' : 'No',
    'Note': e.note || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

  XLSX.writeFile(workbook, filename);
};
