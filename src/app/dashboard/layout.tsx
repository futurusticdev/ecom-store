import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNav } from "@/components/dashboard/MobileNav";

// Loading component for dashboard content
function DashboardLoading() {
  return (
    <div className="space-y-4 p-4 md:p-8 text-center sm:text-left">
      <Skeleton className="h-8 w-1/3 mx-auto sm:mx-0" />
      <Skeleton className="h-4 w-1/4 mx-auto sm:mx-0" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
        <Skeleton className="h-20 md:h-24 rounded-md" />
        <Skeleton className="h-20 md:h-24 rounded-md" />
        <Skeleton className="h-20 md:h-24 rounded-md" />
        <Skeleton className="h-20 md:h-24 rounded-md" />
      </div>
      <Skeleton className="h-48 md:h-64 mt-6 md:mt-8 rounded-md" />
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<DashboardLoading />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
