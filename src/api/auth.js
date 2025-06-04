import axios from 'axios'

const API_URL = "http://localhost:8080/api/v1"

export async function loginUser({ userLogin, password}) {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            "login": userLogin,
            "password":password
        })
        console.log(response.data)
        console.log(response.data.access_token)
        return response.data.access_token
    }catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Ошибка входа')
        }else {
            throw new Error('Сервер недоступен')
        }
    }
}