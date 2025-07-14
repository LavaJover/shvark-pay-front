import { useEffect, useState } from "react"
import api from "../api/axios"
import { toast } from "react-toastify"
import "./AdminTrafficPage.css"

const AdminTrafficPage = () => {
  const [traders, setTraders] = useState([])
  const [merchants, setMerchants] = useState([])
  const [trafficList, setTrafficList] = useState([])

  const [form, setForm] = useState({
    id: "",
    trader_id: "",
    merchant_id: "",
    trader_reward: 0,
    trader_priority: 0,
    platform_fee: 0,
    enabled: true,
  })

  const [editing, setEditing] = useState(false)

  const fetchData = async () => {
    try {
      const [traderRes, merchantRes, trafficRes] = await Promise.all([
        api.get("/admin/traders"),
        api.get("/admin/merchants"),
        api.get("/admin/traffic/records?page=1&limit=10"),
      ])
      setTraders(traderRes.data.users)
      setMerchants(merchantRes.data.users)
      setTrafficList(trafficRes.data.traffic_records || [])
    } catch (err) {
      toast.error("Ошибка при загрузке данных")
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const floatFields = ["trader_reward", "trader_priority", "platform_fee"]

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : floatFields.includes(name)
          ? parseFloat(value) || 0
          : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.patch("/admin/traffic/edit", { traffic: form })
        toast.success("Трафик обновлён")
      } else {
        await api.post("/admin/traffic/create", form)
        toast.success("Трафик создан")
      }
      setForm({
        id: "",
        trader_id: "",
        merchant_id: "",
        trader_reward: 0,
        trader_priority: 0,
        platform_fee: 0,
        enabled: true,
      })
      setEditing(false)
      fetchData()
    } catch (err) {
      toast.error("Ошибка при сохранении трафика")
      console.error(err)
    }
  }

  const handleEdit = (traffic) => {
    setForm(traffic)
    setEditing(true)
  }

  const getUsername = (id, list) => {
    if (!id || list.length === 0) return "—"
    const found = list.find((x) => x.id === id)
    return found ? `${found.username} (${found.login})` : id
  }

  return (
    <div className="admin-traffic-page">
      <h1>Настройка трафика</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Мерчант</label>
          <select
            name="merchant_id"
            value={form.merchant_id}
            onChange={handleChange}
            required
          >
            <option value="">Выбери мерчанта</option>
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.username} ({m.login})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Трейдер</label>
          <select
            name="trader_id"
            value={form.trader_id}
            onChange={handleChange}
            required
          >
            <option value="">Выбери трейдера</option>
            {traders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.username} ({t.login})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Награда трейдера</label>
          <input
            name="trader_reward"
            type="number"
            step="any"
            value={form.trader_reward}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Приоритет трейдера</label>
          <input
            name="trader_priority"
            type="number"
            step="any"
            value={form.trader_priority}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Комиссия платформы</label>
          <input
            name="platform_fee"
            type="number"
            step="any"
            value={form.platform_fee}
            onChange={handleChange}
          />
        </div>

        <div className="form-group checkbox-group">
          <label>Активен</label>
          <input
            name="enabled"
            type="checkbox"
            checked={form.enabled}
            onChange={handleChange}
          />
        </div>

        <button type="submit">{editing ? "Сохранить" : "Создать"}</button>
      </form>

      <h2>Список трафика</h2>

      {trafficList.length === 0 ||
      merchants.length === 0 ||
      traders.length === 0 ? (
        <p>Загрузка данных...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Мерчант</th>
              <th>Трейдер</th>
              <th>Награда</th>
              <th>Приоритет</th>
              <th>Комиссия</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trafficList.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{getUsername(t.merchant_id, merchants)}</td>
                <td>{getUsername(t.trader_id, traders)}</td>
                <td>{t.trader_reward * 100}%</td>
                <td>{t.trader_priority}</td>
                <td>{t.platform_fee * 100}%</td>
                <td>{t.enabled ? "✅" : "❌"}</td>
                <td>
                  <button onClick={() => handleEdit(t)}>Редактировать</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminTrafficPage
