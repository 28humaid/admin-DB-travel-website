import { Input } from '@/components/ui/input';
import Button from '@/components/common/button.jsx';
import DateFilterGroup from './dateFilterGroup';

const FilterControls = ({
  globalFilter,
  setGlobalFilter,
  tempBookingFrom,
  setTempBookingFrom,
  tempBookingTo,
  setTempBookingTo,
  tempTravelFrom,
  setTempTravelFrom,
  tempTravelTo,
  setTempTravelTo,
  bookingFromError,
  setBookingFromError,
  bookingToError,
  setBookingToError,
  travelFromError,
  setTravelFromError,
  travelToError,
  setTravelToError,
  handleDateSearch,
  handleResetFilters,
  records="bookings",
  tempRefundFrom,
  setTempRefundFrom,
  tempRefundTo,
  setTempRefundTo,
  refundFromError,
  setRefundFromError,
  refundToError,
  setRefundToError,
  children,
}) => {
  return (
    <div className="mb-4 flex flex-col gap-4">
        {/* PNR/BOOKING-ID SE SEARCH KRNE K LIYE  */}
      <div>
        <Input
          placeholder="Search PNR or Booking ID..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div
        className="flex flex-col md:flex-row gap-4 justify-between"
      >
        {records === "bookings" && 
          <>
            <DateFilterGroup
                label="Date of Booking Range"
                fromValue={tempBookingFrom}
                setFromValue={setTempBookingFrom}
                toValue={tempBookingTo}
                setToValue={setTempBookingTo}
                fromError={bookingFromError}
                setFromError={setBookingFromError}
                toError={bookingToError}
                setToError={setBookingToError}
            />
            <DateFilterGroup
                label="Date of Travel Range"
                fromValue={tempTravelFrom}
                setFromValue={setTempTravelFrom}
                toValue={tempTravelTo}
                setToValue={setTempTravelTo}
                fromError={travelFromError}
                setFromError={setTravelFromError}
                toError={travelToError}
                setToError={setTravelToError}
            />
          </>
        }
        {records === "refunds" &&
          <>
            {/* <div>I should be here for refunds!!</div> */}
            <DateFilterGroup
                label="Date of Refund Range"
                fromValue={tempRefundFrom}
                setFromValue={setTempRefundFrom}
                toValue={tempRefundTo}
                setToValue={setTempRefundTo}
                fromError={refundFromError}
                setFromError={setRefundFromError}
                toError={refundToError}
                setToError={setRefundToError}
            />
          </>
        }
      </div>
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleDateSearch}>
          Search Dates
        </Button>
        <Button variant="danger" onClick={handleResetFilters}>
          Reset All Filters
        </Button>
        {children}
      </div>
    </div>
  );
};

export default FilterControls;