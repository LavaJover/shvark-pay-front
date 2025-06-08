import { useEffect, useState } from 'react';
import { fetchWalletBalance } from '../api/wallet';
import { useAuth } from '../auth/AuthContext';

export function useWalletBalance(pollingInterval = 10000, isInitialized) {
  const { traderId, token, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isInitialized) return; // Ждем инициализации
    if (!isAuthenticated || !traderId) return;

    let intervalId;

    console.log(`Check useWalletBalance: ${traderId}`)

    const loadBalance = async () => {
      try {
        setLoading(true);
        const data = await fetchWalletBalance(traderId, token);
        setBalance(data);
        console.log(data)
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки баланса:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadBalance();
    intervalId = setInterval(loadBalance, pollingInterval);

    return () => clearInterval(intervalId);
  }, [traderId, isAuthenticated, pollingInterval, isInitialized]);

  return { balance, loading, error };
}
