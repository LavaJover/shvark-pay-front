import {jwtDecode} from 'jwt-decode'

export const extractTraderID = (token) => {
    try{
        if (token) {
            const decoded = jwtDecode(token)
            console.log(decoded)
            return decoded.user_id
        }
    }catch(err) {
        console.log('Ошибка раскодирования токена: ' + err.message)
    }
}