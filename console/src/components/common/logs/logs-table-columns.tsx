import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Log } from "@/types/logs.type";
import { LogActionsMenu } from "./log-actions-menu";
import type { SearchLogsParams } from "@/hooks/logs/use-search-logs-params";

export const createColumns = (
  searchParams: SearchLogsParams,
  onSort: (column: string) => void
): ColumnDef<Log>[] => [
  {
    accessorKey: "action",
    header: () => (
      <div
        className="flex items-center cursor-pointer hover:text-foreground transition-colors duration-200 p-2 rounded hover:bg-accent whitespace-nowrap"
        onClick={() => onSort("action")}
      >
        <span className="font-medium">Hành động</span>
        {searchParams.sortBy === "action" && (
          <span className="ml-1 text-sm">
            {searchParams.sortOrder === "ASC" ? "↑" : "↓"}
          </span>
        )}
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-2 py-1.5 font-medium text-sm md:text-base line-clamp-2">
        {row.original.action}
      </div>
    ),
    size: 150,
    minSize: 120,
  },
  {
    accessorKey: "context",
    header: () => <div className="p-2 font-medium">Context</div>,
    cell: ({ row }) => (
      <div
        className="text-sm p-2 line-clamp-2 break-words"
        title={row.original.context}
      >
        {row.original.context}
      </div>
    ),
    size: 200,
    minSize: 150,
  },
  {
    accessorKey: "details",
    header: () => <div className="p-2 font-medium">Details</div>,
    cell: ({ row }) => (
      <div className="p-2 space-y-1">
        {row.original.details &&
          Object.entries(row.original.details)
            .slice(0, 2)
            .map(([key, value]) => (
              <div
                key={key}
                className="text-sm line-clamp-1 break-words"
                title={`${key}: ${value}`}
              >
                <span className="font-medium text-muted-foreground">
                  {key}:
                </span>{" "}
                <span className="text-foreground">{String(value)}</span>
              </div>
            ))}
        {Object.keys(row.original.details || {}).length > 2 && (
          <div className="text-xs text-muted-foreground">
            +{Object.keys(row.original.details).length - 2} mục khác...
          </div>
        )}
      </div>
    ),
    size: 300,
    minSize: 200,
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="p-2 font-medium text-center md:text-left">Status</div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center md:justify-start p-2">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
            row.original.status === "SUCCESS"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          )}
        >
          {row.original.status === "SUCCESS" ? "Thành công" : "Thất bại"}
        </span>
      </div>
    ),
    size: 120,
    minSize: 100,
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <div
        className="flex items-center cursor-pointer hover:text-foreground transition-colors duration-200 p-2 rounded hover:bg-accent whitespace-nowrap"
        onClick={() => onSort("createdAt")}
      >
        <span className="font-medium">Time</span>
        {searchParams.sortBy === "createdAt" && (
          <span className="ml-1 text-sm">
            {searchParams.sortOrder === "ASC" ? "↑" : "↓"}
          </span>
        )}
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-sm p-2 whitespace-nowrap">
        {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")}
      </div>
    ),
    size: 150,
    minSize: 130,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end pr-2">
        <LogActionsMenu log={row.original} />
      </div>
    ),
    size: 50,
    minSize: 40,
  },
];
