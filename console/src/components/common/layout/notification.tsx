import { BellRing } from "lucide-react";

export default function Notification() {
  return (
    <div className="flex items-center gap-2">
      <BellRing className="h-5 w-5 text-gray-500" />
      <span className="hidden sm:inline text-sm font-medium text-gray-700">
        Thông báo
      </span>
    </div>
  );
}
