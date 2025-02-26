"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Discount } from "@/types/discount";
import { createDiscount } from "@/services/discount-service";
import "react-datepicker/dist/react-datepicker.css";
import { BasicInformation } from "./discounts/BasicInformation";
import { ValidityPeriod } from "./discounts/ValidityPeriod";
import { DiscountConditions } from "./discounts/DiscountConditions";
import { DiscountFormActions } from "./discounts/DiscountFormActions";

interface DiscountFormProps {
  discount?: Discount;
  isEditing?: boolean;
}

export function DiscountForm({
  discount,
  isEditing = false,
}: DiscountFormProps) {
  const router = useRouter();

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState(discount?.code || "");
  const [discountType, setDiscountType] = useState<
    "PERCENTAGE" | "FIXED" | "SHIPPING"
  >(
    discount?.type === "PERCENTAGE"
      ? "PERCENTAGE"
      : discount?.type === "FIXED"
      ? "FIXED"
      : discount?.type === "SHIPPING"
      ? "SHIPPING"
      : "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState(
    discount?.value?.toString() || ""
  );
  const [minPurchase, setMinPurchase] = useState(
    discount?.minPurchase?.toString() || ""
  );
  const [maxUses, setMaxUses] = useState(
    discount?.usage?.max?.toString() || ""
  );

  // Parse date strings to Date objects for the DatePicker
  const [startDateObj, setStartDateObj] = useState<Date>(
    discount?.startDate ? new Date(discount.startDate) : new Date()
  );
  const [endDateObj, setEndDateObj] = useState<Date>(
    discount?.endDate
      ? new Date(discount.endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  // Handle date changes from the date picker
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDateObj(date);

      // If end date is now before or equal to start date, adjust it to be one day after
      if (endDateObj <= date) {
        const newEndDate = new Date(date);
        newEndDate.setDate(newEndDate.getDate() + 1); // Add one day
        setEndDateObj(newEndDate);
      }
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDateObj(date);
    }
  };

  const [isActive] = useState(discount?.status === "Active" || false);
  const [customerGroups, setCustomerGroups] = useState<string[]>(
    discount?.customerGroups || []
  );

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleCustomerGroup = (group: string) => {
    if (customerGroups.includes(group)) {
      setCustomerGroups(customerGroups.filter((g) => g !== group));
    } else {
      setCustomerGroups([...customerGroups, group]);
    }
  };

  // Function to set a range of days from today
  const setDateRange = (days: number) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    setStartDateObj(today);
    setEndDateObj(futureDate);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    // Client-side validation
    const validationErrors: Record<string, string> = {};

    if (!discountCode.trim()) {
      validationErrors.code = "Discount code is required";
    } else if (!/^[A-Z0-9_]+$/.test(discountCode)) {
      validationErrors.code =
        "Code must contain only uppercase letters, numbers, and underscores";
    }

    if (!discountValue && discountType !== "SHIPPING") {
      validationErrors.value = "Discount value is required";
    } else if (discountType === "PERCENTAGE" && Number(discountValue) > 100) {
      validationErrors.value = "Percentage discount cannot exceed 100%";
    }

    // Validate dates
    if (!startDateObj) {
      validationErrors.startDate = "Start date is required";
    }

    if (!endDateObj) {
      validationErrors.endDate = "End date is required";
    }

    if (startDateObj && endDateObj && endDateObj <= startDateObj) {
      validationErrors.endDate = "End date must be after start date";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitting(false);
      return;
    }

    try {
      // Prepare discount data for API
      const discountData: Partial<Discount> = {
        code: discountCode,
        type: discountType,
        value: Number(discountValue),
        minPurchase: minPurchase ? Number(minPurchase) : undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        status: isActive ? "Active" : "Scheduled",
        customerGroups,
      };

      if (isEditing && discount) {
        // Update existing discount - in a real app, this would be an API call
        // For now, just simulate success
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success(`Discount ${discountCode} updated successfully`);
      } else {
        // Create new discount using our API service
        const newDiscount = await createDiscount(discountData);
        toast.success(`Discount ${newDiscount.code} created successfully`);
      }

      // Redirect back to discounts page
      router.push("/admin/discounts");
      router.refresh();
    } catch (error) {
      // Changed 'e' to '_error' to indicate it's intentionally unused
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          {/* Basic Information */}
          <BasicInformation
            discountCode={discountCode}
            setDiscountCode={setDiscountCode}
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            maxUses={maxUses}
            setMaxUses={setMaxUses}
            errors={errors}
            submitting={submitting}
          />

          {/* Validity Period */}
          <ValidityPeriod
            startDateObj={startDateObj}
            endDateObj={endDateObj}
            handleStartDateChange={handleStartDateChange}
            handleEndDateChange={handleEndDateChange}
            setDateRange={setDateRange}
            errors={errors}
            submitting={submitting}
          />

          {/* Conditions */}
          <DiscountConditions
            minPurchase={minPurchase}
            setMinPurchase={setMinPurchase}
            customerGroups={customerGroups}
            toggleCustomerGroup={toggleCustomerGroup}
            errors={errors}
            submitting={submitting}
          />
        </CardContent>

        <CardFooter>
          <DiscountFormActions submitting={submitting} isEditing={isEditing} />
        </CardFooter>
      </form>
    </Card>
  );
}
