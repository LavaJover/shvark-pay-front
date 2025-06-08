import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import OrdersPage from './pages/OrdersPage';
import StatPage from './pages/StatPage';
import LoginPage from './pages/LoginPage';
import BankDetailsPage from './pages/BankDetailsPage';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './auth/PrivateRoute';

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
      </Route>
      <Route path="/login" element={<LoginPage/>}/>
      </Routes>
      <ToastContainer position='bottom-right' autoClose={3000}/>
      </AuthProvider>
      </>
  );
}

export default App;