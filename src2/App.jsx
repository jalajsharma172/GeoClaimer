import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage.jsx';
import Heatmap from './pages/Heatmap.jsx';
import ProtectedRoute from './components/ProtectedRoutes.jsx';
import Registration from './components/Registration/Registration.jsx';
import UserData from './components/landingPage/usersData/UsersData.jsx';
import { useAuth } from './context/AuthContext';

function App() {
  const { isRegistered, isAuthenticated } = useAuth();

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/data" element={<UserData />} />

        {/* ✅ Only allow /registration if user is authenticated AND not registered */}
        {!isRegistered && (
          <Route
            path="/registration"
            element={
              isAuthenticated ? <Registration /> : <Navigate to="/auth" replace />
            }
          />
        )}

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Add other public routes here */}
      </Routes>
    </div>
  );
}

export default App;
