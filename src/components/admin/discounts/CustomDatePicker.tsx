import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

// Define a proper type for the CustomInput props
interface CustomDatePickerProps {
  value?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  submitting: boolean;
}

export function CustomDatePicker({
  value,
  onClick,
  onChange,
  error,
  placeholder,
  submitting,
}: CustomDatePickerProps) {
  return (
    <div className="relative mt-1">
      <Input
        value={value}
        onClick={onClick}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1 custom-datepicker-input ${
          error ? "border-red-500" : ""
        }`}
        disabled={submitting}
        readOnly // Make it read-only to ensure the date picker is used
      />
      <div
        className="absolute inset-y-0 right-0 flex items-center pr-3 custom-datepicker-icon"
        onClick={onClick}
        title="Click to open calendar"
      >
        <Calendar className="h-4 w-4 text-gray-400 hover:text-indigo-600 transition-colors" />
      </div>
    </div>
  );
}
