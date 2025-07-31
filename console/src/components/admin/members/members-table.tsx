import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getInitials } from "@/lib/utils";
import { RoleMember } from "@/types/enums/enum";
import type { Member, MembersResponse } from "@/hooks/members/use-members";
import type { SearchMembersParams } from "@/hooks/members/use-search-members-params";

interface MembersTableProps {
  data?: MembersResponse;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  searchParams: SearchMembersParams;
  onToggleBan: (memberId: string, isBanned: boolean) => void;
  onUpdateRole: (memberId: string, newRole: RoleMember) => void;
}

export function MembersTable({
  data,
  isLoading,
  isError,
  error,
  onToggleBan,
  onUpdateRole,
}: MembersTableProps) {
  // Table columns definition
  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "fullName",
      header: () => (
        <div className="flex items-center cursor-pointer hover:text-foreground ml-1">
          Họ và tên
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 ml-1">
          <Avatar className="h-5 w-5 rounded-full">
            <AvatarImage
              src={row.original.image?.url}
              alt={row.original.fullName}
            />
            <AvatarFallback>
              {getInitials(row.original.fullName)}
            </AvatarFallback>
          </Avatar>
          <span>{row.original.fullName}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
    },
    {
      accessorKey: "roleMember",
      header: "Vai trò",
      cell: ({ row }) => {
        const role = row.original.roleMember;
        let roleText = "Nhân viên";
        let bgColor = "bg-blue-100 text-blue-800";

        if (role === RoleMember.ADMIN) {
          roleText = "Quản trị viên";
          bgColor = "bg-purple-100 text-purple-800";
        } else if (role === RoleMember.USER) {
          roleText = "Người dùng";
          bgColor = "bg-green-100 text-green-800";
        }

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}
          >
            {roleText}
          </span>
        );
      },
    },
    {
      accessorKey: "isBanned",
      header: "Trạng thái",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.original.isBanned
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.original.isBanned ? "Bị cấm" : "Hoạt động"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(member.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onUpdateRole(
                    member.id,
                    member.roleMember === RoleMember.ADMIN
                      ? RoleMember.USER
                      : RoleMember.ADMIN
                  )
                }
                className={
                  member.roleMember === RoleMember.ADMIN
                    ? "text-yellow-600"
                    : "text-purple-600"
                }
              >
                {member.roleMember === RoleMember.ADMIN
                  ? "Xóa quyền admin"
                  : "Cấp quyền admin"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={member.isBanned ? "text-green-600" : "text-red-500"}
                onClick={() => onToggleBan(member.id, member.isBanned)}
              >
                {member.isBanned ? "Bỏ cấm" : "Cấm thành viên"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Initialize table
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
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
                Đang tải...
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
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Không tìm thấy thành viên nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
