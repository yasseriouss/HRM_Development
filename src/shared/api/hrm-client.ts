import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";

export const hrmClient = {
  async get(url: string) {
    const res = await fetch(`/api${url}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    return { data };
  },
  async post(url: string, body?: any) {
    const res = await fetch(`/api${url}`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    return { data };
  },
  async put(url: string, body?: any) {
    const res = await fetch(`/api${url}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    return { data };
  },
  async delete(url: string) {
    const res = await fetch(`/api${url}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    return { data };
  }
};
