import { useState } from 'react';
import { Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/SideBar';
import NearbyPage from './pages/NearByPage';
import FriendsPage from './pages/FriendsPage';
import RequestsPage from './pages/RequestsPage';
import PendingPage from './pages/PendingPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import UnifiedChatPage from './pages/UnifiedChatPage';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  // Get current page name from URL for the header (e.g., "/nearby" -> "nearby")
  const currentPage = location.pathname.split('/')[1] || 'Dashboard';

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    navigate('/login');
  };

  if (!token) {
    return <AuthPage onLoginSuccess={(newToken) => {
      setToken(newToken);
      navigate('/nearby');
    }} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto">
          {/* Header updates automatically based on the URL path */}
          <header className="mb-8">
            <h2 className="text-4xl font-extrabold text-slate-900 capitalize">
              {currentPage}
            </h2>
            <p className="text-slate-500 mt-2">Manage your NearLink activities here.</p>
          </header>

          <div className="animate-in fade-in duration-500">
            <Routes>
              {/* Redirect root to nearby */}
              <Route path="/" element={<Navigate to="/nearby" replace />} />
              
              <Route path="/nearby" element={<NearbyPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/message" element={<UnifiedChatPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/pending" element={<PendingPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;