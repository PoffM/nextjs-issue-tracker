/**
 * Removes 'undefined' from a union.
 */
export type Defined<T> = Exclude<T, undefined>;
