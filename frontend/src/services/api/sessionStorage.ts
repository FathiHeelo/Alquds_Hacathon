const memory = new Map<string, string>();

export const sessionStorage = {
  async getItem(key: string): Promise<string | null> { return memory.get(key) ?? null; },
  async setItem(key: string, value: string): Promise<void> { memory.set(key, value); },
  async removeItem(key: string): Promise<void> { memory.delete(key); }
};
