import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage';

// Import Private Route Component
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Redirect root path to login by default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/notes" element={<NotesPage />} />
          {/* You can add more private routes here, e.g., /profile */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;