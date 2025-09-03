import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./AdminDisputesPage.css";

const statusLabels = {
  DISPUTE_OPENED: "Открыт",
  DISPUTE_ACCEPTED: "Принят",
  DISPUTE_REJECTED: "Отклонён",
  DISPUTE_FREEZED: "Заморожен",
};

const actionLabels = {
  accept: "принять",
  reject: "отклонить",
  freeze: "заморозить",
};

const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [filters, setFilters] = useState({
    status: "DISPUTE_OPENED",
    traderId: "",
    merchantId: "",
    disputeId: "",
    orderId: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [traders, setTraders] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [timers, setTimers] = useState({});
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchMerchantOrderId, setSearchMerchantOrderId] = useState("");
  const [foundOrder, setFoundOrder] = useState(null);
  const [showCreateDisputeModal, setShowCreateDisputeModal] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    dispute_amount_fiat: 0,
    dispute_reason: "NO_PAYMENT",
    proof_url: "",
    ttl: "30",
  });
  
  // Состояние для модалки подтверждения действий
  const [confirmAction, setConfirmAction] = useState({
    show: false,
    action: null,
    disputeId: null,
    disputeDetails: null,
  });

  const findUsername = (id, list) => {
    const user = list.find((u) => u.id === id);
    return user ? user.username : id;
  };

  const fetchDisputesAndUsers = async () => {
    setLoading(true);
    try {
      // Формируем параметры запроса
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
      };
      
      // Добавляем фильтры только если они не пустые
      if (filters.traderId) params.traderId = filters.traderId;
      if (filters.merchantId) params.merchantId = filters.merchantId;
      if (filters.disputeId) params.disputeId = filters.disputeId;
      if (filters.orderId) params.orderId = filters.orderId;

      const [disputesRes, tradersRes, teamLeadsRes, merchantsRes] = await Promise.all([
        api.get(`/admin/orders/disputes?${new URLSearchParams(params)}`),
        api.get("/admin/users?role=TRADER"),
        api.get("/admin/users?role=TEAM_LEAD"),
        api.get("/admin/users?role=MERCHANT"),
      ]);
      
      // Объединяем трейдеров и тимлидов в один список
      const combinedTraders = [
        ...(tradersRes.data.users || []),
        ...(teamLeadsRes.data.users || [])
      ];
      
      setDisputes(disputesRes.data.disputes || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: disputesRes.data.pagination?.total_pages || 1,
      }));
      setTraders(combinedTraders);
      setMerchants(merchantsRes.data.users || []);
      updateTimers(disputesRes.data.disputes || []);
    } catch (err) {
      toast.error("Ошибка при загрузке данных");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTimers = (disputesList) => {
    const now = Date.now();
    const newTimers = {};
    disputesList.forEach((d) => {
      if (!d.accept_at) return;
      const acceptAtMs = new Date(d.accept_at).getTime();
      const diffMs = acceptAtMs - now;
      newTimers[d.dispute_id] = diffMs > 0 ? diffMs : 0;
    });
    setTimers(newTimers);
  };

  useEffect(() => {
    if (disputes.length === 0) return;

    const interval = setInterval(() => {
      setTimers((oldTimers) => {
        const now = Date.now();
        const updatedTimers = {};
        for (const d of disputes) {
          if (!d.accept_at) continue;
          const acceptAtMs = new Date(d.accept_at).getTime();
          const diff = acceptAtMs - now;
          updatedTimers[d.dispute_id] = diff > 0 ? diff : 0;
        }
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [disputes]);

  useEffect(() => {
    fetchDisputesAndUsers();
  }, [pagination.page, pagination.limit, filters]);

  const handleAction = async (action, disputeId) => {
    try {
      await api.post(`/admin/disputes/${action}`, { dispute_id: disputeId });
      toast.success("Действие выполнено");
      fetchDisputesAndUsers();
      // Закрываем модалку подтверждения
      setConfirmAction({ show: false, action: null, disputeId: null, disputeDetails: null });
    } catch (err) {
      toast.error("Ошибка при выполнении действия");
      console.error(err);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setPagination({ page: 1, totalPages: pagination.totalPages, limit: newLimit });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      status: "DISPUTE_OPENED",
      traderId: "",
      merchantId: "",
      disputeId: "",
      orderId: "",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatMsToTime = (ms) => {
    if (ms <= 0) return "Истекло";
    let totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSearch = async (type, id) => {
    if (!id) {
      toast.warning("Введите ID для поиска");
      return;
    }

    try {
      const endpoint =
        type === "order" ? `/orders/${id}` : `/orders/merchant/${id}`;
      const res = await api.get(endpoint);
      setFoundOrder(res.data.order);
      toast.success("Сделка найдена");
    } catch (err) {
      toast.error("Сделка не найдена");
      setFoundOrder(null);
      console.error(err);
    }
  };

  const handleCreateDispute = async () => {
    if (!disputeForm.ttl || disputeForm.ttl <= 0) {
      toast.error("Укажите валидное время жизни диспута");
      return;
    }

    try {
      await api.post("/admin/disputes/create", {
        ...disputeForm,
        order_id: foundOrder.order_id,
        ttl: `${disputeForm.ttl}m`,
      });

      toast.success("Диспут успешно открыт");
      setShowCreateDisputeModal(false);
      // Сбрасываем состояние поиска
      setFoundOrder(null);
      setSearchOrderId("");
      setSearchMerchantOrderId("");
      // Сбрасываем форму
      setDisputeForm({
        dispute_amount_fiat: 0,
        dispute_reason: "NO_PAYMENT",
        proof_url: "",
        ttl: "30",
      });
      fetchDisputesAndUsers();
    } catch (err) {
      toast.error("Ошибка при открытии диспута");
      console.error(err);
    }
  };

  // Открыть модалку подтверждения действия
  const openConfirmActionModal = (action, disputeId, disputeDetails) => {
    setConfirmAction({
      show: true,
      action,
      disputeId,
      disputeDetails,
    });
  };

  return (
    <div className="admin-disputes-page">
      <h1>Диспуты</h1>

      {/* Фильтры и пагинация */}
      <div className="filter-row">
        <div className="filter-group">
          <label>Статус: </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Трейдер: </label>
          <select
            value={filters.traderId}
            onChange={(e) => handleFilterChange("traderId", e.target.value)}
          >
            <option value="">Все трейдеры</option>
            {traders.map(trader => (
              <option key={trader.id} value={trader.id}>
                {trader.username}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Мерчант: </label>
          <select
            value={filters.merchantId}
            onChange={(e) => handleFilterChange("merchantId", e.target.value)}
          >
            <option value="">Все мерчанты</option>
            {merchants.map(merchant => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.username}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>ID диспута: </label>
          <input
            type="text"
            value={filters.disputeId}
            onChange={(e) => handleFilterChange("disputeId", e.target.value)}
            placeholder="Фильтр по ID диспута"
          />
        </div>

        <div className="filter-group">
          <label>ID сделки: </label>
          <input
            type="text"
            value={filters.orderId}
            onChange={(e) => handleFilterChange("orderId", e.target.value)}
            placeholder="Фильтр по ID сделки"
          />
        </div>

        <div className="filter-group">
          <label>Записей: </label>
          <select value={pagination.limit} onChange={handleLimitChange}>
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <button className="reset-filters-btn" onClick={resetFilters}>
          Сбросить фильтры
        </button>
      </div>

      {/* Список диспутов */}
      {loading ? (
        <p>Загрузка...</p>
      ) : disputes.length === 0 ? (
        <p>Нет диспутов</p>
      ) : (
        <div className="disputes-table">
          {disputes.map((d) => {
            const bank = d?.order?.bank_detail || {};
            const order = d?.order || {};
            const traderUsername = findUsername(bank.trader_id, traders);

            return (
              <div key={d.dispute_id} className="dispute-card">
                <div className="dispute-section">
                  <h3>Банковские реквизиты</h3>
                  <p>
                    <strong>Банк:</strong> {bank.bank_name || "-"} (
                    {bank.payment_system || "-"})
                  </p>
                  <p>
                    <strong>Телефон:</strong> {bank.phone || "-"}
                  </p>
                  <p>
                    <strong>Владелец:</strong> {bank.owner || "-"}
                  </p>
                  <p>
                    <strong>Trader:</strong> {traderUsername}
                  </p>
                </div>

                <div className="dispute-section">
                  <h3>Детали сделки</h3>
                  <p>
                    <strong>Order ID:</strong> {order.order_id || "-"}
                  </p>
                  <p>
                    <strong>Merchant Order ID:</strong>{" "}
                    {order.merchant_order_id || "-"}
                  </p>
                  <p>
                    <strong>Сумма (₽):</strong> {order.amount_fiat || "-"}
                  </p>
                  <p>
                    <strong>Сумма (крипто):</strong>{" "}
                    {order.amount_crypto?.toFixed(6) || "-"}
                  </p>
                  <p>
                    <strong>Курс:</strong>{" "}
                    {order.crypro_rate || d.dispute_crypto_rate || "-"}
                  </p>
                </div>

                <div className="dispute-section">
                  <h3>Детали диспута</h3>
                  <p>
                    <strong>ID диспута:</strong> {d.dispute_id}
                  </p>
                  <p>
                    <strong>Причина:</strong> {d.dispute_reason}
                  </p>
                  <p>
                    <strong>Статус:</strong>{" "}
                    {statusLabels[d.dispute_status] || d.dispute_status}
                  </p>
                  <p>
                    <strong>Сумма диспута (₽):</strong> {d.dispute_amount_fiat}
                  </p>
                  <p>
                    <strong>Сумма диспута (крипто):</strong>{" "}
                    {d.dispute_amount_crypto.toFixed(6)}
                  </p>
                  <p>
                    <a href={d.proof_url} target="_blank" rel="noreferrer">
                      Доказательство
                    </a>
                  </p>
                  {d.accept_at && (
                    <p>
                      <strong>До автопринятия:</strong>{" "}
                      {formatMsToTime(timers[d.dispute_id])}
                    </p>
                  )}
                </div>

                <div className="dispute-actions">
                  {(d.dispute_status === "DISPUTE_OPENED" ||
                    d.dispute_status === "DISPUTE_FREEZED") && (
                    <>
                      <button onClick={() => openConfirmActionModal("accept", d.dispute_id, d)}>
                        Принять
                      </button>
                      <button onClick={() => openConfirmActionModal("reject", d.dispute_id, d)}>
                        Отклонить
                      </button>
                    </>
                  )}
                  {d.dispute_status === "DISPUTE_OPENED" && (
                    <button onClick={() => openConfirmActionModal("freeze", d.dispute_id, d)}>
                      Заморозить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Пагинация */}
      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
          }
        >
          Назад
        </button>
        <span>
          Стр. {pagination.page} / {pagination.totalPages}
        </span>
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
          }
        >
          Вперёд
        </button>
      </div>

      {/* Модальное окно создания диспута */}
      {showCreateDisputeModal && foundOrder && (
        <div className="modal">
          <div className="modal-content">
            <h2>Открытие диспута</h2>
            <div className="form-group">
              <label>Сумма диспута (₽):</label>
              <input
                type="number"
                value={disputeForm.dispute_amount_fiat}
                onChange={(e) =>
                  setDisputeForm((prev) => ({
                    ...prev,
                    dispute_amount_fiat: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label>Причина:</label>
              <select
                value={disputeForm.dispute_reason}
                onChange={(e) =>
                  setDisputeForm((prev) => ({
                    ...prev,
                    dispute_reason: e.target.value,
                  }))
                }
              >
                <option value="UNKNOWN">Неизвестно</option>
                <option value="NO_PAYMENT">Нет оплаты</option>
                <option value="WRONG_AMOUNT">Неверная сумма</option>
                <option value="WRONG_REQUISITE">Неверные реквизиты</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ссылка на доказательство:</label>
              <input
                type="text"
                value={disputeForm.proof_url}
                onChange={(e) =>
                  setDisputeForm((prev) => ({
                    ...prev,
                    proof_url: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label>Время жизни диспута (минуты):</label>
              <input
                type="number"
                value={disputeForm.ttl}
                onChange={(e) =>
                  setDisputeForm((prev) => ({
                    ...prev,
                    ttl: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            </div>

            <div className="modal-actions">
              <button onClick={handleCreateDispute}>Открыть диспут</button>
              <button onClick={() => setShowCreateDisputeModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения действия */}
      {confirmAction.show && (
        <div className="modal">
          <div className="modal-content">
            <h2>Подтвердите действие</h2>
            
            <div className="confirmation-details">
              <p>
                Вы уверены, что хотите <strong>{actionLabels[confirmAction.action]}</strong> диспут?
              </p>
              
              {confirmAction.disputeDetails && (
                <div className="dispute-summary">
                  <p><strong>ID диспута:</strong> {confirmAction.disputeDetails.dispute_id}</p>
                  <p><strong>Статус:</strong> {statusLabels[confirmAction.disputeDetails.dispute_status]}</p>
                  <p><strong>Сумма:</strong> {confirmAction.disputeDetails.dispute_amount_fiat} ₽</p>
                  <p><strong>Причина:</strong> {confirmAction.disputeDetails.dispute_reason}</p>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="confirm-btn"
                onClick={() => handleAction(confirmAction.action, confirmAction.disputeId)}
              >
                Да, подтверждаю
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setConfirmAction({ show: false, action: null, disputeId: null, disputeDetails: null })}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputesPage;