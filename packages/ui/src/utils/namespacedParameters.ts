/**
 * Utilities for handling namespaced URL parameters to support multiple
 * content hub blocks on a single page without interference.
 */

/**
 * Generates a namespaced parameter name.
 * - If blockId is provided: returns `${blockId}_${paramName}`
 * - If blockId is not provided: returns `paramName` (backward compatibility)
 */
export function getParameterName(paramName: string, blockId?: string): string {
  return blockId ? `${blockId}_${paramName}` : paramName;
}

/**
 * Extracts a parameter value from URLSearchParams using namespaced lookup.
 * - First tries to find the namespaced parameter (if blockId provided)
 * - Falls back to the non-namespaced parameter for backward compatibility
 */
export function getParameterValue(
  searchParams: URLSearchParams,
  paramName: string,
  blockId?: string,
): string | null {
  if (blockId) {
    const namespacedName = getParameterName(paramName, blockId);
    const namespacedValue = searchParams.get(namespacedName);
    if (namespacedValue !== null) {
      return namespacedValue;
    }
  }

  // Fall back to non-namespaced parameter
  return searchParams.get(paramName);
}

/**
 * Creates a new URLSearchParams object with namespaced parameters set.
 * Preserves existing parameters and adds/updates the namespaced ones.
 */
export function setNamespacedParameters(
  searchParams: URLSearchParams,
  params: Record<string, string | number | undefined>,
  blockId?: string,
): URLSearchParams {
  const newParams = new URLSearchParams(searchParams);

  Object.entries(params).forEach(([key, value]) => {
    const paramName = getParameterName(key, blockId);

    if (value === undefined || value === '') {
      newParams.delete(paramName);
    } else {
      newParams.set(paramName, String(value));
    }
  });

  return newParams;
}

/**
 * Parses namespaced parameters from URLSearchParams into a plain object.
 * Handles both namespaced and non-namespaced parameters for backward compatibility.
 */
export function parseNamespacedParameters<T extends Record<string, string>>(
  searchParams: URLSearchParams,
  paramNames: string[],
  blockId?: string,
): Partial<T> {
  const result: Partial<T> = {};

  paramNames.forEach((paramName) => {
    const value = getParameterValue(searchParams, paramName, blockId);
    if (value !== null) {
      (result as Record<string, string>)[paramName] = value;
    }
  });

  return result;
}
