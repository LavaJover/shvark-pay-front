import axios from 'axios'
import {toast} from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'

const getToken = () => localStorage.getItem('token')

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const {status, data} = error.response

            if (status == 401){
                toast.error('Сессия истекла. Пожалуйста, войдите снова.')
            }else if (status >= 500) {
                toast.error('Ошибка сервера. Попробуйте позже')
            }else if (status >= 400) {
                toast.error(data.message || 'Ошибка запроса')
            }
        }else {
            toast.error('Ошибка сети. Проверьте подключение')
        }

        return Promise.reject(error)
    }
)

export default api