import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Button from '@/components/common/button.jsx';
import { CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isValid, parse } from 'date-fns';

const DateFilterInput = ({ value, onChange, error, setError, placeholder, className }) => {
  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setError('');
        }}
        className={className}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="absolute right-0 top-0 h-full">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <DatePicker
            selected={typeof value === 'string' && value ? parse(value, 'dd-MM-yyyy', new Date()) : null}
            onChange={(date) => {
              onChange(date && isValid(date) ? format(date, 'dd-MM-yyyy') : '');
              setError('');
            }}
            inline
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default DateFilterInput;