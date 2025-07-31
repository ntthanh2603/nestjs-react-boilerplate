import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Member } from "@/types/interfaces/member.interface";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CalendarIcon, Eye, EyeOff } from "lucide-react";
import { Gender, Language, RoleMember } from "@/types/enums/enum";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { axiosInstance } from "@/services/apis/axios-client";
import { customToast } from "@/lib/toast";

const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || val === "" || /^\d{10,11}$/.test(val), {
      message: "Số điện thoại không hợp lệ (10-11 chữ số)",
    }),
  provinceOrMunicipality: z.string().optional(),
  districtOrTown: z.string().optional(),
  facebook: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  birthday: z.date().optional().nullable(),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || (val.length >= 8 && val.length <= 20),
      {
        message: "Mật khẩu phải có từ 8-20 ký tự",
      }
    ),
  is2FA: z.boolean(),
  isNotification: z.boolean(),
  language: z.nativeEnum(Language),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const genderOptions = [
  { value: Gender.MALE, label: "Nam" },
  { value: Gender.FEMALE, label: "Nữ" },
  { value: Gender.OTHER, label: "Khác" },
];

const languageOptions = [
  { value: Language.VIETNAM, label: "Tiếng Việt" },
  { value: Language.ENGLISH, label: "English" },
];

interface ProfileLayoutProps {
  member: Member;
  onClose: () => void;
}

export function ProfileLayout({ member, onClose }: ProfileLayoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmCloseModal, setShowConfirmCloseModal] = useState(false);

  const {
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
    getValues,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: member.fullName || "",
      description: member.description || "",
      phoneNumber: member.phoneNumber || "",
      provinceOrMunicipality: member.address?.provinceOrMunicipality || "",
      districtOrTown: member.address?.districtOrTown || "",
      facebook: member.facebook || "",
      gender: (member.gender as "MALE" | "FEMALE" | "OTHER") || null,
      birthday: member.birthday ? new Date(member.birthday) : null,
      is2FA: Boolean(member.is2FA),
      isNotification: Boolean(member.isNotification ?? true),
      language: member.language || Language.VIETNAM,
      password: "",
    },
  });

  const is2FAEnabled = watch("is2FA");

  // Fix: Remove unused setValue from dependency array
  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setAvatarFile(file);
      }
    },
    []
  );

  // Fix: Remove unused setValue from dependency array
  const handleAvatarUpload = useCallback(async () => {
    if (!avatarFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

      const response = await axiosInstance.patch(
        "/images/update-avatar-member",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        localStorage.setItem(
          "member",
          JSON.stringify({ ...member, image: response.data })
        );
        customToast.success("Cập nhật ảnh đại diện thành công.");
        setAvatarFile(null);
      }
    } catch (error: any) {
      setUploadError("Không thể cập nhật ảnh đại diện. Vui lòng thử lại.");
      customToast.error(
        error.response?.data?.message || "Không thể cập nhật ảnh đại diện."
      );
    } finally {
      setIsUploading(false);
    }
  }, [avatarFile, member]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const formData = getValues();

      const updateData = {
        ...formData,
        birthday: formData.birthday ? formData.birthday.toISOString() : null,
        gender: formData.gender?.toLowerCase() || null,
        address: {
          provinceOrMunicipality: formData.provinceOrMunicipality || "",
          districtOrTown: formData.districtOrTown || "",
        },
        // Fix: Only include password if it's not empty
        ...(formData.password && formData.password.trim() !== ""
          ? { password: formData.password }
          : {}),
      };

      await axiosInstance.patch("/members/update-my-setting", updateData);
      customToast.success("Cập nhật thông tin thành công");
      localStorage.setItem(
        "member",
        JSON.stringify({ ...member, ...updateData })
      );
      reset(formData);
    } catch (error: any) {
      customToast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fix: Check for dirty state before showing confirmation modal
  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowConfirmCloseModal(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleConfirmClose = useCallback(() => {
    setShowConfirmCloseModal(false);
    onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-white">
          <h2 className="text-2xl font-bold text-gray-800">
            Thông tin tài khoản
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Đóng"
            >
              <span className="text-gray-500 hover:text-gray-700 text-2xl">
                &times;
              </span>
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto">
          {/* User Info Section */}
          <div className="flex items-start gap-6 p-6 bg-gray-50 border-b">
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src={member.image?.url || "/src/assets/react.svg"}
                  alt="Ảnh đại diện"
                />
              </Avatar>
              <div className="mt-3 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center justify-center rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-colors"
                  >
                    Chọn ảnh
                  </label>
                  <Button
                    onClick={handleAvatarUpload}
                    disabled={!avatarFile || isUploading}
                    className="bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs h-auto"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      "Cập nhật"
                    )}
                  </Button>
                </div>
                {uploadError && (
                  <p className="text-xs text-red-500 text-center max-w-[200px]">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="grid gap-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {member.fullName || member.email.split("@")[0]}
                </h3>
                <p className="text-base text-gray-800">{member.description}</p>
                <p className="text-sm text-gray-600">Email: {member.email}</p>
                <p className="text-sm text-gray-500">
                  Vai trò:{" "}
                  {member.roleMember === RoleMember.ADMIN
                    ? "Quản trị viên"
                    : "Người dùng"}
                </p>
                {member.createdAt && (
                  <p className="text-sm text-gray-500">
                    Tham gia vào:{" "}
                    {format(new Date(member.createdAt), "dd/MM/yyyy")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Single Form Section */}
          <form onSubmit={handleFormSubmit} className="p-6 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    disabled={isLoading}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    disabled={isLoading}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provinceOrMunicipality">Tỉnh/Thành phố</Label>
                  <Input
                    id="provinceOrMunicipality"
                    {...register("provinceOrMunicipality")}
                    disabled={isLoading}
                    placeholder="Nhập tỉnh/thành phố"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="districtOrTown">Quận/Huyện</Label>
                  <Input
                    id="districtOrTown"
                    {...register("districtOrTown")}
                    disabled={isLoading}
                    placeholder="Nhập quận/huyện"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    {...register("facebook")}
                    disabled={isLoading}
                    placeholder="Nhập link Facebook"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch("birthday") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("birthday") ? (
                          format(watch("birthday") as Date, "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày sinh</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch("birthday") || undefined}
                        onSelect={(date) =>
                          setValue("birthday", date || null, {
                            shouldDirty: true,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue(
                        "gender",
                        value === "null" ? null : (value as any),
                        { shouldDirty: true }
                      )
                    }
                    value={watch("gender") || "null"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Không xác định</SelectItem>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  {...register("description")}
                  disabled={isLoading}
                  placeholder="Nhập mô tả"
                />
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-6 pt-6 mt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">Bảo mật</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      disabled={isLoading}
                      placeholder="Để trống nếu không đổi mật khẩu"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Để trống nếu không muốn đổi mật khẩu
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="is2FA">Xác thực 2 yếu tố (2FA)</Label>
                    <p className="text-sm text-muted-foreground">
                      Bảo mật tài khoản của bạn bằng xác thực 2 yếu tố
                    </p>
                  </div>
                  <Switch
                    id="is2FA"
                    checked={is2FAEnabled}
                    onCheckedChange={(checked) =>
                      setValue("is2FA", checked, { shouldDirty: true })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-6 pt-6 mt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">Cài đặt</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isNotification">Thông báo</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo từ hệ thống
                    </p>
                  </div>
                  <Switch
                    id="isNotification"
                    checked={watch("isNotification")}
                    onCheckedChange={(checked) =>
                      setValue("isNotification", checked, { shouldDirty: true })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("language", value as Language, {
                        shouldDirty: true,
                      })
                    }
                    value={watch("language")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className={cn(!isDirty && "opacity-50 cursor-not-allowed")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-4">Xác nhận thoát</h3>
            <p className="text-gray-700 mb-6">
              Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát mà không lưu
              không?
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmCloseModal(false)}
                className="px-4 py-2"
              >
                Tiếp tục chỉnh sửa
              </Button>
              <Button
                onClick={handleConfirmClose}
                className="bg-red-400 hover:bg-red-500 text-white px-4 py-2"
              >
                Thoát và không lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
