import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchTraderWalletHistory } from "../api/wallet";
import "./HistoryPage.css";

const HistoryPage = () => {
  const { traderID } = useAuth();
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (page = 1, limit = pagination.itemsPerPage) => {
    try {
      setLoading(true);
      const data = await fetchTraderWalletHistory({ 
        traderID, 
        queryParams: { page, limit } 
      });
      
      setHistory(data.history);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems,
        itemsPerPage: data.pagination.itemsPerPage,
      });
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки истории транзакций");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (traderID) {
      fetchData();
    }
  }, [traderID]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1
    }));
    fetchData(1, newItemsPerPage);
  };

  return (
    <div className="history-container">
      <h1 className="history-title">История транзакций</h1>
      
      {loading && <div className="loading-indicator">Загрузка...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <>
          <div className="pagination-controls">
            <div className="pagination-info">
              Показано: {history.length} из {pagination.totalItems}
            </div>
            
            <div className="items-per-page">
              <label htmlFor="itemsPerPage">Элементов на странице:</label>
              <select 
                id="itemsPerPage" 
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Сумма</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Детали</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map(txn => (
                    <tr key={txn.id}>
                      <td>{txn.id}</td>
                      <td>
                        {txn.amount} {txn.currency}
                      </td>
                      <td>
                        <span className={`txn-type ${txn.type}`}>
                          {getTypeLabel(txn.type)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${txn.status}`}>
                          {getStatusLabel(txn.status)}
                        </span>
                      </td>
                      <td>
                        {new Date(txn.createdAt).toLocaleString()}
                      </td>
                      <td>
                        {txn.txHash && (
                          <a 
                            href={`https://explorer.example.com/tx/${txn.txHash}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tx-link"
                          >
                            Ссылка
                          </a>
                        )}
                        {txn.orderId && (
                          <span className="order-id">Order: {txn.orderId}</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      Нет данных о транзакциях
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button 
              className="pagination-btn"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(1)}
            >
              &laquo;
            </button>
            <button 
              className="pagination-btn"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              &lsaquo;
            </button>
            
            <span className="current-page">
              Страница {pagination.currentPage} из {pagination.totalPages}
            </span>
            
            <button 
              className="pagination-btn"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              &rsaquo;
            </button>
            <button 
              className="pagination-btn"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.totalPages)}
            >
              &raquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Вспомогательные функции для перевода
const getTypeLabel = (type) => {
  const types = {
    deposit: "Пополнение",
    withdraw: "Вывод",
    freeze: "Заморозка",
    release: "Разморозка",
    reward: "Награда",
    platform_fee: "Комиссия платформы"
  };
  return types[type] || type;
};

const getStatusLabel = (status) => {
  const statuses = {
    pending: "В обработке",
    confirmed: "Подтверждено",
    failed: "Ошибка"
  };
  return statuses[status] || status;
};

export default HistoryPage;