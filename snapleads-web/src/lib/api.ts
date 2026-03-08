const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8100";

async function request(path: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  setup: () => request("/api/auth/setup", { method: "POST" }),
  me: () => request("/api/auth/me"),

  // Admin
  adminStats: () => request("/api/admin/stats"),
  adminGenerateKeys: (data: { plan: string; billing_cycle: string; quantity: number; assigned_to_email?: string; assigned_to_name?: string; notes?: string }) =>
    request("/api/admin/keys/generate", { method: "POST", body: JSON.stringify(data) }),
  adminListKeys: (params?: { page?: number; plan?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.plan) q.set("plan", params.plan);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    return request(`/api/admin/keys?${q.toString()}`);
  },
  adminGetKey: (id: string) => request(`/api/admin/keys/${id}`),
  adminRevokeKey: (id: string) => request(`/api/admin/keys/${id}/revoke`, { method: "PUT" }),
  adminReactivateKey: (id: string) => request(`/api/admin/keys/${id}/activate`, { method: "PUT" }),
  adminCreateReseller: (data: { email: string; password: string; name: string; role: string }) =>
    request("/api/admin/resellers", { method: "POST", body: JSON.stringify(data) }),
  adminListResellers: () => request("/api/admin/resellers"),
  adminUpdateReseller: (id: string, data: { name?: string; status?: string }) =>
    request(`/api/admin/resellers/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Reseller
  resellerStats: () => request("/api/reseller/stats"),
  resellerGenerateKeys: (data: { plan: string; billing_cycle: string; quantity: number; assigned_to_email?: string; assigned_to_name?: string; notes?: string }) =>
    request("/api/reseller/keys/generate", { method: "POST", body: JSON.stringify(data) }),
  resellerListKeys: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return request(`/api/reseller/keys?${q.toString()}`);
  },
  // License (public)
  validateLicense: (key: string, device_id: string) =>
    request("/api/license/validate", { method: "POST", body: JSON.stringify({ key, device_id }) }),
  activateLicense: (key: string, device_id: string, device_name: string) =>
    request("/api/license/activate", { method: "POST", body: JSON.stringify({ key, device_id, device_name }) }),
  getPricing: () => request("/api/license/pricing"),
  getFeatures: (plan: string) => request(`/api/license/features/${plan}`),
};
