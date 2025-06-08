import { useAuth } from "../contexts/AuthContext";


const TraderInfo = () => {

    const {traderID} = useAuth()

    return (
        <article className="trader-info">
            <p>ID: {traderID}</p>
            <div className="trader-wallet">
                <div className="wallet-info">
                    <p><b>Адрес: </b> Адрес </p>
                    <p><b>Баланс:</b> </p>
                    <p><b>Заморожено:</b> </p>
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
