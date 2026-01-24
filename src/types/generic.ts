/**
 * Generic utility types for RotaDent.
 * Provides common type wrappers used throughout the application.
 */

/**
 * Represents a value that may be null.
 */
export type Nullable<T> = T | null;

/**
 * A dictionary type for key-value pairs with string keys.
 */
export type Dict<T = unknown> = Record<string, T>;
