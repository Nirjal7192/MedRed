import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import GlobalStyles from "./components/GlobalStyles";
import AnimatedBackground from "./components/AnimatedBackground";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Reminders from "./components/Reminders";
import Login from "./components/Login";
import ErrorPage from "./components/ErrorPage";
import "./App.css";

export default function App() {
  return (
    <Router>
      <GlobalStyles />
      <AnimatedBackground />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}