import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DiscountConditionsProps {
  minPurchase: string;
  setMinPurchase: (value: string) => void;
  customerGroups: string[];
  toggleCustomerGroup: (group: string) => void;
  errors: Record<string, string>;
  submitting: boolean;
}

export function DiscountConditions({
  minPurchase,
  setMinPurchase,
  customerGroups,
  toggleCustomerGroup,
  errors,
  submitting,
}: DiscountConditionsProps) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-4">Conditions</h2>
      <div className="space-y-6">
        <div>
          <Label htmlFor="minPurchase" className="text-sm font-medium">
            Minimum Purchase Amount
          </Label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              $
            </div>
            <Input
              id="minPurchase"
              type="number"
              placeholder="100"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              className={`pl-6 ${errors.minPurchase ? "border-red-500" : ""}`}
              disabled={submitting}
            />
          </div>
          {errors.minPurchase && (
            <p className="text-sm text-red-500 mt-1">{errors.minPurchase}</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium mb-2">Customer Groups</Label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-customers"
                checked={customerGroups.includes("All Customers")}
                onCheckedChange={() => toggleCustomerGroup("All Customers")}
              />
              <label
                htmlFor="all-customers"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                All Customers
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vip-members"
                checked={customerGroups.includes("VIP Members")}
                onCheckedChange={() => toggleCustomerGroup("VIP Members")}
              />
              <label
                htmlFor="vip-members"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                VIP Members
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="first-time"
                checked={customerGroups.includes("First-time Customers")}
                onCheckedChange={() =>
                  toggleCustomerGroup("First-time Customers")
                }
              />
              <label
                htmlFor="first-time"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                First-time Customers
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
