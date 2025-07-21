import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import OrdersPage from './pages/OrdersPage';
import StatPage from './pages/StatisticsPage';
import LoginPage from './pages/LoginPage';
import BankDetailsPage from './pages/BankDetailsPage';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import AdminRoute from './auth/AdminRoute';
import AdminPanel from './pages/AdminPanel';
import AdminTradersPage from './pages/AdminTradersPage';
import AdminMerchantsPage from './pages/AdminMerchantsPage';
import AdminTrafficPage from './pages/AdminTrafficPage';
import AdminWalletsPage from './pages/AdminWalletsPage';
import AdminDisputesPage from './pages/AdminDisputesPage';
import AdminTraderOrdersPage from './pages/AdminTraderOrdersPage';
import TelegramLogin from './pages/AdminTelegramPage';
import SettleSettings from './pages/AdminSettleSettings';

function App() {
  return (
      <>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<PrivateRoute> <AppLayout/> </PrivateRoute>}>
          <Route index element={<HomePage/>}/>
          <Route path="history" element={<HistoryPage/>}/>
          <Route path="settings" element={<SettingsPage/>}/>
          <Route path="orders" element={<OrdersPage/>}/>
          <Route path="bank-details" element={<BankDetailsPage/>}/>
          <Route path="stats" element={<StatPage/>}/>
          <Route path="admin" element={
            <AdminRoute>
                <AdminPanel />
            </AdminRoute>
          }>
              <Route path="traders" element={<AdminTradersPage />} />
              <Route path="merchants" element={<AdminMerchantsPage/>} />
              <Route path="traffic" element={<AdminTrafficPage/>} />
              <Route path="wallets" element={<AdminWalletsPage/>} />
              <Route path="disputes" element={<AdminDisputesPage/>} />
              <Route path="orders" element={<AdminTraderOrdersPage/>} />
              <Route path="telegram" element={<TelegramLogin/>} />
              <Route path="settle-settings" element={<SettleSettings/>} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage/>}/>
      </Routes>
      <ToastContainer position='bottom-right' autoClose={3000}/>
      </AuthProvider>
      </>
  );
}

export default App;