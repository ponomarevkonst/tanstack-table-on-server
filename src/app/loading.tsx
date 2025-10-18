import { DataTableSkeleton } from "@/components/data-table";

export default async function Loading() {
  return <DataTableSkeleton columnCount={5} rowCount={10} />;
}
