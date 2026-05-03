import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import GlobalStyles from "./components/GlobalStyles";
// import AnimatedBackground from "./components/AnimatedBackground";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Reminders from "./components/Reminders";
import Login from "./components/Login";
import UserForm from "./components/UserForm";
import ErrorPage from "./components/ErrorPage";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <GlobalStyles />
      {/* <AnimatedBackground /> */}

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
  );
}