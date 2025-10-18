import type {
  PaginationState,
  RowData,
  TableFeature,
  TableState,
  Table as TanstackTable,
} from "@tanstack/table-core";

type NextSearchParams = Record<string, string | string[] | undefined>;

declare module "@tanstack/table-core" {
  interface TableState {
    searchParams?: NextSearchParams;
  }

  interface InitialTableState {
    searchParams?: NextSearchParams;
  }

  // baseUrl is used to build the href for the table
  interface TableOptionsResolved<TData extends RowData> {
    baseUrl?: string;
  }

  interface Table<TData extends RowData> {
    buildNewHref: (changes: Partial<TableState>) => string;
    getCurrentHref: () => string;
  }
}

/**
 * Builds a URLSearchParams object from NextSearchParams.
 * Handles both single values and arrays.
 *
 * @param params - The search parameters to convert
 * @returns URLSearchParams instance ready for URL construction
 */
function buildURLSearchParams(params: NextSearchParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const v of value) {
        searchParams.append(key, v);
      }
    } else {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

export const ServerSidePaginationFeature: TableFeature = {
  getDefaultOptions: () => ({ baseUrl: "/" }),

  getInitialState: (state) => ({
    searchParams: {},
    ...state,
    pagination: {
      pageIndex: 0,
      pageSize: 10,
      ...state?.pagination,
    },
  }),

  createTable: <TData extends RowData>(table: TanstackTable<TData>): void => {
    // primary function to build the href for the table
    table.buildNewHref = (changes: Partial<TableState>) => {
			// 1. get the current state of the table
      const { searchParams = {}, pagination = { pageIndex: 0, pageSize: 10 } } = table.getState();

			// 2. merge the changes with the current state
      const newPagination = { ...pagination, ...changes.pagination };
      
      // 3. omit the pageIndex and pageSize from the search params
      const { pageIndex: _, pageSize: __, ...rest } = searchParams;

			// 4. build the new search params
      const nextParams = {
        pageIndex: String(newPagination.pageIndex),
        pageSize: String(newPagination.pageSize),
        ...rest,
      };

      // 5. transform the new search params into a URLSearchParams object
      const urlSearchParams = buildURLSearchParams(nextParams);

			// 6. return the new href
      return `${table.options.baseUrl}?${urlSearchParams.toString()}`;
    };

    table.getCurrentHref = () => table.buildNewHref(table.getState());
  },
};
