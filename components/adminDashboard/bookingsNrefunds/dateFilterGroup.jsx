import DateFilterInput from './dateFilterInput';

const DateFilterGroup = ({
  label,
  fromValue,
  setFromValue,
  toValue,
  setToValue,
  fromError,
  setFromError,
  toError,
  setToError,
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{label}</h3>
      <div className="flex flex-col md:flex-row gap-2">
        <DateFilterInput
          value={fromValue}
          onChange={setFromValue}
          error={fromError}
          setError={setFromError}
          placeholder="From (DD-MM-YYYY)"
        //   className="max-w-[150px]"
        />
        <DateFilterInput
          value={toValue}
          onChange={setToValue}
          error={toError}
          setError={setToError}
          placeholder="To (DD-MM-YYYY)"
        //   className="max-w-[150px]"
        />
      </div>
    </div>
  );
};

export default DateFilterGroup;