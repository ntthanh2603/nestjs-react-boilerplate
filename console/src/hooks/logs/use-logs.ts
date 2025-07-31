import { useQuery } from "@tanstack/react-query";
import { fetchLogs } from "@/services/logs.service";
import type { SearchLogsParams } from "@/hooks/logs/use-search-logs-params";
import type { LogsResponse } from "@/types/logs.type";

export function useLogs(params: SearchLogsParams) {
  const query = useQuery<LogsResponse, Error>({
    queryKey: ["logs", params],
    queryFn: () => fetchLogs(params),
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = () => {
    query.refetch();
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRefetching: query.isFetching,
    handleRefresh,
  };
}
