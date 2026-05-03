import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialise from sessionStorage so a page-refresh keeps the user logged in
  // (the actual auth is the httpOnly cookie; this is just UI state)
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('medred_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function login(userData) {
    setUser(userData);
    sessionStorage.setItem('medred_user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem('medred_user');
  }

  function updateUser(data) {
    const updated = { ...user, ...data };
    setUser(updated);
    sessionStorage.setItem('medred_user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
