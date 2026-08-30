/**
 * API Client — wraps all backend REST endpoints.
 * Includes JWT bearer token support for reliable authentication and cross-device sync.
 */

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl === "/") {
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      return "http://localhost:5000";
    }
    return "";
  }
  return envUrl.replace(/\/+$/, "");
};

const TOKEN_KEY = "ownurgate_token";

export function setAuthToken(token: string) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function normalizeId<T>(item: T): T {
  if (!item || typeof item !== "object") return item;
  if (Array.isArray(item)) {
    return item.map(normalizeId) as unknown as T;
  }
  const obj = { ...item } as any;
  if (obj._id && !obj.id) {
    obj.id = obj._id;
  }
  return obj;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl && typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    throw new Error(
      "VITE_API_URL environment variable is missing on Vercel. Please go to Vercel Project Settings -> Environment Variables and set VITE_API_URL to your backend URL (e.g. https://your-backend.onrender.com)."
    );
  }

  const url = `${baseUrl}${cleanPath}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    credentials: "include",
    headers,
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${options.method || "GET"} ${path} failed: ${text}`);
  }

  const data = await res.json();
  return normalizeId(data) as T;
}

// ---- Auth ----
export const authApi = {
  /** Dev login (no real Google credential) */
  devLogin: () =>
    apiFetch<{ token: string; user: { id: string; email: string; name: string; picture?: string } }>(
      "/api/auth/google",
      { method: "POST", body: JSON.stringify({ isDev: true }) }
    ),

  /** Real Google OAuth login */
  googleLogin: (credential: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; name: string; picture?: string } }>(
      "/api/auth/google",
      { method: "POST", body: JSON.stringify({ credential, isDev: false }) }
    ),

  /** Check existing session */
  me: () =>
    apiFetch<{ user: { id: string; email: string; name: string; picture?: string } }>("/api/auth/me"),
};

// ---- Questions ----
export const questionsApi = {
  list: () => apiFetch<any[]>("/api/questions"),
  create: (data: any) => apiFetch<any>("/api/questions", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/api/questions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<{ success: boolean }>(`/api/questions/${id}`, { method: "DELETE" }),
};

// ---- Subjects ----
export const subjectsApi = {
  list: () => apiFetch<any[]>("/api/subjects"),
  create: (data: any) => apiFetch<any>("/api/subjects", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/api/subjects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<{ success: boolean }>(`/api/subjects/${id}`, { method: "DELETE" }),
  seed: () => apiFetch<any[]>("/api/subjects/seed", { method: "POST" }),
};

// ---- Quizzes ----
export const quizzesApi = {
  list: () => apiFetch<any[]>("/api/quizzes"),
  create: (data: any) => apiFetch<any>("/api/quizzes", { method: "POST", body: JSON.stringify(data) }),
};

// ---- Attempts ----
export const attemptsApi = {
  list: () => apiFetch<any[]>("/api/quiz-attempts"),
  create: (data: any) => apiFetch<any>("/api/quiz-attempts", { method: "POST", body: JSON.stringify(data) }),
};

export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl && typeof window !== "undefined" && window.location.hostname !== "localhost") return false;
    const token = getAuthToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${baseUrl}/api/auth/me`, { credentials: "include", headers });
    return res.ok;
  } catch {
    return false;
  }
};
