import assert from "node:assert/strict";
import test from "node:test";

import { loadPreferences, savePreferences } from "../src/shared/preferences/preferencesStorage.web";
import { defaultPreferences, type AccessibilityPreferences } from "../src/shared/preferences/types";

function installStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set("ammerha.accessibility.preferences.v1", initial);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => { values.clear(); },
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; }
  } satisfies Storage;
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage } });
}

test("web preferences persist every accessibility field and reload", async () => {
  installStorage();
  const expected: AccessibilityPreferences = { appearance: "high_contrast", language: "en", textSize: "large", reduceMotion: true };
  await savePreferences(expected);
  assert.deepEqual(await loadPreferences(), expected);
});

test("web preferences fall back safely for malformed or inaccessible storage", async () => {
  installStorage("not-json");
  assert.deepEqual(await loadPreferences(), defaultPreferences);
  Object.defineProperty(globalThis, "window", { configurable: true, get() { throw new Error("blocked"); } });
  assert.deepEqual(await loadPreferences(), defaultPreferences);
  await assert.doesNotReject(() => savePreferences(defaultPreferences));
});
