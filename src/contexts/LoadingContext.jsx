import { createContext, useContext, useState, useEffect } from 'react';

const LoadingContext = createContext();

import { setLoadingHandlers } from '../utils/loadingManager';

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => setLoadingCount((count) => count + 1);
  const stopLoading = () => setLoadingCount((count) => Math.max(0, count - 1));

  useEffect(() => {
    setLoadingHandlers(startLoading, stopLoading);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading: loadingCount > 0 }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
