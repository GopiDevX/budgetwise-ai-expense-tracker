export const exportToCSV = (transactions) => {
  if (!transactions || transactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  // Define headers
  const headers = ["Date", "Description", "Type", "Category", "Amount"];
  
  // Format data
  const csvRows = transactions.map(tx => {
    return [
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`, // Escape quotes
      tx.type,
      tx.category,
      tx.amount
    ].join(",");
  });

  // Combine headers and rows
  const csvContent = [headers.join(","), ...csvRows].join("\n");

  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `budgetwise-transactions-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
