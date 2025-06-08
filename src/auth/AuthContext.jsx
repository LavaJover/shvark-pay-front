import { createContext, useContext, useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [traderId, setTraderId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      try {
        const payload = jwtDecode(savedToken);
        const extractedTraderId = payload?.trader_id || payload?.user_id || payload?.sub || null;
        setTraderId(extractedTraderId);
      } catch (e) {
        console.error("Ошибка при декодировании токена:", e);
        setTraderId(null);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    try {
      const payload = jwtDecode(newToken);
      console.log(payload)
      const extractedTraderId = payload?.trader_id || payload?.user_id || payload?.sub || null;
      setTraderId(extractedTraderId);
    } catch (e) {
      console.error("Ошибка при декодировании токена при логине:", e);
      setTraderId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTraderId(null);
  };

  console.log(`TraderID: ${traderId}`)

  return (
    <AuthContext.Provider
      value={{
        token,
        traderId,
        login,
        logout,
        isAuthenticated: !!token,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);