import { createContext, useContext, useEffect, useState } from "react";
import { extractTraderID } from "../utils/jwt";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    
    const [token, setToken] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [traderID, setTraderID] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        console.log('use effect' + storedToken)
        if (storedToken) {
            setToken(storedToken)
            setIsAuthenticated(true)
            console.log(storedToken)
            setTraderID(extractTraderID(storedToken))
        }
        setIsLoading(false)
    }, [])

    const login = (newToken) => {
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setIsAuthenticated(true)
        setTraderID(extractTraderID(newToken))
        setIsLoading(false)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setIsAuthenticated(false)
        setTraderID(null)
        setIsLoading(false)
    }

    return (
        <AuthContext.Provider value={{token, isAuthenticated, login, logout, traderID, isLoading}}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => useContext(AuthContext)