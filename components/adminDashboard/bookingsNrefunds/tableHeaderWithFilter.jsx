import { flexRender } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Button from '@/components/common/button.jsx';
import { CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isValid, parse } from 'date-fns';
import { TableHead } from '@/components/ui/table';

const TableHeaderWithFilter = ({ header, isDateColumn }) => {
  return (
    <TableHead className="text-left">
      {flexRender(header.column.columnDef.header, header.getContext())}
      {header.column.getCanFilter() ? (
        <div className="my-2 relative">
          {isDateColumn ? (
            <>
              <Input
                placeholder="DD-MM-YYYY"
                // placeholder="Search"
                value={header.column.getFilterValue() ?? ''}
                onChange={(e) => header.column.setFilterValue(e.target.value)}
                className="w-[160px]"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="absolute right-0 top-0 h-full">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    selected={
                      typeof header.column.getFilterValue() === 'string' &&
                      header.column.getFilterValue()
                        ? parse(header.column.getFilterValue(), 'dd-MM-yyyy', new Date())
                        : null
                    }
                    onChange={(date) =>
                      header.column.setFilterValue(
                        date && isValid(date) ? format(date, 'dd-MM-yyyy') : ''
                      )
                    }
                    inline
                  />
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Input
              placeholder={`Filter ${header.column.columnDef.header}...`}
              // placeholder="Search"
              value={header.column.getFilterValue() ?? ''}
              onChange={(e) => header.column.setFilterValue(e.target.value)}
              className="w-[160px]"
            />
          )}
        </div>
      ) : null}
    </TableHead>
  );
};

export default TableHeaderWithFilter;