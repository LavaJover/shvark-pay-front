import api from "./axios"

export const fetchTraderOrders = async ({traderID}) => {
    const response = await api.get(`/orders/trader/${traderID}`)
    console.log(response.data.orders)
    return response.data
} 

export const approveTraderOrder = async({order_id}) => {
    const response = await api.post(`/orders/approve`, {
        "order_id": order_id
    })
    return response.data
}