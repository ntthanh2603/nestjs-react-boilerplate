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
  signInFormSchema,
  type SignInFormData,
} from "@/types/interfaces/auth.interface";
import { RoleMember } from "@/types/enums/enum";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authService } from "@/services/auth.service";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const navigate = useNavigate();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
    mode: "onChange",
    defaultValues: {
      roleMember: RoleMember.USER,
      email: "",
      password: "",
      otp: "",
    },
  });

  const currentEmail = form.watch("email");

  const onSubmit = async (data: SignInFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.signIn(data);

      if (response?.message === "OTP has been sent to your email") {
        setStep("otp");
      } else if (response?.token) {
        if (data.roleMember === RoleMember.ADMIN) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setError(null);
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
          <p className="text-muted-foreground text-sm text-balance">
            {step === "otp" ? (
              <>
                Mã xác thực đã được gửi đến <br />
                <strong>{currentEmail}</strong>
              </>
            ) : (
              <>
                Kính chào quý khách <br /> Xin mời nhập thông tin đăng nhập vào
                hệ thống
              </>
            )}
          </p>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
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
                <div className="flex items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link
                    to="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
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
                <Label htmlFor="roleMember">Vai trò</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("roleMember", value as RoleMember)
                  }
                  defaultValue={form.getValues("roleMember")}
                  disabled={isLoading}
                >
                  <SelectTrigger id="roleMember" className="w-full">
                    <SelectValue placeholder="Chọn vai trò của bạn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RoleMember.ADMIN}>
                      Quản trị viên
                    </SelectItem>
                    <SelectItem value={RoleMember.USER}>Người dùng</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.roleMember && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.roleMember.message}
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
              ? "Đang xử lý..."
              : step === "otp"
              ? "Xác nhận OTP"
              : "Đăng nhập"}
          </Button>

          {step === "otp" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToCredentials}
              disabled={isLoading}
            >
              Quay lại
            </Button>
          )}

          {step === "credentials" && (
            <>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-background text-muted-foreground relative z-10 px-2">
                  Hoặc đăng nhập với
                </span>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    className="text-[#4285F4]"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    className="text-[#34A853]"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    className="text-[#FBBC05]"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    className="text-[#EA4335]"
                  />
                </svg>
                <span>Đăng nhập với Google</span>
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
