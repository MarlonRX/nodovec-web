import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Column } from "@/schemas/tableSchema";

interface TypedColumn<T> extends Omit<Column, 'render'> {
  render?: (value: any, row: T) => React.ReactNode;
}

interface MyTableProps<T extends { id: string | number }> {
  data: T[];
  columns: TypedColumn<T>[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick?: (id: string | number) => void;
}

export const MyTable = <T extends { id: string | number }>({
  data,
  columns,
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
  variant = 'default',
  showPagination = true,
}: MyTableProps<T> & { variant?: 'default' | 'excel'; showPagination?: boolean }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = sortConfig
    ? [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      return aValue > bValue ? direction : -direction;
    })
    : data;

  const handleSort = (key: keyof T) => {
    setSortConfig(prev =>
      prev?.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    );
  };

  const SortableHeader = ({ label, sortKey, isSortable }: { label: string; sortKey: string; isSortable?: boolean }) => (
    <div
      onClick={() => isSortable && handleSort(sortKey as keyof T)}
      className={`flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-all duration-200 ${isSortable ? 'cursor-pointer hover:text-(--accent-secondary) hover:-translate-y-0.5' : 'cursor-default'
        }`}
    >
      {label}
      {isSortable && <ArrowUpDown className="w-4 h-4 opacity-70" />}
    </div>
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 md:gap-6 flex-1 overflow-hidden">
      {/* Table Wrapper */}
      <div className={`w-full overflow-hidden flex-1 flex flex-col ${variant === 'excel'
        ? 'rounded-none border-2 border-(--border-primary) shadow-none'
        : 'rounded-lg md:rounded-xl bg-(--bg-surface) shadow-md border border-(--border-primary) hover:shadow-lg transition-all duration-300'
        }`}>
        <div className={variant === 'excel' ? "flex-1 overflow-x-auto overflow-y-auto custom-scrollbar" : "flex-1 overflow-x-auto overflow-y-auto custom-scrollbar"}>
          <Table className={`w-full border-collapse min-w-full ${variant === 'excel' ? 'bg-(--bg-surface)' : 'bg-(--bg-surface)'}`}>
            <TableHeader className={variant === 'excel' ? "sticky top-0 z-10" : ""}>
              <TableRow className={`${variant === 'excel'
                ? 'bg-(--bg-secondary) border-b-2 border-(--border-primary) h-10'
                : 'bg-linear-to-r from-(--accent-primary) to-(--accent-hover) border-b-2 border-(--accent-primary) h-14'
                }`}>
                {columns.map(column => (
                  <TableHead
                    key={String(column.key)}
                    className={`${variant === 'excel'
                      ? 'px-2 md:px-4 py-2 text-(--text-secondary) font-bold border-r border-(--border-primary) last:border-r-0 sticky top-0 bg-(--bg-secondary) z-20 shadow-[0_1px_0_var(--border-primary)]'
                      : 'px-3 md:px-6 py-2 md:py-4 text-(--text-inverted) bg-transparent border-none whitespace-nowrap'
                      }`}
                  >
                    <SortableHeader
                      label={column.label}
                      sortKey={column.key}
                      isSortable={column.sortable !== false}
                    />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`${variant === 'excel'
                      ? 'border-b border-(--border-primary) hover:bg-(--border-light)'
                      : `border-b border-(--border-primary) transition-all duration-200 cursor-pointer group ${index % 2 === 0
                        ? 'bg-(--bg-surface)'
                        : 'bg-[rgba(212,175,55,0.03)]'
                      } hover:bg-[rgba(var(--accent-primary-rgb),0.08)] hover:translate-x-1 hover:shadow-[inset_3px_0_0_0_var(--accent-primary)]`
                      }`}
                    onClick={() => onRowClick?.(row.id)}
                  >
                    {columns.map(column => {
                      const value = row[column.key as keyof T];
                      return (
                        <TableCell
                          key={String(column.key)}
                          className={`${variant === 'excel'
                            ? 'px-2 md:px-4 py-2 text-(--text-primary) text-xs md:text-sm border-r border-(--border-primary) last:border-r-0 whitespace-nowrap overflow-hidden text-ellipsis font-mono'
                            : 'px-3 md:px-6 py-2 md:py-4 text-(--text-primary) text-xs md:text-sm border-none whitespace-nowrap overflow-hidden text-ellipsis group-odd:text-(--text-secondary)'
                            }`}
                        >
                          {column.render
                            ? (column.render(value, row) as React.ReactNode)
                            : String(value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="px-6 py-8 text-center text-(--text-secondary)">
                    No items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {showPagination && (
        <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap py-2 px-2 md:px-0">
          {/* Previous Button */}
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-1.5 md:p-2 rounded-lg transition-all duration-300 ${currentPage === 1
              ? 'bg-(--border-primary) text-(--text-tertiary) cursor-not-allowed opacity-50'
              : 'bg-linear-to-r from-(--accent-primary) to-(--accent-hover) text-(--text-inverted) hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md'
              }`}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 md:gap-2">
            {generatePageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-1 md:px-2 text-(--text-secondary) text-xs md:text-base">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`w-7 h-7 md:w-10 md:h-10 rounded-lg font-semibold text-xs md:text-sm transition-all duration-300 ${currentPage === page
                    ? 'bg-linear-to-r from-(--accent-primary) to-(--accent-hover) text-(--text-inverted) shadow-lg scale-105'
                    : 'bg-(--border-primary) text-(--text-secondary) hover:bg-(--border-secondary) hover:-translate-y-0.5'
                    }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-1.5 md:p-2 rounded-lg transition-all duration-300 ${currentPage === totalPages
              ? 'bg-(--border-primary) text-(--text-tertiary) cursor-not-allowed opacity-50'
              : 'bg-linear-to-r from-(--accent-primary) to-(--accent-hover) text-(--text-inverted) hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md'
              }`}
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
