import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { axiosInstance } from "@/services/apis/axios-client";
import { customToast } from "@/lib/toast";

const ownerSchema = z.object({
  email: z.string().email("Email không hợp lệ."),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  description: z.string().optional(),
  phoneNumber: z.string().regex(/^\d{10}$/, "Số điện thoại không hợp lệ."),
  address: z.object({
    provinceOrMunicipality: z.string().min(2, "Tỉnh/Thành phố không hợp lệ."),
    districtOrTown: z.string().min(2, "Quận/Huyện không hợp lệ."),
    detail: z.string().min(2, "Địa chỉ không hợp lệ."),
  }),
  cid: z.string().min(9, "CCCD/CMND không hợp lệ."),
  dateOfIssue: z.date({
    required_error: "Ngày cấp không được để trống.",
  }),
  placeOfIssue: z.string().min(2, "Nơi cấp không hợp lệ."),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  facebook: z.string().url("URL Facebook không hợp lệ.").optional(),
  birthday: z.date({
    required_error: "Ngày sinh không được để trống.",
  }),
});

export type OwnerFormValues = z.infer<typeof ownerSchema>;

export const useAddOwner = () => {
  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      address: {
        provinceOrMunicipality: "",
        districtOrTown: "",
        detail: "",
      },
      cid: "",
      dateOfIssue: undefined,
      placeOfIssue: "",
      gender: "MALE",
      birthday: undefined,
      description: "",
      facebook: "",
    },
  });

  const onSubmit = async (values: OwnerFormValues) => {
    try {
      const response = await axiosInstance.post(
        "/members/sign-up-owner",
        values
      );
      if (response.data?.message === "Success") {
        customToast.success("Thêm chủ cửa hàng thành công!");
        form.reset();
      } else {
        throw new Error("Có lỗi xảy ra");
      }
    } catch (error: any) {
      customToast.error("Thêm chủ cửa hàng thất bại.");
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
};
