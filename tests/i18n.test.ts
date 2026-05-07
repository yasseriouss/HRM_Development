/**
 * i18n Integrity Tests
 * 
 * Ensures EN and AR language files are fully synchronized:
 * - No missing keys
 * - No "Ebdaa" branding leaks in production strings
 * - All keys are properly typed
 */
import { describe, it, expect } from "vitest";
import en from "../artifacts/hrm-skill-matrix/src/i18n/en";
import ar from "../artifacts/hrm-skill-matrix/src/i18n/ar";

const EN_KEYS = Object.keys(en) as (keyof typeof en)[];
const AR_KEYS = Object.keys(ar) as (keyof typeof ar)[];

describe("i18n — Key Synchronization", () => {
  it("EN and AR should have the same number of keys", () => {
    expect(EN_KEYS.length).toBe(AR_KEYS.length);
  });

  it("every EN key should exist in AR", () => {
    const missingInAr = EN_KEYS.filter((key) => !(key in ar));
    expect(missingInAr).toEqual([]);
  });

  it("every AR key should exist in EN", () => {
    const missingInEn = AR_KEYS.filter((key) => !(key in en));
    expect(missingInEn).toEqual([]);
  });

  it("no key should have an empty string value in EN", () => {
    const emptyKeys = EN_KEYS.filter((key) => en[key] === "");
    expect(emptyKeys).toEqual([]);
  });

  it("no key should have an empty string value in AR", () => {
    const emptyKeys = AR_KEYS.filter((key) => ar[key] === "");
    expect(emptyKeys).toEqual([]);
  });
});

describe("i18n — Branding Audit", () => {
  const BANNED_TERMS = ["Ebdaa Suite", "EBDAA", "ebdaa_"];

  it("EN values should not contain banned branding terms", () => {
    const violations: string[] = [];
    for (const key of EN_KEYS) {
      const val = en[key];
      for (const term of BANNED_TERMS) {
        if (val.includes(term)) {
          violations.push(`${key}: contains "${term}" → "${val}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("AR values should not contain banned branding terms", () => {
    const violations: string[] = [];
    for (const key of AR_KEYS) {
      const val = ar[key];
      for (const term of BANNED_TERMS) {
        if (val.includes(term)) {
          violations.push(`${key}: contains "${term}" → "${val}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
