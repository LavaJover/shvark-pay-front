import api from "./axios"

export const fetchTraderWalletAddress = async ({ traderID }) => {
    try {
        const response = await api.get(`/wallets/${traderID}/address`)
        console.log(response)
        return response.data
    }catch (err) {
        if (err.response) {
            console.log(err)
            console.log('server responded with error: ' + err.response)
            if (err.status == 401) {
                throw new Error('unauthorized')
            }
        }else if (err.request) {
            console.log('server not responding')
        }else {
            console.log('invalid request: ' + err)
        }
    }
}

export const fetchTraderWalletBalance = async ({ traderID }) => {
    try {
        const response = await api.get(`/wallets/${traderID}/balance`)

        return response.data
    }catch (err) {
        if (err.response) {
            console.log('server responded with error: ' + err.response)
        }else if (err.request) {
            console.log('server not responding')
        }else {
            console.log('invalid request')
        }
    }
}

export const fetchTraderWalletHistory = async ({ traderID }) => {
    try {
        const response = await api.get(`/wallets/${traderID}/history`)

        return response.data
    }catch (err) {
        if (err.response) {
            console.log('server responded with error: ' + err.response)
        }else if (err.request) {
            console.log('server not responding')
        }else {
            console.log('invalid request')
        }
    }
}