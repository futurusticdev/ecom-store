"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Users, ShoppingBag, Tag } from "lucide-react";
import Link from "next/link";
import { getRecentActivity, Activity } from "@/services/dashboard-service";

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const data = await getRecentActivity(5);
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getIconForActivity = (icon: string) => {
    switch (icon) {
      case "user":
        return (
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
            <Users className="h-4 w-4" />
          </div>
        );
      case "order":
        return (
          <div className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
            <ShoppingBag className="h-4 w-4" />
          </div>
        );
      case "product":
        return (
          <div className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
            <Tag className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
            <Tag className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Link href="/admin/activity">
          <Button variant="outline" size="sm" className="flex items-center">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-start">
                  <Skeleton className="w-8 h-8 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    {getIconForActivity(activity.icon)}
                    <div>
                      <p className="font-medium">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No recent activity found
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
