import Link from "next/link";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { AddressListContent } from "./AddressListContent";

interface AddressListProps {
  userId: string;
  page?: number;
  limit?: number;
}

// Cache the addresses query
const getCachedAddresses = unstable_cache(
  async ({ userId, page = 1, limit = 10 }: AddressListProps) => {
    const skip = (page - 1) * limit;

    try {
      const addresses = await prisma.address.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });

      const total = await prisma.address.count({
        where: { userId },
      });

      return {
        addresses,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return {
        addresses: [],
        total: 0,
        totalPages: 0,
      };
    }
  },
  ["addresses-list"],
  { revalidate: 60 } // Cache for 60 seconds
);

// This is a Server Component that fetches data
export async function getAddressListData({
  userId,
  page = 1,
  limit = 10,
}: AddressListProps) {
  return getCachedAddresses({
    userId,
    page,
    limit,
  });
}

async function AddressListComponent({
  userId,
  page,
  limit = 10,
}: {
  userId: string;
  page: number;
  limit?: number;
}) {
  // @ts-expect-error Server Component
  return <AddressListContent userId={userId} page={page} limit={limit} />;
}

// Type cast to work around TS2786 error
export const AddressList = AddressListComponent as unknown as (props: {
  userId: string;
  page: number;
  limit?: number;
}) => JSX.Element;
