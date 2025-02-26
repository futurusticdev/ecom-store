import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DiscountFormActionsProps {
  submitting: boolean;
  isEditing: boolean;
}

export function DiscountFormActions({
  submitting,
  isEditing,
}: DiscountFormActionsProps) {
  const router = useRouter();

  return (
    <div className="flex justify-end space-x-4 pt-2 pb-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/admin/discounts")}
        disabled={submitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? "Updating..." : "Creating..."}
          </>
        ) : isEditing ? (
          "Update Discount"
        ) : (
          "Create Discount"
        )}
      </Button>
    </div>
  );
}
