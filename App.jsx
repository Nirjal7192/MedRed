import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import GlobalStyles from "./components/GlobalStyles";
import AnimatedBackground from "./components/AnimatedBackground";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Reminders from "./components/Reminders";
import Login from "./components/Login";
import UserForm from "./components/UserForm";
import ErrorPage from "./components/ErrorPage";
import "./App.css";

// Redirects unauthenticated users to /login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Wait for session restore
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalStyles />
        <AnimatedBackground />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/info"
            element={
              <ProtectedRoute>
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}