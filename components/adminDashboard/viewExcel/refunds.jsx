'use client';
import BrLayout from './brLayout'; // Adjust path if different
import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from 'use-debounce';
import Button from '@/components/common/button.jsx';
import FilterControls from '../bookingsNrefunds/filterControls';
import TableHeaderWithFilter from '../bookingsNrefunds/tableHeaderWithFilter';
import { format, isValid, parse, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import TableSum from '../bookingsNrefunds/tableSum';
// import ExcelDownloadButton from '../bookingsNrefunds/excelDownloadButton';

const Refunds = ({ refunds, error }) => {
  console.log('refunds:', refunds);

  // State for filters
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [debouncedGlobalFilter] = useDebounce(globalFilter, 300);
  const [tempRefundFrom, setTempRefundFrom] = useState('');
  const [tempRefundTo, setTempRefundTo] = useState('');
  const [refundFromError, setRefundFromError] = useState('');
  const [refundToError, setRefundToError] = useState('');

  // Define columns
  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor('pnrNo', { header: 'PNR Number', filterFn: 'includesString' }),
      columnHelper.accessor('refundDate', {
        header: 'Refund Date',
        cell: (info) => {
          const date = new Date(info.getValue());
          return isValid(date) ? format(date, 'dd-MM-yyyy') : 'N/A';
        },
        filterFn: (row, columnId, filterValue) => {
          const rowDate = new Date(row.getValue(columnId));
          if (!isValid(rowDate)) return false;
          if (typeof filterValue === 'string' && filterValue) {
            const parsedFilter = parse(filterValue, 'dd-MM-yyyy', new Date());
            if (!isValid(parsedFilter)) return true;
            return format(rowDate, 'dd-MM-yyyy') === filterValue;
          } else if (Array.isArray(filterValue) && filterValue.length === 2) {
            const [from, to] = filterValue;
            if (!isValid(from) || !isValid(to)) return true;
            return isWithinInterval(rowDate, { start: from, end: to });
          }
          return true;
        },
      }),
      columnHelper.accessor('refund', {
        header: 'Refund Amount',
        cell: (info) => info.getValue() ?? 'N/A',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('corporate', { header: 'Corporate Name', filterFn: 'includesString' }),
    ],
    [],
  );

  // Handle date search
  const handleDateSearch = () => {
    const newFilters = [];
    const parseDate = (value) => {
      if (typeof value !== 'string' || !value) return null;
      return parse(value, 'dd-MM-yyyy', new Date());
    };

    // Refund Date
    const refundFrom = parseDate(tempRefundFrom);
    const refundTo = parseDate(tempRefundTo);
    setRefundFromError(tempRefundFrom && !isValid(refundFrom) ? 'Invalid Date' : '');
    setRefundToError(tempRefundTo && !isValid(refundTo) ? 'Invalid Date' : '');
    if (refundFrom && isValid(refundFrom) && refundTo && isValid(refundTo)) {
      newFilters.push({ id: 'refundDate', value: [startOfDay(refundFrom), endOfDay(refundTo)] });
    } else if (refundFrom && isValid(refundFrom)) {
      newFilters.push({ id: 'refundDate', value: [startOfDay(refundFrom), endOfDay(refundFrom)] });
    } else if (refundTo && isValid(refundTo)) {
      newFilters.push({ id: 'refundDate', value: [startOfDay(refundTo), endOfDay(refundTo)] });
    }

    // Preserve text column filters
    const existingTextFilters = columnFilters.filter(
      (f) => !['refundDate'].includes(f.id),
    );
    setColumnFilters([...existingTextFilters, ...newFilters]);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setGlobalFilter('');
    setColumnFilters([]);
    setTempRefundFrom('');
    setTempRefundTo('');
    setRefundFromError('');
    setRefundToError('');
  };

  // Initialize TanStack Table
  const table = useReactTable({
    data: refunds,
    columns,
    state: { globalFilter: debouncedGlobalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const pnr = row.getValue('pnrNo')?.toString().toLowerCase() || '';
      return pnr.includes(filterValue.toLowerCase());
    },
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <BrLayout heading="Refunds">
      {error ? (
        <div className="text-red-500 mt-4">{error}</div>
      ) : (
        <div>
          <FilterControls
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            tempRefundFrom={tempRefundFrom}
            setTempRefundFrom={setTempRefundFrom}
            tempRefundTo={tempRefundTo}
            setTempRefundTo={setTempRefundTo}
            refundFromError={refundFromError}
            setRefundFromError={setRefundFromError}
            refundToError={refundToError}
            setRefundToError={setRefundToError}
            handleDateSearch={handleDateSearch}
            handleResetFilters={handleResetFilters}
            records="refunds"
          >
            {/* <ExcelDownloadButton
              table={table}
              columns={columns}
              filename="refunds.xlsx"
              greetingsMessage="Thank you for using our system!"
            /> */}
          </FilterControls>
          <TableSum table={table} columnAccessor="refund" label="Total Refund Amount" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHeaderWithFilter
                        key={header.id}
                        header={header}
                        isDateColumn={['refundDate'].includes(header.column.id)}
                      />
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No refunds found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="primary"
              size="medium"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="primary"
              size="medium"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </BrLayout>
  );
};

export default Refunds;