import { useMemo } from 'react';
import { parseJWT } from '../utils/jwt';

export default function useAuthPayload() {
  const token = localStorage.getItem('token');

  return useMemo(() => {
    return parseJWT(token);
  }, [token]);
}