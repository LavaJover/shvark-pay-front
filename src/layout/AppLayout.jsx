import {Outlet, Link, useNavigate} from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'

const AppLayout = () => {
    const {logout} = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        toast.success('Выход из аккаунта')
        navigate('/login')
    }

    return (
        <>
        <header>
            <nav className='nav-panel'>
                <Link to="/" className='nav-link'>Главная</Link>
                <Link to="/orders" className='nav-link'>Сделки</Link>
                <Link to="/bank-details" className='nav-link'>Реквизиты</Link>
                <Link to="/history" className='nav-link'>История операций</Link>
                <Link to="/stats" className='nav-link'>Статистика</Link>
                <Link to="/settings" className='nav-link'>Настройки</Link>
                <button className='logout-button' onClick={handleLogout}>Выйти</button>
            </nav>
        </header>
        <main>
            <Outlet/>
        </main>
        </>
    )
}

export default AppLayout