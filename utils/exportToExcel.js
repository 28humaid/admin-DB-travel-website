import ExcelJS from 'exceljs';
import { format, isValid } from 'date-fns';
import { saveAs } from 'file-saver';

const exportToExcel = async (rows, columns, filename, greetingsMessage) => {
  const formatToMMMYYYY = (dateString) => {
      if (!dateString) return '';
      
      // If it's already in a recognizable date format, parse and format it
      const date = new Date(dateString);
      return isValid(date) ? format(date, 'MMM-yyyy') : '';
    };
  try {
    // console.log('Exporting to Excel with:');
    // console.log('Rows:', rows);
    // console.log('Columns:', columns);
    // console.log('Filename:', filename);
    // console.log('Greetings Message:', greetingsMessage);

    // Validate inputs
    if (!columns || !Array.isArray(columns)) {
      throw new Error('Columns array is invalid or missing');
    }
    if (!rows || !Array.isArray(rows)) {
      throw new Error('Rows array is invalid or missing');
    }

    // Validate browser APIs
    if (!window.Blob || !window.URL || !window.URL.createObjectURL) {
      throw new Error('Required browser APIs (Blob or URL.createObjectURL) are not available');
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1', {
      properties: { defaultColWidth: 15 }, // Default column width for readability
    });

    // Add greetings message (default style or optional custom style)
    worksheet.addRow([greetingsMessage || 'Thank you for using our system!']).commit();
    worksheet.addRow([]).commit(); // Blank row

    // Add headers with bold font and size 14
    const headers = columns.map((column) => column.header || 'N/A');
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 14 }; // Bold, size 14 for headers
    });
    headerRow.commit();

    // Add filtered row data with font size 12, non-bold
    rows.forEach((row, rowIndex) => {
      const rowData = columns.map((column, colIndex) => {
        const accessor = column.accessorKey || column.id;
        if (!accessor) {
          console.warn(`Column at index ${colIndex} has no accessorKey or id`, column);
          return 'N/A';
        }
        let value;
        try {
          value = row.getValue(accessor);
        } catch (error) {
          console.warn(`Error accessing value for column ${accessor} in row ${rowIndex}:`, error);
          return 'N/A';
        }
        if (['date_of_booking', 'date_of_travel', 'refund_date'].includes(accessor)) {
          const date = new Date(value);
          return isValid(date) ? format(date, 'dd-MM-yyyy') : 'N/A';
        }
        // Format statement_period → "MMM-yyyy"
        if (accessor === "statement_period") {
          return formatToMMMYYYY(value);
        }
        return value ?? 'N/A';
      });
      const dataRow = worksheet.addRow(rowData);
      dataRow.eachCell((cell) => {
        cell.font = { bold: false, size: 12 }; // Non-bold, size 12 for data
      });
      dataRow.commit();
    });

    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column, index) => {
      let maxLength = headers[index]?.length || 10;
      rows.forEach((row) => {
        const value = row.getValue(columns[index].accessorKey) ?? 'N/A';
        const length = value.toString().length;
        if (length > maxLength) maxLength = length;
      });
      column.width = Math.min(Math.max(maxLength + 5, 10), 50); // Min 10, max 50
    });

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename || 'export.xlsx');
    console.log('Excel file written successfully');
  } catch (error) {
    console.error('Error generating Excel file:', error);
    alert(`Failed to generate Excel file: ${error.message}. Please check the console for details.`);
  }
};

export default exportToExcel