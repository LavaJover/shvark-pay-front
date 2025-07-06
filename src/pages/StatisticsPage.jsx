import { useState } from "react"
import "./StatisticsPage.css"
import { DateRangePicker } from "../components/DateRangePicker"

const StatisticsPage = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  })

  return (
    <div className="statistics-container">
      <h1 className="page-title">Статистика</h1>

      <div className="filters-section">
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      <div className="metrics-grid">
        <StatCard title="Сделок в фиате" value="0" subtitle="Обработано заявок" />
        <StatCard title="Сделок в крипте" value="0" subtitle="Обработано заявок" />
        <StatCard title="Прибыль в крипте" value="+0 USD" subtitle="Чистая прибыль" />
        <StatCard title="Общая сумма сделок в фиате" value="0 ₽" subtitle="Создано сделок" />
      </div>
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
