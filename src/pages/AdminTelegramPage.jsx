// TelegramLogin.jsx
import React, { useState } from 'react';
import api from '../api/axios';
import './AdminTelegramPage.css'

const TelegramLogin = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCopied(false);
    setToken('');
    setError('');

    try {
      const res = await api.post('/login', { login, password });
      setToken(res.data.access_token);
    } catch (err) {
      setError('Неверный логин или пароль');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
  };

  return (
    <div className="container">
      <h2>Генерация токена</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>Login</label>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Войти</button>
      </form>

      {error && <p className="error">{error}</p>}

      {token && (
        <div className="token-box" onClick={handleCopy}>
          <p>{token}</p>
          {copied && <span className="copied">✓ Скопировано</span>}
        </div>
      )}
    </div>
  );
};

export default TelegramLogin;
