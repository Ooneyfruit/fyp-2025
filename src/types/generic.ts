/**
 * Generic utility types for RotaDent.
 * Provides common type wrappers used throughout the application.
 */

/**
 * Represents a value that may be null.
 */
export type Nullable<T> = T | null;

/**
 * Represents a value that may be undefined.
 */
export type Optional<T> = T | undefined;

/**
 * Represents the state of an asynchronous operation.
 * useful for Pinia stores or composables handling data fetching.
 */
export interface AsyncState<T> {
  data: Nullable<T>;
  loading: boolean;
  error: Nullable<Error>;
}

/**
 * A dictionary type for key-value pairs.
 */
export type Dict<T = unknown> = Record<string, T>;
