import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInformationProps {
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountType: "PERCENTAGE" | "FIXED" | "SHIPPING";
  setDiscountType: (type: "PERCENTAGE" | "FIXED" | "SHIPPING") => void;
  discountValue: string;
  setDiscountValue: (value: string) => void;
  maxUses: string;
  setMaxUses: (maxUses: string) => void;
  errors: Record<string, string>;
  submitting: boolean;
}

export function BasicInformation({
  discountCode,
  setDiscountCode,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  maxUses,
  setMaxUses,
  errors,
  submitting,
}: BasicInformationProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="code" className="text-sm font-medium">
            Discount Code
          </Label>
          <Input
            id="code"
            placeholder="e.g., SUMMER2025"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            className={`mt-1 ${errors.code ? "border-red-500" : ""}`}
            disabled={submitting}
          />
          {errors.code && (
            <p className="text-sm text-red-500 mt-1">{errors.code}</p>
          )}
        </div>
        <div>
          <Label htmlFor="type" className="text-sm font-medium">
            Discount Type
          </Label>
          <select
            id="type"
            className="w-full h-10 px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={discountType}
            onChange={(e) =>
              setDiscountType(
                e.target.value as "PERCENTAGE" | "FIXED" | "SHIPPING"
              )
            }
            disabled={submitting}
          >
            <option value="PERCENTAGE">Percentage Discount</option>
            <option value="FIXED">Fixed Amount Discount</option>
            <option value="SHIPPING">Free Shipping</option>
          </select>
        </div>
        <div>
          <Label htmlFor="value" className="text-sm font-medium">
            Value
          </Label>
          <div className="relative mt-1">
            <Input
              id="value"
              type="number"
              placeholder="25"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className={`${errors.value ? "border-red-500" : ""}`}
              disabled={submitting || discountType === "SHIPPING"}
            />
            {discountType === "PERCENTAGE" && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                %
              </div>
            )}
          </div>
          {errors.value && (
            <p className="text-sm text-red-500 mt-1">{errors.value}</p>
          )}
        </div>
        <div>
          <Label htmlFor="maxUses" className="text-sm font-medium">
            Usage Limit
          </Label>
          <Input
            id="maxUses"
            type="number"
            placeholder="500"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className={`mt-1 ${errors.maxUses ? "border-red-500" : ""}`}
            disabled={submitting}
          />
          {errors.maxUses && (
            <p className="text-sm text-red-500 mt-1">{errors.maxUses}</p>
          )}
        </div>
      </div>
    </div>
  );
}
