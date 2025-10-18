/** biome-ignore-all lint/suspicious/noArrayIndexKey: i use indexes only for the skeleton loader */
import { flexRender } from "@tanstack/react-table";
import Form from "next/form";
import Link from "next/link";
import type {
  Header,
  HeaderGroup,
  Row,
  Table as TanstackTable,
  Header as TanstackHeader,
} from "@tanstack/table-core";
import type { Cell, Cell as TanstackCell } from "@tanstack/react-table";
import type { Table as TanstackTableCore } from "@tanstack/table-core";

/**
 * Skeleton loader animation component
 */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ animationDuration: "1.5s" }}
    />
  );
}
/**
 * Renders the table header with column headers.
 * Supports nested header groups and placeholder columns.
 *
 * @template TData - The type of data in the table rows
 * @param props - Component props
 * @returns The rendered table header element
 */
export function TableHeader<TData>({ table }: { table: TanstackTable<TData> }) {
  return (
    <thead>
      <tr className="bg-gray-100">
        {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) =>
          headerGroup.headers.map((header: TanstackHeader<TData, unknown>) => (
            <th
              key={header.id}
              className="border border-gray-300 px-4 py-2 text-left"
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
            </th>
          )),
        )}
      </tr>
    </thead>
  );
}

/**
 * Renders the table body with data rows and cells.
 * Each row renders all visible cells based on the table's column configuration.
 *
 * @template TData - The type of data in the table rows
 * @param props - Component props
 * @returns The rendered table body element
 */
export function TableBody<TData>({ table }: { table: TanstackTable<TData> }) {
  const rows = table.getRowModel().rows;

  return (
    <tbody>
      {rows.map((row: Row<TData>) => (
        <tr key={row.id} className="hover:bg-gray-50">
          {row.getVisibleCells().map((cell: TanstackCell<TData, unknown>) => (
            <td key={cell.id} className="border border-gray-300 px-4 py-2">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/**
 * Available page size options for the pagination control.
 */
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/**
 * Renders pagination controls for the table.
 * Includes:
 * - Page size selector with Apply button
 * - Current page indicator
 * - Previous/Next navigation buttons
 *
 * Navigation uses Next.js Links with URL search params for browser history support.
 *
 * @template TData - The type of data in the table rows
 * @param props - Component props
 * @returns The rendered pagination controls
 */
export function TablePagination<TData>({
  table,
}: {
  table: TanstackTable<TData>;
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const canGoPrevious = table.getCanPreviousPage();
  const canGoNext = table.getCanNextPage();
  const pageCount = table.getPageCount();

  // Generate href for previous page
  const previousHref = canGoPrevious
    ? table.buildNewHref({
        pagination: { pageIndex: pageIndex - 1, pageSize },
      })
    : table.getCurrentHref();

  // Generate href for next page
  const nextHref = canGoNext
    ? table.buildNewHref({
        pagination: { pageIndex: pageIndex + 1, pageSize },
      })
    : table.getCurrentHref();

  return (
    <div className="flex items-center justify-between">
      {/* Left side: Page size selector and page info */}
      <div className="flex items-center gap-2">
        <Form action="/" className="flex items-center gap-2">
          <input type="hidden" name="pageIndex" value={pageIndex} />
          <select
            name="pageSize"
            defaultValue={pageSize}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            Apply
          </button>
        </Form>
        <div className="text-gray-500 text-sm">
          Page {pageIndex + 1} of {pageCount}
        </div>
      </div>

      {/* Right side: Navigation buttons */}
      <div className="flex items-center gap-2">
        <Link
          href={previousHref}
          className={`px-3 py-1 border border-gray-300 rounded text-sm ${
            !canGoPrevious
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50"
          }`}
        >
          Previous
        </Link>
        <Link
          href={nextHref}
          className={`px-3 py-1 border border-gray-300 rounded text-sm ${
            !canGoNext ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

/**
 * Main data table component that combines header, body, and pagination.
 * This is the primary component to use for rendering a complete table UI.
 *
 * Features:
 * - Responsive horizontal scrolling
 * - Integrated pagination controls
 * - Styled with Tailwind CSS
 *
 * @template TData - The type of data in the table rows
 * @param props - Component props
 * @returns The complete rendered data table
 *
 * @example
 * ```tsx
 * import { createTable } from '@tanstack/table-core';
 * import { DataTable } from './table';
 *
 * const table = createTable({
 *   data: myData,
 *   columns: myColumns,
 *   // ... other options
 * });
 *
 * <DataTable table={table} />
 * ```
 */
export function DataTable<TData>({ table }: { table: TanstackTable<TData> }) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <TableHeader table={table} />
          <TableBody table={table} />
        </table>
      </div>
      <TablePagination table={table} />
    </div>
  );
}

/**
 * Skeleton loader for the data table.
 * Shows animated placeholders while data is loading.
 *
 * @param config - Configuration for skeleton dimensions
 * @returns Skeleton loading state matching the table structure
 */
export function DataTableSkeleton({
  columnCount = 5,
  rowCount = 10,
}: {
  columnCount?: number;
  rowCount?: number;
}) {
  return (
    <div className="space-y-4">
      {/* Table skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          {/* Header skeleton */}
          <thead>
            <tr className="bg-gray-100">
              {Array.from({ length: columnCount }).map((_, i) => (
                <th
                  key={`header-${i}`}
                  className="border border-gray-300 px-4 py-2 text-left"
                >
                  <Skeleton className="h-6 w-24" />
                </th>
              ))}
            </tr>
          </thead>

          {/* Body skeleton */}
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="hover:bg-gray-50">
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <td
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="border border-gray-300 px-4 py-2"
                  >
                    <Skeleton
                      className={`h-6 ${
                        colIndex === 0
                          ? "w-20"
                          : colIndex === 1
                            ? "w-32"
                            : colIndex === 2
                              ? "w-16"
                              : colIndex === 3
                                ? "w-24"
                                : "w-12"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        {/* Left side skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Right side skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}
