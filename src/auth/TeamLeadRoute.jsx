// src/auth/TeamLeadRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TeamLeadRoute = ({ children }) => {
  const { isTeamLead, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Загрузка...</div>; // Можно добавить спиннер
  }

  if (!isTeamLead) {
    // Перенаправляем на главную, если пользователь не тимлид
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default TeamLeadRoute;