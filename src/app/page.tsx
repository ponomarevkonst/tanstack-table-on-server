import { getProducts } from "@/app/actions";
import { DataTable, DataTableSkeleton } from "@/components/data-table";
import { ServerSidePaginationFeature } from "@/lib/pagination-feature";
import type { Product } from "@/lib/types";
import {
  type ColumnDef,
  type PaginationState,
  createTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/table-core";
import { Suspense } from "react";

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    id: "id",
    header: "Product ID",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "name",
    id: "name",
    header: "Product Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "price",
    id: "price",
    header: "Price",
    cell: (info) => {
      const price = info.getValue() as number;
      return `$${price.toFixed(2)}`;
    },
  },
  {
    accessorKey: "category",
    id: "category",
    header: "Category",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "stock",
    id: "stock",
    header: "Stock",
    cell: (info) => {
      const stock = info.getValue() as number;
      return (
        <span
          className={`px-2 py-1 rounded ${
            stock > 50
              ? "bg-green-100 text-green-800"
              : stock > 20
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {stock}
        </span>
      );
    },
  },
];

type PageProps = {
  searchParams: Promise<{ pageIndex?: string; pageSize?: string }>;
};

type ProductsTableProps = {
  pagination: PaginationState;
  searchParams: { pageIndex?: string; pageSize?: string };
};

async function ProductsTable({ pagination, searchParams }: ProductsTableProps) {
  const { pageIndex, pageSize } = pagination;

  // Fetch products from server action with pagination
  const { data: tableData, pageCount } = await getProducts({
    pageIndex,
    pageSize,
  });

  const table = createTable({
    _features: [ServerSidePaginationFeature],
    baseUrl: "/",
    data: tableData,
    columns,
    getRowId: (row) => String(row.id),
    initialState: {
      pagination,
      searchParams,
    },
    state: {
      pagination,
    },
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    onStateChange: () => {},
    renderFallbackValue: null,
  });

  table.setOptions((prev) => ({
    ...prev,
    state: {
      ...prev.state,
      ...table.initialState,
      searchParams,
    },
  }));

  return <DataTable table={table} />;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageIndex = Number(params.pageIndex) || 0;
  const pageSize = Number(params.pageSize) || 10;

  const pagination: PaginationState = { pageIndex, pageSize };

  return (
    <Suspense
      fallback={<DataTableSkeleton columnCount={5} rowCount={pageSize} />}
    >
      <ProductsTable pagination={pagination} searchParams={params} />
    </Suspense>
  );
}
