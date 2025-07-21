export const DateRangePicker = ({ dateRange, setDateRange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    setDateRange({
      ...dateRange,
      [name]: new Date(value), // ← вот так
    })
  }

  return (
    <div className="date-range-picker">
      <div>
        <label>С</label>
        <input
          type="date"
          name="from"
          value={dateRange.from instanceof Date ? dateRange.from.toISOString().split("T")[0] : ""}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>По</label>
        <input
          type="date"
          name="to"
          value={dateRange.to instanceof Date ? dateRange.to.toISOString().split("T")[0] : ""}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
