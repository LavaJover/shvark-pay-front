import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./AdminTraderOrdersPage.css";

const statusOptions = [
  "PENDING",
  "COMPLETED",
  "CANCELED",
  "DISPUTE"
];

const Timer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState("-");

  useEffect(() => {
    if (!expiresAt) return;
    
    const updateTimer = () => {
      const expiresDate = new Date(expiresAt);
      const now = new Date();
      
      if (expiresDate <= now) {
        setTimeLeft("Истекло");
        return;
      }
      
      const diffMs = expiresDate - now;
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setTimeLeft(`${minutes}м ${seconds}с`);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [expiresAt]);

  return <span>{timeLeft}</span>;
};

const AdminTraderOrdersPage = () => {
  const [traders, setTraders] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [selectedTrader, setSelectedTrader] = useState("");
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
    currency: "",
    sortBy: "expires_at",
    sortOrder: "desc"
  });

  const fetchUsers = async () => {
    try {
      // Получаем трейдеров, тимлидов и мерчантов параллельно
      const [tradersRes, teamLeadsRes, merchantsRes] = await Promise.all([
        api.get("/admin/users?role=TRADER"),
        api.get("/admin/users?role=TEAM_LEAD"),
        api.get("/admin/users?role=MERCHANT"),
      ]);

      // Объединяем трейдеров и тимлидов в один список
      const combinedTraders = [
        ...(tradersRes.data.users || []),
        ...(teamLeadsRes.data.users || [])
      ];

      setTraders(combinedTraders);
      setMerchants(merchantsRes.data.users || []);
    } catch (e) {
      toast.error("Ошибка при загрузке списка пользователей");
      console.error(e);
    }
  };

  const getUsername = (id, list) => {
    const user = list.find(u => u.id === id);
    return user ? user.username : id;
  };

  const fetchOrders = async () => {
    if (!selectedTrader) return;
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };
      if (filters.status) params.status = filters.status;
      if (filters.minAmount) params.min_amount = filters.minAmount;
      if (filters.maxAmount) params.max_amount = filters.maxAmount;
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      if (filters.currency) params.currency = filters.currency;

      const res = await api.get(`/orders/trader/${selectedTrader}`, { params });
      setOrders(res.data.orders || []);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.pagination?.total_pages || 1,
        page: res.data.pagination?.current_page || prev.page
      }));
    } catch (e) {
      toast.error("Ошибка при загрузке сделок");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [selectedTrader, pagination.page, pagination.limit, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLimitChange = (e) => {
    setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }));
  };

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (field) => {
    if (filters.sortBy === field) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === "asc" ? "desc" : "asc"
      }));
    } else {
      setFilters(prev => ({ ...prev, sortBy: field, sortOrder: "asc" }));
    }
  };

  const renderSortArrow = (field) => {
    if (filters.sortBy !== field) return null;
    return filters.sortOrder === "asc" ? " ▲" : " ▼";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return (
      <div className="time-container">
        <div className="time-row">-</div>
      </div>
    );
    
    const date = new Date(dateString);
    const utcHours = String(date.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(date.getUTCMinutes()).padStart(2, '0');
    const utcDate = `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const utcTime = `${utcHours}:${utcMinutes}`;
    
    const localDate = date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit'
    });
    const localTime = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <div className="time-container">
        <div className="time-row">
          <span className="time-label">UTC:</span>
          <span className="time-value">{utcDate} {utcTime}</span>
        </div>
        <div className="time-row">
          <span className="time-label">Лок:</span>
          <span className="time-value">{localDate} {localTime}</span>
        </div>
      </div>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("ID скопирован в буфер");
  };

  const OrderIdCell = ({ orderId }) => {
    const shortId = orderId.length > 8 ? `${orderId.substring(0, 4)}...${orderId.slice(-4)}` : orderId;
    
    return (
      <div 
        className="order-id-cell"
        onClick={() => copyToClipboard(orderId)}
        title="Нажмите, чтобы скопировать ID"
      >
        {shortId}
        <span className="copy-icon">⎘</span>
      </div>
    );
  };

  const BankDetailsCard = ({ bank }) => {
    if (!bank) return <div className="bank-details-card">Нет данных</div>;
    
    let contactInfo;
    if (bank.payment_system === "SBP") {
        contactInfo = bank.phone || "Не указано";
    } else if (bank.payment_system === "C2C") {
        contactInfo = bank.card_number || "Не указано";
    } else {
        // Для других платежных систем или если не указана система
        contactInfo = bank.card_number || bank.phone || "Не указано";
    }
    
    return (
      <div className="bank-details-card">
        <div className="bank-row">
          <span className="bank-label">Банк:</span> 
          <span className="bank-value">{bank.bank_name || "-"}</span>
        </div>
        <div className="bank-row">
          <span className="bank-label">ПС:</span> 
          <span className="bank-value">{bank.payment_system || "-"}</span>
        </div>
        <div className="bank-row">
          <span className="bank-label">Владелец:</span> 
          <span className="bank-value">{bank.owner || "-"}</span>
        </div>
        <div className="bank-row">
          <span className="bank-label">Реквизиты:</span> 
          <span className="bank-value">{contactInfo}</span>
        </div>
      </div>
    );
  };

  const AmountCard = ({ amountFiat, amountCrypto, rate }) => (
    <div className="amount-card">
      <div className="amount-row">
        <span className="amount-label">Рубли:</span> 
        <span className="amount-value">{amountFiat} ₽</span>
      </div>
      <div className="amount-row">
        <span className="amount-label">Крипто:</span> 
        <span className="amount-value">{amountCrypto?.toFixed(6)} USD</span>
      </div>
      <div className="amount-row">
        <span className="amount-label">Курс:</span> 
        <span className="amount-value">{rate}</span>
      </div>
    </div>
  );

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    proof_url: "",
    dispute_reason: "",
    ttl: "",
    dispute_amount_fiat: "",
    order_id: ""
  });

  const openDisputeModal = (orderId) => {
    setDisputeForm(prev => ({ ...prev, order_id: orderId }));
    setDisputeModalOpen(true);
  };

  const closeDisputeModal = () => {
    setDisputeModalOpen(false);
    setDisputeForm({
      proof_url: "",
      dispute_reason: "",
      ttl: "",
      dispute_amount_fiat: "",
      order_id: ""
    });
  };

  const submitDispute = async () => {
    try {
      await api.post("/admin/disputes/create", {
        order_id: disputeForm.order_id,
        proof_url: disputeForm.proof_url,
        dispute_reason: disputeForm.dispute_reason,
        ttl: disputeForm.ttl,
        dispute_amount_fiat: parseFloat(disputeForm.dispute_amount_fiat)
      });
      toast.success("Диспут успешно открыт");
      closeDisputeModal();
      fetchOrders();
    } catch (e) {
      toast.error("Ошибка при открытии диспута");
      console.error(e);
    }
  };

  return (
    <div className="admin-trader-orders-page">
      <h1>Сделки трейдера (Админ)</h1>

      <div className="filter-row">
        <label>Выберите трейдера: </label>
        <select
          value={selectedTrader}
          onChange={e => {
            setSelectedTrader(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
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
                onChange={e => handleFilterChange("status", e.target.value)}
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
            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID сделки</th>
                    <th>Реквизиты</th>
                    <th>Сумма сделки</th>
                    <th>Merchant</th>
                    <th>Merchant order ID</th>
                    <th>Создана</th>
                    <th>Обновлена</th>
                    <th onClick={() => handleSortChange("expires_at")} style={{ cursor: "pointer" }}>
                      Таймер{renderSortArrow("expires_at")}
                    </th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const bank = o.bank_detail || {};
                    return (
                      <tr key={o.order_id}>
                        <td>
                          <OrderIdCell orderId={o.order_id} />
                        </td>
                        <td>
                          <BankDetailsCard bank={bank} />
                        </td>
                        <td>
                          <AmountCard 
                            amountFiat={o.amount_fiat} 
                            amountCrypto={o.amount_crypto} 
                            rate={o.crypto_rub_rate} 
                          />
                        </td>
                        <td>{getUsername(o.merchant_id, merchants)}</td>
                        <td>{o.merchant_order_id}</td>
                        <td className="time-cell">
                          {formatDateTime(o.created_at)}
                        </td>
                        <td className="time-cell">
                          {formatDateTime(o.updated_at)}
                        </td>
                        <td>
                          <Timer expiresAt={o.expires_at} />
                        </td>
                        <td>
                          <div className="status-cell">
                            {o.status}
                            {o.status === "CANCELED" && (
                              <button 
                                className="dispute-btn" 
                                onClick={() => openDisputeModal(o.order_id)}
                              >
                                Открыть диспут
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
            <h2>Открытие диспута для заказа: {disputeForm.order_id}</h2>
            
            <div className="modal-form-group">
              <label>Причина диспута:</label>
              <textarea
                value={disputeForm.dispute_reason}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, dispute_reason: e.target.value }))}
              />
            </div>
            
            <div className="modal-form-group">
              <label>Ссылка на доказательство (proof_url):</label>
              <input
                type="text"
                value={disputeForm.proof_url}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, proof_url: e.target.value }))}
              />
            </div>
            
            <div className="modal-form-group">
              <label>TTL (например, 24h, 2d):</label>
              <input
                type="text"
                value={disputeForm.ttl}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, ttl: e.target.value }))}
              />
            </div>
            
            <div className="modal-form-group">
              <label>Сумма диспута (₽):</label>
              <input
                type="number"
                value={disputeForm.dispute_amount_fiat}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, dispute_amount_fiat: e.target.value }))}
              />
            </div>
            
            <div className="modal-buttons">
              <button className="btn-primary" onClick={submitDispute}>Отправить</button>
              <button className="btn-cancel" onClick={closeDisputeModal}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTraderOrdersPage;