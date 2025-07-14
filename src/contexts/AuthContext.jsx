import { createContext, useContext, useEffect, useState } from "react";
import { extractTraderID } from "../utils/jwt";
import axios from "axios";
import api from "../api/axios";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [traderID, setTraderID] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    const checkAdmin = async (userID, token) => {
        try {
            const res = await api.post(
                "/rbac/permissions",
                {
                    user_id: userID,
                    object: "*",
                    action: "*"
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setIsAdmin(res.data.allowed === true)
        } catch (err) {
            console.error("Ошибка при проверке прав администратора:", err)
            setIsAdmin(false)
        }
    }

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
            const id = extractTraderID(storedToken)
            setToken(storedToken)
            setTraderID(id)
            setIsAuthenticated(true)
            checkAdmin(id, storedToken)
        }
        setIsLoading(false)
    }, [])

    const login = (newToken) => {
        localStorage.setItem('token', newToken)
        const id = extractTraderID(newToken)
        setToken(newToken)
        setTraderID(id)
        setIsAuthenticated(true)
        setIsLoading(false)
        checkAdmin(id, newToken)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setIsAuthenticated(false)
        setTraderID(null)
        setIsAdmin(false)
        setIsLoading(false)
    }

    return (
        <AuthContext.Provider value={{
            token,
            isAuthenticated,
            login,
            logout,
            traderID,
            isLoading,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
