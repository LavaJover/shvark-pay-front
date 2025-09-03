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
  const [loading, setLoading] = useState({
    users: true,
    wallet: false,
    withdraw: false
  })
  
  // Состояния для модальных окон
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showOnchainWithdrawModal, setShowOnchainWithdrawModal] = useState(false)
  
  // Состояния для вывода on-chain
  const [onchainWithdrawData, setOnchainWithdrawData] = useState({
    amount: "",
    toAddress: ""
  })
  const [withdrawResult, setWithdrawResult] = useState(null)
  const [onchainErrors, setOnchainErrors] = useState({})

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Добавляем кошелёк платформы в список пользователей
      const platformUser = {
        id: "platform",
        login: "platform",
        role: "PLATFORM",
        username: "Платформа"
      }
      
      setUsers([platformUser, ...res.data.users])
    } catch (err) {
      console.error("Ошибка загрузки пользователей", err)
      toast.error("Не удалось загрузить список пользователей")
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const fetchWallet = async (userId) => {
    setLoading(prev => ({ ...prev, wallet: true }))
    try {
      // Для платформы используем специальный endpoint
      const endpoint = userId === "platform" 
        ? "/wallets/platform/balance" 
        : `/wallets/${userId}/balance`
      
      const res = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // Для платформы добавляем специальную валюту, если не указана
      const walletData = userId === "platform"
        ? { ...res.data, currency: res.data.currency || "PLAT" }
        : res.data
        
      setWallet(walletData)
    } catch (err) {
      console.error("Ошибка получения баланса", err)
      toast.error("Не удалось получить данные кошелька")
    } finally {
      setLoading(prev => ({ ...prev, wallet: false }))
    }
  }

  const handleSelectUser = (e) => {
    const userId = e.target.value
    setSelectedUser(userId)
    setWallet(null)
    setWithdrawResult(null)
    if (userId) {
      fetchWallet(userId)
    }
  }

  const openDepositModal = (e) => {
    e.preventDefault()
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Введите корректную сумму для пополнения")
      return
    }
    setShowDepositModal(true)
  }

  const openWithdrawModal = (e) => {
    e.preventDefault()
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Введите корректную сумму для списания")
      return
    }
    
    setShowWithdrawModal(true)
  }

  const openOnchainWithdrawModal = () => {
    if (selectedUser === "platform") {
      toast.error("Вывод on-chain недоступен для платформы")
      return
    }
    
    setShowOnchainWithdrawModal(true)
    setOnchainWithdrawData({ amount: "", toAddress: "" })
    setWithdrawResult(null)
    setOnchainErrors({})
  }

  const handleDeposit = async () => {
    setShowDepositModal(false)
    try {
      // Для платформы используем специальный endpoint
      const endpoint = selectedUser === "platform"
        ? "/wallets/platform/deposit"
        : "/wallets/deposit"
      
      await api.post(
        endpoint,
        {
          amount: parseFloat(depositAmount),
          // Для платформы передаем "platform" вместо null
          traderId: selectedUser === "platform" ? "platform" : selectedUser,
          txHash: "admin-deposit",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success(`Баланс пополнен на ${depositAmount} ${wallet.currency}`)
      fetchWallet(selectedUser)
      setDepositAmount("")
    } catch (err) {
      console.error("Ошибка пополнения", err)
      toast.error("Не удалось пополнить баланс")
    }
  }

  const handleWithdraw = async () => {
    setShowWithdrawModal(false)
    try {
      // Для всех кошельков используем один и тот же endpoint offchain-withdraw
      await api.post(
        "/wallets/offchain-withdraw",
        {
          amount: parseFloat(withdrawAmount),
          // Для платформы передаем "platform"
          traderId: selectedUser === "platform" ? "platform" : selectedUser,
          txHash: "admin-withdraw",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success(`Средства списаны: ${withdrawAmount} ${wallet.currency}`)
      fetchWallet(selectedUser)
      setWithdrawAmount("")
    } catch (err) {
      console.error("Ошибка списания", err)
      toast.error("Не удалось списать средства")
    }
  }

  const validateOnchainWithdraw = () => {
    const errors = {}
    const amount = parseFloat(onchainWithdrawData.amount)
    
    if (!amount || amount <= 0) {
      errors.amount = "Введите корректную сумму"
    } else if (amount > wallet.balance) {
      errors.amount = "Сумма превышает доступный баланс"
    }
    
    if (!onchainWithdrawData.toAddress) {
      errors.toAddress = "Введите адрес кошелька"
    }
    
    setOnchainErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleOnchainWithdraw = async () => {
    if (!validateOnchainWithdraw()) return
    
    setLoading(prev => ({ ...prev, withdraw: true }))
    setWithdrawResult(null)
    
    try {
      const response = await api.post(
        "/wallets/withdraw",
        {
          amount: parseFloat(onchainWithdrawData.amount),
          toAddress: onchainWithdrawData.toAddress,
          traderId: selectedUser
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      setWithdrawResult({
        success: true,
        txid: response.data.txid
      })
      
      // Обновляем баланс после вывода
      fetchWallet(selectedUser)
    } catch (err) {
      console.error("Ошибка вывода on-chain", err.response?.data || err)
      setWithdrawResult({
        success: false,
        error: err.response?.data?.error || "Неизвестная ошибка",
        details: err.response?.data?.details || "Дополнительная информация отсутствует"
      })
    } finally {
      setLoading(prev => ({ ...prev, withdraw: false }))
    }
  }

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.info("Скопировано в буфер обмена")
  }

  const closeOnchainModal = () => {
    setShowOnchainWithdrawModal(false)
    setWithdrawResult(null)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="admin-wallets-page">
      {/* Модальное окно подтверждения депозита */}
      {showDepositModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Подтверждение пополнения</h3>
            <p>
              Вы уверены, что хотите пополнить баланс{" "}
              <strong>
                {selectedUser === "platform" 
                  ? "платформы" 
                  : users.find(u => u.id === selectedUser)?.username || selectedUser}
              </strong>{" "}
              на сумму <strong>{depositAmount} {wallet?.currency}</strong>?
            </p>
            <div className="modal-actions">
              <button 
                className="confirm-btn"
                onClick={handleDeposit}
              >
                Подтвердить
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowDepositModal(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения off-chain списания */}
      {showWithdrawModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Подтверждение списания</h3>
            <p>
              Вы уверены, что хотите списать со счета{" "}
              <strong>
                {selectedUser === "platform" 
                  ? "платформы" 
                  : users.find(u => u.id === selectedUser)?.username || selectedUser}
              </strong>{" "}
              сумму <strong>{withdrawAmount} {wallet?.currency}</strong>?
            </p>
            
            {/* Предупреждение о списании больше баланса */}
            {selectedUser !== "platform" && parseFloat(withdrawAmount) > wallet?.balance && (
              <div className="warning-box">
                <strong>Внимание!</strong> Сумма списания превышает текущий баланс. 
                Это приведёт к отрицательному балансу пользователя.
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                className="confirm-btn"
                onClick={handleWithdraw}
              >
                Подтвердить
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowWithdrawModal(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно для вывода on-chain */}
      {showOnchainWithdrawModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Вывод средств (On-chain)</h3>
            
            {!withdrawResult ? (
              <>
                <div className={`form-group ${onchainErrors.amount ? "has-error" : ""}`}>
                  <label>Сумма вывода</label>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={onchainWithdrawData.amount}
                    onChange={(e) => setOnchainWithdrawData({
                      ...onchainWithdrawData,
                      amount: e.target.value
                    })}
                    placeholder={`Максимум: ${wallet?.balance || 0}`}
                    disabled={loading.withdraw}
                  />
                  {onchainErrors.amount && (
                    <div className="error-text">{onchainErrors.amount}</div>
                  )}
                </div>
                
                <div className={`form-group ${onchainErrors.toAddress ? "has-error" : ""}`}>
                  <label>Адрес получателя</label>
                  <input
                    type="text"
                    value={onchainWithdrawData.toAddress}
                    onChange={(e) => setOnchainWithdrawData({
                      ...onchainWithdrawData,
                      toAddress: e.target.value
                    })}
                    placeholder="Введите адрес кошелька"
                    disabled={loading.withdraw}
                  />
                  {onchainErrors.toAddress && (
                    <div className="error-text">{onchainErrors.toAddress}</div>
                  )}
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="confirm-btn"
                    onClick={handleOnchainWithdraw}
                    disabled={loading.withdraw}
                  >
                    {loading.withdraw ? "Обработка..." : "Подтвердить вывод"}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={closeOnchainModal}
                    disabled={loading.withdraw}
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                {withdrawResult.success ? (
                  <div className="success-result">
                    <h4>✅ Вывод успешно выполнен</h4>
                    <p>
                      <strong>ID транзакции:</strong>
                      <span 
                        className="copyable"
                        onClick={() => copyToClipboard(withdrawResult.txid)}
                        title="Нажмите, чтобы скопировать"
                      >
                        {withdrawResult.txid}
                      </span>
                    </p>
                    <p>Средства были отправлены на указанный адрес.</p>
                  </div>
                ) : (
                  <div className="error-result">
                    <h4>❌ Ошибка вывода средств</h4>
                    <p><strong>Ошибка:</strong> {withdrawResult.error}</p>
                    <p><strong>Детали:</strong> {withdrawResult.details}</p>
                  </div>
                )}
                
                <div className="modal-actions single-action">
                  <button 
                    className="close-btn"
                    onClick={closeOnchainModal}
                  >
                    Закрыть
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <h1>Управление кошельками</h1>

      <div className="form-group">
        <label>Выберите пользователя или платформу</label>
        {loading.users ? (
          <div className="loader">Загрузка пользователей...</div>
        ) : (
          <select value={selectedUser} onChange={handleSelectUser}>
            <option value="">-- Выберите --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                [{u.role}] {u.username} {u.id === "platform" ? "(Системный кошелёк)" : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading.wallet && selectedUser && (
        <div className="loader">Загрузка данных кошелька...</div>
      )}

      {wallet && !loading.wallet && (
        <div className="wallet-info">
          <div className="wallet-header">
            <h3>Информация о кошельке</h3>
            {selectedUser !== "platform" && (
              <button 
                className="withdraw-onchain-btn"
                onClick={openOnchainWithdrawModal}
              >
                Вывод средств
              </button>
            )}
          </div>
          
          <div className="wallet-details">
            <div className="detail-item">
              <span className="detail-label">Адрес:</span>
              <span 
                className="detail-value copyable"
                onClick={() => copyToClipboard(wallet.address)}
                title="Нажмите, чтобы скопировать"
              >
                {wallet.address || "Системный кошелёк"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Баланс:</span>
              <span className="detail-value highlight">{wallet.balance} {wallet.currency}</span>
            </div>
            {selectedUser !== "platform" && (
              <div className="detail-item">
                <span className="detail-label">Заморожено:</span>
                <span className="detail-value">{wallet.frozen} {wallet.currency}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedUser && wallet && !loading.wallet && (
        <div className="wallet-operations">
          <form onSubmit={openDepositModal} className="wallet-form">
            <h3>Пополнение кошелька</h3>
            <div className="form-group">
              <label>Сумма депозита</label>
              <input
                type="number"
                min={0}
                step="0.0001"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Введите сумму"
                required
              />
            </div>
            <button type="submit" className="deposit-btn">
              Пополнить
            </button>
          </form>

          <form onSubmit={openWithdrawModal} className="wallet-form">
            <h3>Списание средств</h3>
            <div className="form-group">
              <label>Сумма списания</label>
              <input
                type="number"
                min={0}
                step="0.0001"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Введите сумму"
                required
              />
            </div>
            <button type="submit" className="withdraw-btn">
              Списать
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminWalletsPage