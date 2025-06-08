import { toast } from "react-toastify"
import api from "./axios"

export const loginUser = async ({login, password}) => {

    try {
        const response = await api.post('/login', {
            'login': login,
            'password': password
        })
        toast.success('Успешный вход!')
        
        // extracting tokens from successful server response
        const accessToken = response.data.access_token
        const refreshToken = response.data.refresh_token

        localStorage.setItem('token', accessToken)



        return response.data

    }catch (err) {
        // errors with status code 4xx, 5xx

        if (err.response) {
            // server responded with error
            console.log('Ошибка на сервере: ', err.response.status, err.response.data)
            toast.error(`Ошибка входа`)
        }else if (err.request) {
            // request sended but no response
            console.log('Сервер не отвечает')
            toast.error(`Нет ответа от сервера`)
        }else {
            // error in request settings 
            console.log('Ошибка в настройке запроса: ', err.message)
            // toast.error('Ошибка запроса: '+ err.message)
        }
    }
}