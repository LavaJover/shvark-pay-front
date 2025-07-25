import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./AdminTrafficPage.css";

const AdminTrafficPage = () => {
  const [traders, setTraders] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [trafficList, setTrafficList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const initialForm = {
    id: "",
    trader_id: "",
    merchant_id: "",
    trader_reward: 0,
    trader_priority: 0,
    platform_fee: 0,
    enabled: true,
  };

  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});

  // Определение мобильного устройства
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [traderRes, merchantRes, trafficRes] = await Promise.all([
        api.get("/admin/traders"),
        api.get("/admin/merchants"),
        api.get("/admin/traffic/records?page=1&limit=100"),
      ]);
      setTraders(traderRes.data.users);
      setMerchants(merchantRes.data.users);
      setTrafficList(trafficRes.data.traffic_records || []);
    } catch (err) {
      toast.error("Ошибка при загрузке данных");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const numberFields = ["trader_reward", "platform_fee", "trader_priority"];
    
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : numberFields.includes(name)
          ? parseFloat(value) || 0
          : value,
    }));

    // Валидация в реальном времени
    if (name === "trader_reward" || name === "platform_fee") {
      const reward = name === "trader_reward" ? parseFloat(value) || 0 : form.trader_reward;
      const fee = name === "platform_fee" ? parseFloat(value) || 0 : form.platform_fee;
      
      if (reward > fee) {
        setErrors({ ...errors, reward: "Награда не может превышать комиссию" });
      } else {
        const newErrors = { ...errors };
        delete newErrors.reward;
        setErrors(newErrors);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (form.trader_reward > form.platform_fee) {
      newErrors.reward = "Награда трейдера не может превышать комиссию платформы";
    }
    
    if (!form.merchant_id) {
      newErrors.merchant = "Выберите мерчанта";
    }
    
    if (!form.trader_id) {
      newErrors.trader = "Выберите трейдера";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Преобразование чисел к нужному формату перед отправкой
      const payload = {
        ...form,
        trader_priority: Number(form.trader_priority),
        trader_reward: Number(form.trader_reward),
        platform_fee: Number(form.platform_fee),
      };
      
      if (editing) {
        await api.patch("/admin/traffic/edit", { traffic: payload });
        toast.success("Трафик обновлён");
      } else {
        await api.post("/admin/traffic/create", payload);
        toast.success("Трафик создан");
      }
      setForm(initialForm);
      setEditing(false);
      fetchData();
    } catch (err) {
      toast.error("Ошибка при сохранении трафика");
      console.error(err);
    }
  };

  const handleEdit = (traffic) => {
    setForm(traffic);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditing(false);
    setErrors({});
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("ID скопирован в буфер");
  };

  const renderUserInfo = (id, list) => {
    if (!id) return <span className="text-muted">—</span>;
    
    const user = list.find(u => u.id === id);
    if (!user) return <span>{id}</span>;
    
    const shortId = id.length > 6 ? `${id.substring(0, 6)}...` : id;
    
    return (
      <div className="user-info">
        <div className="username">{user.username} ({user.login})</div>
        <div 
          className="user-id"
          onClick={() => copyToClipboard(id)}
          title="Нажмите, чтобы скопировать ID"
        >
          <small>{shortId}</small>
        </div>
      </div>
    );
  };

  // Функция для форматирования чисел до 3 знаков после запятой
  const formatDecimal = (value) => {
    return parseFloat(value).toFixed(3);
  };

  // Рендеринг списка трафика для мобильных устройств
  const renderMobileList = () => (
    <div className="mobile-traffic-list">
      {trafficList.map((t) => (
        <div key={t.id} className={`traffic-card ${!t.enabled ? "inactive" : ""}`}>
          <div className="card-header">
            <span className={`status-badge ${t.enabled ? "active" : "inactive"}`}>
              {t.enabled ? "Активен" : "Неактивен"}
            </span>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleEdit(t)}
            >
              Редакт.
            </button>
          </div>
          
          <div className="card-body">
            <div className="card-row">
              <div className="card-label">Мерчант:</div>
              <div className="card-value">{renderUserInfo(t.merchant_id, merchants)}</div>
            </div>
            
            <div className="card-row">
              <div className="card-label">Трейдер:</div>
              <div className="card-value">{renderUserInfo(t.trader_id, traders)}</div>
            </div>
            
            <div className="card-row">
              <div className="card-label">Награда:</div>
              <div className="card-value">{formatDecimal(t.trader_reward * 100)}%</div>
            </div>
            
            <div className="card-row">
              <div className="card-label">Приоритет:</div>
              <div className="card-value">{t.trader_priority}</div>
            </div>
            
            <div className="card-row">
              <div className="card-label">Комиссия:</div>
              <div className="card-value">{formatDecimal(t.platform_fee * 100)}%</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Рендеринг таблицы для десктопов
  const renderDesktopTable = () => (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="thead-light">
          <tr>
            <th>Статус</th>
            <th>Мерчант</th>
            <th>Трейдер</th>
            <th>Награда</th>
            <th>Приоритет</th>
            <th>Комиссия</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {trafficList.map((t) => (
            <tr key={t.id} className={!t.enabled ? "inactive-row" : ""}>
              <td>
                <span className={`status-badge ${t.enabled ? "active" : "inactive"}`}>
                  {t.enabled ? "Активен" : "Неактивен"}
                </span>
              </td>
              <td>{renderUserInfo(t.merchant_id, merchants)}</td>
              <td>{renderUserInfo(t.trader_id, traders)}</td>
              <td>{formatDecimal(t.trader_reward * 100)}%</td>
              <td>{t.trader_priority}</td>
              <td>{formatDecimal(t.platform_fee * 100)}%</td>
              <td>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEdit(t)}
                >
                  Редактировать
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-traffic-page">
      <h1>Управление распределением трафика</h1>
      
      <div className="card form-card">
        <div className="card-header">
          {editing ? "Редактирование трафика" : "Создание новой записи"}
        </div>
        
        <form className="card-body" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className={`form-group ${errors.merchant ? "has-error" : ""}`}>
              <label>Мерчант *</label>
              <select
                name="merchant_id"
                value={form.merchant_id}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Выберите мерчанта</option>
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.username} ({m.login})
                  </option>
                ))}
              </select>
              {errors.merchant && (
                <div className="error-text">{errors.merchant}</div>
              )}
            </div>
            
            <div className={`form-group ${errors.trader ? "has-error" : ""}`}>
              <label>Трейдер *</label>
              <select
                name="trader_id"
                value={form.trader_id}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Выберите трейдера</option>
                {traders.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.username} ({t.login})
                  </option>
                ))}
              </select>
              {errors.trader && (
                <div className="error-text">{errors.trader}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>Комиссия платформы (%)</label>
              <input
                name="platform_fee"
                type="number"
                step="0.001"
                min="0"
                max="100"
                value={form.platform_fee}
                onChange={handleChange}
                className="form-control"
              />
              <small className="form-text text-muted">
                До тысячных: 0.001
              </small>
            </div>
            
            <div className={`form-group ${errors.reward ? "has-error" : ""}`}>
              <label>Награда трейдера (%)</label>
              <input
                name="trader_reward"
                type="number"
                step="0.001"
                min="0"
                max={form.platform_fee}
                value={form.trader_reward}
                onChange={handleChange}
                className="form-control"
              />
              {errors.reward && (
                <div className="error-text">{errors.reward}</div>
              )}
              <small className="form-text text-muted">
                Максимум: {formatDecimal(form.platform_fee)}%
              </small>
            </div>
            
            <div className="form-group">
              <label>Приоритет трейдера</label>
              <input
                name="trader_priority"
                type="number"
                min="0"
                step="1"
                value={form.trader_priority}
                onChange={handleChange}
                className="form-control"
              />
              <small className="form-text text-muted">
                Целое число, чем выше - тем больше сделок
              </small>
            </div>
            
            <div className="form-group form-check">
              <input
                name="enabled"
                type="checkbox"
                className="form-check-input"
                checked={form.enabled}
                onChange={handleChange}
                id="enabledCheck"
              />
              <label className="form-check-label" htmlFor="enabledCheck">
                Активный трафик
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editing ? "Сохранить" : "Создать"}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancel}
              >
                Отменить
              </button>
            )}
          </div>
        </form>
      </div>
      
      <h2 className="mt-4">Настройки трафика</h2>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Загрузка...</span>
          </div>
        </div>
      ) : trafficList.length === 0 ? (
        <div className="alert alert-info">Нет записей о трафике</div>
      ) : isMobile ? (
        renderMobileList()
      ) : (
        renderDesktopTable()
      )}
    </div>
  );
};

export default AdminTrafficPage;