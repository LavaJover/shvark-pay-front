
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

export const FinishedOrdersTable = ({isOpen, finishedOrders}) => {

    if(!isOpen || !finishedOrders)return null

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Реквизит</th>
                    <th>Сумма в фиате</th>
                    <th>Сумма в крипте</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tbody>
                {
                    finishedOrders.map(order => (
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
                            <td>{order.status}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}