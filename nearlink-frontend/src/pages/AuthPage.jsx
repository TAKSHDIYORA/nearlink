import { useState } from 'react';
import API from '../api';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', bio: '', latitude: '', longitude: ''
  });

  // Automatically detect location for Signup
  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData({ ...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // LOGIN LOGIC
        const res = await API.post('auth/login/', { 
          username: formData.username, 
          password: formData.password 
        });
        localStorage.setItem('access_token', res.data.access);
        onLoginSuccess(res.data.access);
      } else {
        // SIGNUP LOGIC
        await API.post('auth/register/', formData);
        alert("Account created! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert("Authentication failed. Please check your details.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-blue-600 tracking-tight">NearLink.</h1>
          <p className="text-slate-500 mt-2">
            {isLogin ? "Welcome back! Good to see you." : "Join the community around you."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            placeholder="Username"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          
          <input 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            type="password"
            placeholder="Password"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          {!isLogin && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <input 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Email Address"
                type="email"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <textarea 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Tell us about yourself..."
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
              <button 
                type="button"
                onClick={detectLocation}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition"
              >
                {formData.latitude ? "📍 Location Captured" : "🎯 Detect My Location"}
              </button>
            </div>
          )}

          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all">
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 font-medium hover:text-blue-600 transition"
          >
            {isLogin ? "New to NearLink? Create account" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}