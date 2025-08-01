import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { authService } from "@/services/auth.service";
import { customToast } from "@/lib/toast";
import { z } from "zod";

// Define separate schemas for each step
const credentialsSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    fullName: z.string().min(1, "Full name is required"),
    description: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const signUpFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  description: z.string().optional(),
  otp: z.string().optional(),
});

type SignUpFormData = z.infer<typeof signUpFormSchema>;

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const navigate = useNavigate();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      description: "",
      otp: "",
    },
  });

  const currentEmail = form.watch("email");

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      if (step === "credentials") {
        // Validate credentials step manually
        const credentialsData = {
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword || "",
          fullName: data.fullName,
          description: data.description,
        };

        // Manual validation for credentials step
        const credentialsResult = credentialsSchema.safeParse(credentialsData);
        if (!credentialsResult.success) {
          console.log(
            "Credentials validation failed:",
            credentialsResult.error
          );
          setError("Please check your input");
          setIsLoading(false);
          return;
        }

        // Extract only the needed fields for OTP
        const { confirmPassword, otp, ...otpData } = data;

        // Send OTP for sign up
        await authService.signUpSendOTP(otpData);
        customToast.success("Verification code has been sent to your email!");
        setStep("otp");
      } else if (step === "otp") {
        if (!data.otp || data.otp.length !== 6) {
          setError("Please enter the verification code");
          setIsLoading(false);
          return;
        }

        // Confirm OTP and complete sign up
        const response = await authService.signUpConfirmOTP({
          email: data.email,
          otp: data.otp,
          fullName: data.fullName,
          description: data.description,
          password: data.password,
        });

        if (response?.message === "Success") {
          customToast.success("Registration successful!");

          // Add a small delay before redirecting to show the success message
          setTimeout(() => {
            navigate("/sign-in", { replace: true });
          }, 2000);
        }
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "An error occurred. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setError(null);
    form.setValue("otp", ""); // Clear OTP when going back
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Smart Retail Management System</h1>
          <div className="text-muted-foreground text-sm text-balance">
            {step === "otp" ? (
              <>
                Verification code has been sent to <br />
                <strong>{currentEmail}</strong>
              </>
            ) : (
              <>
                Welcome
                <br />
                Please enter your registration information
              </>
            )}
          </div>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6">
          {step === "credentials" ? (
            <>
              <div className="grid gap-3">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  {...form.register("fullName")}
                  aria-invalid={
                    form.formState.errors.fullName ? "true" : "false"
                  }
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...form.register("email")}
                  aria-invalid={form.formState.errors.email ? "true" : "false"}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Tell us about yourself or your company"
                  disabled={isLoading}
                  {...form.register("description")}
                  aria-invalid={
                    form.formState.errors.description ? "true" : "false"
                  }
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...form.register("password")}
                  aria-invalid={
                    form.formState.errors.password ? "true" : "false"
                  }
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...form.register("confirmPassword")}
                  aria-invalid={
                    form.formState.errors.confirmPassword ? "true" : "false"
                  }
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </>
          ) : (
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  {form.formState.errors.otp && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.otp.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : step === "otp"
              ? "Complete Registration"
              : "Continue"}
          </Button>

          {step === "otp" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToCredentials}
              disabled={isLoading}
            >
              Back
            </Button>
          )}

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
