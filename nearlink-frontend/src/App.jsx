import { useEffect, useState } from 'react';
import Sidebar from './components/SideBar';
import NearbyPage from './pages/NearByPage';
import FriendsPage from './pages/FriendsPage';
import RequestsPage from './pages/RequestsPage';
import PendingPage from './pages/PendingPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import {  Route, Routes, useNavigate } from 'react-router-dom';
// import ChatPage from './pages/ChatPage';
// import MessagePage from './pages/MessagePage';
import UnifiedChatPage from './pages/UnifiedChatPage';

const  App = () => {
   const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [activeTab, setActiveTab] = useState('nearby');

  // Guard: If no token, show login (simplified for this example)
 if (!token) {
    return <AuthPage onLoginSuccess={(newToken) => {setToken(newToken);
      setActiveTab = 'nearby';
    }} />;
  }

  useEffect(() => {
    if (token) {
      navigate(`/${activeTab}`);
    }else{
      navigate('login');
    }
  }, [activeTab, navigate, token]);

  

  return (
   
    <div className="flex min-h-screen bg-slate-50">
      {/* 1. Sidebar Component Injected */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
        onLogout={() => { localStorage.clear(); setToken(null); }}
      />
      
      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto">
          {/* Header that changes based on selection */}
          <header className="mb-8">
            <h2 className="text-4xl font-extrabold text-slate-900 capitalize">{activeTab}</h2>
            <p className="text-slate-500 mt-2">Manage your NearLink activities here.</p>
          </header>

          {/* Injected Content */}
          <div className="animate-in fade-in duration-500">
            <Routes>
         <Route path="/nearby" element={<NearbyPage/>}/>
         <Route path="/login" element={<AuthPage/>} />
         <Route path="/message" element={<UnifiedChatPage/>}/>
         <Route path="/friends" element={<FriendsPage onTabChange={()=> setActiveTab('message')}/>} />
          <Route path="/requests" element={<RequestsPage/>} />
           <Route path="/pending" element={<PendingPage/>} />
            <Route path="/profile" element={<ProfilePage/>} />
      </Routes>
          </div>
        </div>
      </main>

      
    </div>
    
  );
}

export default App;