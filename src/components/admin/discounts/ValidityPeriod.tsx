import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CustomDatePicker } from "./CustomDatePicker";

interface ValidityPeriodProps {
  startDateObj: Date;
  endDateObj: Date;
  handleStartDateChange: (date: Date | null) => void;
  handleEndDateChange: (date: Date | null) => void;
  setDateRange: (days: number) => void;
  errors: Record<string, string>;
  submitting: boolean;
}

export function ValidityPeriod({
  startDateObj,
  endDateObj,
  handleStartDateChange,
  handleEndDateChange,
  setDateRange,
  errors,
  submitting,
}: ValidityPeriodProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Validity Period</h2>
      <DateRangeSelector setDateRange={setDateRange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="startDate" className="text-sm font-medium">
            Start Date
          </Label>
          <DatePicker
            selected={startDateObj}
            onChange={handleStartDateChange}
            dateFormat="MM/dd/yyyy"
            showMonthDropdown
            showYearDropdown
            todayButton="Today"
            dropdownMode="select"
            popperPlacement="bottom-start"
            popperProps={{
              strategy: "fixed",
            }}
            customInput={
              <CustomDatePicker
                error={errors.startDate}
                placeholder="mm/dd/yyyy"
                submitting={submitting}
              />
            }
          />
          {errors.startDate && (
            <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
          )}
        </div>
        <div>
          <Label htmlFor="endDate" className="text-sm font-medium">
            End Date
          </Label>
          <DatePicker
            selected={endDateObj}
            onChange={handleEndDateChange}
            dateFormat="MM/dd/yyyy"
            showMonthDropdown
            showYearDropdown
            todayButton="Today"
            dropdownMode="select"
            minDate={new Date(startDateObj.getTime() + 86400000)} // One day after start date
            popperPlacement="bottom-start"
            popperProps={{
              strategy: "fixed",
            }}
            customInput={
              <CustomDatePicker
                error={errors.endDate}
                placeholder="mm/dd/yyyy"
                submitting={submitting}
              />
            }
          />
          {errors.endDate && (
            <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Add a simple component for the date range selector
function DateRangeSelector({
  setDateRange,
}: {
  setDateRange: (days: number) => void;
}) {
  return (
    <div className="flex justify-end space-x-2 mb-2">
      <span className="text-xs text-gray-500 mr-1 self-center">
        Quick select:
      </span>
      <button
        type="button"
        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
        onClick={() => setDateRange(7)}
      >
        7 days
      </button>
      <button
        type="button"
        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
        onClick={() => setDateRange(30)}
      >
        30 days
      </button>
      <button
        type="button"
        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
        onClick={() => setDateRange(90)}
      >
        90 days
      </button>
    </div>
  );
}
