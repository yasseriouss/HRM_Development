/**
 * Auth Module Tests
 * 
 * Validates localStorage-backed auth utilities:
 * - Token CRUD operations
 * - User object serialization/deserialization
 * - Key naming consistency (no "ebdaa_" leaks)
 * - Header generation
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const key in store) delete store[key]; }),
  length: 0,
  key: vi.fn(() => null),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Import after mocking
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getAuthUser,
  setAuthUser,
  clearAuthUser,
  getAuthHeaders,
} from "../artifacts/hrm-skill-matrix/src/lib/auth";

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("Auth — Token Management", () => {
  it("should return null when no token is set", () => {
    expect(getAuthToken()).toBeNull();
  });

  it("should store and retrieve a token", () => {
    setAuthToken("test-token-123");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("hrm_user_token", "test-token-123");
    expect(getAuthToken()).toBe("test-token-123");
  });

  it("should clear the token", () => {
    setAuthToken("test-token-123");
    clearAuthToken();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("hrm_user_token");
  });

  it("should NOT use legacy 'ebdaa_' key names", () => {
    setAuthToken("abc");
    const calls = localStorageMock.setItem.mock.calls.flat();
    expect(calls).not.toContain("ebdaa_user_token");
  });
});

describe("Auth — User Management", () => {
  const mockUser = {
    id: 1,
    email: "admin@hrm-dev.com",
    display_name: "Admin",
    role: "super_admin",
    department_id: null,
    department_name: null,
    is_active: true,
  };

  it("should return null when no user is set", () => {
    expect(getAuthUser()).toBeNull();
  });

  it("should store and retrieve user", () => {
    setAuthUser(mockUser as any);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "hrm_user",
      JSON.stringify(mockUser),
    );
    const retrieved = getAuthUser();
    expect(retrieved).toEqual(mockUser);
  });

  it("should clear user", () => {
    setAuthUser(mockUser as any);
    clearAuthUser();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("hrm_user");
  });
});

describe("Auth — Headers", () => {
  it("should return empty headers when not authenticated", () => {
    expect(getAuthHeaders()).toEqual({});
  });

  it("should return x-user-token header when authenticated", () => {
    setAuthToken("my-secret-token");
    const headers = getAuthHeaders();
    expect(headers).toEqual({ "x-user-token": "my-secret-token" });
  });
});
