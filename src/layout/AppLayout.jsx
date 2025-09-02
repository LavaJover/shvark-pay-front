import {Outlet, Link, useNavigate} from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import './Header.css'
import './AppLayout.css'
import { useState } from 'react'

const AppLayout = () => {
    const {logout, isAdmin, isTeamLead} = useAuth()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        toast.success('Выход из аккаунта')
        navigate('/login')
    }

    return (
        <>
        <header>
            <div className="header-content">

                <button
                    className="burger-button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    ☰
                </button>

                <nav className={`nav-panel ${mobileMenuOpen ? "open" : ""}`}>
                    <Link to="/" className='nav-link' onClick={() => setMobileMenuOpen(false)}>Главная</Link>
                    <Link to="/orders" className='nav-link' onClick={() => setMobileMenuOpen(false)}>Сделки</Link>
                    <Link to="/bank-details" className='nav-link' onClick={() => setMobileMenuOpen(false)}>Реквизиты</Link>
                    <Link to="/devices" className='nav-link' onClick={() => setMobileMenuOpen(false)}>Устройства</Link>
                    <Link to="/history" className='nav-link' onClick={() => setMobileMenuOpen(false)}>История операций</Link>
                    <Link to="/stats" className='nav-link' onClick={() => setMobileMenuOpen(false)}>Статистика</Link>
                    <Link to="/settings" className='nav-link' onClick={() => setMobileMenuOpen(false)}>Настройки</Link>
                    
                    {/* Кабинет тимлида (отображается при наличии прав) */}
                    {isTeamLead && (
                        <Link to="/team-lead" className='nav-link' onClick={() => setMobileMenuOpen(false)}>
                            Кабинет тимлида
                        </Link>
                    )}
                    
                    {/* Админ-панель (отображается при наличии прав) */}
                    {isAdmin && (
                        <Link to="/admin" className='nav-link' onClick={() => setMobileMenuOpen(false)}>
                            Админ-панель
                        </Link>
                    )}

                    <div className="mobile-logout">
                        <button className="logout-button" onClick={handleLogout}>Выйти</button>
                    </div>
                </nav>

                <div className="header-actions">
                    <button className='logout-button' onClick={handleLogout}>Выйти</button>
                </div>
            </div>
        </header>
        <main className='main-content'>
            <Outlet/>
        </main>
        </>
    )
}

export default AppLayout