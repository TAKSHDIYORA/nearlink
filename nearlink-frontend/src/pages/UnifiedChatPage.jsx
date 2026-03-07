import { useState, useEffect } from 'react';
import API from '../api';
import ChatPage from './ChatPage';
import CreateGroupModal from './CreateGroupModal';
import { MessageCircle, Users, Plus, UserMinus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function UnifiedChatPage() {
    const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [view, setView] = useState('chats'); // Switch between 'chats' and 'friends'
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetching active rooms and the friend list simultaneously
      const [roomsRes, friendsRes] = await Promise.all([
        API.get('chat/rooms/'),
        API.get('accounts/friends/list/')
      ]);
      setRooms(roomsRes.data);
      setFriends(friendsRes.data);
      if (location.state?.startChatWith) {
          handleStartChat(location.state.startChatWith);
        }
    } catch (err) {
      console.error("Failed to sync NearLink data", err);
    } finally {
      setLoading(false);
    }
  };

  // Logic to handle your 'chat/with/<id>/' URL
  const startChatWithFriend = async (friendId) => {
    try {
      // Hits your path('with/<int:other_user_id>/'...)
      const res = await API.get(`chat/with/${friendId}/`);
      
      // Update rooms list if it's a new conversation
      const roomExists = rooms.find(r => r.id === res.data.id);
      if (!roomExists) {
        setRooms([res.data, ...rooms]);
      }
      
      setSelectedRoom(res.data);
      setView('chats'); // Automatically switch view to show the active chat
    } catch (err) {
      console.error("Could not initialize chat session", err);
    }
  };

  return (
    <div className="flex bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden" style={{ height: '80vh' }}>
      
      {/* SIDEBAR */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 bg-white border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-slate-900">NearLink</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 transition-all hover:text-white"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setView('chats')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${view === 'chats' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              Messages
            </button>
            
          </div>
        </div>

        {/* LIST AREA */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-6 text-slate-400 animate-pulse text-center">Connecting...</div>
          ) : view === 'chats' ? (
            rooms.map(room => (
              <div 
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 mb-1 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                  selectedRoom?.id === room.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'hover:bg-white text-slate-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${
                  selectedRoom?.id === room.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                }`}>
                  {room.is_group ? <Users size={20} /> : room.display_name[0].toUpperCase()}
                </div>
                <div className="flex-1 truncate">
                  <p className="font-bold truncate">{room.display_name}</p>
                  <p className={`text-xs ${selectedRoom?.id === room.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {room.is_group ? 'Group Chat' : 'Direct'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            friends.map(friend => (
              <div key={friend.id} className="p-4 mb-1 rounded-2xl bg-white flex items-center gap-3 border border-transparent hover:border-blue-50">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-bold">
                  {friend.username[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900 truncate">{friend.username}</p>
                  <button 
                    onClick={() => startChatWithFriend(friend.id)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Start Chatting
                  </button>
                </div>
                <button className="p-2 text-slate-300 hover:text-red-500 transition">
                  <UserMinus size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT INTERFACE */}
      <div className="flex-1 bg-white relative flex flex-col">
        {selectedRoom ? (
          <ChatPage 
            room_id={selectedRoom.id} 
            room_name={selectedRoom.display_name}
            is_group={selectedRoom.is_group}
            other_user_id={selectedRoom.other_user_id}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <MessageCircle size={60} className="mb-4 opacity-10" />
            <h3 className="text-slate-900 font-black text-xl">Inbox</h3>
            <p className="text-slate-400">Pick a friend or group to start talking.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateGroupModal 
          onClose={() => setIsModalOpen(false)} 
          onCreated={() => {
            setIsModalOpen(false);
            fetchData(); // Reload rooms to show the new group
          }} 
        />
      )}
    </div>
  );
}