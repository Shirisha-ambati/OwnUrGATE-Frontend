/**
 * API Client — wraps all backend REST endpoints.
 * Falls back gracefully when the backend is offline.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${options.method || "GET"} ${path} failed: ${text}`);
  }
  return res.json() as Promise<T>;
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
    await fetch(`${API_URL}/api/auth/me`, { credentials: "include" });
    return true;
  } catch {
    return false;
  }
};
