import { act, useState } from "react"
import ActiveOrdersTable from "../components/ActiveOrdersTable"
import { useTraderOrders } from "../hooks/useTraderOrders"
import { FinishedOrdersTable } from "../components/FinishedOrdersTable"
import { CanceledOrdersTable } from "../components/CanceledOrdersTable"
import { DisputeOrdersTable } from "../components/DisputeOrdersTable"

const OrdersPage = () => {

    const {orders, loading} = useTraderOrders()
    const [isActiveOpen, setIsActiveOpen] = useState(false)
    const [isFinishedOpen, setIsFinishedOpen] = useState(false)
    const [isCanceledOpen, setIsCanceledOpen] = useState(false)
    const [isDisputeOpen, setIsDisputeOpen] = useState(false)

    const handleAciveButton = () => {
        setIsActiveOpen(true)
        setIsCanceledOpen(false)
        setIsDisputeOpen(false)
        setIsFinishedOpen(false)
    }

    const handleCanceledButton = () => {
        setIsActiveOpen(false)
        setIsCanceledOpen(true)
        setIsDisputeOpen(false)
        setIsFinishedOpen(false)
    }

    const handleFinishedButton = () => {
        setIsActiveOpen(false)
        setIsCanceledOpen(false)
        setIsDisputeOpen(false)
        setIsFinishedOpen(true)
    }

    const handleDisputeButton = () => {
        setIsActiveOpen(false)
        setIsCanceledOpen(false)
        setIsDisputeOpen(true)
        setIsFinishedOpen(false)
    }

    const activeOrders = orders.filter(order => order.status==='CREATED')
    const finishedOrders = orders.filter(order => order.status==='SUCCEED')
    const canceledOrders = orders.filter(order => order.status==='CANCELED')
    const disputeOrders = orders.filter(order => order.status==='DISPUTE_CREATED' || order.status==='DISPUTE_RESOLVED')

    return (
        <>
        <h1>Сделки</h1>
        <div className="orders-nav">
            <button onClick={handleAciveButton}>Активные</button>
            <button onClick={handleFinishedButton}>Завершённые</button>
            <button onClick={handleCanceledButton}>Отменённые</button>
            <button onClick={handleDisputeButton}>Споры</button>
        </div>
        <ActiveOrdersTable 
            isOpen={isActiveOpen}
            activeOrders={activeOrders}
        />
        <FinishedOrdersTable
            isOpen={isFinishedOpen}
            finishedOrders={finishedOrders}
        />
        <CanceledOrdersTable
            isOpen={isCanceledOpen}
            canceledOrders={canceledOrders}
        />
        <DisputeOrdersTable
            isOpen={isDisputeOpen}
            disputeOrders={disputeOrders}
        />
        </>
    )
}

export default OrdersPage