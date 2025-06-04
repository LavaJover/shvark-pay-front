const TraderInfo = () => {
    return (
        <article className="trader-info">
            <div className="trader-wallet">
                <div className="wallet-info">
                    <p><b>Адрес: </b> tb1qaw0ch8er0erpzsk067aedfe2pu9ea43n57ul00</p>
                    <p><b>Баланс:</b> 0.0001 BTC</p>
                    <p><b>Страховой лимит:</b> 0.02 BTC</p>
                    <p><b>Заморожено:</b> 0.00001</p>
                </div>
                <div className="wallet-control">
                    <button className="wallet-button">История</button>
                    <button className="wallet-button">Вывести</button>
                    <button className="wallet-button">Пополнить</button>
                </div>
            </div>
        </article>
    )
}

export default TraderInfo