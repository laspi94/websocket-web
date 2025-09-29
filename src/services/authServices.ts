import { apiFetch } from "./api";

export async function login(email: string, password: string) {
    return apiFetch("/login", 'POST', {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export async function logout() {
    return apiFetch("/logout", 'POST', { method: "POST" });
}