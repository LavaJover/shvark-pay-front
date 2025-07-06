export const DateRangePicker = ({ dateRange, setDateRange }) => {
    const handleChange = (e) => {
      const { name, value } = e.target
      setDateRange({ ...dateRange, [name]: value })
    }
  
    return (
      <div className="date-range-picker">
        <div>
          <label>С</label>
          <input
            type="date"
            name="from"
            value={dateRange.from.toISOString().split("T")[0]}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>По</label>
          <input
            type="date"
            name="to"
            value={dateRange.to.toISOString().split("T")[0]}
            onChange={handleChange}
          />
        </div>
      </div>
    )
  }
  