import { useAuth } from '../auth/AuthContext';
import { useWalletBalance } from "../hooks/useWalletBalance";

const TraderInfo = () => {
    const { isInitialized } = useAuth();
    const { balance, loading, error } = useWalletBalance(10000, isInitialized);

    if (!isInitialized) return <div>Загрузка...</div>;

    if (loading) return <div>Загрузка баланса...</div>;
    if (error) return <div>Ошибка загрузки баланса</div>;

    // Защита от null, если баланс еще не пришел
    const { address, currency, balance: amount, frozen } = balance || {};

    return (
        <article className="trader-info">
            <div className="trader-wallet">
                <div className="wallet-info">
                    <p><b>Адрес: </b> {address ?? '—'}</p>
                    <p><b>Баланс:</b> {amount ?? '—'} {currency ?? '—'}</p>
                    <p><b>Заморожено:</b> {frozen ?? '—'} {currency ?? '—'}</p>
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
