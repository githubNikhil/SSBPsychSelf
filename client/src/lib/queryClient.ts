import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  useAuth: boolean = false,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add Basic Auth header if needed for admin endpoints
  if (useAuth) {
    try {
      const authString = localStorage.getItem("auth");
      if (authString) {
        const { email, password } = JSON.parse(authString);
        const base64Credentials = btoa(`${email}:${password}`);
        headers["Authorization"] = `Basic ${base64Credentials}`;
      }
    } catch (error) {
      console.error("Error adding auth header:", error);
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Don't throw error here, let the caller handle it
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  useAuth?: boolean;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, useAuth = false }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};

    // Add Basic Auth header if needed
    if (useAuth) {
      try {
        const authString = localStorage.getItem("auth");
        if (authString) {
          const { email, password } = JSON.parse(authString);
          const base64Credentials = btoa(`${email}:${password}`);
          headers["Authorization"] = `Basic ${base64Credentials}`;
        }
      } catch (error) {
        console.error("Error adding auth header:", error);
      }
    }

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
