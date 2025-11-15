import Button from '@/components/common/button.jsx';
import exportToExcel from '@/utils/exportToExcel';

const ExcelDownloadButton = ({ table, columns, filename, greetingsMessage }) => {
  const handleDownload = async () => {
    if (table.getRowModel().rows.length === 0) {
      alert('No data to download.');
      return;
    }
    await exportToExcel(table.getRowModel().rows, columns, filename, greetingsMessage);
  };

  return (
    <Button variant="primary" size="medium" onClick={handleDownload}>
      Download as Excel
    </Button>
  );
};

export default ExcelDownloadButton;