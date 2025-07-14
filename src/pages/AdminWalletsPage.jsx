import { useEffect, useState } from "react"
import api from "../api/axios"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"
import './AdminWalletsPage.css'

const AdminWalletsPage = () => {
  const { token } = useAuth()

  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState("")
  const [wallet, setWallet] = useState(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const fetchUsers = async () => {
    try {
      const [tradersRes, merchantsRes] = await Promise.all([
        api.get("/admin/traders", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/admin/merchants", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const traders = tradersRes.data.users
      const merchants = merchantsRes.data.users
      const combined = [
        ...traders.map((u) => ({ ...u, type: "trader" })),
        ...merchants.map((u) => ({ ...u, type: "merchant" })),
      ]
      setUsers(combined)
    } catch (err) {
      console.error("Ошибка загрузки пользователей", err)
      toast.error("Не удалось загрузить список пользователей")
    }
  }

  const fetchWallet = async (userId) => {
    try {
      const res = await api.get(`/wallets/${userId}/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setWallet(res.data)
    } catch (err) {
      console.error("Ошибка получения баланса", err)
      toast.error("Не удалось получить данные кошелька")
    }
  }

  const handleSelectUser = (e) => {
    const userId = e.target.value
    setSelectedUser(userId)
    setWallet(null)
    if (userId) {
      fetchWallet(userId)
    }
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    try {
      await api.post(
        "/wallets/deposit",
        {
          amount: parseFloat(depositAmount),
          traderId: selectedUser,
          txHash: "admin-deposit",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success("Баланс пополнен")
      fetchWallet(selectedUser)
      setDepositAmount("")
    } catch (err) {
      console.error("Ошибка пополнения", err)
      toast.error("Не удалось пополнить баланс")
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    try {
      await api.post(
        "/wallets/offchain-withdraw",
        {
          amount: parseFloat(withdrawAmount),
          traderId: selectedUser,
          txHash: "admin-withdraw",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success("Средства успешно списаны")
      fetchWallet(selectedUser)
      setWithdrawAmount("")
    } catch (err) {
      console.error("Ошибка списания", err)
      toast.error("Не удалось списать средства")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="admin-wallets-page">
      <h1>Управление кошельками</h1>

      <div className="form-group">
        <label>Выберите пользователя</label>
        <select value={selectedUser} onChange={handleSelectUser}>
          <option value="">-- Выберите --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              [{u.type}] {u.username} ({u.login})
            </option>
          ))}
        </select>
      </div>

      {wallet && (
        <div className="wallet-info">
          <h3>Кошелёк</h3>
          <p><strong>Адрес:</strong> {wallet.address}</p>
          <p><strong>Баланс:</strong> {wallet.balance} {wallet.currency}</p>
          <p><strong>Заморожено:</strong> {wallet.frozen} {wallet.currency}</p>
        </div>
      )}

      {selectedUser && (
        <>
          <form onSubmit={handleDeposit} className="wallet-form">
            <h3>Пополнение кошелька</h3>
            <div className="form-group">
              <label>Сумма депозита</label>
              <input
                type="number"
                min={0}
                step="any"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
              />
            </div>
            <button type="submit">Пополнить</button>
          </form>

          <form onSubmit={handleWithdraw} className="wallet-form">
            <h3>Списание средств</h3>
            <div className="form-group">
              <label>Сумма списания</label>
              <input
                type="number"
                min={0}
                step="any"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="danger-button">Списать</button>
          </form>
        </>
      )}
    </div>
  )
}

export default AdminWalletsPage
