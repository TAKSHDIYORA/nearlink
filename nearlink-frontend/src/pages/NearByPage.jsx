import { useEffect, useState } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import API from '../api';

export default function NearbyPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState([]); // Track sent IDs locally

  // Fetch nearby users on load
  const fetchNearby = async () => {
    try {
      const res = await API.get('users/nearby/');
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching nearby users", err);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, []);

  // Search Logic
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchNearby();
    const res = await API.get(`users/search/?q=${searchQuery}`);
    setUsers(res.data);
  };

  // Connect Logic
  const handleConnect = async (receiverId) => {
    try {
      await API.post(`friends/send/${receiverId}/`);
      setSentRequests([...sentRequests, receiverId]);
      alert("Friend request sent!");
    } catch (err) {
        console.log(err);
        
      alert("Request already sent or error occurred.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <input 
          type="text"
          placeholder="Search by username..."
          className="w-full p-4 pl-12 bg-white rounded-2xl border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-4 text-slate-400" size={20} />
      </form>

      {/* Users Grid */}
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

            {sentRequests.includes(user.id) ? (
              <button className="flex items-center gap-2 bg-green-50 text-green-600 px-6 py-3 rounded-2xl font-bold text-sm cursor-default">
                <Check size={18} /> Sent
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
        )) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 text-lg font-medium">No one found nearby.</p>
          </div>
        )}
      </div>
    </div>
  );
}