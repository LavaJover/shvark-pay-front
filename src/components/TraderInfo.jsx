import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchTraderWalletAddress, fetchTraderWalletBalance } from "../api/wallet";
import { useNavigate } from "react-router-dom";


const TraderInfo = () => {

    const {traderID, logout} = useAuth()
    const [walletAddress, setWalletAddress] = useState('')
    const [walletBalance, setWalletBalance] = useState(0)
    const [freezeBalance, setFreezeBalance] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchData() {
            try{
                const addressData = await fetchTraderWalletAddress({traderID})
                const balanceData = await fetchTraderWalletBalance({traderID})
                setWalletBalance(balanceData.balance)
                setFreezeBalance(balanceData.frozen)
                setWalletAddress(addressData.address)
            }catch(err) {
                if (err.message == 'unauthorized'){
                    console.log('in try catch')
                    logout()
                    navigate('/login')
                }
            }
        }
        fetchData()
    }, [])

    return (
        <article className="trader-info">
            <p>ID: {traderID}</p>
            <div className="trader-wallet">
                <div className="wallet-info">
                    <p><b>Адрес: </b> {walletAddress} </p>
                    <p><b>Баланс:</b> {walletBalance} </p>
                    <p><b>Заморожено:</b> {freezeBalance} </p>
                </div>
                <div className="wallet-control">
                    <button className="wallet-button">История</button>
                    <button className="wallet-button">Вывести</button>
                    <button className="wallet-button">Пополнить</button>
                </div>
            </div>
        </article>
    );
};

export default TraderInfo;
