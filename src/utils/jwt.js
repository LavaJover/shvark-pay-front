export function parseJWT(token) {
    if (!token) return null;
  
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch (err) {
      console.error('Ошибка декодирования JWT:', err);
      return null;
    }
  }
  