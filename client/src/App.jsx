import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";
import SupervisorLayout from "./layouts/SupervisorLayout";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPass";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDetections from './pages/admin/Detections';
import AdminHome from './pages/admin/Home';
import AdminLogin from './pages/admin/Login';
import AdminIndex from './pages/admin/index.jsx';
import LandingPage from "./pages/landing/LandingPage";
export function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Client Routes */}
        <Route path="/client/*" element={<ClientLayout />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminHome />} />
        <Route path="/admin/detections" element={<AdminDetections />} />
        <Route path="/admin" element={<AdminIndex />} />
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Supervisor Layout */}
        <Route path="/supervisor/*" element={<SupervisorLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
