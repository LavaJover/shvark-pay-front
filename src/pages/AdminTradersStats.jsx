import { useEffect, useState } from "react";
import api from "../api/axios";
import "./StatisticsPage.css";

const AdminTradersStats = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  });

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка пользователей (трейдеры, мерчанты, тимлиды)
  const fetchUsers = async () => {
    try {
      const [tradersRes, teamLeadsRes, merchantsRes] = await Promise.all([
        api.get("/admin/users?role=TRADER"),
        api.get("/admin/users?role=TEAM_LEAD"),
        api.get("/admin/users?role=MERCHANT"),
      ]);

      const combinedUsers = [
        ...(tradersRes.data.users || []),
        ...(teamLeadsRes.data.users || []),
        ...(merchantsRes.data.users || [])
      ];

      setUsers(combinedUsers);
    } catch (e) {
      console.error("Ошибка при загрузке пользователей", e);
    }
  };

  // Загрузка статистики для выбранного пользователя
  const fetchStatistics = async () => {
    if (!selectedUserId) return;
    
    setLoading(true);
    setError(null);

    try {
      const from = dateRange.from.toISOString();
      const to = dateRange.to.toISOString();

      const response = await api.get("/admin/orders/statistics", {
        params: {
          traderID: selectedUserId,
          date_from: from,
          date_to: to,
        },
      });

      setStats(response.data);
    } catch (err) {
      setError("Ошибка загрузки статистики");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchStatistics();
    } else {
      setStats(null);
    }
  }, [selectedUserId, dateRange]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: new Date(value),
    });
  };

  return (
    <div className="statistics-container">
      <h1 className="page-title">Статистика пользователя</h1>

      <div className="filters-section">
        <div className="user-selector">
          <label>Выберите пользователя:</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">-- Выберите пользователя --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.role})
              </option>
            ))}
          </select>
        </div>
        
        <div className="date-range-picker">
          <div>
            <label>С</label>
            <input
              type="date"
              name="from"
              value={dateRange.from.toISOString().split("T")[0]}
              onChange={handleDateChange}
            />
          </div>
          <div>
            <label>По</label>
            <input
              type="date"
              name="to"
              value={dateRange.to.toISOString().split("T")[0]}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      {loading && <p className="info-text">Загрузка статистики...</p>}
      {error && <p className="error-text">{error}</p>}

      {stats && selectedUserId && (
        <div className="metrics-grid">
          <StatCard title="Успешных сделок" value={stats.succeed_orders} subtitle="Обработано заявок" />
          <StatCard title="Отменённых сделок" value={stats.canceled_orders} subtitle="Отклонено заявок" />
          <StatCard title="Сумма в крипте (обработано)" value={`${stats.processed_amount_crypto} USD`} subtitle="Успешные заявки" />
          <StatCard title="Сумма в фиате (обработано)" value={`${stats.processed_amount_fiat} ₽`} subtitle="Успешные заявки" />
          <StatCard title="Сумма в крипте (отмена)" value={`${stats.canceled_amount_crypto} USD`} subtitle="Отклонённые заявки" />
          <StatCard title="Сумма в фиате (отмена)" value={`${stats.canceled_amount_fiat} ₽`} subtitle="Отклонённые заявки" />
          <StatCard title="Прибыль в крипте" value={`+${stats.income_crypto} USD`} subtitle="Чистая прибыль" />
          <StatCard title="Всего сделок" value={stats.total_orders} subtitle="За период" />
        </div>
      )}

      {!selectedUserId && !loading && (
        <div className="no-selection">
          <p>Выберите пользователя для просмотра статистики</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="stat-card">
      <h2 className="stat-title">{title}</h2>
      <p className="stat-value">{value}</p>
      <p className="stat-subtitle">{subtitle}</p>
    </div>
  );
};

export default AdminTradersStats;