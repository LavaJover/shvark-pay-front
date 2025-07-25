import api from "./axios"

export const fetchTraderWalletAddress = async ({ traderID }) => {
    const response = await api.get(`/wallets/${traderID}/address`)
    console.log(response)
    return response.data
}

export const fetchTraderWalletBalance = async ({ traderID }) => {
    const response = await api.get(`/wallets/${traderID}/balance`)
    return response.data
}

export const fetchTraderWalletHistory = async ({ traderID, queryParams = {} }) => {
    const response = await api.get(`/wallets/${traderID}/history`, {
      params: queryParams
    });
    return response.data;
  };