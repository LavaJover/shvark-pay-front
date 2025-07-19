import { useEffect, useState } from "react"
import api from "../api/axios"
import { toast } from "react-toastify"
import "./AdminTraderOrdersPage.css"

const statusOptions = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
  // добавь сюда нужные статусы из API
]

const AdminTraderOrdersPage = () => {
  const [traders, setTraders] = useState([])
  const [selectedTrader, setSelectedTrader] = useState("")
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: [],
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
    currency: "",
    sortBy: "expires_at",
    sortOrder: "desc"
  })

  // Загрузка списка трейдеров
  const fetchTraders = async () => {
    try {
      const res = await api.get("/admin/traders")
      setTraders(res.data.users || [])
    } catch (e) {
      toast.error("Ошибка при загрузке списка трейдеров")
      console.error(e)
    }
  }

  // Загрузка сделок выбранного трейдера
  const fetchOrders = async () => {
    if (!selectedTrader) return
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      }
      if (filters.status.length) params.status = filters.status
      if (filters.minAmount) params.min_amount = filters.minAmount
      if (filters.maxAmount) params.max_amount = filters.maxAmount
      if (filters.dateFrom) params.date_from = filters.dateFrom
      if (filters.dateTo) params.date_to = filters.dateTo
      if (filters.currency) params.currency = filters.currency

      const res = await api.get(`/orders/trader/${selectedTrader}`, { params })
      setOrders(res.data.orders || [])
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.pagination?.total_pages || 1,
        page: res.data.pagination?.current_page || prev.page
      }))
    } catch (e) {
      toast.error("Ошибка при загрузке сделок")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTraders()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [selectedTrader, pagination.page, pagination.limit, filters])

  // Обновление фильтров
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // при смене фильтра сброс страницы
  }

  // Смена лимита
  const handleLimitChange = (e) => {
    setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))
  }

  // Смена страницы
  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // Смена сортировки
  const handleSortChange = (field) => {
    if (filters.sortBy === field) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === "asc" ? "desc" : "asc"
      }))
    } else {
      setFilters(prev => ({ ...prev, sortBy: field, sortOrder: "asc" }))
    }
  }

  const renderSortArrow = (field) => {
    if (filters.sortBy !== field) return null
    return filters.sortOrder === "asc" ? " ▲" : " ▼"
  }

  return (
    <div className="admin-trader-orders-page">
      <h1>Сделки трейдера (Админ)</h1>

      <div className="filter-row">
        <label>Выберите трейдера: </label>
        <select value={selectedTrader} onChange={e => {
          setSelectedTrader(e.target.value)
          setPagination(prev => ({ ...prev, page: 1 })) // сброс страницы при смене трейдера
        }}>
          <option value="">-- Выберите трейдера --</option>
          {traders.map(t => (
            <option key={t.id} value={t.id}>{t.username}</option>
          ))}
        </select>
      </div>

      {selectedTrader && (
        <>
          <div className="filters">
            <div className="filter-item">
              <label>Статус:</label>
              <select
                multiple
                value={filters.status}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions, o => o.value)
                  handleFilterChange("status", selected)
                }}
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Мин. сумма (₽):</label>
              <input
                type="number"
                min="0"
                value={filters.minAmount}
                onChange={e => handleFilterChange("minAmount", e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label>Макс. сумма (₽):</label>
              <input
                type="number"
                min="0"
                value={filters.maxAmount}
                onChange={e => handleFilterChange("maxAmount", e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label>Дата от:</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label>Дата до:</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => handleFilterChange("dateTo", e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label>Валюта:</label>
              <input
                type="text"
                value={filters.currency}
                onChange={e => handleFilterChange("currency", e.target.value.toUpperCase())}
                placeholder="Например, RUB, USDT"
              />
            </div>

            <div className="filter-item">
              <label>Записей на странице:</label>
              <select value={pagination.limit} onChange={handleLimitChange}>
                {[5, 10, 20, 50].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p>Загрузка...</p>
          ) : orders.length === 0 ? (
            <p>Сделок не найдено</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortChange("amount_fiat")} style={{cursor: "pointer"}}>
                    Сумма (₽){renderSortArrow("amount_fiat")}
                  </th>
                  <th>Сумма (крипто)</th>
                  <th>Банк / Платёжная система</th>
                  <th>Статус</th>
                  <th onClick={() => handleSortChange("expires_at")} style={{cursor: "pointer"}}>
                    Истекает {renderSortArrow("expires_at")}
                  </th>
                  <th>Дата создания</th>
                  <th>Merchant Order ID</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.order_id}>
                    <td data-label="Сумма (₽)">{o.amount_fiat}</td>
                    <td data-label="Сумма (крипто)">{o.amount_crypto?.toFixed(6)}</td>
                    <td data-label="Банк / Платёжная система">{o.bank_detail?.bank_name} / {o.bank_detail?.payment_system}</td>
                    <td data-label="Статус">{o.status}</td>
                    <td data-label="Истекает">{o.expires_at ? new Date(o.expires_at).toLocaleString() : "-"}</td>
                    <td data-label="Дата создания">{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</td>
                    <td data-label="Merchant Order ID">{o.merchant_order_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pagination">
            <button disabled={pagination.page === 1} onClick={() => changePage(pagination.page - 1)}>
              Назад
            </button>
            <span>
              Стр. {pagination.page} / {pagination.totalPages}
            </span>
            <button disabled={pagination.page === pagination.totalPages} onClick={() => changePage(pagination.page + 1)}>
              Вперёд
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminTraderOrdersPage
