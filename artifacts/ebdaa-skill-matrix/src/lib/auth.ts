import type { UserWithDepartment } from "@workspace/api-client-react";

export const getAuthToken = () => localStorage.getItem("ebdaa_user_token");
export const setAuthToken = (token: string) => localStorage.setItem("ebdaa_user_token", token);
export const clearAuthToken = () => localStorage.removeItem("ebdaa_user_token");

export const getAuthUser = (): UserWithDepartment | null => {
  const user = localStorage.getItem("ebdaa_user");
  return user ? (JSON.parse(user) as UserWithDepartment) : null;
};
export const setAuthUser = (user: UserWithDepartment) =>
  localStorage.setItem("ebdaa_user", JSON.stringify(user));
export const clearAuthUser = () => localStorage.removeItem("ebdaa_user");

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { "x-user-token": token } : {};
};
