import React from "react";
import { Button } from "@/components/ui/button";
import type { SearchLogsParams } from "@/hooks/logs/use-search-logs-params";
import type { LogsResponse } from "@/types/logs.type";

interface LogsPaginationProps {
  searchParams: SearchLogsParams;
  data: LogsResponse | undefined;
  onPagination: (page: number) => void;
}

export const LogsPagination: React.FC<LogsPaginationProps> = ({
  searchParams,
  data,
  onPagination,
}) => {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        Hiển thị{" "}
        <span className="font-medium">
          {(searchParams.page - 1) * searchParams.limit + 1}
        </span>{" "}
        đến{" "}
        <span className="font-medium">
          {Math.min(searchParams.page * searchParams.limit, data?.total || 0)}
        </span>{" "}
        trong tổng số <span className="font-medium">{data?.total || 0}</span>{" "}
        bản ghi
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPagination(searchParams.page - 1)}
          disabled={searchParams.page <= 1}
        >
          Trước
        </Button>
        <span className="text-sm px-2">
          Trang {searchParams.page} /{" "}
          {Math.ceil((data?.total || 0) / searchParams.limit)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPagination(searchParams.page + 1)}
          disabled={
            !data ||
            searchParams.page * searchParams.limit >= (data?.total || 0)
          }
        >
          Tiếp
        </Button>
      </div>
    </div>
  );
};
