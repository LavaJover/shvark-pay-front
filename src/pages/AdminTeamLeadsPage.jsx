import React, { useState, useEffect } from 'react';
import './AdminTeamLeadsPage.css';
import api from '../api/axios';

const AdminTeamLeadsPage = () => {
  const [teamLeads, setTeamLeads] = useState([]);
  const [traders, setTraders] = useState([]);
  const [relations, setRelations] = useState([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState('');
  const [newRelation, setNewRelation] = useState({
    traderId: '',
    commission: 0
  });
  const [editRelation, setEditRelation] = useState(null);
  const [loading, setLoading] = useState({
    teamLeads: true,
    traders: true,
    relations: false
  });
  const [error, setError] = useState('');

  // Загрузка тим-лидов
  useEffect(() => {
    const fetchTeamLeads = async () => {
      try {
        const response = await api.get('/admin/users?role=TEAM_LEAD');
        setTeamLeads(response.data.users);
      } catch (err) {
        setError('Ошибка при загрузке тим-лидов');
      } finally {
        setLoading(prev => ({ ...prev, teamLeads: false }));
      }
    };

    fetchTeamLeads();
  }, []);

  // Загрузка трейдеров
  useEffect(() => {
    const fetchTraders = async () => {
      try {
        const response = await api.get('/admin/users?role=TRADER');
        setTraders(response.data.users);
      } catch (err) {
        setError('Ошибка при загрузке трейдеров');
      } finally {
        setLoading(prev => ({ ...prev, traders: false }));
      }
    };

    fetchTraders();
  }, []);

  // Загрузка отношений при выборе тим-лида
  useEffect(() => {
    const fetchRelations = async () => {
      if (!selectedTeamLead) return;
      
      try {
        setLoading(prev => ({ ...prev, relations: true }));
        const response = await api.get(`/admin/teams/relations/team-lead/${selectedTeamLead}`);
        setRelations(response.data.teamRelations);
      } catch (err) {
        setError('Ошибка при загрузке команд');
      } finally {
        setLoading(prev => ({ ...prev, relations: false }));
      }
    };

    fetchRelations();
  }, [selectedTeamLead]);

  const handleCreateRelation = async (e) => {
    e.preventDefault();
    
    if (!newRelation.traderId) {
      setError('Выберите трейдера');
      return;
    }

    // Валидация: комиссия должна быть между 0 и 1
    if (newRelation.commission < 0 || newRelation.commission > 1) {
      setError('Комиссия должна быть в диапазоне от 0 до 1');
      return;
    }

    try {
      // ОТПРАВЛЯЕМ ДОЛЮ БЕЗ ПРЕОБРАЗОВАНИЯ
      await api.post('/admin/teams/relations/create', {
        teamLeadId: selectedTeamLead,
        teamRelationParams: { commission: newRelation.commission },
        traderId: newRelation.traderId
      });

      // Обновляем список отношений
      const response = await api.get(`/admin/teams/relations/team-lead/${selectedTeamLead}`);
      setRelations(response.data.teamRelations);
      
      // Сбрасываем форму
      setNewRelation({ traderId: '', commission: 0 });
      setError('');
    } catch (err) {
      setError('Ошибка при создании команды: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateRelation = async (e) => {
    e.preventDefault();
    
    if (!editRelation) return;

    // Валидация: комиссия должна быть между 0 и 1
    if (editRelation.commission < 0 || editRelation.commission > 1) {
      setError('Комиссия должна быть в диапазоне от 0 до 1');
      return;
    }

    try {
      // ОТПРАВЛЯЕМ ДОЛЮ БЕЗ ПРЕОБРАЗОВАНИЯ
      await api.patch('/admin/teams/relations/update', {
        relationId: editRelation.id,
        teamRelationParams: { commission: editRelation.commission }
      });

      // Обновляем локальное состояние
      setRelations(relations.map(rel => 
        rel.id === editRelation.id 
          ? { ...rel, teamRelationRarams: { commission: editRelation.commission } } 
          : rel
      ));
      
      setEditRelation(null);
      setError('');
    } catch (err) {
      setError('Ошибка при обновлении отношения: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteRelation = async (relationId) => {
    try {
      await api.delete(`/admin/teams/relations/${relationId}/delete`);
      setRelations(relations.filter(rel => rel.id !== relationId));
      setError('');
    } catch (err) {
      setError('Ошибка при удалении отношения: ' + (err.response?.data?.message || err.message));
    }
  };

  // Получение имени пользователя по ID
  const getUserName = (userId) => {
    const user = [...teamLeads, ...traders].find(u => u.id === userId);
    return user ? user.username : 'Неизвестный';
  };

  // Форматирование комиссии: преобразование в проценты
  const formatCommission = (commissionValue) => {
    // Если значение уже в процентах (>1), возвращаем как есть
    if (commissionValue > 1) {
      return commissionValue.toFixed(1) + '%';
    }
    // Преобразуем долю в проценты
    return (commissionValue * 100).toFixed(1) + '%';
  };

  // Получение выбранного тим-лида
  const selectedTeamLeadData = teamLeads.find(tl => tl.id === selectedTeamLead);

  return (
    <div className="admin-team-leads-page">
      <h1 className="page-title">Управление командами</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Выбор тим-лида */}
      <div className="section team-lead-selector">
        <label htmlFor="teamLeadSelect">Выберите тим-лида:</label>
        <select
          id="teamLeadSelect"
          value={selectedTeamLead}
          onChange={(e) => setSelectedTeamLead(e.target.value)}
          disabled={loading.teamLeads}
        >
          <option value="">-- Выберите тим-лида --</option>
          {teamLeads.map(teamLead => (
            <option key={teamLead.id} value={teamLead.id}>
              {teamLead.username} ({teamLead.login})
            </option>
          ))}
        </select>
        
        {loading.teamLeads && <span className="loader">Загрузка...</span>}
      </div>

      {selectedTeamLead && (
        <div className="relations-management">
          <div className="section-header">
            <h2>
              Отношения для: {selectedTeamLeadData?.username || 'Неизвестный тим-лид'}
            </h2>
          </div>

          {/* Список отношений */}
          <div className="relations-list">
            <h3>Текущие команды</h3>
            
            {loading.relations ? (
              <div className="loader">Загрузка команд...</div>
            ) : relations.length === 0 ? (
              <div className="no-data">Нет активных команд</div>
            ) : (
              <table className="relations-table">
                <thead>
                  <tr>
                    <th>Трейдер</th>
                    <th>Комиссия</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {relations.map(relation => (
                    <tr key={relation.id}>
                      <td>{getUserName(relation.traderId)}</td>
                      <td>{formatCommission(relation.teamRelationRarams.commission)}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => setEditRelation({
                            id: relation.id,
                            commission: relation.teamRelationRarams.commission,
                            traderId: relation.traderId
                          })}
                        >
                          Изменить
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteRelation(relation.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Форма создания/редактирования */}
          <div className="relation-form-container">
            {editRelation ? (
              <div className="relation-form">
                <h3>Редактирование команд</h3>
                <form onSubmit={handleUpdateRelation}>
                  <div className="form-group">
                    <label>Трейдер:</label>
                    <div className="form-value">
                      {getUserName(editRelation.traderId)}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="editCommission">Комиссия (доля):</label>
                    <input
                      type="number"
                      id="editCommission"
                      value={editRelation.commission}
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        // Валидация: значение должно быть между 0 и 1
                        if (!isNaN(value) && value >= 0 && value <= 1) {
                          setEditRelation({
                            ...editRelation,
                            commission: value
                          });
                        }
                      }}
                      step="0.001"
                      min="0"
                      max="1"
                      required
                    />
                    <div className="commission-hint">
                      Введите долю от 0 до 1 (например, 0.05 = 5%)
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-btn">Сохранить</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setEditRelation(null)}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="relation-form">
                <h3>Создать новую команду</h3>
                <form onSubmit={handleCreateRelation}>
                  <div className="form-group">
                    <label htmlFor="traderSelect">Трейдер:</label>
                    <select
                      id="traderSelect"
                      value={newRelation.traderId}
                      onChange={e => setNewRelation({
                        ...newRelation,
                        traderId: e.target.value
                      })}
                      disabled={loading.traders}
                      required
                    >
                      <option value="">-- Выберите трейдера --</option>
                      {traders.map(trader => (
                        <option key={trader.id} value={trader.id}>
                          {trader.username} ({trader.login})
                        </option>
                      ))}
                    </select>
                    {loading.traders && <span className="inline-loader">Загрузка...</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="commission">Комиссия (доля):</label>
                    <input
                      type="number"
                      id="commission"
                      value={newRelation.commission}
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        // Валидация: значение должно быть между 0 и 1
                        if (!isNaN(value) && value >= 0 && value <= 1) {
                          setNewRelation({
                            ...newRelation,
                            commission: value
                          });
                        }
                      }}
                      step="0.001"
                      min="0"
                      max="1"
                      required
                    />
                    <div className="commission-hint">
                      Введите долю от 0 до 1 (например, 0.05 = 5%)
                    </div>
                  </div>
                  <button type="submit" className="create-btn">Создать</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeamLeadsPage;