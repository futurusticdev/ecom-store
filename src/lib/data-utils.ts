/**
 * Utility functions for data fetching with fallbacks
 */

/**
 * Attempts to fetch data from an API endpoint with a fallback to mock data
 * @param apiUrl The API endpoint to fetch data from
 * @param realDataFn Function that returns real data
 * @param mockDataFn Function that returns mock data
 * @param timeout Timeout in milliseconds before falling back to mock data
 */
export async function fetchWithFallback<T>(
  apiUrl: string,
  realDataFn: () => Promise<T>,
  mockDataFn: () => T,
  timeout: number = 3000
): Promise<T> {
  // Create a promise that rejects after the timeout
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error("Request timed out")), timeout);
  });

  try {
    // Try to fetch real data from the API or use the provided real data function
    const response = await Promise.race([
      fetch(apiUrl).then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      }),
      realDataFn(),
      timeoutPromise,
    ]);

    console.log("Using real data");
    return response as T;
  } catch (error) {
    // If API fetch fails, log and use mock data
    console.log(
      "Using mock data:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return mockDataFn();
  }
}

/**
 * Stores data in localStorage with expiration
 */
export function storeWithExpiry<T>(key: string, value: T, ttl: number): void {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Gets data from localStorage with expiration check
 */
export function getWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value as T;
}

/**
 * Fetches data with caching in localStorage
 * @param apiUrl The API endpoint to fetch data from
 * @param cacheKey The key to use for caching
 * @param realDataFn Function that returns real data
 * @param mockDataFn Function that returns mock data
 * @param ttl Time to live for the cache in milliseconds
 */
export async function fetchWithCache<T>(
  apiUrl: string,
  cacheKey: string,
  realDataFn: () => Promise<T>,
  mockDataFn: () => T,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  // Try to get from cache first
  const cachedData = getWithExpiry<T>(cacheKey);

  if (cachedData) {
    console.log(`Using cached data for ${cacheKey}`);
    return cachedData;
  }

  // If not in cache, fetch fresh data using fetchWithFallback
  const freshData = await fetchWithFallback<T>(apiUrl, realDataFn, mockDataFn);

  // Store in cache
  storeWithExpiry(cacheKey, freshData, ttl);

  return freshData;
}
