import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/settings/ProfileForm";
import { PasswordForm } from "@/components/dashboard/settings/PasswordForm";
import { NotificationSettings } from "@/components/dashboard/settings/NotificationSettings";
import { DeleteAccountForm } from "@/components/dashboard/settings/DeleteAccountForm";

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Profile Information</h2>
          <ProfileForm user={user} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <PasswordForm userId={user.id} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>
          <NotificationSettings userId={user.id} />
        </div>

        <DeleteAccountForm userId={user.id} />
      </div>
    </div>
  );
}
