import api from "./axios"

export const fetchTraderOrders = async ({traderID}) => {
    try {
        const response = await api.get(`http://localhost:8080/api/v1/orders/trader/${traderID}`)
        console.log(response.data.orders)
        return response.data
    }catch(error) {
        if (error.response){

        }else if (error.request) {

        }else {
            console.log('Invalid request to get trader orders...')
        }
    }
} 

export const approveTraderOrder = async({order_id}) => {
    try {
        const response = await api.post(`http://localhost:8080/api/v1/orders/approve`, {
            "order_id": order_id
        })
        return response.data
    }catch(error) {
        if (error.response){

        }else if (error.request) {

        }else {
            console.log('Invalid request to get trader orders...')
        }
    }
}