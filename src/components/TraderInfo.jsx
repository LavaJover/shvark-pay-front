

const TraderInfo = () => {

    return (
        <article className="trader-info">
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
