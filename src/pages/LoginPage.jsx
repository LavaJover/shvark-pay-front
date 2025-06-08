import { useState } from "react"
import { loginUser } from "../api/auth"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const LoginPage = () => {
    const [userLogin, setLogin] = useState('')
    const [userPassword, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const {login} = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (!userLogin || !userPassword) {
            setError('Пожалуйста, заполните все поля')
        }
        try {
            const data = await loginUser({login: userLogin, password: userPassword})
            console.log('before navigate')
            login()
            navigate('/')
        }catch (err) {
        
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
        <form onSubmit={handleSubmit}>
            <label htmlFor="login">Логин</label>
            <input
                type="text"
                id="login"
                className="login-input" 
                value={userLogin} 
                onChange={(event) => setLogin(event.target.value)}
            />

            <label htmlFor="password">Пароль</label>
            <input
                type="password"
                id="password" 
                className="password-input" 
                value={userPassword}
                onChange={(event) => setPassword(event.target.value)}
            />

            <button>Войти</button>
        </form>
        </>
    )
}

export default LoginPage