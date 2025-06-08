import { useTransactions } from "../hooks/useTransactions"

const TransactionsTable = () => {
    
    const {transactions, loading, error} = useTransactions()

    if(loading) return <p>Загрузка</p>
    if(error) return <p>Ошибка загрузки: {error.message}</p>

    return (
        <table className="table-auto w-full border mt-4">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2">Сумма</th>
                    <th className="border px-4 py-2">Тип</th>
                    <th className="border px-4 py-2">Статус</th>
                    <th className="border px-4 py-2">Дата</th>
                </tr>
            </thead>
            <tbody>
                {
                    transactions.map(txn => (
                        <tr key={txn.id}>
                            <td className="border px-4 py-2">{txn.id}</td>
                            <td className="border px-4 py-2">
                                {txn.amount} {txn.currency}
                            </td>
                            <td className="border px-4 py-2">{txn.type}</td>
                            <td className="border px-4 py-2">{txn.status}</td>
                            <td className="border px-4 py-2">
                                {new Date(txn.created_at).toLocaleString()}
                            </td>
                        </tr>
                    ))
                }
            </tbody>

        </table>
    )
}

export default TransactionsTable