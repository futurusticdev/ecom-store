"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DiscountForm } from "@/components/admin/discount-form";
import { Discount } from "@/types/discount";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditDiscountPage() {
  const params = useParams<{ id: string }>();
  const discountId = params?.id || "";

  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState<Discount | null>(null);

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        setLoading(true);

        // In a real app, this would be an API call
        // For demo purposes, we're creating sample data
        await new Promise((resolve) => setTimeout(resolve, 800));

        const sampleDiscount: Discount = {
          id: discountId,
          code: "SAMPLE50",
          type: "PERCENTAGE",
          value: 50,
          usage: {
            current: 25,
            max: 100,
          },
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          minPurchase: 25,
          maxUses: 100,
          productCategory: "Electronics",
        };

        setDiscount(sampleDiscount);
      } catch (error) {
        console.error("Error fetching discount:", error);
        toast.error("Failed to load discount details");
      } finally {
        setLoading(false);
      }
    };

    if (discountId) {
      fetchDiscount();
    }
  }, [discountId]);

  if (loading) {
    return (
      <div className="py-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/admin/discounts">
              <Button variant="ghost" className="mr-4" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Discount</h1>
          </div>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!discount) {
    return (
      <div className="py-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/admin/discounts">
              <Button variant="ghost" className="mr-4" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Discount</h1>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Discount not found</p>
          <Link href="/admin/discounts">
            <Button className="mt-4">Return to Discounts</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/admin/discounts">
            <Button variant="ghost" className="mr-4" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Discount: {discount.code}</h1>
        </div>
      </div>

      <div className="max-w-3xl">
        <DiscountForm discount={discount} isEditing />
      </div>
    </div>
  );
}
