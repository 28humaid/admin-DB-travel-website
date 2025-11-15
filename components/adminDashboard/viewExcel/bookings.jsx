'use client';
import BrLayout from './brLayout';
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
// import DateFilterInput from '@/components/bookings/DateFilterInput';
// import DateFilterGroup from '@/components/bookings/DateFilterGroup';


const Bookings = ({ bookings, error }) => {
  console.log('bookings:', bookings);

  // State for filters
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [debouncedGlobalFilter] = useDebounce(globalFilter, 300);
  const [tempBookingFrom, setTempBookingFrom] = useState('');
  const [tempBookingTo, setTempBookingTo] = useState('');
  const [tempTravelFrom, setTempTravelFrom] = useState('');
  const [tempTravelTo, setTempTravelTo] = useState('');
  const [bookingFromError, setBookingFromError] = useState('');
  const [bookingToError, setBookingToError] = useState('');
  const [travelFromError, setTravelFromError] = useState('');
  const [travelToError, setTravelToError] = useState('');

  // Define columns
  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor('bookingId', {
        header: 'Booking ID',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('charges', {
        header: 'Charges',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('class', {
        header: 'Class',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('corporateName', {
        header: 'Corporate Name',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('dateOfBooking', {
        header: 'Date of Booking',
        cell: (info) => {
          const date = new Date(info.getValue());
          return isValid(date) ? format(date, 'dd-MM-yyyy') : 'Invalid Date';
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
      columnHelper.accessor('dateOfTravel', {
        header: 'Date of Travel',
        cell: (info) => {
          const date = new Date(info.getValue());
          return isValid(date) ? format(date, 'dd-MM-yyyy') : 'Invalid Date';
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
      columnHelper.accessor('destinationStn', {
        header: 'Destination Station',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('entityName', {
        header: 'Entity Name',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('gst18', {
        header: 'GST (18%)',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('gstNo', {
        header: 'GST Number',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('invoiceNo', {
        header: 'Invoice Number',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('noOfPax', {
        header: 'No. of Passengers',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('nttBillNo', {
        header: 'NTT Bill Number',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('originStn', {
        header: 'Origin Station',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('passengerName', {
        header: 'Passenger Name',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('pnrTicket', {
        header: 'PNR Ticket',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('quota', {
        header: 'Quota',
        filterFn: 'includesString',
      }),
      // columnHelper.accessor('sNo', {
      //   header: 'Serial Number',
      //   filterFn: 'includesString',
      // }),
      columnHelper.accessor('sector', {
        header: 'Sector',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('statementPeriod', {
        header: 'Statement Period',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('ticketAmount', {
        header: 'Ticket Amount',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('totalAmount', {
        header: 'Total Amount',
        filterFn: 'includesString',
      }),
      columnHelper.accessor('vendeeName', {
        header: 'Vendee Name',
        filterFn: 'includesString',
      }),
    ],
    [],
  );

  // Handle date search button click
  const handleDateSearch = () => {
    const newFilters = [];
    const parseDate = (value) => {
      if (typeof value !== 'string' || !value) return null;
      return parse(value, 'dd-MM-yyyy', new Date());
    };

    // Validate and set Date of Booking range
    const bookingFrom = parseDate(tempBookingFrom);
    const bookingTo = parseDate(tempBookingTo);
    setBookingFromError(tempBookingFrom && !isValid(bookingFrom) ? 'Invalid Date' : '');
    setBookingToError(tempBookingTo && !isValid(bookingTo) ? 'Invalid Date' : '');
    if (bookingFrom && isValid(bookingFrom) && bookingTo && isValid(bookingTo)) {
      newFilters.push({ id: 'dateOfBooking', value: [startOfDay(bookingFrom), endOfDay(bookingTo)] });
    } else if (bookingFrom && isValid(bookingFrom)) {
      newFilters.push({ id: 'dateOfBooking', value: [startOfDay(bookingFrom), endOfDay(bookingFrom)] });
    } else if (bookingTo && isValid(bookingTo)) {
      newFilters.push({ id: 'dateOfBooking', value: [startOfDay(bookingTo), endOfDay(bookingTo)] });
    }

    // Validate and set Date of Travel range
    const travelFrom = parseDate(tempTravelFrom);
    const travelTo = parseDate(tempTravelTo);
    setTravelFromError(tempTravelFrom && !isValid(travelFrom) ? 'Invalid Date' : '');
    setTravelToError(tempTravelTo && !isValid(travelTo) ? 'Invalid Date' : '');
    if (travelFrom && isValid(travelFrom) && travelTo && isValid(travelTo)) {
      newFilters.push({ id: 'dateOfTravel', value: [startOfDay(travelFrom), endOfDay(travelTo)] });
    } else if (travelFrom && isValid(travelFrom)) {
      newFilters.push({ id: 'dateOfTravel', value: [startOfDay(travelFrom), endOfDay(travelFrom)] });
    } else if (travelTo && isValid(travelTo)) {
      newFilters.push({ id: 'dateOfTravel', value: [startOfDay(travelTo), endOfDay(travelTo)] });
    }

    // Preserve existing text column filters
    const existingTextFilters = columnFilters.filter(
      (f) => f.id !== 'dateOfBooking' && f.id !== 'dateOfTravel',
    );
    setColumnFilters([...existingTextFilters, ...newFilters]);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setGlobalFilter('');
    setColumnFilters([]);
    setTempBookingFrom('');
    setTempBookingTo('');
    setTempTravelFrom('');
    setTempTravelTo('');
    setBookingFromError('');
    setBookingToError('');
    setTravelFromError('');
    setTravelToError('');
  };

  // Initialize TanStack Table
  const table = useReactTable({
    data: bookings,
    columns,
    state: { globalFilter: debouncedGlobalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const pnr = row.getValue('pnrTicket')?.toString().toLowerCase() || '';
      const bookingId = row.getValue('bookingId')?.toString().toLowerCase() || '';
      return pnr.includes(filterValue.toLowerCase()) || bookingId.includes(filterValue.toLowerCase());
    },
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <BrLayout heading="Bookings">
      {error ? (
        <div className="text-red-500 mt-4">{error}</div>
      ) : (
        <div>
          <FilterControls
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            tempBookingFrom={tempBookingFrom}
            setTempBookingFrom={setTempBookingFrom}
            tempBookingTo={tempBookingTo}
            setTempBookingTo={setTempBookingTo}
            tempTravelFrom={tempTravelFrom}
            setTempTravelFrom={setTempTravelFrom}
            tempTravelTo={tempTravelTo}
            setTempTravelTo={setTempTravelTo}
            bookingFromError={bookingFromError}
            setBookingFromError={setBookingFromError}
            bookingToError={bookingToError}
            setBookingToError={setBookingToError}
            travelFromError={travelFromError}
            setTravelFromError={setTravelFromError}
            travelToError={travelToError}
            setTravelToError={setTravelToError}
            handleDateSearch={handleDateSearch}
            handleResetFilters={handleResetFilters}
          >
            {/* <ExcelDownloadButton
              table={table}
              columns={columns}
              filename="bookings.xlsx"
              greetingsMessage="Thank you for using our system!"
            /> */}
          </FilterControls>
          <TableSum table={table} columnAccessor="totalAmount" label="Total Amount" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHeaderWithFilter
                        key={header.id}
                        header={header}
                        isDateColumn={['dateOfBooking', 'dateOfTravel'].includes(header.column.id)}
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
                      No bookings found.
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

export default Bookings;