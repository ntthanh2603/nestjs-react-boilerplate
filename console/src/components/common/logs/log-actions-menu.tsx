import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Copy } from "lucide-react";
import { customToast } from "@/lib/toast";
import type { Log } from "@/types/logs.type";
import { LogDetailModal } from "./log-detail-modal";

interface LogActionsMenuProps {
  log: Log;
}

export const LogActionsMenu: React.FC<LogActionsMenuProps> = ({ log }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleCopyDetails = () => {
    const detailsText = JSON.stringify(log.details, null, 2);
    navigator.clipboard.writeText(detailsText);
    customToast.success("Đã sao chép chi tiết vào clipboard!");
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(log.id);
    customToast.success("Đã sao chép ID vào clipboard!");
  };

  const handleViewDetails = () => {
    setIsDetailsOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            Sao chép ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyDetails}>
            <Copy className="mr-2 h-4 w-4" />
            Sao chép chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogDetailModal
        log={log}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
};
