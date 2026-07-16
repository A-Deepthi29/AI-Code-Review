import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import SubmitCode from './pages/SubmitCode';
import History from './pages/History';


function App() {
  return (
    <Router>
      <Routes>
        {/* Placeholder Fallback — Redirect straight to Dashboard for now */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected Application Wrapper */}
        <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<SubmitCode />} />
    <Route path="history" element={<History />} />
</Route>
      </Routes>
    </Router>
  );
}

export default App;