/**
 * API Discovery Tool
 * Pure functions for discovering APIs from Dexfra marketplace
 */

import type {
  DexfraAPI,
  APIDiscoveryFilters,
  APIDiscoveryResponse,
} from "../types/dexfra";
import { APINotFoundError, DexfraError } from "../types/dexfra";
import { DEXFRA_DEFAULTS } from "../constants";

/**
 * Search for APIs in the marketplace
 */
export async function discoverAPIs(
  filters?: APIDiscoveryFilters,
  marketplaceUrl?: string
): Promise<DexfraAPI[]> {
  try {
    const baseUrl = marketplaceUrl || DEXFRA_DEFAULTS.MARKETPLACE_URL;
    const params = new URLSearchParams();

    if (filters?.category) params.set("category", filters.category);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
    if (filters?.search) params.set("q", filters.search);
    if (filters?.tags) params.set("tags", filters.tags.join(","));
    if (filters?.minPrice !== undefined)
      params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined)
      params.set("maxPrice", String(filters.maxPrice));
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));

    const url = `${baseUrl}/api/v1/apis?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new DexfraError(
        `Failed to search APIs: ${response.statusText}`,
        "API_SEARCH_FAILED",
        { status: response.status, statusText: response.statusText }
      );
    }

    const data = (await response.json()) as APIDiscoveryResponse;
    return data.apis || [];
  } catch (error) {
    if (error instanceof DexfraError) {
      throw error;
    }

    throw new DexfraError(
      `API search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "API_SEARCH_ERROR",
      error
    );
  }
}

/**
 * Get detailed information about a specific API
 */
export async function getAPIDetails(
  apiId: string,
  marketplaceUrl?: string
): Promise<DexfraAPI> {
  try {
    const baseUrl = marketplaceUrl || DEXFRA_DEFAULTS.MARKETPLACE_URL;
    const url = `${baseUrl}/api/v1/apis/${apiId}`;
    const response = await fetch(url);

    if (response.status === 404) {
      throw new APINotFoundError(`API not found: ${apiId}`, apiId);
    }

    if (!response.ok) {
      throw new DexfraError(
        `Failed to get API: ${response.statusText}`,
        "API_GET_FAILED",
        { apiId, status: response.status, statusText: response.statusText }
      );
    }

    const api = (await response.json()) as DexfraAPI;
    return api;
  } catch (error) {
    if (error instanceof DexfraError) {
      throw error;
    }

    throw new DexfraError(
      `Failed to fetch API: ${error instanceof Error ? error.message : "Unknown error"}`,
      "API_FETCH_ERROR",
      { apiId, error }
    );
  }
}

/**
 * Get all APIs in a specific category
 */
export async function getAPIsByCategory(
  category: string,
  marketplaceUrl?: string
): Promise<DexfraAPI[]> {
  return discoverAPIs({ category }, marketplaceUrl);
}

/**
 * Get all APIs with specific tags
 */
export async function getAPIsByTags(
  tags: string[],
  marketplaceUrl?: string
): Promise<DexfraAPI[]> {
  return discoverAPIs({ tags }, marketplaceUrl);
}

/**
 * Get multiple APIs by their IDs
 */
export async function getMultipleAPIs(
  apiIds: string[],
  marketplaceUrl?: string
): Promise<DexfraAPI[]> {
  const promises = apiIds.map((id) => getAPIDetails(id, marketplaceUrl));
  const results = await Promise.allSettled(promises);

  // Filter out failed requests and return successful ones
  return results
    .filter(
      (result): result is PromiseFulfilledResult<DexfraAPI> =>
        result.status === "fulfilled"
    )
    .map((result) => result.value);
}

/**
 * Search APIs with pagination support
 */
export async function searchAPIsWithPagination(
  filters?: APIDiscoveryFilters,
  marketplaceUrl?: string
): Promise<APIDiscoveryResponse> {
  try {
    const baseUrl = marketplaceUrl || DEXFRA_DEFAULTS.MARKETPLACE_URL;
    const params = new URLSearchParams();

    if (filters?.category) params.set("category", filters.category);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
    if (filters?.search) params.set("q", filters.search);
    if (filters?.tags) params.set("tags", filters.tags.join(","));
    if (filters?.minPrice !== undefined)
      params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined)
      params.set("maxPrice", String(filters.maxPrice));
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));

    const url = `${baseUrl}/api/v1/apis?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new DexfraError(
        `Failed to search APIs: ${response.statusText}`,
        "API_SEARCH_FAILED",
        { status: response.status, statusText: response.statusText }
      );
    }

    return (await response.json()) as APIDiscoveryResponse;
  } catch (error) {
    if (error instanceof DexfraError) {
      throw error;
    }

    throw new DexfraError(
      `API search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "API_SEARCH_ERROR",
      error
    );
  }
}
