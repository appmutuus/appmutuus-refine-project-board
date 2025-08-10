import { createContext, useContext, useState, ReactNode } from 'react';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Fdwfdw24';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';
  });

  const login = (username: string, password: string) => {
    const verified = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    if (verified) {
      setIsAdmin(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAdmin', 'true');
      }
    } else {
      setIsAdmin(false);
    }
    return verified;
  };

  const logout = () => {
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

