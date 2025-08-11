import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./AdminTraderOrdersPage.css";

const statusOptions = [
  "PENDING",
  "COMPLETED",
  "CANCELED",
  "DISPUTE"
];

const typeOptions = [
  "BUY",
  "SELL"
];

const paymentSystemOptions = [
  "SBP",
  "CARD",
  "C2C"
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
  const location = useLocation();
  const navigate = useNavigate();
  const [traders, setTraders] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [banks, setBanks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    totalPages: 1, 
    totalItems: 0,
    itemsPerPage: 10 
  });
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [filters, setFilters] = useState({
    traderId: "",
    merchantId: "",
    orderId: "",
    merchantOrderId: "",
    status: "",
    bankCode: "",
    timeOpeningStart: "",
    timeOpeningEnd: "",
    amountMin: "",
    amountMax: "",
    type: "",
    paymentSystem: "",
    deviceId: "",
    sort: "created_at desc"
  });

  const refreshIntervalRef = useRef(null);
  const fetchOrdersRef = useRef();

  const updateUrlParams = () => {
    const params = new URLSearchParams();
    params.set('page', pagination.page);
    params.set('limit', pagination.itemsPerPage);
    navigate(`?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page');
    const limit = params.get('limit');
    
    if (page) {
      setPagination(prev => ({
        ...prev,
        page: parseInt(page, 10)
      }));
    }
    
    if (limit) {
      setPagination(prev => ({
        ...prev,
        itemsPerPage: parseInt(limit, 10)
      }));
    }
  }, []);

  useEffect(() => {
    updateUrlParams();
  }, [pagination.page, pagination.itemsPerPage]);

  const fetchUsers = async () => {
    try {
      const [tradersRes, teamLeadsRes, merchantsRes] = await Promise.all([
        api.get("/admin/users?role=TRADER"),
        api.get("/admin/users?role=TEAM_LEAD"),
        api.get("/admin/users?role=MERCHANT"),
      ]);

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

  const fetchBanks = async () => {
    try {
      const res = await api.get("/merchant/banks");
      setBanks(res.data || []);
    } catch (e) {
      toast.error("Ошибка при загрузке списка банков");
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.itemsPerPage,
        sort: filters.sort,
      };
      
      if (filters.traderId) params.trader_id = filters.traderId;
      if (filters.merchantId) params.merchant_id = filters.merchantId;
      if (filters.orderId) params.order_id = filters.orderId;
      if (filters.merchantOrderId) params.merchant_order_id = filters.merchantOrderId;
      if (filters.status) params.status = filters.status;
      if (filters.bankCode) params.bank_code = filters.bankCode;
      if (filters.timeOpeningStart) params.time_opening_start = new Date(filters.timeOpeningStart).toISOString();
      if (filters.timeOpeningEnd) params.time_opening_end = new Date(filters.timeOpeningEnd + "T23:59:59.999Z").toISOString();
      if (filters.amountMin) params.amount_min = parseFloat(filters.amountMin);
      if (filters.amountMax) params.amount_max = parseFloat(filters.amountMax);
      if (filters.type) params.type = filters.type;
      if (filters.paymentSystem) params.payment_system = filters.paymentSystem;
      if (filters.deviceId) params.device_id = filters.deviceId;

      const res = await api.get(`/orders/all`, { params });
      setOrders(res.data.orders || []);
      
      if (res.data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: res.data.pagination.total_pages || 1,
          totalItems: res.data.pagination.total_items || 0,
          page: res.data.pagination.current_page || prev.page
        }));
      }

      setLastUpdated(new Date());
    } catch (e) {
      console.error("Ошибка при загрузке сделок:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersRef.current = fetchOrders;
  }, [filters, pagination.page, pagination.itemsPerPage]);

  useEffect(() => {
    fetchUsers();
    fetchBanks();
    fetchOrdersRef.current();
  }, []);

  useEffect(() => {
    fetchOrdersRef.current();
  }, [filters, pagination.page, pagination.itemsPerPage]);

  const handleManualRefresh = () => {
    fetchOrdersRef.current();
    toast.info("Список сделок обновлён");
  };

  useEffect(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        if (fetchOrdersRef.current) {
          fetchOrdersRef.current();
        }
      }, 10000);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      itemsPerPage: newLimit, 
      page: 1 
    }));
  };

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (field) => {
    const currentSort = filters.sort.split(" ");
    const currentField = currentSort[0];
    const currentOrder = currentSort[1] || "desc";
    
    if (currentField === field) {
      const newOrder = currentOrder === "asc" ? "desc" : "asc";
      handleFilterChange("sort", `${field} ${newOrder}`);
    } else {
      handleFilterChange("sort", `${field} desc`);
    }
  };

  const renderSortArrow = (field) => {
    const currentSort = filters.sort.split(" ");
    if (currentSort[0] !== field) return null;
    return currentSort[1] === "asc" ? " ▲" : " ▼";
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

  const UserCell = ({ userId, userList, fallback = "Неизвестный пользователь" }) => {
    const user = userList.find(u => u.id === userId);
    const shortId = userId?.length > 8 ? `${userId.substring(0, 4)}...${userId.slice(-4)}` : userId || "";
    
    if (!userId) {
      return <div className="user-cell">Не назначен</div>;
    }
    
    return (
      <div className="user-cell">
        <div className="user-name">{user ? user.username : fallback}</div>
        <div 
          className="user-id"
          onClick={() => copyToClipboard(userId)}
          title="Нажмите, чтобы скопировать ID"
        >
          {shortId}
          <span className="copy-icon">⎘</span>
        </div>
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
        contactInfo = bank.card_number || bank.phone || "Не указано";
    }
    
    return (
      <div className="bank-details-card">
        <div className="bank-row">
          <span className="bank-label">Банк:</span> 
          <span className="bank-value">{bank.bank_name || "-"}</span>
        </div>
        <div className="bank-row">
          <span className="bank-label">Код:</span> 
          <span className="bank-value">{bank.bank_code || "-"}</span>
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

  const resetFilters = () => {
    setFilters({
      traderId: "",
      merchantId: "",
      orderId: "",
      merchantOrderId: "",
      status: "",
      bankCode: "",
      timeOpeningStart: "",
      timeOpeningEnd: "",
      amountMin: "",
      amountMax: "",
      type: "",
      paymentSystem: "",
      deviceId: "",
      sort: "created_at desc"
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatLastUpdated = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="admin-trader-orders-page">
      <div className="header-row">
        <h1>Мониторинг сделок</h1>
        
        <div className="refresh-controls">
          <div className="last-updated">
            {lastUpdated && `Обновлено: ${formatLastUpdated(lastUpdated)}`}
          </div>
          
          <div className="refresh-buttons">
            <button 
              className={`refresh-btn ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? "Автообновление включено" : "Автообновление выключено"}
            >
              <span className={`auto-refresh-indicator ${autoRefresh ? 'pulsing' : ''}`}></span>
              {autoRefresh ? 'Автообновление: Вкл' : 'Автообновление: Выкл'}
            </button>
            
            <button 
              className="manual-refresh-btn"
              onClick={handleManualRefresh}
              title="Обновить сейчас"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
              Обновить
            </button>
          </div>
        </div>
      </div>

      <div className="filters-container">
        <div className="filter-row">
          <div className="filter-item">
            <label>Трейдер:</label>
            <select
              value={filters.traderId}
              onChange={e => handleFilterChange("traderId", e.target.value)}
            >
              <option value="">Все трейдеры</option>
              {traders.map(t => (
                <option key={t.id} value={t.id}>{t.username}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Мерчант:</label>
            <select
              value={filters.merchantId}
              onChange={e => handleFilterChange("merchantId", e.target.value)}
            >
              <option value="">Все мерчанты</option>
              {merchants.map(m => (
                <option key={m.id} value={m.id}>{m.username}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Статус:</label>
            <select
              value={filters.status}
              onChange={e => handleFilterChange("status", e.target.value)}
            >
              <option value="">Все статусы</option>
              {statusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Тип сделки:</label>
            <select
              value={filters.type}
              onChange={e => handleFilterChange("type", e.target.value)}
            >
              <option value="">Все типы</option>
              {typeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item">
            <label>ID сделки:</label>
            <input
              type="text"
              value={filters.orderId}
              onChange={e => handleFilterChange("orderId", e.target.value)}
              placeholder="Поиск по ID"
            />
          </div>

          <div className="filter-item">
            <label>ID заказа мерчанта:</label>
            <input
              type="text"
              value={filters.merchantOrderId}
              onChange={e => handleFilterChange("merchantOrderId", e.target.value)}
              placeholder="Merchant Order ID"
            />
          </div>

          <div className="filter-item">
            <label>Банк:</label>
            <select
              value={filters.bankCode}
              onChange={e => handleFilterChange("bankCode", e.target.value)}
            >
              <option value="">Все банки</option>
              {banks.map(bank => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>ID устройства:</label>
            <input
              type="text"
              value={filters.deviceId}
              onChange={e => handleFilterChange("deviceId", e.target.value)}
              placeholder="Device ID"
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item">
            <label>Платежная система:</label>
            <select
              value={filters.paymentSystem}
              onChange={e => handleFilterChange("paymentSystem", e.target.value)}
            >
              <option value="">Все системы</option>
              {paymentSystemOptions.map(ps => (
                <option key={ps} value={ps}>{ps}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Сумма от:</label>
            <input
              type="number"
              min="0"
              value={filters.amountMin}
              onChange={e => handleFilterChange("amountMin", e.target.value)}
              placeholder="Мин. сумма (₽)"
            />
          </div>

          <div className="filter-item">
            <label>Сумма до:</label>
            <input
              type="number"
              min="0"
              value={filters.amountMax}
              onChange={e => handleFilterChange("amountMax", e.target.value)}
              placeholder="Макс. сумма (₽)"
            />
          </div>

          <div className="filter-item">
            <label>Дата от:</label>
            <input
              type="date"
              value={filters.timeOpeningStart}
              onChange={e => handleFilterChange("timeOpeningStart", e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>Дата до:</label>
            <input
              type="date"
              value={filters.timeOpeningEnd}
              onChange={e => handleFilterChange("timeOpeningEnd", e.target.value)}
            />
          </div>
        </div>

        <div className="filter-actions">
          <div className="filter-item">
            <label>Записей на странице:</label>
            <select value={pagination.itemsPerPage} onChange={handleLimitChange}>
              {[10, 25, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          
          <button className="compact-reset-btn" onClick={resetFilters} title="Сбросить все фильтры">
            Сбросить
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Всего сделок:</span>
          <span className="stat-value">{pagination.totalItems}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Страница:</span>
          <span className="stat-value">{pagination.page} из {pagination.totalPages}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <p>Загрузка сделок...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>Сделок не найдено</p>
          <button className="compact-reset-btn" onClick={resetFilters}>
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="table-scroll-container">
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortChange("order_id")} style={{ cursor: "pointer" }}>
                    ID сделки{renderSortArrow("order_id")}
                  </th>
                  <th>Реквизиты</th>
                  <th onClick={() => handleSortChange("amount_fiat")} style={{ cursor: "pointer" }}>
                    Сумма{renderSortArrow("amount_fiat")}
                  </th>
                  <th>Merchant</th>
                  <th>Merchant order ID</th>
                  <th onClick={() => handleSortChange("trader_id")} style={{ cursor: "pointer" }}>
                    Trader{renderSortArrow("trader_id")}
                  </th>
                  <th onClick={() => handleSortChange("created_at")} style={{ cursor: "pointer" }}>
                    Создана{renderSortArrow("created_at")}
                  </th>
                  <th onClick={() => handleSortChange("updated_at")} style={{ cursor: "pointer" }}>
                    Обновлена{renderSortArrow("updated_at")}
                  </th>
                  <th onClick={() => handleSortChange("expires_at")} style={{ cursor: "pointer" }}>
                    Таймер{renderSortArrow("expires_at")}
                  </th>
                  <th onClick={() => handleSortChange("status")} style={{ cursor: "pointer" }}>
                    Статус{renderSortArrow("status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const bank = order.bank_detail || {};
                  const traderId = bank?.trader_id || "";
                  
                  return (
                    <tr key={order.order_id}>
                      <td>
                        <OrderIdCell orderId={order.order_id} />
                      </td>
                      <td>
                        <BankDetailsCard bank={bank} />
                      </td>
                      <td>
                        <AmountCard 
                          amountFiat={order.amount_fiat} 
                          amountCrypto={order.amount_crypto} 
                          rate={order.crypto_rub_rate} 
                        />
                      </td>
                      <td>
                        <UserCell 
                          userId={order.merchant_id} 
                          userList={merchants} 
                          fallback="Неизвестный мерчант" 
                        />
                      </td>
                      <td>{order.merchant_order_id}</td>
                      <td>
                        <UserCell 
                          userId={traderId} 
                          userList={traders} 
                          fallback="Неизвестный трейдер" 
                        />
                      </td>
                      <td className="time-cell">
                        {formatDateTime(order.created_at)}
                      </td>
                      <td className="time-cell">
                        {formatDateTime(order.updated_at)}
                      </td>
                      <td>
                        <Timer expiresAt={order.expires_at} />
                      </td>
                      <td>
                        <div className={`status-cell ${order.status.toLowerCase()}`}>
                          {order.status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.totalPages > 0 && (
        <div className="pagination-controls" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '20px 0',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 100,
          position: 'relative'
        }}>
          <button 
            style={{
              padding: '8px 16px',
              margin: '0 10px',
              backgroundColor: pagination.page > 1 ? '#4a76a8' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: pagination.page > 1 ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
            disabled={pagination.page === 1} 
            onClick={() => changePage(pagination.page - 1)}
          >
            &lt; Назад
          </button>
          
          <div style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#333',
            margin: '0 15px'
          }}>
            Страница {pagination.page} из {pagination.totalPages}
          </div>
          
          <button 
            style={{
              padding: '8px 16px',
              margin: '0 10px',
              backgroundColor: pagination.page < pagination.totalPages ? '#4a76a8' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: pagination.page < pagination.totalPages ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
            disabled={pagination.page === pagination.totalPages} 
            onClick={() => changePage(pagination.page + 1)}
          >
            Вперёд &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTraderOrdersPage;