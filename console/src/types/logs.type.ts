// Define Log interface
export interface Log {
  id: string;
  action: string;
  context: string;
  status: "SUCCESS" | "FAILURE";
  details: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Define API response type
export interface LogsResponse {
  data: Log[];
  total: number;
  hasNextPage: boolean;
  page: number;
  limit: number;
}
