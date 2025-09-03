import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './AdminBankDetailsPage.css';

const BankRequisitesPage = () => {
  const [bankDetails, setBankDetails] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    items_per_page: 10,
    total_items: 0,
    total_pages: 0
  });
  const [traders, setTraders] = useState([]);
  const [banks, setBanks] = useState([]);
  const [filters, setFilters] = useState({
    trader_id: '',
    bank_code: '',
    enabled: '',
    payment_system: '',
    page: 1,
    limit: 10
  });
  const [loading, setLoading] = useState(false);

  // Загрузка трейдеров и тимлидов
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [tradersResponse, teamLeadsResponse] = await Promise.all([
          api.get('/admin/users?role=TRADER'),
          api.get('/admin/users?role=TEAM_LEAD')
        ]);
        
        const allUsers = [
          ...tradersResponse.data.users,
          ...teamLeadsResponse.data.users
        ];
        
        setTraders(allUsers);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    };
    
    fetchUsers();
  }, []);

  // Загрузка банков
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await api.get('/merchant/banks');
        setBanks(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке банков:', error);
      }
    };
    
    fetchBanks();
  }, []);

  // Загрузка реквизитов
  useEffect(() => {
    const fetchRequisites = async () => {
      setLoading(true);
      try {
        // Формируем параметры запроса, исключая пустые значения
        const params = {};
        Object.keys(filters).forEach(key => {
          if (filters[key] !== '' && filters[key] !== null) {
            params[key] = filters[key];
          }
        });

        const response = await api.get('/banking/requisites', { params });
        setBankDetails(response.data.bank_details);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Ошибка при загрузке реквизитов:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequisites();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Сброс на первую страницу при изменении фильтров
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatUUID = (uuid) => {
    if (!uuid) return '';
    return `${uuid.substring(0, 8)}...${uuid.substring(uuid.length - 4)}`;
  };

  return (
    <div className="bank-requisites-page">
      <h1>Банковские реквизиты трейдеров</h1>
      
      {/* Фильтры */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="trader_id">Трейдер/Тимлид:</label>
          <select
            id="trader_id"
            name="trader_id"
            value={filters.trader_id}
            onChange={handleFilterChange}
          >
            <option value="">Все</option>
            {traders.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="bank_code">Банк:</label>
          <select
            id="bank_code"
            name="bank_code"
            value={filters.bank_code}
            onChange={handleFilterChange}
          >
            <option value="">Все</option>
            {banks.map(bank => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="payment_system">Платежная система:</label>
          <select
            id="payment_system"
            name="payment_system"
            value={filters.payment_system}
            onChange={handleFilterChange}
          >
            <option value="">Все</option>
            <option value="SBP">SBP</option>
            <option value="C2C">C2C</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="enabled">Статус:</label>
          <select
            id="enabled"
            name="enabled"
            value={filters.enabled}
            onChange={handleFilterChange}
          >
            <option value="">Все</option>
            <option value="true">Включен</option>
            <option value="false">Выключен</option>
          </select>
        </div>
      </div>
      
      {/* Таблица реквизитов */}
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Трейдер</th>
                  <th>Банк</th>
                  <th>Ограничения</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {bankDetails.map(detail => {
                  const trader = traders.find(t => t.id === detail.trader_id);
                  const bank = banks.find(b => b.code === detail.bank_code);
                  
                  return (
                    <tr key={detail.id}>
                      <td>
                        <div 
                          className="copyable"
                          onClick={() => copyToClipboard(detail.id)}
                          title="Кликните для копирования"
                        >
                          {formatUUID(detail.id)}
                        </div>
                      </td>
                      <td>
                        <div className="trader-info">
                          <div className="trader-name">{trader?.username || 'Неизвестно'}</div>
                          <div 
                            className="copyable trader-id"
                            onClick={() => copyToClipboard(detail.trader_id)}
                            title="Кликните для копирования"
                          >
                            {formatUUID(detail.trader_id)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="bank-info">
                          <div className="bank-name">{detail.bank_name}</div>
                          <div className="bank-code">{bank?.name || detail.bank_code}</div>
                          <div className="owner">{detail.owner}</div>
                          <div className="payment-details">
                            {detail.payment_system === 'C2C' 
                              ? `Карта: ${detail.card_number}` 
                              : `Телефон: ${detail.phone}`
                            }
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="limits">
                          <div>Мин: {detail.min_amount}</div>
                          <div>Макс: {detail.max_amount}</div>
                          <div>В день: {detail.max_amount_day}</div>
                          <div>В месяц: {detail.max_amount_month}</div>
                          <div>Одновр. заказов: {detail.max_orders_simultaneosly}</div>
                          <div>Кол-во в день: {detail.max_quantity_day}</div>
                          <div>Кол-во в месяц: {detail.max_quantity_month}</div>
                          <div>Интервал между сделками (мин): {detail.delay / 60}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`status ${detail.enabled ? 'enabled' : 'disabled'}`}>
                          {detail.enabled ? 'Включен' : 'Выключен'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Пагинация */}
          {pagination.total_pages > 1 && (
            <div className="pagination">
              <button 
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Назад
              </button>
              
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={filters.page === page ? 'active' : ''}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              
              <button 
                disabled={filters.page >= pagination.total_pages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BankRequisitesPage;