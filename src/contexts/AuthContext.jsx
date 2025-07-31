import { createContext, useContext, useEffect, useState } from "react";
import { extractTraderID } from "../utils/jwt";
import api from "../api/axios";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [traderID, setTraderID] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isTeamLead, setIsTeamLead] = useState(false)

    // Проверка разрешения через RBAC
    const checkPermission = async (userID, token, object, action) => {
        try {
            const res = await api.post(
                "/rbac/permissions",
                {
                    user_id: userID,
                    object: object,
                    action: action
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            return res.data.allowed === true;
        } catch (err) {
            console.error(`Ошибка при проверке прав (${object}/${action}):`, err)
            return false
        }
    }

    // Проверка всех необходимых ролей
    const checkRoles = async (userID, token) => {
        try {
            // Проверка администратора (полные права)
            const adminCheck = checkPermission(userID, token, "*", "*")
            // Проверка доступа к кабинету тимлида
            const teamLeadCheck = checkPermission(userID, token, "team_lead_dashboard", "read")
            
            // Выполняем обе проверки параллельно
            const [isAdminResult, isTeamLeadResult] = await Promise.all([
                adminCheck,
                teamLeadCheck
            ])
            
            setIsAdmin(isAdminResult)
            setIsTeamLead(isTeamLeadResult)
        } catch (err) {
            console.error("Ошибка при проверке ролей:", err)
            setIsAdmin(false)
            setIsTeamLead(false)
        }
    }

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
            const id = extractTraderID(storedToken)
            setToken(storedToken)
            setTraderID(id)
            setIsAuthenticated(true)
            checkRoles(id, storedToken)
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
        checkRoles(id, newToken)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setIsAuthenticated(false)
        setTraderID(null)
        setIsAdmin(false)
        setIsTeamLead(false)
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
            isAdmin,
            isTeamLead
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)