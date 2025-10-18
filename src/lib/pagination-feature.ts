import type {
  PaginationState,
  RowData,
  TableFeature,
  TableState,
  Table as TanstackTable,
  Updater,
} from "@tanstack/table-core";

export type NextSearchParams = Record<string, string | string[] | undefined>;

export interface TableComponentProps<TData> {
  table: TanstackTable<TData>;
}

export interface SearchParamsTableState {
  searchParams?: NextSearchParams;
}

export interface SearchParamsOptions {
  baseUrl?: string;
  onSearchParamsChange?: (updater: Updater<NextSearchParams>) => void;
}

/**
 * Methods added to the table instance for managing search parameters.
 * @template TData - The type of data in the table rows
 */
export interface SearchParamsInstance<TData> {
  /**
   * Generates link props with updated table state.
   * @param changes - Partial table state changes to apply
   * @returns Object with href property containing the generated URL
   */
  getLinkProps: (changes: Partial<TableState>) => {
    href: string;
  };

  /**
   * Updates the search parameters.
   * @param updater - Function or value to update search params
   */
  setSearchParams: (updater: Updater<NextSearchParams>) => void;

  /**
   * Gets link props for the current table state.
   * @returns Object with href property for the current state
   */
  getCurrentLink: () => { href: string };
}

declare module "@tanstack/table-core" {
  interface TableState extends SearchParamsTableState {}
  interface InitialTableState extends SearchParamsTableState {}
  interface TableOptionsResolved<TData extends RowData>
    extends SearchParamsOptions {}
  interface Table<TData extends RowData> extends SearchParamsInstance<TData> {}
}

/**
 * Default pagination configuration
 */
const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};

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
      // Append each array value separately
      for (const v of value) {
        searchParams.append(key, v);
      }
    } else {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

/**
 * Merges pagination state with changes, preserving non-pagination parameters.
 *
 * @param currentParams - Current search parameters
 * @param currentPagination - Current pagination state
 * @param paginationChanges - Pagination changes to apply
 * @returns Merged search parameters
 */
function mergePaginationParams(
  currentParams: NextSearchParams,
  currentPagination: PaginationState,
  paginationChanges?: Partial<PaginationState>,
): NextSearchParams {
  // Merge pagination changes with current state
  const newPagination = {
    ...currentPagination,
    ...paginationChanges,
  };

  // Build new params object
  const nextParams: NextSearchParams = {
    pageIndex: String(newPagination.pageIndex),
    pageSize: String(newPagination.pageSize),
  };

  // Preserve non-pagination parameters
  for (const [key, value] of Object.entries(currentParams)) {
    if (key !== "pageIndex" && key !== "pageSize") {
      nextParams[key] = value;
    }
  }

  return nextParams;
}

/**
 * TanStack Table feature that integrates URL search parameters with table state.
 * This feature enables:
 * - Syncing pagination state with URL search params
 * - Generating links with updated table state
 * - Managing search parameters reactively
 *
 * @example
 * ```ts
 * import { createTable } from '@tanstack/table-core';
 *
 * const table = createTable({
 *   data,
 *   columns,
 *   _features: [PaginationFeature],
 *   baseUrl: '/users',
 *   onSearchParamsChange: (updater) => {
 *     // Handle URL updates
 *   }
 * });
 * ```
 */
export const PaginationFeature: TableFeature = {
  /**
   * Initializes the table state with empty search parameters.
   */
  getInitialState: (state): SearchParamsTableState => {
    return {
      ...state,
      searchParams: {},
    };
  },

  /**
   * Provides default options for the feature.
   */
  getDefaultOptions: (): SearchParamsOptions => {
    return {
      baseUrl: "/",
    };
  },

  /**
   * Enhances the table instance with search param methods.
   */
  createTable: <TData extends RowData>(table: TanstackTable<TData>): void => {
    /**
     * Updates search parameters and triggers the onChange callback.
     */
    table.setSearchParams = (updater: Updater<NextSearchParams>) => {
      table.options.onSearchParamsChange?.(updater);
    };

    /**
     * Generates link props with updated table state.
     * Merges current state with proposed changes and builds a URL.
     */
    table.getLinkProps = (changes: Partial<TableState>) => {
      const currentState = table.getState();
      const currentParams = currentState.searchParams ?? {};
      const currentPagination = currentState.pagination ?? DEFAULT_PAGINATION;

      // Merge pagination changes and build new params
      const nextParams = mergePaginationParams(
        currentParams,
        currentPagination,
        changes.pagination,
      );

      // Convert to URLSearchParams and build href
      const searchParams = buildURLSearchParams(nextParams);
      const href = `${table.options.baseUrl}?${searchParams.toString()}`;

      return { href };
    };

    /**
     * Convenience method to get link props for the current state.
     */
    table.getCurrentLink = () => {
      const currentState = table.getState();
      return table.getLinkProps(currentState);
    };
  },
};
