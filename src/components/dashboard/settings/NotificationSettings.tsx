"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  key: string;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: "order-updates",
    label: "Order Updates",
    description: "Receive notifications about your order status",
    key: "orderUpdates",
  },
  {
    id: "promotions",
    label: "Promotions",
    description: "Receive notifications about sales and special offers",
    key: "promotions",
  },
  {
    id: "product-updates",
    label: "Product Updates",
    description: "Get notified when items in your wishlist are back in stock",
    key: "productUpdates",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    description: "Receive our weekly newsletter with new products and trends",
    key: "newsletter",
  },
];

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    orderUpdates: true,
    promotions: false,
    productUpdates: true,
    newsletter: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateSetting(key: string, enabled: boolean) {
    setIsUpdating(true);

    try {
      const response = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          key,
          enabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification settings");
      }

      setSettings((prev) => ({ ...prev, [key]: enabled }));
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description:
          "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
      // Revert the setting if the update failed
      setSettings((prev) => ({ ...prev, [key]: !enabled }));
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      {notificationSettings.map((setting) => (
        <div
          key={setting.id}
          className="flex items-center justify-between space-x-2"
        >
          <div className="space-y-0.5">
            <Label htmlFor={setting.id}>{setting.label}</Label>
            <p className="text-sm text-muted-foreground">
              {setting.description}
            </p>
          </div>
          <Switch
            id={setting.id}
            checked={settings[setting.key]}
            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
            disabled={isUpdating}
            aria-label={`Toggle ${setting.label.toLowerCase()}`}
          />
        </div>
      ))}
    </div>
  );
}
