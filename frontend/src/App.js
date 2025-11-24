import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import ReceptionistDashboard from './ReceptionistDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';
import './App.css';

function PrivateRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user.user_id) {
    return <Navigate to="/" />;
  }

  if (allowedRole) {
    const userRole = user.role.toLowerCase();
    const allowed = allowedRole.toLowerCase();

    if (allowed === 'doctor' && (userRole === 'physician' || userRole === 'doctor')) {
      return children;
    }

    if (userRole !== allowed) {
      return <Navigate to="/" />;
    }
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/receptionist"
          element={
            <PrivateRoute allowedRole="receptionist">
              <ReceptionistDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <PrivateRoute allowedRole="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRole="administrator">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
