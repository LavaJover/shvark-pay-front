export async function fetchWalletBalance(traderId, token) {
    const response = await fetch(`http://localhost:8080/api/v1/wallets/${traderId}/balance`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // важно передать токен сюда
      },
    });
  
    if (!response.ok) {
      throw new Error('Ошибка получения баланса');
    }
  
    return await response.json();
  }
  