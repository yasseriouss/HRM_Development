import type { UserWithDepartment } from "@hrm-development/api-client-react";

export const getAuthToken = () =>localStorage.getItem("hrm_user_token");
export const setAuthToken = (token: string) => localStorage.setItem("hrm_user_token", token);
export const clearAuthToken = () => localStorage.removeItem("hrm_user_token");

export const getAuthUser = (): UserWithDepartment | null => {
  const user = localStorage.getItem("hrm_user");
  return user ? (JSON.parse(user) as UserWithDepartment) : null;
};
export const setAuthUser = (user: UserWithDepartment) =>
  localStorage.setItem("hrm_user", JSON.stringify(user));
export const clearAuthUser = () => localStorage.removeItem("hrm_user");

export const logout = () => {
  clearAuthToken();
  clearAuthUser();
  window.location.href = "/login";
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { "x-user-token": token } : {};
};
