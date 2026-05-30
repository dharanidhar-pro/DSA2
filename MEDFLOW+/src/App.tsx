/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { EmergencyDashboard } from './pages/EmergencyDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AiAssistant } from './components/AiAssistant';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/dashboard/patient/*" 
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/doctor/*" 
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/admin/*" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/emergency" element={<EmergencyDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AiAssistant />
    </Router>
  );
}
