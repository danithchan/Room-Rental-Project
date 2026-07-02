import api from './api';

export interface Admin {
  adminid: number;
  username: string;
  fullname: string;
  phone: string | null;
  avatarurl: string | null;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: Admin;
}
const ADMIN_KEY = 'ssrms_admin';
const TOKEN_KEY = 'ssrms_token';
const BACKEND_URL = 'https://room-rental-project.onrender.com';
export const getAvatarUrl = (avatarurl: string | null): string | null => {
  if (!avatarurl) return null;
  return `${BACKEND_URL}${avatarurl}`;
};
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
export const login = async (data: LoginInput): Promise<Admin> => {
  const response = await api.post<LoginResponse>('/admin/login', data);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(response.data.admin));
  localStorage.setItem(TOKEN_KEY, response.data.token);
  return response.data.admin;
};
export const logout = (): void => {
  localStorage.removeItem(ADMIN_KEY);
  localStorage.removeItem(TOKEN_KEY);
};
export const getCurrentAdmin = (): Admin | null => {
  const stored = localStorage.getItem(ADMIN_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Admin;
  } catch {
    return null;
  }
};
export const updateCurrentAdmin = (admin: Admin): void => {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};
export const isLoggedIn = (): boolean => {
  return getCurrentAdmin() !== null && getToken() !== null;
};