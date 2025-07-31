import { axiosInstance } from "@/services/apis/axios-client";
import membersService from "@/services/members.service";
import type { SearchLogsParams } from "@/hooks/logs/use-search-logs-params";
import type { LogsResponse } from "@/types/logs.type";

// API function to fetch logs
export async function fetchLogs(
  params: SearchLogsParams
): Promise<LogsResponse> {
  const member = membersService.getCurrentMember();

  const queryParams = {
    memberId: member?.id?.toString(),
    page: params.page.toString(),
    limit: params.limit.toString(),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    ...(params.status && { status: params.status }),
    ...(params.search && { search: params.search }),
    ...(params.date && { date: params.date }),
  };

  const response = await axiosInstance.get("/logging", {
    params: queryParams,
  });

  if (!response.data) {
    throw new Error("Failed to fetch logs");
  }

  return response.data;
}
