import { approveTraderOrder } from "../api/orders"
import { useAuth } from "../contexts/AuthContext"
import { useTraderOrders } from "../hooks/useTraderOrders"
import React, { useMemo, useState, useEffect } from "react"
import api from "../api/axios"
import { CopyableId } from "./CopyableID"
import './ActiveOrdersTable.css'

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

const TimeLeft = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState("");
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires - now;
    
      if (diff <= 0) return "Истекло";
    
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor(diff / (1000 * 60 * 60));
    
      return `${hours > 0 ? `${hours}ч ` : ""}${minutes}м ${seconds}с`;
    };

    // Устанавливаем начальное значение
    setTimeLeft(calculateTimeLeft());
    
    // Запускаем интервал для обновления каждую секунду
    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(timerId);
  }, [expiresAt]);

  return <span>{timeLeft}</span>;
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

const ApproveOrderModal = ({isOpen, onClose, onSuccess}) => {
    if (!isOpen) return null

    const handleOnSuccess = () => {
        onSuccess()
        onClose()
        window.location.reload();
    }

    return (
    <div className="modal-overlay">
        <div className="approve-modal">
            <h1>Подтвердить сделку?</h1>
            <div className="modal-actions">
                <button onClick={handleOnSuccess} className="approve-modal-btn">Подтвердить</button>
                <button onClick={() => onClose()} className="cancel-modal-btn">Отмена</button>
            </div>
        </div>
    </div>
    )
}

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

const ActiveOrdersTable = ({isOpen}) => {
    
    const [currentPage, setCurrentPage] = useState(1)
    const [activeOrders, setActiveOrders] = useState([])
    const {traderID} = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
    const [orderID, setOrderID] = useState('')
    const MemoizedTimeLeft = React.memo(TimeLeft);
    const MemoizedRequisite = React.memo(Requisite);
    const MemoizedTraderReward = React.memo(TraderReward);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 5,
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

    useEffect(() => {
        async function fetchOrders() {
            try {
                setLoading(true)

                const params = {
                    page: pagination.page,
                    limit: pagination.limit,
                    status: "PENDING"
                }

                const response = await api.get(`/orders/trader/${traderID}`, {params})

                setActiveOrders(response.data.orders)

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

    const handleApprove = async ({order_id}) => {
        const data = await approveTraderOrder({order_id})
    }

    const MemoizedDealAmount = React.memo(DealAmount);

    if (!isOpen) return null

    return (
        <div className="orders-container">
            <ApproveOrderModal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                onSuccess={() => handleApprove({order_id: orderID})}
            />
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Реквизит</th>
                    <th>Сумма сделки</th>
                    <th>Награда трейдера</th>
                    <th>Таймер</th>
                    <th>Статус</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {activeOrders.map(order => (
                  <tr key={order.order_id}>
                    <td data-label="ID">
                      <CopyableId id={order.order_id} />
                    </td>
                    <td data-label="Реквизит">
                      <Requisite {...order.bank_detail} />
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
                    <td data-label="Таймер">
                       <MemoizedTimeLeft expiresAt={order.expires_at} />
                    </td>
                    <td data-label="Статус">{order.status}</td>
                    <td data-label="">
                      <button onClick={() => {
                        setIsApproveModalOpen(true);
                        setOrderID(order.order_id);
                      }}>
                        Подтвердить
                      </button>
                    </td>
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
                          Страница {pagination.page} из {Math.max(Math.ceil(pagination.total / pagination.limit), 1)}
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
                          <option value="5">5 на странице</option> 
                          <option value="10">10 на странице</option>
                          <option value="20">20 на странице</option>
                          <option value="50">50 на странице</option>
                        </select>
                    </div>
                  </div>
    )
}

export default ActiveOrdersTable