import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { createColumns } from "./logs-table-columns";
import type { SearchLogsParams } from "@/hooks/logs/use-search-logs-params";
import type { LogsResponse } from "@/types/logs.type";

interface LogsTableProps {
  data: LogsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  searchParams: SearchLogsParams;
  onSort: (column: string) => void;
}

export const LogsTable: React.FC<LogsTableProps> = ({
  data,
  isLoading,
  isError,
  error,
  searchParams,
  onSort,
}) => {
  const columns = createColumns(searchParams, onSort);

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data ? Math.ceil(data.total / data.limit) : 1,
    state: {
      pagination: {
        pageIndex: data ? data.page - 1 : 0,
        pageSize: data?.limit || 10,
      },
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  className={index === 0 ? "pl-4" : ""}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <div className="mt-2">Đang tải...</div>
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-red-500"
              >
                Lỗi khi tải dữ liệu: {error?.message || "Unknown error"}
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell
                    key={cell.id}
                    className={index === 0 ? "pl-4" : ""}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Không tìm thấy nhật ký nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
