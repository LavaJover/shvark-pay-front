import { useState } from "react"
import { loginUser } from "../api/auth"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import './LoginPage.css'

const LoginPage = () => {
    const [userLogin, setLogin] = useState('')
    const [userPassword, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [twoFaRequired, setTwoFaRequired] = useState(false)
    const [twoFACode, setTwoFACode] = useState('')
    const navigate = useNavigate()

    const {login} = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (!userLogin || !userPassword) {
            setError('Пожалуйста, заполните все поля')
        }
        try {
            const data = await loginUser({login: userLogin, password: userPassword, twoFACode})
            login(data.access_token)
            navigate('/')
        }catch (err) {
            console.log(err.response.data)
            if (err.response.data.error === "rpc error: code = Unauthenticated desc = 2FA_REQUIRED"){
                console.log(true)
                setTwoFaRequired(true)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
        <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
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

            {twoFaRequired && (
                 <input type="text" placeholder="Код из Google Authenticator" value={twoFACode} onChange={e => setTwoFACode(e.target.value)} />
            )}

            <button type="submit">Войти</button>
        </form>
        </div>
        </>
    )
}

export default LoginPage