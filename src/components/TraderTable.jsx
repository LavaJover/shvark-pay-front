import { useEffect, useState } from "react"
import { fetchTraders } from "../api/admin"
import "./TraderTable.css"

const TraderTable = () => {
  const [traders, setTraders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTraders = async () => {
      try {
        const data = await fetchTraders()
        setTraders(data)
      } catch (err) {
        console.error("Ошибка загрузки трейдеров:", err)
        setError("Не удалось загрузить трейдеров")
      } finally {
        setLoading(false)
      }
    }

    loadTraders()
  }, [])

  if (loading) return <p>Загрузка...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>

  return (
    <div className="trader-table-wrapper">
      <h2>Список трейдеров</h2>
      <table className="trader-table">
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
  )
}

export default TraderTable
