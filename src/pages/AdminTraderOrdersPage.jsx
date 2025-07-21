import { useEffect, useState } from "react"
import api from "../api/axios"
import { toast } from "react-toastify"
import "./AdminTraderOrdersPage.css"

const statusOptions = [
  "CREATED",
  "SUCCEED",
  "CANCELED",
  // другие статусы, если нужны
]

const AdminTraderOrdersPage = () => {
  const [traders, setTraders] = useState([])
  const [merchants, setMerchants] = useState([])
  const [selectedTrader, setSelectedTrader] = useState("")
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
    currency: "",
    sortBy: "expires_at",
    sortOrder: "desc"
  })

  // Загрузка списка трейдеров и мерчантов
  const fetchUsers = async () => {
    try {
      const [tradersRes, merchantsRes] = await Promise.all([
        api.get("/admin/traders"),
        api.get("/admin/merchants"),
      ])
      setTraders(tradersRes.data.users || [])
      setMerchants(merchantsRes.data.users || [])
    } catch (e) {
      toast.error("Ошибка при загрузке списка трейдеров или мерчантов")
      console.error(e)
    }
  }

  // Получить username по id из списка
  const getUsername = (id, list) => {
    const user = list.find(u => u.id === id)
    return user ? user.username : id
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
      if (filters.status) params.status = filters.status
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
    fetchUsers()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [selectedTrader, pagination.page, pagination.limit, filters])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // сброс страницы при смене фильтра
  }

  const handleLimitChange = (e) => {
    setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))
  }

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPagination(prev => ({ ...prev, page: newPage }))
  }

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

  // Таймер до истечения сделки
  const formatExpires = (expiresAt) => {
    if (!expiresAt) return "-"
    const expiresDate = new Date(expiresAt)
    const now = new Date()
    if (expiresDate <= now) return "Истекло"
    const diffMs = expiresDate - now
    const minutes = Math.floor(diffMs / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)
    return `${minutes}м ${seconds}с`
  }

  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
const [disputeForm, setDisputeForm] = useState({
  proof_url: "",
  dispute_reason: "",
  ttl: "",
  dispute_amount_fiat: "",
  order_id: ""
})

const openDisputeModal = (orderId) => {
  setDisputeForm(prev => ({ ...prev, order_id: orderId }))
  setDisputeModalOpen(true)
}

const closeDisputeModal = () => {
  setDisputeModalOpen(false)
  setDisputeForm({
    proof_url: "",
    dispute_reason: "",
    ttl: "",
    dispute_amount_fiat: "",
    order_id: ""
  })
}

const submitDispute = async () => {
  try {
    await api.post("/admin/disputes/create", {
      order_id: disputeForm.order_id,
      proof_url: disputeForm.proof_url,
      dispute_reason: disputeForm.dispute_reason,
      ttl: disputeForm.ttl,
      dispute_amount_fiat: parseFloat(disputeForm.dispute_amount_fiat)
    })
    toast.success("Диспут успешно открыт")
    closeDisputeModal()
  } catch (e) {
    toast.error("Ошибка при открытии диспута")
    console.error(e)
  }
}


  return (
    <div className="admin-trader-orders-page">
      <h1>Сделки трейдера (Админ)</h1>

      <div className="filter-row">
        <label>Выберите трейдера: </label>
        <select
          value={selectedTrader}
          onChange={e => {
            setSelectedTrader(e.target.value)
            setPagination(prev => ({ ...prev, page: 1 }))
          }}
        >
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
                value={filters.status}
                onChange={e => {
                  handleFilterChange("status", e.target.value)
                }}
              >
                <option value="">-- Все --</option>
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
                  <th>Банк</th>
                  <th>Платёжная система</th>
                  <th>Владелец</th>
                  <th onClick={() => handleSortChange("amount_fiat")} style={{ cursor: "pointer" }}>
                    Сумма (₽){renderSortArrow("amount_fiat")}
                  </th>
                  <th>Сумма (крипто)</th>
                  <th>Курс</th>
                  {/* <th>Трейдер</th> */}
                  <th>Merchant</th>
                  <th>Merchant order ID</th>
                  <th>Создана / Обновлена</th>
                  <th onClick={() => handleSortChange("expires_at")} style={{ cursor: "pointer" }}>
                    Таймер{renderSortArrow("expires_at")}
                  </th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const bank = o.bank_detail || {}
                  return (
                    <tr key={o.order_id}>
                      <td>{bank.bank_name || "-"}</td>
                      <td>{bank.payment_system || "-"}</td>
                      <td>{bank.owner || "-"}</td>
                      <td>{o.amount_fiat} Rub</td>
                      <td>{o.amount_crypto?.toFixed(6)} USD</td>
                      <td>{o.crypto_rub_rate}</td>
                      {/* <td>{getUsername(o.bank_detail.trader_id, traders)}</td> */}
                      <td>{getUsername(o.merchant_id, merchants)}</td>
                      <td>{o.merchant_order_id}</td>
                      <td>{o.created_at} / {o.updated_at}</td>
                      <td>{formatExpires(o.expires_at)}</td>
                      <td>
                        {o.status}
                        {o.status === "CANCELED" && (
                          <button className="dispute-btn" onClick={() => openDisputeModal(o.order_id)}>
                            Открыть диспут
                          </button>
                        )}
                      </td>

                    </tr>
                  )
                })}
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

{disputeModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Открытие диспута</h2>

      <label>Причина диспута:</label>
      <textarea
        value={disputeForm.dispute_reason}
        onChange={(e) => setDisputeForm(prev => ({ ...prev, dispute_reason: e.target.value }))}
      />

      <label>Ссылка на доказательство (proof_url):</label>
      <input
        type="text"
        value={disputeForm.proof_url}
        onChange={(e) => setDisputeForm(prev => ({ ...prev, proof_url: e.target.value }))}
      />

      <label>TTL (например, 24h, 2d):</label>
      <input
        type="text"
        value={disputeForm.ttl}
        onChange={(e) => setDisputeForm(prev => ({ ...prev, ttl: e.target.value }))}
      />

      <label>Сумма диспута (₽):</label>
      <input
        type="number"
        value={disputeForm.dispute_amount_fiat}
        onChange={(e) => setDisputeForm(prev => ({ ...prev, dispute_amount_fiat: e.target.value }))}
      />

      <div className="modal-buttons">
        <button onClick={submitDispute}>Отправить</button>
        <button onClick={closeDisputeModal}>Отмена</button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}

export default AdminTraderOrdersPage
