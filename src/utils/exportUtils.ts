export const exportToCsv = (data: any[], filename: string, columns?: string[]) => {
  if (!data || data.length === 0) {
    console.warn('No data to export.');
    return;
  }

  const headers = columns || Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.map(header => `"${header}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle null/undefined values and escape double quotes by replacing " with ""
      const stringValue = value === null || value === undefined ? '' : String(value).replace(/"/g, '""');
      return `"${stringValue}"`; // Quote every value
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToExcel = (data: any[], filename: string, columns?: string[]) => {
  if (!data || data.length === 0) {
    console.warn('No data to export.');
    return;
  }

  const headers = columns || Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.map(header => `"${header}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle null/undefined values and escape double quotes by replacing " with ""
      const stringValue = value === null || value === undefined ? '' : String(value).replace(/"/g, '""');
      return `"${stringValue}"`; // Quote every value
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  // Use a BOM (Byte Order Mark) for better compatibility with Excel, especially for non-ASCII characters
  const BOM = "\uFEFF"; 
  // Change MIME type to force Excel opening, and extension to .xls
  const blob = new Blob([BOM + csvString], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xls`); // Changed to .xls
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToWord = (data: any[], filename: string, columns?: string[]) => {
  if (!data || data.length === 0) {
    console.warn('No data to export.');
    return;
  }

  const headers = columns || Object.keys(data[0]);

  let tableHtml = '<table border="1" style="width:100%; border-collapse: collapse; font-size: 10pt;">';
  
  // Table Header
  tableHtml += '<thead><tr style="background-color:#f2f2f2;">';
  for (const header of headers) {
    tableHtml += `<th style="padding: 8px; text-align: left; border: 1px solid #ddd;">${header}</th>`;
  }
  tableHtml += '</tr></thead>';

  // Table Body
  tableHtml += '<tbody>';
  for (const row of data) {
    for (const header of headers) {
      const value = row[header] === null || row[header] === undefined ? '' : String(row[header]);
      tableHtml += `<td style="padding: 8px; border: 1px solid #ddd;">${value}</td>`;
    }
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody></table>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2c3e50; font-size: 18pt; margin-bottom: 10px; }
            p { color: #555; font-size: 10pt; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 9pt; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1>Laporan ${filename}</h1>
        <p>Tanggal Export: ${new Date().toLocaleDateString('id-ID')}</p>
        ${tableHtml}
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.doc`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};