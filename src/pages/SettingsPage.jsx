import { useState } from 'react'
import api from '../api/axios'
import './SettingsPage.css'
import { Setup2FA } from '../components/Setup2FA'

const SettingsPage = () => {

    const [loading, setLoading] = useState(false)

    const handleConfirm2FA = async () => {
        try {
            const res = api.post('/2fa/setup')
        }catch(error) {

        }finally {

        }
    }

    return (
        <div className="settings-container">
            <div className="twofa-settings-container">
                <Setup2FA/>
            </div>
        </div>
    )
}

export default SettingsPage