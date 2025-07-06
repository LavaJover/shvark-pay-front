import { useState, useEffect } from "react"
import api from "../api/axios"
import QRCode from 'qrcode'

function ShowQR({ otpauthUrl }) {
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (otpauthUrl) {
      QRCode.toDataURL(otpauthUrl)
        .then(setQrDataUrl)
        .catch(console.error)
    }
  }, [otpauthUrl])

  return (
    <div className="qr-wrapper">
      <p>Отсканируйте QR-код в Google Authenticator:</p>
      {qrDataUrl && <img src={qrDataUrl} alt="QR Code" />}
    </div>
  )
}

export const Setup2FA = () => {
  const [qrUrl, setQrUrl] = useState('')
  const [code, setCode] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const setup2fa = async () => {
      try {
        const resp = await api.post('/2fa/setup')
        setQrUrl(resp.data.qr_url)
      } catch (err) {
        setError('Ошибка при загрузке QR-кода')
      }
    }
    setup2fa()
  }, [])

  const handleVerify = async () => {
    try {
      const resp = await api.post('/2fa/verify', { code })
      setSuccess(true)
      setError('')
    } catch (err) {
      setSuccess(false)
      setError('Неверный код. Попробуйте снова.')
    }
  }

  return (
    <div className="twofa-settings-container">
      <h2>Подключение двухфакторной аутентификации</h2>

      {qrUrl ? <ShowQR otpauthUrl={qrUrl} /> : <p>Загрузка QR-кода...</p>}

      <label htmlFor="2fa-code">Введите код из приложения</label>
      <input
        id="2fa-code"
        type="text"
        placeholder="Код из Google Authenticator"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={handleVerify}>Подтвердить</button>

      {success && <p className="success-message">2FA успешно подключено!</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}
