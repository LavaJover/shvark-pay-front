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


function App() {
  return (
      <>
      <Routes>
      <Route path="/" element={<AppLayout/>}>
        <Route index element={<HomePage/>}/>
        <Route path="history" element={<HistoryPage/>}/>
        <Route path="settings" element={<SettingsPage/>}/>
        <Route path="orders" element={<OrdersPage/>}/>
        <Route path="bank-details" element={<BankDetailsPage/>}/>
        <Route path="stats" element={<StatPage/>}/>
      </Route>
      <Route path="/login" element={<LoginPage/>}/>
      </Routes>
      </>
  );
}

export default App;