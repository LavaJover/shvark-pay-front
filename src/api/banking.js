import api from "./axios"

export const fetchTraderBankDetails = async ({traderID}) => {

    try {
        const response = await api.get(`/banking/details?trader=${traderID}`)
        console.log(response.data)
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