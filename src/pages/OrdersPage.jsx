import { act, useState } from "react"
import ActiveOrdersTable from "../components/ActiveOrdersTable"
import { useTraderOrders } from "../hooks/useTraderOrders"
import { FinishedOrdersTable } from "../components/FinishedOrdersTable"
import { CanceledOrdersTable } from "../components/CanceledOrdersTable"
import { DisputeOrdersTable } from "../components/DisputeOrdersTable"

import './OrdersPage.css'

const OrdersPage = () => {

    const [activeTab, setActiveTab] = useState('created')

    return (
        <>
        <div className="orders-content">
        <div className="orders-nav">
            <button onClick={() => setActiveTab('created')}>Активные</button>
            <button onClick={() => setActiveTab('succeed')}>Завершённые</button>
            <button onClick={() => setActiveTab('canceled')}>Отменённые</button>
            <button onClick={() => setActiveTab('dispute')}>Споры</button>
        </div>
        <ActiveOrdersTable 
            isOpen={activeTab === 'created'}
        />
        <FinishedOrdersTable
            isOpen={activeTab === 'succeed'}
        />
        <CanceledOrdersTable
            isOpen={activeTab === 'canceled'}
        />
        <DisputeOrdersTable
            isOpen={activeTab === 'dispute'}
        />
        </div>
        </>
    )
}

export default OrdersPage