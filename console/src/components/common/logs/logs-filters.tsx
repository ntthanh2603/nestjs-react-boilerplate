import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Search,
  RotateCw,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchLogsParams } from "@/hooks/logs/use-search-logs-params";

interface LogsFiltersProps {
  searchParams: SearchLogsParams;
  date?: Date;
  setDate: (date: Date | undefined) => void;
  onFilterChange: (key: string, value: any) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isRefetching: boolean;
}

export const LogsFilters: React.FC<LogsFiltersProps> = ({
  searchParams,
  date,
  setDate,
  onFilterChange,
  onRefresh,
  isLoading,
  isRefetching,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm theo hành động, ngữ cảnh..."
          className="w-full pl-8"
          value={searchParams.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <div className="w-[calc(50%-0.25rem)] md:w-[180px]">
          <Select
            value={searchParams.status || "all"}
            onValueChange={(value) =>
              onFilterChange("status", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILURE">Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[calc(50%-0.25rem)] md:w-[240px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy") : <span>Choose date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
              {date && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setDate(undefined)}
                  >
                    Clear date filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button
        onClick={onRefresh}
        variant="outline"
        size="sm"
        className="md:ml-auto"
        disabled={isLoading || isRefetching}
      >
        {isLoading || isRefetching ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RotateCw className="h-4 w-4 mr-2" />
        )}
        Refresh
      </Button>
    </div>
  );
};
