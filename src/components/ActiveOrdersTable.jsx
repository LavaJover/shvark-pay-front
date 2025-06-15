import { approveTraderOrder } from "../api/orders"
import { useTraderOrders } from "../hooks/useTraderOrders"
import { useMemo } from "react"

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

const ActiveOrdersTable = ({isOpen, activeOrders}) => {

    if (!isOpen || !activeOrders) return null

    const handleApprove = async ({order_id}) => {
        const data = await approveTraderOrder({order_id})
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Реквизит</th>
                    <th>Сумма в фиате</th>
                    <th>Сумма в крипте</th>
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
    )
}

export default ActiveOrdersTable