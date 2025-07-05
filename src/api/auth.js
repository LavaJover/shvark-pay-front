import { toast } from "react-toastify"
import api from "./axios"

export const loginUser = async ({login, password, twoFACode}) => {

    try {
        const response = await api.post('/login', {
            'login': login,
            'password': password,
            'two_fa_code': twoFACode,
        })
        toast.success('Успешный вход!')
        
        return response.data

    }catch (err) {
        // errors with status code 4xx, 5xx

        if (err.response) {
            // server responded with error
            console.log('Ошибка на сервере: ', err.response.status, err.response.data)
            toast.error(`Ошибка входа`)
            // throw new Error('Failed to login')
            throw err
        }else if (err.request) {
            // request sended but no response
            console.log('Сервер не отвечает')
            toast.error(`Нет ответа от сервера`)
            // throw new Error('server unavailable')
            throw err
        }else {
            // error in request settings 
            console.log('Ошибка в настройке запроса: ', err.message)
            toast.error('Ошибка запроса: '+ err.message)
            // throw new Error('invalid axios set-up')
            throw err
        }
    }
}