import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const PrivateRoute = ({children}) => {
    const {isAuthenticated, isLoading} = useAuth()

    if (isLoading) {
        return <p>Loading...</p>
    }

    if (!isAuthenticated) {
        return <Navigate to='/login' replace/>
    }

    return children
}

export default PrivateRoute