import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatRows(transactions) {
  return transactions.map((txn, i) => ({
    'S.No': i + 1,
    Date: txn.date,
    Type: txn.type === 'income' ? 'Income' : 'Expense',
    Category: txn.category,
    Description: txn.description || '',
    'Payee / Vendor': txn.payeeVendor || '',
    'Amount (INR)': txn.amount,
    'Payment Mode': txn.paymentMode || '',
    'Expensed By': txn.approvedBy || '',
    'Project / Dept': txn.projectDepartment || '',
    Details: txn.transactionDetails || '',
  }));
}

function summaryRows(transactions) {
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense };
}

export function exportToExcel(transactions, filename = 'Transactions') {
  const rows = formatRows(transactions);
  const { totalIncome, totalExpense, netBalance } = summaryRows(transactions);

  rows.push({});
  rows.push({ 'S.No': '', Date: '', Type: '', Category: 'Total Income', Description: '', 'Payee / Vendor': '', 'Amount (INR)': totalIncome, 'Payment Mode': '', 'Expensed By': '', 'Project / Dept': '', Details: '' });
  rows.push({ 'S.No': '', Date: '', Type: '', Category: 'Total Expense', Description: '', 'Payee / Vendor': '', 'Amount (INR)': totalExpense, 'Payment Mode': '', 'Expensed By': '', 'Project / Dept': '', Details: '' });
  rows.push({ 'S.No': '', Date: '', Type: '', Category: 'Net Balance', Description: '', 'Payee / Vendor': '', 'Amount (INR)': netBalance, 'Payment Mode': '', 'Expensed By': '', 'Project / Dept': '', Details: '' });

  const ws = XLSX.utils.json_to_sheet(rows);

  const colWidths = [6, 12, 9, 16, 24, 18, 14, 14, 14, 16, 20];
  ws['!cols'] = colWidths.map((w) => ({ wch: w }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(transactions, filename = 'Transactions') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Bandhanam Management - Transactions Report', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | Total: ${transactions.length} transactions`, 14, 22);

  const headers = [['#', 'Date', 'Type', 'Category', 'Description', 'Payee/Vendor', 'Amount', 'Mode', 'Expensed By', 'Project']];

  const body = transactions.map((txn, i) => [
    i + 1,
    txn.date,
    txn.type === 'income' ? 'Income' : 'Expense',
    txn.category,
    txn.description || '-',
    txn.payeeVendor || '-',
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(txn.amount),
    txn.paymentMode || '-',
    txn.approvedBy || '-',
    txn.projectDepartment || '-',
  ]);

  const { totalIncome, totalExpense, netBalance } = summaryRows(transactions);
  const fmt = (v) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v);

  body.push([]);
  body.push(['', '', '', 'Total Income', '', '', fmt(totalIncome), '', '', '']);
  body.push(['', '', '', 'Total Expense', '', '', fmt(totalExpense), '', '', '']);
  body.push(['', '', '', 'Net Balance', '', '', fmt(netBalance), '', '', '']);

  autoTable(doc, {
    head: headers,
    body,
    startY: 26,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 8 },
      6: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell(data) {
      const lastRows = body.length;
      if (data.section === 'body' && data.row.index >= lastRows - 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [235, 240, 248];
      }
    },
  });

  doc.save(`${filename}.pdf`);
}
