import { useState, useEffect } from 'react';
import API from './api';
import Register from './Register';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [nearby, setNearby] = useState([]);

  // Log in logic
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('auth/login/', loginData);
      localStorage.setItem('access_token', res.data.access);
      setToken(res.data.access);
    } catch (err) { alert("Wrong username or password"); }
  };

  // Fetch nearby people
  useEffect(() => {
    if (token) {
      API.get('users/nearby/')
        .then(res => setNearby(res.data))
        .catch(() => setToken(null)); // Clear token if expired
    }
  }, [token]);

  if (!token) {
    return isRegistering ? <Register onSwitch={() => setIsRegistering(false)} /> : (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-96">
          <h1 className="text-3xl font-black text-blue-600 text-center">NearLink.</h1>
          <input className="border p-2 rounded" placeholder="Username" onChange={e => setLoginData({...loginData, username: e.target.value})} />
          <input className="border p-2 rounded" type="password" placeholder="Password" onChange={e => setLoginData({...loginData, password: e.target.value})} />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded font-bold">Login</button>
          <button type="button" onClick={() => setIsRegistering(true)} className="text-blue-500 text-sm">New here? Sign up</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">NearLink.</h1>
        <button onClick={() => { localStorage.clear(); setToken(null); }} className="text-red-500">Logout</button>
      </div>

      <h2 className="text-xl font-bold mb-4">People Near You 📍</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nearby.map(user => (
          <div key={user.id} className="p-4 bg-white rounded-xl shadow border border-slate-100 flex justify-between items-center">
            <div>
              <p className="font-bold">{user.username}</p>
              <p className="text-sm text-slate-500">{user.bio || "No bio"}</p>
            </div>
            <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold hover:bg-blue-600 hover:text-white transition">
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}