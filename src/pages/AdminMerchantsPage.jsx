import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useAuth } from "../contexts/AuthContext"
import api from "../api/axios"
import './AdminMerchantsPage.css'

const AdminMerchantsPage = () => {
  const { token } = useAuth()

  const [form, setForm] = useState({
    username: "",
    login: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [merchants, setMerchants] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("/admin/merchants/create", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast.success("Мерчант создан")
      setForm({ username: "", login: "", password: "" })
      fetchMerchants()
    } catch (err) {
      console.error(err)
      toast.error("Ошибка при создании мерчанта")
    } finally {
      setLoading(false)
    }
  }

  const fetchMerchants = async () => {
    try {
      const res = await api.get("/admin/merchants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setMerchants(res.data.users || [])
    } catch (err) {
      console.error("Ошибка при получении списка мерчантов", err)
    }
  }

  useEffect(() => {
    fetchMerchants()
  }, [])

  return (
    <div className="admin-merchants-page">
      <h1>Создание аккаунта мерчанта</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Login</label>
          <input
            name="login"
            type="text"
            value={form.login}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Создание..." : "Создать мерчанта"}
        </button>
      </form>

      <h2>Список мерчантов</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Login</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((merchant) => (
            <tr key={merchant.id}>
                <td data-label="ID">{merchant.id}</td>
                <td data-label="Username">{merchant.username}</td>
                <td data-label="Login">{merchant.login}</td>
                <td data-label="Role">{merchant.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminMerchantsPage
