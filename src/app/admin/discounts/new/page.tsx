"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DiscountForm } from "@/components/admin/discount-form";
import "../discount-styles.css";

export default function NewDiscountPage() {
  return (
    <div className="py-6 px-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/admin/discounts">
          <Button variant="ghost" className="p-0 mr-3" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">New Discount</h1>
      </div>

      <div className="max-w-4xl">
        <DiscountForm />
      </div>
    </div>
  );
}
