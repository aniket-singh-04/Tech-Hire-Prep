import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction, ReactNode } from "react";
import type { AuthUser, UserRole } from "../features/auth/types";
import { userHasRole } from "../features/auth/access";
import { mapAuthUser } from "../features/auth/user";
import { api, ApiError } from "../utils/api";
import { useToast } from "./ToastContext";
import { getErrorMessage } from "../utils/notifications";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  login: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasRole: (roles?: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const fetchUser = async (skipRefresh = false) => {
    try {
      const data = await api.get<any>("/api/v1/auth/me", { skipRefresh });
      const payload = data?.user ?? data?.data ?? data;
      const mappedUser = mapAuthUser(payload);
      setUser(mappedUser);
    } catch (error) {
      pushToast({ title: "Session error", description: getErrorMessage(error, "An error occurred"), variant: "error" });
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const refreshResponse = await api.post<any>("/api/v1/auth/refresh", undefined, { skipRefresh: true });
      const accessToken = refreshResponse?.data?.accessToken;
      const refreshUser = mapAuthUser(refreshResponse?.data?.user);

      if (accessToken) {
        localStorage.setItem('token', accessToken);
      }
      if (refreshUser) {
        setUser(refreshUser);
        setLoading(false);
        return;
      }
    } catch {
      localStorage.removeItem('token');
    }

    if (!localStorage.getItem('token')) {
      setUser(null);
      setLoading(false);
      return;
    }

    await fetchUser(true);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = (token: string, loggedInUser: AuthUser) => {
    localStorage.setItem('token', token);
    setUser(loggedInUser);
  };

  const logout = async (): Promise<void> => {
    try {
      const response = await api.post<any>("/api/v1/auth/logout");
      if (response?.success === false) {
        throw new Error(response?.message || "Logout failed");
      }
    } catch (error) {
      pushToast({ title: "Logout failed", description: getErrorMessage(error, "Failed to log out"), variant: "error" });
      throw error;
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const hasRole = (roles?: UserRole | UserRole[]) => userHasRole(user, roles);

  const value = useMemo(() => ({ user, loading, setUser, login, logout, refresh, hasRole }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider missing");
  return context;
};
