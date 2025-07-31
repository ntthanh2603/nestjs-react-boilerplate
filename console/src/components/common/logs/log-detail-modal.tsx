import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { customToast } from "@/lib/toast";
import type { Log } from "@/types/logs.type";

interface LogDetailModalProps {
  log: Log;
  isOpen: boolean;
  onClose: () => void;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  const handleCopyDetails = () => {
    const detailsText = JSON.stringify(log.details, null, 2);
    navigator.clipboard.writeText(detailsText);
    customToast.success("Đã sao chép chi tiết vào clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết lịch sử thao tác</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Thông tin cơ bản</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="text-sm">{log.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hành động</p>
                <p className="text-sm">{log.action}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <p className="text-sm">
                  {log.status === "SUCCESS" ? "Thành công" : "Thất bại"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thời gian</p>
                <p className="text-sm">
                  {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Chi tiết</h4>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto sm:max-w-[58vw] max-h-[80vh]">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </div>
        <div className="flex justify-start gap-2 w-full">
          <Button variant="outline" onClick={handleCopyDetails}>
            <Copy className="mr-2 h-4 w-4" />
            Sao chép chi tiết
          </Button>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
