import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    if (token && email && role) {
      setUser({ token, email, role, userId: Number(userId) });
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', data.userId);
    setUser({ token: data.token, email: data.email, role: data.role, userId: data.userId });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isCustomer = () => user?.role === 'CUSTOMER';
  const isLoggedIn = () => !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isCustomer, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
