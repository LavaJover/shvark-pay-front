import { useState, useEffect } from "react"
import api from "../api/axios"
import QRCode from 'qrcode'

export default function ShowQR({ otpauthUrl }) {
    const [qrDataUrl, setQrDataUrl] = useState('')
  
    useEffect(() => {
      if (otpauthUrl) {
        QRCode.toDataURL(otpauthUrl)
          .then(url => setQrDataUrl(url))
          .catch(err => console.error(err))
      }
    }, [otpauthUrl])
  
    return (
      <div>
        <p>Отсканируйте QR-код:</p>
        {qrDataUrl && <img src={qrDataUrl} alt="QR Code" />}
      </div>
    )
  }
  

export const Setup2FA = () => {
    const [qrUrl, setQrUrl] = useState('')
    const [secret, setSecret] = useState('')
    const [code, setCode] = useState('')
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const setup2fa = async () => {
            try {
                const resp = await api.post('/2fa/setup')
                console.log(resp)
                setQrUrl(resp.data.qr_url)
            }catch(err) {
                console.log(err)
            }finally {

            }
        }
        setup2fa()
    }, [])

    const handleVerify = () => {
        const verify2FA = async () => {
            try {
                const resp = await api.post('/2fa/verify', {code})
                setSuccess(true)
                setError('')
            }catch(err) {
                setSuccess(false)
                setError(err)
            }finally{

            }
        }
        verify2FA()
      }

    return (
        <div>
            <h2>Подключение 2FA</h2>
            {qrUrl ? (
                <>
                    <ShowQR otpauthUrl={qrUrl}/>
                </>
            ) : (
                <p>Загрузка QR...</p>
            )}

            <input type="text" placeholder="Код из приложения" value={code} onChange={e => setCode(e.target.value)} />
            <button onClick={() => handleVerify()}>Подтвердить</button>

            {success && <p style={{ color: 'green' }}>2FA подключено!</p>}
            {error && <p style={{ color: 'red' }}>Ошибка</p>}
        </div>
    )
} 