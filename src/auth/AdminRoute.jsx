import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) return <p>Загрузка...</p>
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />

  return children
}

export default AdminRoute