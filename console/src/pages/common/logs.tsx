import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useSearchLogsParams } from "@/hooks/logs/use-search-logs-params";
import { useLogs } from "@/hooks/logs/use-logs";
import { LogsErrorBoundary } from "@/components/common/logs/logs-error-boundary";
import { LogsFilters } from "@/components/common/logs/logs-filters";
import { LogsTable } from "@/components/common/logs/logs-table";
import { LogsPagination } from "@/components/common/logs/logs-pagination";

function LogsPage() {
  const [searchParams, setSearchParams, updateFromUrl] = useSearchLogsParams();
  const [date, setDate] = useState<Date | undefined>(
    searchParams.date ? new Date(searchParams.date) : undefined
  );

  const { data, isLoading, isError, error, isRefetching, handleRefresh } =
    useLogs(searchParams);

  // Handle date change
  useEffect(() => {
    if (date) {
      setSearchParams({
        date: format(date, "yyyy-MM-dd"),
        page: 1,
      });
    } else {
      setSearchParams({
        date: undefined,
        page: 1,
      });
    }
  }, [date, setSearchParams]);

  // Handle sorting
  const handleSort = useCallback(
    (column: string) => {
      const newSortOrder =
        searchParams.sortBy === column && searchParams.sortOrder === "DESC"
          ? "ASC"
          : "DESC";
      setSearchParams({
        sortBy: column,
        sortOrder: newSortOrder,
      });
    },
    [searchParams.sortBy, searchParams.sortOrder, setSearchParams]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      setSearchParams({
        [key]: value,
        page: 1, // Reset to first page when filters change
      });
    },
    [setSearchParams]
  );

  // Handle pagination
  const handlePagination = useCallback(
    (page: number) => {
      setSearchParams({
        page,
      });
    },
    [setSearchParams]
  );

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      updateFromUrl();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [updateFromUrl]);

  // Sync date with searchParams
  useEffect(() => {
    const newDate = searchParams.date ? new Date(searchParams.date) : undefined;
    if (newDate?.getTime() !== date?.getTime()) {
      setDate(newDate);
    }
  }, [searchParams.date]);

  return (
    <div className="pr-3 pl-3 space-y-4">
      <LogsFilters
        searchParams={searchParams}
        date={date}
        setDate={setDate}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        isRefetching={isRefetching}
      />

      <LogsTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        searchParams={searchParams}
        onSort={handleSort}
      />

      <LogsPagination
        searchParams={searchParams}
        data={data}
        onPagination={handlePagination}
      />
    </div>
  );
}

// Main export component with Error Boundary
const LogsPageWithErrorBoundary = () => (
  <LogsErrorBoundary>
    <LogsPage />
  </LogsErrorBoundary>
);

export default LogsPageWithErrorBoundary;
