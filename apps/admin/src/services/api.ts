export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || "";
}

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("servease_admin_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.data !== undefined ? result.data : result;
}
