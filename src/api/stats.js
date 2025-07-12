import api from "./axios"

export const getBankDetailsStats = (traderID) => {
  return api.get(`/banking/details/stats/${traderID}`)
}