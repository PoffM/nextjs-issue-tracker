import { isEqual } from "lodash";

/**
 * Returns the changed fields between two objects.
 * Top level fields only.
 */
export function shallowDiff<T>(from: Partial<T>, to: Partial<T>): Partial<T> {
  const result: Partial<T> = {};
  for (const key in to) {
    if (!isEqual(from[key], to[key])) {
      result[key] = to[key];
    }
  }
  return result;
}
