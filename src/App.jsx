import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import OrdersPage from './pages/OrdersPage';
import BankDetailsPage from './pages/BankDetailsPage';
import StatPage from './pages/StatPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';


function App() {
  return (
    <AuthProvider>
      <Routes>
      <Route path="/" element={<PrivateRoute><AppLayout/></PrivateRoute>}>
        <Route index element={<HomePage/>}/>
        <Route path="history" element={<HistoryPage/>}/>
        <Route path="settings" element={<SettingsPage/>}/>
        <Route path="orders" element={<OrdersPage/>}/>
        <Route path="bank-details" element={<BankDetailsPage/>}/>
        <Route path="stats" element={<StatPage/>}/>
      </Route>
      <Route path="/login" element={<LoginPage/>}/>
    </Routes>
    </AuthProvider>
  );
}

export default App;