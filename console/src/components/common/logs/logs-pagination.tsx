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
        Showing{" "}
        <span className="font-medium">
          {(searchParams.page - 1) * searchParams.limit + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(searchParams.page * searchParams.limit, data?.total || 0)}
        </span>{" "}
        of <span className="font-medium">{data?.total || 0}</span> logs
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPagination(searchParams.page - 1)}
          disabled={searchParams.page <= 1}
        >
          Previous
        </Button>
        <span className="text-sm px-2">
          Page {searchParams.page} /{" "}
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
          Next
        </Button>
      </div>
    </div>
  );
};
