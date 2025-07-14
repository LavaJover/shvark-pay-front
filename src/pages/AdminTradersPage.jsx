import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useAuth } from "../contexts/AuthContext"
import api from "../api/axios"

const AdminTradersPage = () => {
  const { token } = useAuth()

  const [form, setForm] = useState({
    username: "",
    login: "",
    password: "",
  })

  const [traders, setTraders] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const fetchTraders = async () => {
    setFetching(true)
    try {
      const res = await api.get("/admin/traders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setTraders(res.data.users)
    } catch (err) {
      toast.error("Ошибка при загрузке трейдеров")
      console.error(err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchTraders()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("/admin/teams/create", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast.success("Трейдер создан")
      setForm({ username: "", login: "", password: "" })
      fetchTraders()
    } catch (err) {
      console.error(err)
      toast.error("Ошибка при создании трейдера")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-traders-page">
      <h1>Создание аккаунта трейдера</h1>
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
          {loading ? "Создание..." : "Создать трейдера"}
        </button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Список трейдеров</h2>
      {fetching ? (
        <p>Загрузка трейдеров...</p>
      ) : (
        <div className="traders-table-wrapper">
          <table className="traders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Login</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {traders.map((trader) => (
                <tr key={trader.id}>
                  <td>{trader.id}</td>
                  <td>{trader.username}</td>
                  <td>{trader.login}</td>
                  <td>{trader.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminTradersPage
