import api from "./axios";

export const checkIsAdmin = async (userID) => {
    try {
        console.log(userID)
      const res = await api.post('/rbac/permissions', {
        user_id: userID,
        object: '*',
        action: '*',
      })
      return res.data.allowed === true
    } catch (err) {
      console.error("Ошибка при проверке прав (admin check)", err)
      return false
    }
  }