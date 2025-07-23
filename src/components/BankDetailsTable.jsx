import { useState, useEffect } from "react"
import { useTraderBankDetails } from "../hooks/useTraderBankDetails"
import EditbankDetailsModal from "./EditBankDetailsModal"
import { toast } from "react-toastify"
import { deleteBankDetail } from "../api/banking"
import { getBankDetailsStats } from "../api/stats" // создадим этот метод
import RequisiteStats from "./RequisiteStats"
import { useAuth } from "../contexts/AuthContext"
import './BankDetailsTable.css'

const Requisite = ({bank_name, payment_system, card_number, phone, owner}) => {
  return (
    <div className="requisite-card">
      <div className="requisite-item">
        <span className="requisite-icon">💳</span>
        <span className="requisite-label">Система:</span>
        <span className="requisite-value">{payment_system}</span>
      </div>
      
      <div className="requisite-item">
        <span className="requisite-icon">🏦</span>
        <span className="requisite-label">Банк:</span>
        <span className="requisite-value">{bank_name}</span>
      </div>
      
      {card_number && (
        <div className="requisite-item">
          <span className="requisite-icon">🔢</span>
          <span className="requisite-label">Карта:</span>
          <span className="requisite-value">{formatCardNumber(card_number)}</span>
        </div>
      )}
      
      {phone && (
        <div className="requisite-item">
          <span className="requisite-icon">📱</span>
          <span className="requisite-label">Телефон:</span>
          <span className="requisite-value">{formatPhoneNumber(phone)}</span>
        </div>
      )}
      
      <div className="requisite-item">
        <span className="requisite-icon">👤</span>
        <span className="requisite-label">Владелец:</span>
        <span className="requisite-value">{owner}</span>
      </div>
    </div>
  );
};

// Форматирование номера карты
const formatCardNumber = (number) => {
  return number.replace(/(\d{4})/g, '$1 ').trim();
};

// Форматирование телефона
const formatPhoneNumber = (phone) => {
  const match = phone.match(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (!match) return phone;
  return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
};

const SumLimits = ({min_amount, max_amount, currency}) => {
    return (
        <div>
            <p>От {min_amount} {currency}</p>
            <p>До {max_amount} {currency}</p>
        </div>
    )
} 

const VolumeLimits = ({max_amount_day, max_amount_month, currency}) => {
    return (
        <div>
            <p>В день: {max_amount_day} {currency}</p>
            <p>В месяц: {max_amount_month} {currency}</p>
        </div>
    )
}

const QuantityLimits = ({max_quantity_day, max_quantity_month}) => {
    return (
        <div>
            <p>Макс в день: {max_quantity_day}</p>
            <p>Макс в месяц: {max_quantity_month}</p>
        </div>
    )
}

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, bankName }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="confirm-delete-modal">
        <div className="modal-header">
          <h3>Подтверждение удаления</h3>
        </div>
        <div className="modal-body">
          <p>Вы уверены, что хотите удалить реквизит банка <strong>{bankName}</strong>?</p>
          <p>Это действие нельзя отменить.</p>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Отмена</button>
          <button className="confirm-btn" onClick={onConfirm}>Удалить</button>
        </div>
      </div>
    </div>
  );
};

const CombinedLimits = ({
  min_amount,
  max_amount,
  currency,
  max_amount_day,
  max_amount_month,
  max_quantity_day,
  max_quantity_month,
  max_orders_simultaneosly
}) => {
  return (
    <div className="combined-limits-card">
      <div className="limits-section">
        <div className="section-header">
          <span className="icon">💸</span>
          <span className="title">Сумма сделки</span>
        </div>
        <div className="limits-row">
          <span className="label">От:</span>
          <span className="value">{min_amount} {currency}</span>
        </div>
        <div className="limits-row">
          <span className="label">До:</span>
          <span className="value">{max_amount} {currency}</span>
        </div>
      </div>
      
      <div className="limits-section">
        <div className="section-header">
          <span className="icon">📊</span>
          <span className="title">Объём</span>
        </div>
        <div className="limits-row">
          <span className="label">День:</span>
          <span className="value">{max_amount_day} {currency}</span>
        </div>
        <div className="limits-row">
          <span className="label">Месяц:</span>
          <span className="value">{max_amount_month} {currency}</span>
        </div>
      </div>
      
      <div className="limits-section">
        <div className="section-header">
          <span className="icon">🔢</span>
          <span className="title">Количество</span>
        </div>
        <div className="limits-row">
          <span className="label">День:</span>
          <span className="value">{max_quantity_day}</span>
        </div>
        <div className="limits-row">
          <span className="label">Месяц:</span>
          <span className="value">{max_quantity_month}</span>
        </div>
      </div>
      
      <div className="limits-section simultaneous">
        <div className="section-header">
          <span className="icon">🔄</span>
          <span className="title">Одновременно</span>
        </div>
        <div className="limits-row">
          <span className="value-big">{max_orders_simultaneosly}</span>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ enabled }) => {
  return (
    <div className={`status-badge ${enabled ? 'active' : 'inactive'}`}>
      {enabled ? "Активен" : "Неактивен"}
    </div>
  );
};

const BankDetailsTable = () => {
  const { bankDetails } = useTraderBankDetails()
  const [showModal, setShowModal] = useState(false)
  const [chosenDetail, setChoseonDetail] = useState(null)
  const [stats, setStats] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState(null);

  const {traderID} = useAuth() // или получи откуда у тебя id

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getBankDetailsStats(traderID)
        setStats(res.data.stats)
      } catch (err) {
        console.error("Ошибка при получении статистики реквизитов", err)
      }
    }
    fetchStats()
  }, [traderID])

  const handleEdit = (detail) => {
    setChoseonDetail(detail)
    setShowModal(true)
  }

  const handleDeleteClick = (detail) => {
    setDetailToDelete(detail);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!detailToDelete) return;
    
    try {
      await deleteBankDetail({ bankDetailID: detailToDelete.id });
      toast.success("Реквизит успешно удален");
      // Здесь можно добавить обновление данных без перезагрузки страницы
      window.location.reload(); // временное решение
    } catch (error) {
      toast.error("Ошибка при удалении реквизита");
      console.error("Delete error:", error);
    } finally {
      setShowDeleteModal(false);
      setDetailToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDetailToDelete(null);
  }; 

  return (
    <>
      <div className="bank-details-table-container">
        <EditbankDetailsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            toast.success("Изменения сохранены")
            setShowModal(false)
          }}
          detail={chosenDetail}
        />

      <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          bankName={detailToDelete?.bank_name || ""}
      />
        <table>
          <thead>
            <tr>
              <th>Реквизиты</th>
              <th>Валюта</th>
              <th>Лимиты</th>
              <th>Статистика</th>
              <th>Статус</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bankDetails.map((detail) => {
              const stat = stats.find((s) => s.bank_detail_id === detail.id)
              return (
                <tr key={detail.id}>
                  <td><Requisite {...detail} /></td>
                  <td>{detail.currency}</td>
                  <td>
                  <CombinedLimits 
                    min_amount={detail.min_amount}
                    max_amount={detail.max_amount}
                    currency={detail.currency}
                    max_amount_day={detail.max_amount_day}
                    max_amount_month={detail.max_amount_month}
                    max_quantity_day={detail.max_quantity_day}
                    max_quantity_month={detail.max_quantity_month}
                    max_orders_simultaneosly={detail.max_orders_simultaneosly}
                  />
                  </td>
                  <td data-label="Статистика">
                    <RequisiteStats stat={stat} detail={detail} />
                  </td>
                  <td data-label="Статус">
                    <StatusBadge enabled={detail.enabled} />
                  </td>
                  <td data-label=""><button onClick={() => handleEdit(detail)}>Редактировать</button></td>
                  <td data-label=""><button className="delete-btn" onClick={() => handleDeleteClick(detail)}>Удалить</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default BankDetailsTable