import { getProducts } from "@/app/actions";
import { DataTable } from "@/components/data-table";
import { PaginationFeature } from "@/lib/pagination-feature";
import type { Product } from "@/lib/types";
import {
	type ColumnDef,
	createTable,
	getCoreRowModel,
	getPaginationRowModel,
} from "@tanstack/table-core";

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

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageIndex = Number(params.pageIndex) || 0;
  const pageSize = Number(params.pageSize) || 10;

  // Fetch products from server action with pagination
  const { data: tableData, pageCount } = await getProducts({
    pageIndex,
    pageSize,
  });

  const table = createTable({
    _features: [PaginationFeature],
    baseUrl: "/",
    data: tableData,
    columns,
    getRowId: (row) => String(row.id),
    initialState: {
      pagination: { pageIndex, pageSize },
      searchParams: params,
    },
    state: {
      pagination: { pageIndex, pageSize },
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
      searchParams: params,
    },
  }));

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Product Inventory</h1>

        <DataTable table={table} />
      </div>
    </div>
  );
}
