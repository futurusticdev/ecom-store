"use client";

import { useState } from "react";
import { Home, Package, Heart, MapPin, Settings, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Orders", href: "/dashboard/orders", icon: Package },
  { name: "Favorites", href: "/dashboard/favorites", icon: Heart },
  { name: "Addresses", href: "/dashboard/addresses", icon: MapPin },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <DashboardNav
          items={navigation}
          setOpen={setOpen}
          className="border-none"
        />
      </SheetContent>
    </Sheet>
  );
}
