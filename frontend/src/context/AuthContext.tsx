import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, removeToken, setToken } from '../lib/api-client';
import { AuthResponse, UserRole, UserSummary } from '../types';

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string, role?: string) => Promise<AuthResponse>;
  register: (data: any) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    const existingToken = getToken();
    if (!existingToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<UserSummary>('/auth/me');
      setUser(data);
    } catch (err) {
      removeToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (usernameOrEmail: string, password: string, role?: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { usernameOrEmail, password, role });
    setToken(res.token);
    setTokenState(res.token);
    setUser({
      userId: res.userId,
      username: res.username,
      email: res.email,
      role: res.role,
      accountStatus: 'ACTIVE',
      fullName: res.fullName,
      patientCode: res.patientCode,
      entityId: res.entityId,
    });
    return res;
  };

  const register = async (data: any): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    setToken(res.token);
    setTokenState(res.token);
    setUser({
      userId: res.userId,
      username: res.username,
      email: res.email,
      role: res.role,
      accountStatus: 'ACTIVE',
      fullName: res.fullName,
      patientCode: res.patientCode,
      entityId: res.entityId,
    });
    return res;
  };

  const logout = () => {
    try {
      api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loading: isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
