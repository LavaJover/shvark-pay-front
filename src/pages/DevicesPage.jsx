import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Измененный импорт
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const DevicesPage = () => {
  const { traderID } = useAuth();
  const [devices, setDevices] = useState([]);
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(null);

  // Получение устройств
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/devices/${traderID}`);
      setDevices(response.data.devices);
    } catch (err) {
      setError('Ошибка при загрузке устройств');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Создание устройства
  const handleCreateDevice = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    try {
      const response = await api.post('/devices', {
        deviceName: deviceName.trim(),
        enabled: true,
        traderId: traderID
      });
      
      setDevices([...devices, response.data]);
      setDeviceName('');
    } catch (err) {
      setError('Ошибка при создании устройства');
    }
  };

  // Удаление устройства
  const handleDeleteDevice = async (deviceId) => {
    try {
      await api.delete(`/devices/${deviceId}`);
      setDevices(devices.filter(device => device.deviceId !== deviceId));
    } catch (err) {
      setError('Ошибка при удалении устройства');
    }
  };

  // Генерация данных для QR-кода
  const generateQRData = (deviceId) => {
    const token = localStorage.getItem('token');
    return JSON.stringify({
      token: token,
      group_id: deviceId
    });
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="devices-container">
      <h1>Мои устройства</h1>
      
      {error && <div className="error-message">{error}</div>}

      {/* Форма добавления устройства */}
      <form onSubmit={handleCreateDevice} className="device-form">
        <input
          type="text"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          placeholder="Введите имя устройства"
          required
        />
        <button type="submit">Добавить устройство</button>
      </form>

      {/* Список устройств */}
      <div className="devices-list">
        {devices.map(device => (
          <div key={device.deviceId} className="device-card">
            <div className="device-info">
              <h3>{device.deviceName}</h3>
              <p>Статус: {device.enabled ? 'Активно' : 'Отключено'}</p>
            </div>
            
            <div className="device-actions">
              {/* Кнопка показа QR-кода */}
              <button 
                onClick={() => setShowQR(device.deviceId)}
                className="qr-button"
              >
                ℹ️
              </button>
              
              {/* Кнопка удаления */}
              <button 
                onClick={() => handleDeleteDevice(device.deviceId)}
                className="delete-button"
              >
                Удалить
              </button>
            </div>

            {/* Модальное окно с QR-кодом */}
            {showQR === device.deviceId && (
              <div className="qr-modal">
                <div className="qr-content">
                  <h3>QR-код для {device.deviceName}</h3>
                  <QRCodeSVG value={generateQRData(device.deviceId)} size={256} />
                  <button onClick={() => setShowQR(null)}>Закрыть</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevicesPage;