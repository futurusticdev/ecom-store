import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 pb-8">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your information to get started
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <SignUpForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
