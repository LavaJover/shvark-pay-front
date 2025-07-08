import { toast } from "react-toastify"
import api from "./axios"

export const loginUser = async ({login, password, twoFACode}) => {
    const response = await api.post('/login', {
        'login': login,
        'password': password,
        'two_fa_code': twoFACode,
    })
    toast.success('Успешный вход!')
    
    return response.data
}