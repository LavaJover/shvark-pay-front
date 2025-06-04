import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser } from "../api/auth"
import { useAuth } from "../auth/AuthContext"

const LoginPage = () => {
    const [userLogin, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { login } = useAuth();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
  
      try {
        const token = await loginUser({ userLogin, password });
        login(token); // сохраняем через контекст
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    };


    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: '2rem auto' }}>
        <h2>Вход</h2>
  
        <input
          type="text"
          placeholder="Логин"
          value={userLogin}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <br />
  
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
  
        <button type="submit">Войти</button>
  
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    )
}

export default LoginPage