export const API_BASE = import.meta.env.VITE_API_BASE_PATH;

export async function apiFetch(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    options: RequestInit = {}
) {
    const token = localStorage.getItem("_wstoken");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY || "",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        method,
        headers,
    });

    if (!res.ok) {
        if (res.status == 401) {
            localStorage.removeItem("_wstoken");
            window.dispatchEvent(new Event("unauthorized"));
        }

        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Api error");
    }

    return res.json();
}
