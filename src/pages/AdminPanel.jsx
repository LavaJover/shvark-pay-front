import { Link, Outlet, useLocation } from "react-router-dom"
import { useState } from "react"
import './AdminPanel.css'

const AdminPanel = () => {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="admin-panel">
      <button className="admin-burger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <h2>Админка</h2>
        <nav>
          <ul>
            <li className={location.pathname.includes('/admin/traders') ? 'active' : ''}>
              <Link to="/admin/traders" onClick={() => setMenuOpen(false)}>Трейдеры</Link>
            </li>
            <li className={location.pathname.includes('/admin/merchants') ? 'active' : ''}>
              <Link to="/admin/merchants" onClick={() => setMenuOpen(false)}>Мерчанты</Link>
            </li>
            <li className={location.pathname.includes('/admin/traffic') ? 'active' : ''}>
              <Link to="/admin/traffic" onClick={() => setMenuOpen(false)}>Траффик</Link>
            </li>
            <li className={location.pathname.includes('/admin/wallets') ? 'active' : ''}>
              <Link to="/admin/wallets" onClick={() => setMenuOpen(false)}>Кошельки</Link>
            </li>
            <li className={location.pathname.includes('/admin/disputes') ? 'active' : ''}>
              <Link to="/admin/disputes" onClick={() => setMenuOpen(false)}>Диспуты</Link>
            </li>
            <li className={location.pathname.includes('/admin/orders') ? 'active' : ''}>
              <Link to="/admin/orders" onClick={() => setMenuOpen(false)}>Сделки</Link>
            </li>
          </ul>
        </nav>
      </aside>

      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  )
}

export default AdminPanel