import axios from 'axios'

const API_URL = "http://localhost:8080/api/v1"

export async function loginUser({ login, password}) {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            login,
            password
        })
        return response.data.accessToken
    }catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Ошибка входа')
        }else {
            throw new Error('Сервер недоступен')
        }
    }
}