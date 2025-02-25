import { signIn, signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Only show dropdown content when session status is determined
  const isLoading = status === "loading";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="text-gray-500 hover:text-black/90 transition-colors"
          aria-label="Account menu"
        >
          <User2 className="h-5 w-5 stroke-[1.75]" />
        </button>
      </DropdownMenuTrigger>
      {!isLoading && (
        <DropdownMenuContent align="end" className="w-56">
          {session ? (
            <>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/account">Account Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders">Order History</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/wishlist">Wishlist</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onSelect={(event) => {
                  event.preventDefault();
                  signOut();
                  setIsOpen(false);
                }}
              >
                Sign Out
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  signIn();
                  setIsOpen(false);
                }}
              >
                Sign In
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/signin">Create Account</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
