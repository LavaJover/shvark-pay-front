import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import './TeamLeadCabinetPage.css';

// Функция для форматирования даты в ISO 8601
const formatToISO = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('.')[0] + 'Z';
};

const TeamLeadCabinetPage = () => {
  const { traderID } = useAuth();
  const [traders, setTraders] = useState([]);
  const [teamRelations, setTeamRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [commissionProfit, setCommissionProfit] = useState(null);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Установка диапазона дат (последние 7 дней)
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    return {
      from: today.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    };
  });

  // Загрузка данных команды
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Получаем всех трейдеров
        const tradersRes = await api.get('/admin/users?role=TRADER');
        setTraders(tradersRes.data.users || []);
        
        // Получаем команду тимлида
        const relationsRes = await api.get(`/admin/teams/relations/team-lead/${traderID}`);
        setTeamRelations(relationsRes.data.teamRelations || []);
        
      } catch (err) {
        setError('Ошибка при загрузке данных команды');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (traderID) {
      fetchTeamData();
      fetchCommissionProfit();
    }
  }, [traderID]);

  // Получение статистики трейдера
  const fetchTraderStatistics = async (traderId) => {
    if (!traderId) return;
    
    try {
      setStatsLoading(true);
      const params = {
        date_from: formatToISO(dateRange.from + 'T00:00:00'),
        date_to: formatToISO(dateRange.to + 'T23:59:59'),
        traderID: traderId
      };
      
      const res = await api.get(`/admin/orders/statistics`, { params });
      setStatistics(res.data);
    } catch (err) {
      toast.error('Ошибка при загрузке статистики');
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Получение заработка с комиссий
  const fetchCommissionProfit = async () => {
    if (!traderID) return;
    
    try {
      setCommissionLoading(true);
      const res = await api.get(`/wallets/${traderID}/commission-profit`, {
        params: {
          from: formatToISO(dateRange.from + 'T00:00:00'),
          to: formatToISO(dateRange.to + 'T23:59:59')
        }
      });
      setCommissionProfit(res.data);
    } catch (err) {
      toast.error('Ошибка при загрузке заработка с комиссий');
      console.error(err);
    } finally {
      setCommissionLoading(false);
    }
  };

  // Открыть модалку с выбранным трейдером
  const openTraderModal = (trader) => {
    setSelectedTrader(trader);
    setStatistics(null);
    fetchTraderStatistics(trader.id);
  };

  // Закрыть модалку
  const closeModal = () => {
    setSelectedTrader(null);
    setStatistics(null);
  };

  // Получить трейдеров в команде с дополнительной информацией
  const getTeamTraders = () => {
    return teamRelations.map(relation => {
      const trader = traders.find(t => t.id === relation.traderId);
      return {
        ...trader,
        commission: relation.teamRelationRarams?.commission || 0
      };
    }).filter(t => t.id); // Фильтруем не найденных трейдеров
  };

  // Форматирование комиссии
  const formatCommission = (commission) => {
    return (commission * 100).toFixed(1) + '%';
  };

  // Форматирование суммы
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Обновить все данные при изменении даты
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({...prev, [field]: value}));
  };

  // Перезагрузить данные при изменении даты
  useEffect(() => {
    if (traderID) {
      fetchCommissionProfit();
    }
  }, [dateRange]);

  return (
    <div className="team-lead-cabinet">
      <h1>Кабинет тимлида</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Блок заработка с комиссий */}
      <div className="commission-section">
        <h2>Ваш заработок с комиссий</h2>
        
        <div className="commission-controls">
          <div className="date-input">
            <label>От:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={e => handleDateChange('from', e.target.value)}
            />
          </div>
          <div className="date-input">
            <label>До:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={e => handleDateChange('to', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button
            className="load-btn"
            onClick={fetchCommissionProfit}
            disabled={commissionLoading}
          >
            {commissionLoading ? 'Загрузка...' : 'Обновить'}
          </button>
        </div>
        
        {commissionProfit ? (
          <div className="commission-profit-card">
            <div className="profit-row">
              <span>Период:</span>
              <span>{new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}</span>
            </div>
            <div className="profit-row">
              <span>Общая комиссия:</span>
              <span className="profit-value">
                {formatAmount(commissionProfit.totalCommission)} {commissionProfit.currency}
              </span>
            </div>
          </div>
        ) : (
          <div className="commission-placeholder">
            {commissionLoading ? 'Загрузка данных...' : 'Нет данных за выбранный период'}
          </div>
        )}
      </div>

      <div className="team-overview">
        <div className="overview-card">
          <h3>Размер команды</h3>
          <p>{getTeamTraders().length} трейдеров</p>
        </div>
        <div className="overview-card">
          <h3>Средняя комиссия</h3>
          <p>
            {teamRelations.length > 0 
              ? formatCommission(
                  teamRelations.reduce((sum, rel) => sum + rel.teamRelationRarams.commission, 0) / 
                  teamRelations.length
                )
              : '0%'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loader">Загрузка данных команды...</div>
      ) : (
        <div className="team-table-container">
          <h2>Трейдеры в вашей команде</h2>
          
          {getTeamTraders().length === 0 ? (
            <p className="no-data">В вашей команде пока нет трейдеров</p>
          ) : (
            <table className="team-table">
              <thead>
                <tr>
                  <th>Трейдер</th>
                  <th>Логин</th>
                  <th>Комиссия</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {getTeamTraders().map(trader => (
                  <tr key={trader.id}>
                    <td>{trader.username || 'Не указано'}</td>
                    <td>{trader.login}</td>
                    <td>{formatCommission(trader.commission)}</td>
                    <td>
                      <button 
                        className="stats-btn"
                        onClick={() => openTraderModal(trader)}
                      >
                        Статистика
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Модальное окно статистики */}
      {selectedTrader && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Статистика трейдера: {selectedTrader.username}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="date-range-selector">
                <div className="date-input">
                  <label>От:</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={e => handleDateChange('from', e.target.value)}
                  />
                </div>
                <div className="date-input">
                  <label>До:</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={e => handleDateChange('to', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <button
                  className="load-stats-btn"
                  onClick={() => fetchTraderStatistics(selectedTrader.id)}
                  disabled={statsLoading}
                >
                  {statsLoading ? 'Загрузка...' : 'Загрузить статистику'}
                </button>
              </div>
              
              {statistics && (
                <div className="statistics-grid">
                  <div className="stat-card">
                    <h3>Всего сделок</h3>
                    <p>{statistics.total_orders}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Успешные сделки</h3>
                    <p>{statistics.succeed_orders}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Отмененные сделки</h3>
                    <p>{statistics.canceled_orders}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Обработано фиата</h3>
                    <p>{formatAmount(statistics.processed_amount_fiat)} ₽</p>
                  </div>
                  <div className="stat-card">
                    <h3>Обработано крипты</h3>
                    <p>{formatAmount(statistics.processed_amount_crypto)} USD</p>
                  </div>
                  <div className="stat-card">
                    <h3>Отменено фиата</h3>
                    <p>{formatAmount(statistics.canceled_amount_fiat)} ₽</p>
                  </div>
                  <div className="stat-card">
                    <h3>Отменено крипты</h3>
                    <p>{formatAmount(statistics.canceled_amount_crypto)} USD</p>
                  </div>
                  <div className="stat-card highlight">
                    <h3>Чистая прибыль</h3>
                    <p>{formatAmount(statistics.income_crypto)} USD</p>
                  </div>
                </div>
              )}
              
              {!statistics && !statsLoading && (
                <div className="stats-placeholder">
                  <p>Выберите период и нажмите "Загрузить статистику"</p>
                </div>
              )}
              
              {statsLoading && (
                <div className="loader">Загрузка статистики...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeadCabinetPage;