import api from "./axios";

export const fetchTraders = async () => {
    const response = await api.get('/admin/traders')
    return response.data.users
  }