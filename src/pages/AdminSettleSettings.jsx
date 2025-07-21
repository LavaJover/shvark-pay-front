import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './AdminSettleSettings.css'

const SettleSettings = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [rule, setRule] = useState(null);
  const [form, setForm] = useState({
    fixed_fee: '',
    min_amount: '',
    cooldown_seconds: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [tradersRes, merchantsRes] = await Promise.all([
          api.get('/admin/traders'),
          api.get('/admin/merchants')
        ]);
        const traderUsers = tradersRes.data.users;
        const merchantUsers = merchantsRes.data.users;
        setUsers([...traderUsers, ...merchantUsers]);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserChange = async (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    try {
      const res = await api.get(`/admin/wallets/withdraw/rules/${userId}`);
      if (res.data.rule) {
        setRule(res.data.rule);
        setForm({
          fixed_fee: res.data.rule.fixed_fee,
          min_amount: res.data.rule.min_amount,
          cooldown_seconds: res.data.rule.cooldown_seconds
        });
      } else {
        setRule(null);
        setForm({
          fixed_fee: '',
          min_amount: '',
          cooldown_seconds: ''
        });
      }
    } catch (error) {
      console.error('Ошибка при получении правила:', error);
      setRule(null);
      setForm({
        fixed_fee: '',
        min_amount: '',
        cooldown_seconds: ''
      });
    }
  };

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      await api.post('/admin/wallets/withdraw/rules', {
        user_id: selectedUserId,
        fixed_fee: parseFloat(form.fixed_fee),
        min_amount: parseFloat(form.min_amount),
        cooldown_seconds: parseInt(form.cooldown_seconds)
      });
      alert('Правило успешно создано/обновлено');
    } catch (error) {
      console.error('Ошибка при создании/обновлении правила:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/wallets/withdraw/rules/${selectedUserId}`);
      setRule(null);
      setForm({
        fixed_fee: '',
        min_amount: '',
        cooldown_seconds: ''
      });
      alert('Правило удалено');
    } catch (error) {
      console.error('Ошибка при удалении правила:', error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Settle Settings</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Выберите пользователя:</label>
        <select value={selectedUserId} onChange={handleUserChange}>
          <option value="">-- выбрать --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.login} ({user.role})
            </option>
          ))}
        </select>
      </div>

      {selectedUserId && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <label>Fixed Fee:</label>
            <input
              type="number"
              name="fixed_fee"
              value={form.fixed_fee}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Min Amount:</label>
            <input
              type="number"
              name="min_amount"
              value={form.min_amount}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Cooldown Seconds:</label>
            <input
              type="number"
              name="cooldown_seconds"
              value={form.cooldown_seconds}
              onChange={handleInputChange}
            />
          </div>

          <button onClick={handleSubmit}>Создать / Обновить правило</button>

          {rule && (
            <div style={{ marginTop: 20 }}>
              <p>Правило создано: {new Date(rule.created_at).toLocaleString()}</p>
              <p>Последнее обновление: {new Date(rule.updated_at).toLocaleString()}</p>
              <button onClick={handleDelete} style={{ color: 'red' }}>Удалить правило</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettleSettings;
