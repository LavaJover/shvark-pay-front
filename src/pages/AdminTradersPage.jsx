import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useAuth } from "../contexts/AuthContext"
import api from "../api/axios"

const AdminTradersPage = () => {
  const { token } = useAuth()

  const [form, setForm] = useState({
    username: "",
    login: "",
    password: "",
  })

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  // Состояние для модального окна
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    actionType: null, // 'promote' или 'demote'
    userId: null,
    username: "",
    message: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const fetchUsers = async () => {
    setFetching(true)
    try {
      // Загружаем трейдеров и тим-лидов
      const [tradersRes, teamLeadsRes] = await Promise.all([
        api.get("/admin/users?role=TRADER", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get("/admin/users?role=TEAM_LEAD", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      // Объединяем результаты в один список
      setUsers([
        ...tradersRes.data.users.map(u => ({ ...u, role: "TRADER" })),
        ...teamLeadsRes.data.users.map(u => ({ ...u, role: "TEAMLEAD" }))
      ])
    } catch (err) {
      toast.error("Ошибка при загрузке пользователей")
      console.error(err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("/admin/teams/create", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast.success("Трейдер создан")
      setForm({ username: "", login: "", password: "" })
      fetchUsers() // Обновляем список после создания
    } catch (err) {
      console.error(err)
      toast.error("Ошибка при создании трейдера")
    } finally {
      setLoading(false)
    }
  }

  // Открытие модального окна для подтверждения действия
  const openConfirmationModal = (actionType, userId, username) => {
    let message = "";
    if (actionType === "promote") {
      message = `Вы уверены, что хотите повысить пользователя ${username} до тим-лида?`;
    } else {
      message = `Вы уверены, что хотите понизить пользователя ${username} до трейдера?`;
    }
    
    setConfirmationModal({
      isOpen: true,
      actionType,
      userId,
      username,
      message
    });
  };

  // Закрытие модального окна
  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      actionType: null,
      userId: null,
      username: "",
      message: ""
    });
  };

  // Подтверждение действия
  const confirmAction = async () => {
    const { actionType, userId } = confirmationModal;
    
    try {
      if (actionType === "promote") {
        await api.post(`/admin/teams/traders/${userId}/promote-to-teamlead`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success("Пользователь повышен до тим-лида")
      } else {
        await api.post(`/admin/teams/teamleads/${userId}/demote`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success("Тим-лид понижен до трейдера")
      }
      
      fetchUsers(); // Обновляем список пользователей
    } catch (err) {
      console.error(err)
      const action = actionType === "promote" ? "повышения" : "понижения";
      toast.error(`Ошибка при ${action} пользователя`)
    } finally {
      closeConfirmationModal();
    }
  };

  return (
    <div className="admin-traders-page">
      {/* Модальное окно подтверждения */}
      {confirmationModal.isOpen && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <p>{confirmationModal.message}</p>
            <div className="modal-actions">
              <button 
                className="confirm-btn"
                onClick={confirmAction}
              >
                Подтвердить
              </button>
              <button 
                className="cancel-btn"
                onClick={closeConfirmationModal}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <h1>Создание аккаунта трейдера</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Login</label>
          <input
            name="login"
            type="text"
            value={form.login}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Создание..." : "Создать трейдера"}
        </button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Список трейдеров и тим-лидов</h2>
      {fetching ? (
        <p>Загрузка пользователей...</p>
      ) : (
        <div className="traders-table-wrapper">
          <table className="traders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Login</th>
                <th>Role</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.login}</td>
                  <td>{user.role === "TRADER" ? "Трейдер" : "Тим-лид"}</td>
                  <td>
                    {user.role === "TRADER" ? (
                      <button 
                        className="promote-btn"
                        onClick={() => openConfirmationModal("promote", user.id, user.username)}
                      >
                        Повысить до тим-лида
                      </button>
                    ) : (
                      <button 
                        className="demote-btn"
                        onClick={() => openConfirmationModal("demote", user.id, user.username)}
                      >
                        Понизить до трейдера
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminTradersPage