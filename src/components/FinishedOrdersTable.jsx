import React, { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../api/axios"
import { CopyableId } from "./CopyableID"

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

// ОБНОВЛЕННАЯ ФУНКЦИЯ: форматирование даты с учётом часового пояса клиента
const formatDateTime = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  // Проверка на валидность даты
  if (isNaN(date.getTime())) return "Некорректная дата";
  
  // Форматируем с учетом локального времени пользователя
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
};

const TraderReward = ({ amount_crypto, trader_reward }) => {
  const rewardAmount = amount_crypto * trader_reward;
  const rewardPercent = trader_reward * 100;
  
  return (
    <div className="trader-reward-balanced">
      <div className="reward-percent">
        <div className="percent-value">{rewardPercent.toFixed(1)}%</div>
        <div className="percent-label">ваша доля</div>
      </div>
      
      <div className="reward-separator">→</div>
      
      <div className="reward-amount">
        <div className="amount-value">{rewardAmount.toFixed(2)}</div>
        <div className="amount-label">USDT</div>
      </div>
    </div>
  );
};

const DealAmount = ({ amount_fiat, amount_crypto, crypto_rub_rate, currency }) => {
  return (
    <div className="deal-amount">
      <div className="fiat-amount">
        <span className="icon">💵</span>
        {amount_fiat} <span className="currency">{currency}</span>
      </div>
      <div className="crypto-amount">
        <span className="icon"></span>
        ≈ {amount_crypto} USDT
      </div>
      <div className="exchange-rate">
        <span className="icon">🔁</span>
        1 USDT = {crypto_rub_rate} {currency}
      </div>
    </div>
  );
};

export const FinishedOrdersTable = ({isOpen}) => {
    
    const [currentPage, setCurrentPage] = useState(1)
    const [finishedOrders, setFinishedOrders] = useState([])
    const {traderID} = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    })

    const [sorting, setSorting] = useState({
        sortBy: 'expires_at',
        setOrder: 'desc'
    })

    const [filters, setFilters] = useState({
        statuses: [],
        minAmount: '',
        dateFrom: ''
    })

    const MemoizedDealAmount = React.memo(DealAmount);

    useEffect(() => {
        async function fetchOrders() {
            try {
                setLoading(true)
                console.log('HOOK в finished')
                const params = {
                    page: pagination.page,
                    limit: pagination.limit,
                    status: 'COMPLETED'
                }

                const response = await api.get(`/orders/trader/${traderID}`, {params})

                setFinishedOrders(response.data.orders)
                console.log(response.data.orders)

                setPagination({
                    ...pagination,
                    total: response.data.pagination.total_items
                })
            }catch(err) {
                setError(err)
            }finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [isOpen, pagination.page, sorting, filters])

    const handlePageChange = (newPage) => {
        setPagination({...pagination, page: newPage})
    }

    if (!isOpen) return null

    return (
        <>
        <div className="orders-container">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Реквизит</th>
                    <th>Сумма сделки</th>
                    <th>Награда трейдера</th>
                    <th>Создана в</th>
                    <th>Завершена в</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tbody>
                {finishedOrders.map(order => (
                  <tr key={order.order_id}>
                    <td data-label="ID">
                      <CopyableId id={order.order_id} />
                    </td>
                    <td data-label="Реквизит">
                      <Requisite
                        bank_name={order.bank_detail.bank_name}
                        payment_system={order.bank_detail.payment_system}
                        card_number={order.bank_detail.card_number}
                        phone={order.bank_detail.phone}
                        owner={order.bank_detail.owner}
                      />
                    </td>
                    <td data-label="Сумма сделки">
                      <MemoizedDealAmount 
                        amount_fiat={order.amount_fiat}
                        amount_crypto={order.amount_crypto}
                        crypto_rub_rate={order.crypto_rub_rate}
                        currency={order.bank_detail.currency}
                      />
                    </td>
                    <td data-label="Награда">
                      <TraderReward amount_crypto={order.amount_crypto} trader_reward={order.trader_reward} />
                    </td>
                    <td data-label="Создана в">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td data-label="Завершена в">
                      {formatDateTime(order.updated_at)}
                    </td>
                    <td data-label="Статус">{order.status}</td>
                  </tr>
                ))}
            </tbody>
        </table>
        <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Назад
            </button>
            
            <span>
              Страница {pagination.page} из {Math.ceil(pagination.total / pagination.limit)}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
            >
              Вперед
            </button>
            
            <select
              value={pagination.limit}
              onChange={(e) => setPagination({
                ...pagination,
                limit: Number(e.target.value),
                page: 1
              })}
            >
              <option value="10">10 на странице</option>
              <option value="20">20 на странице</option>
              <option value="50">50 на странице</option>
            </select>
          </div>
          </div>
        </>
    )
}