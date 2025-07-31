import { toast } from "sonner";
import type { ToasterProps } from "sonner";

const defaultOptions: Omit<ToasterProps, "toastOptions"> = {
  duration: 3000,
  position: "bottom-right",
};

const successStyle = {
  background: "#f0fdf4",
  color: "#15803d",
  border: "1px solid #bbf7d0",
};

const errorStyle = {
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
};

export const customToast = {
  success: (message: string, options?: Parameters<typeof toast>[1]) => {
    return toast.success(message, {
      ...defaultOptions,
      style: successStyle,
      icon: "✅",
      ...options,
    });
  },
  error: (message: string, options?: Parameters<typeof toast>[1]) => {
    return toast.error(message, {
      ...defaultOptions,
      style: errorStyle,
      icon: "❌",
      ...options,
    });
  },
};
