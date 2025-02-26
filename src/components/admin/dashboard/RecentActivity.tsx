"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Users,
  ShoppingBag,
  Tag,
  AlertCircle,
  User,
  ShoppingCart,
  Package,
  Star,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { getRecentActivity, Activity } from "@/services/dashboard-service";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecentActivity(5);
        setActivities(data);
      } catch (err) {
        console.error("Error fetching recent activities:", err);
        setError("Failed to load recent activities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "NEW_USER":
        return <User className="h-5 w-5 text-blue-500" />;
      case "ORDER_STATUS":
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case "NEW_REVIEW":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "STORE_UPDATE":
        return <Tag className="h-5 w-5 text-purple-500" />;
      case "NEW_ACCOUNT":
        return <Users className="h-5 w-5 text-indigo-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system activities</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive p-4">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 py-2 border-b last:border-0"
              >
                <div className="rounded-full bg-muted p-2">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="font-medium">{activity.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No recent activities found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
