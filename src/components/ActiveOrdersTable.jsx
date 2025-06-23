import { approveTraderOrder } from "../api/orders"
import { useAuth } from "../contexts/AuthContext"
import { useTraderOrders } from "../hooks/useTraderOrders"
import { useMemo, useState, useEffect } from "react"
import api from "../api/axios"

const Requisite = ({bank_name, payment_system, card_number, phone, owner}) => {

    if (card_number) return (
        <div>
            <p>{payment_system}</p>
            <p>{bank_name}</p>
            <p>{card_number}</p>
            <p>{owner}</p>
        </div>
    )

    return (
        <div>
            <p>{payment_system}</p>
            <p>{bank_name}</p>
            <p>{phone}</p>
            <p>{owner}</p>
        </div>
    )
}

const TimeLeft = ({expiresAt}) => {
    const timeLeft = useMemo(() => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;
    
        if (diff <= 0) return "Истекло";
    
        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)));
    
        return `${hours > 0 ? `${hours}ч ` : ""}${minutes}м ${seconds}с`;
      }, [expiresAt]);

  return <span>{timeLeft}</span>;
}

const TraderReward = ({amount_crypto, trader_reward}) => {
    return (
        <div>
            <p>Процент: {trader_reward*100}%</p>
            <p>{amount_crypto * trader_reward} USD</p>
        </div>
    )
}

const ActiveOrdersTable = ({isOpen}) => {
    
    const [currentPage, setCurrentPage] = useState(1)
    const [activeOrders, setActiveOrders] = useState([])
    const {traderID} = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

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
                    status: "CREATED"
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

    const handleSort = (column) => {
        setSorting(prev => ({
          sortBy: column,
          sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Сброс на первую страницу
    };

    const handleApprove = async ({order_id}) => {
        const data = await approveTraderOrder({order_id})
    }

    if (!isOpen) return null

    return (
        <>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Реквизит</th>
                    <th>Сумма в фиате</th>
                    <th>Сумма в крипте</th>
                    <th>Курс сделки</th>
                    <th>Награда трейдера</th>
                    <th>Таймер</th>
                    <th>Статус</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {
                    activeOrders.map(order => (
                        <tr key={order.order_id}>
                            <td>{order.order_id}</td>
                            <td>
                                <Requisite
                                    bank_name={order.bank_detail.bank_name}
                                    payment_system={order.bank_detail.payment_system}
                                    card_number={order.bank_detail.card_number}
                                    phone={order.bank_detail.phone}
                                    owner={order.bank_detail.owner}
                                />
                            </td>
                            <td>{order.amount_fiat}</td>
                            <td>{order.amount_crypto}</td>
                            <td>USD = {order.crypto_rub_rate} {order.bank_detail.currency}</td>
                            <td><TraderReward amount_crypto={order.amount_crypto} trader_reward={order.trader_reward}/></td>
                            <td><TimeLeft expiresAt={order.expires_at}/></td>
                            <td>{order.status}</td>
                            <td>
                                <button onClick={() => handleApprove({order_id: order.order_id})}>Подтвердить</button>
                            </td>
                        </tr>
                    ))
                }
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
                       <option value="10">5 на странице</option> 
                      <option value="10">10 на странице</option>
                      <option value="20">20 на странице</option>
                      <option value="50">50 на странице</option>
                    </select>
                  </div>
                  </>
    )
}

export default ActiveOrdersTable