export const sessionStorage = {
  async getItem(key: string): Promise<string | null> {
    try { return typeof window === "undefined" ? null : window.localStorage.getItem(key); } catch { return null; }
  },
  async setItem(key: string, value: string): Promise<void> {
    try { if (typeof window !== "undefined") window.localStorage.setItem(key, value); } catch { /* Keep the in-memory session when Web storage is unavailable. */ }
  },
  async removeItem(key: string): Promise<void> {
    try { if (typeof window !== "undefined") window.localStorage.removeItem(key); } catch { /* Storage may be disabled by the browser. */ }
  }
};
