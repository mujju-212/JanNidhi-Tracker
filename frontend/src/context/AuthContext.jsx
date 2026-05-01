import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('jn_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readStoredToken = () => {
  try {
    return localStorage.getItem('jn_token');
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser());
  const [token, setToken] = useState(readStoredToken());

  const login = ({ user: nextUser, token: nextToken }) => {
    setUser(nextUser || null);
    setToken(nextToken || null);
    if (nextUser) {
      localStorage.setItem('jn_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('jn_user');
    }
    if (nextToken) {
      localStorage.setItem('jn_token', nextToken);
    } else {
      localStorage.removeItem('jn_token');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jn_user');
    localStorage.removeItem('jn_token');
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
