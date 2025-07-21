import { useEffect, useState } from "react"
import { DateRangePicker } from "../components/DateRangePicker"
import "./StatisticsPage.css"
import api from "../api/axios"

const StatisticsPage = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  })

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStatistics = async () => {
    setLoading(true)
    setError(null)

    try {
      const from = dateRange.from.toISOString()
      const to = dateRange.to.toISOString()

      const response = await api.get("/orders/statistics", {
        params: {
          date_from: from,
          date_to: to,
        },
      })

      setStats(response.data)
    } catch (err) {
      setError("Ошибка загрузки статистики")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [dateRange])

  return (
    <div className="statistics-container">
      <h1 className="page-title">Статистика</h1>

      <div className="filters-section">
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      {loading && <p className="info-text">Загрузка...</p>}
      {error && <p className="error-text">{error}</p>}

      {stats && (
        <div className="metrics-grid">
          <StatCard title="Успешных сделок" value={stats.succeed_orders} subtitle="Обработано заявок" />
          <StatCard title="Отменённых сделок" value={stats.canceled_orders} subtitle="Отклонено заявок" />
          <StatCard title="Сумма в крипте (обработано)" value={`${stats.processed_amount_crypto} USD`} subtitle="Успешные заявки" />
          <StatCard title="Сумма в фиате (обработано)" value={`${stats.processed_amount_fiat} ₽`} subtitle="Успешные заявки" />
          <StatCard title="Сумма в крипте (отмена)" value={`${stats.canceled_amount_crypto} USD`} subtitle="Отклонённые заявки" />
          <StatCard title="Сумма в фиате (отмена)" value={`${stats.canceled_amount_fiat} ₽`} subtitle="Отклонённые заявки" />
          <StatCard title="Прибыль в крипте" value={`+${stats.income_crypto} USD`} subtitle="Чистая прибыль" />
          <StatCard title="Всего сделок" value={stats.total_orders} subtitle="За период" />
        </div>
      )}
    </div>
  )
}

export default StatisticsPage

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="stat-card">
      <h2 className="stat-title">{title}</h2>
      <p className="stat-value">{value}</p>
      <p className="stat-subtitle">{subtitle}</p>
    </div>
  )
}