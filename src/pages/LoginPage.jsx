const LoginPage = () => {
    return (
        <>
        <form>
            <label htmlFor="login">Логин</label>
            <input type="text" id="login" className="login-input"/>

            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" className="password-input"/>
        </form>
        </>
    )
}

export default LoginPage