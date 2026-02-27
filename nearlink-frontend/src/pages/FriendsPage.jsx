import { useState, useEffect } from 'react';
import { MessageCircle, UserMinus } from 'lucide-react';
import API from '../api';

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('accounts/friends/list/')
      .then(res => {
        setFriends(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400">Loading your inner circle...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {friends.length > 0 ? friends.map(friend => (
        <div key={friend.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-black mb-4">
            {friend.username[0].toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{friend.username}</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">{friend.bio || "No bio added yet."}</p>
          
          <div className="flex gap-2 w-full">
            <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
              <MessageCircle size={18} /> Chat
            </button>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition">
              <UserMinus size={18} />
            </button>
          </div>
        </div>
      )) : (
        <div className="col-span-full py-20 text-center">
          <p className="text-slate-400 text-lg">You haven't added any friends yet.</p>
          <p className="text-blue-500 font-medium">Head over to 'Nearby' to find people!</p>
        </div>
      )}
    </div>
  );
}