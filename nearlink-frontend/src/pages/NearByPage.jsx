import { useEffect, useState } from 'react';
import { Search, UserPlus, Check, UserCheck, MapPinOff } from 'lucide-react';
import API from '../api';

export default function NearbyPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null); // Track backend validation errors

  const fetchNearby = async () => {
    try {
      setError(null); // Reset error before fetching
      const res = await API.get('accounts/users/nearby/');
      setUsers(res.data);
    } catch (err) {
      // Check if backend sent the "Please enable location" validation error
      if (err.response && err.response.status === 400) {
        setError(err.response.data.detail || "Location error occurred.");
      } else {
        console.error("Error fetching users", err);
      }
    }
  };

  const refreshLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Send the new coordinates to your CurrentUserView patch method
        await API.patch('accounts/auth/me/', { latitude, longitude });
        // Now fetch nearby users again
        fetchNearby(); 
      } catch (err) {
        console.error("Failed to update location", err);
      }
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};

  useEffect(() => {
    fetchNearby();
  }, []);

  const handleConnect = async (userId) => {
    try {
      await API.post(`accounts/friends/send/${userId}/`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, request_status: 'sent' } : u));
    } catch (err) {
      alert("Error sending request.");
    }
  };

  const handleAccept = async (userId) => {
    try {
      const requestsRes = await API.get('accounts/friends/requests/');
      const requestObj = requestsRes.data.find(r => r.sender_id === userId);

      if (requestObj) {
        await API.patch(`accounts/friends/requests/${requestObj.id}/`, { action: 'accepted' });
        setUsers(prev => prev.filter(u => u.id !== userId));
        alert("Request accepted!");
      }
    } catch (err) {
      alert("Error accepting request.");
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div className="relative max-w-md">
        <input 
          type="text"
          placeholder="Search users..."
          className="w-full p-4 pl-12 bg-white rounded-2xl border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-4 text-slate-400" size={20} />
      </div>

      {/* ERROR STATE: Location Disabled */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center px-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <MapPinOff size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Location Required</h2>
          <p className="text-slate-500 max-w-xs mb-6">
            {error}
          </p>
          <button 
            onClick={() => refreshLocation()}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Enable & Refresh
          </button>
        </div>
      ) : (
        /* NORMAL STATE: Users Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.length > 0 ? users.map(user => (
            <div key={user.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{user.username}</h3>
                  <p className="text-slate-500 text-sm truncate max-w-[150px]">{user.bio || "No bio yet."}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {user.request_status === 'sent' ? (
                  <button className="flex items-center gap-2 bg-slate-100 text-slate-500 px-6 py-3 rounded-2xl font-bold text-sm cursor-default">
                    <Check size={18} /> Sent
                  </button>
                ) : user.request_status === 'received' ? (
                  <button 
                    onClick={() => handleAccept(user.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-100"
                  >
                    <UserCheck size={18} /> Accept
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnect(user.id)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                  >
                    <UserPlus size={18} /> Connect
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 text-lg font-medium">No one found nearby.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}