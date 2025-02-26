"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  AlertCircle,
  User,
  ShoppingCart,
  Star,
  Tag,
  Settings,
} from "lucide-react";
import { getRecentActivity, Activity } from "@/services/dashboard-service";
import { formatDistance, parseISO } from "date-fns";

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Wrap formatTimeAgo in useCallback to memoize it
  const formatTimeAgo = useCallback(
    (date: Date | string) => {
      try {
        // Handle different date formats
        let dateObj: Date;

        if (typeof date === "string") {
          // If it's an ISO string, parse it
          dateObj = parseISO(date);
        } else if (date instanceof Date) {
          // If it's already a Date object, use it directly
          dateObj = date;
        } else {
          // If it's neither, create a new Date object
          console.warn("Invalid date format:", date);
          dateObj = new Date();
        }

        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          console.warn("Invalid date:", date);
          return "recently";
        }

        // Use currentTime in a way that doesn't affect the result but makes
        // React aware that this function depends on currentTime
        const timeDiff = currentTime.getTime() - dateObj.getTime();
        if (timeDiff < 0) {
          console.warn("Future date detected:", date);
        }

        // Format the date using currentTime as the reference time
        return formatDistance(dateObj, currentTime, {
          addSuffix: true,
        });
      } catch (error) {
        console.error("Error formatting date:", error, date);
        return "recently";
      }
    },
    [currentTime]
  ); // Add currentTime as a dependency since the function uses it

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        // Add a small delay to prevent too many rapid requests
        await new Promise((resolve) => setTimeout(resolve, 100));

        const data = await getRecentActivity(5);

        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          // Log the timestamps for debugging
          console.log(
            "Activity timestamps:",
            data.map((a) => ({
              message: a.message,
              timestamp: a.timestamp,
              formattedTime: formatTimeAgo(a.timestamp),
            }))
          );

          setActivities(data);
        } else {
          console.error("Expected array of activities but got:", data);
          setActivities([]);
          setError("Received invalid data format from server");
        }
      } catch (err) {
        console.error("Error fetching recent activities:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load recent activities. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up polling for fresh data every 30 seconds
    const dataIntervalId = setInterval(fetchActivities, 30000);

    // Set up a timer to update the current time every 15 seconds
    // This ensures that the "time ago" display updates more frequently
    const timeIntervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000); // Update every 15 seconds instead of 60 seconds

    // Clean up intervals on component unmount
    return () => {
      clearInterval(dataIntervalId);
      clearInterval(timeIntervalId);
    };
  }, [formatTimeAgo]);

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
            {Array.isArray(activities) && activities.length > 0 ? (
              activities.map((activity) => (
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
              ))
            ) : (
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
