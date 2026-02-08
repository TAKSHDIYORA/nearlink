import { useState, useEffect } from 'react';
import API from './api';

export default function Register({ onSwitch }) {
  const [user, setUser] = useState({ 
    username: '', password: '', bio: '', 
    latitude: '', longitude: '' // These will be filled automatically
  });

  // Automatically fetch location on component load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUser(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Please enable location permissions to find nearby friends!");
        }
      );
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post('auth/register/', user);
      alert("Success! Now log in.");
      onSwitch();
    } catch (err) {
      alert("Registration failed. Check if username is taken.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-4 w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-600 text-center">Create Account</h2>
        
        <input className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-400" 
          placeholder="Username" 
          onChange={e => setUser({...user, username: e.target.value})} required />
        
        <input className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-400" 
          type="password" placeholder="Password" 
          onChange={e => setUser({...user, password: e.target.value})} required />
        
        <textarea className="border p-2 rounded" 
          placeholder="A little about you..." 
          onChange={e => setUser({...user, bio: e.target.value})} />

        {/* Displaying the auto-filled coordinates (Read Only) */}
        <div className="flex gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-dashed">
          <p>📍 Lat: {user.latitude || "Detecting..."}</p>
          <p>📍 Long: {user.longitude || "Detecting..."}</p>
        </div>

        <button type="submit" 
          disabled={!user.latitude} // Disable button until location is found
          className={`p-2 rounded font-bold text-white transition ${user.latitude ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'}`}>
          {user.latitude ? 'Sign Up' : 'Detecting Location...'}
        </button>
        
        <p className="text-sm text-center">Already have an account? <span onClick={onSwitch} className="text-blue-500 cursor-pointer font-medium">Login</span></p>
      </form>
    </div>
  );
}