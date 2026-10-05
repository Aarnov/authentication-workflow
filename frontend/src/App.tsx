import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import OtpLogin from './components/OtpLogin';
import TotpLogin from './components/TotpLogin';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgetPassword';
import VerifyEmail from './components/VerifyEmail';

function App() {
  return (
    <Router>
      <Routes>
        {/* The Layout wraps all routes inside it */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login/otp" element={<OtpLogin />} />
          <Route path="/login/totp" element={<TotpLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;