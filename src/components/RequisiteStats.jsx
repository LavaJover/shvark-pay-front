import "./RequisiteStats.css"

const RequisiteStats = ({ stat, detail }) => {
  if (!stat) return <p>Загрузка...</p>

  const percent = (current, max) =>
    max > 0 ? Math.min(100, ((current / max) * 100).toFixed(1)) : 0

  return (
    <div className="requisite-stats">
      <p>Сегодня (штук): {stat.current_count_today} / {detail.max_quantity_day}</p>
      <ProgressBar percent={percent(stat.current_count_today, detail.max_quantity_day)} />

      <p>Месяц (штук): {stat.current_count_month} / {detail.max_quantity_month}</p>
      <ProgressBar percent={percent(stat.current_count_month, detail.max_quantity_month)} />

      <p>Сегодня (₽): {stat.current_amount_today} / {detail.max_amount_day}</p>
      <ProgressBar percent={percent(stat.current_amount_today, detail.max_amount_day)} />

      <p>Месяц (₽): {stat.current_amount_month} / {detail.max_amount_month}</p>
      <ProgressBar percent={percent(stat.current_amount_month, detail.max_amount_month)} />
    </div>
  )
}

const ProgressBar = ({ percent }) => {
  return (
    <div className="progress-bar">
      <div className="progress-bar-inner" style={{ width: `${percent}%` }}>
        <span>{percent}%</span>
      </div>
    </div>
  )
}

export default RequisiteStats
