import { useState, useEffect } from 'react';
import API from '../api';
import ChatPage from './ChatPage';
import CreateGroupModal from './CreateGroupModal';
import { MessageCircle, Users, Plus, UserMinus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function UnifiedChatPage() {
    // const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [view, setView] = useState('chats'); // Switch between 'chats' and 'friends'
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect( () => {
     fetchData();
  }, []);

  const fetchData =  async () => {
    setLoading(true);
    try {
      // Fetching active rooms and the friend list simultaneously
     
       await API.get('chat/rooms/').then(res => {
          setRooms(res.data);
        })
        await API.get('accounts/friends/list/').then(res => setFriends(res.data))
     
      // setRooms(roomsRes.data);
      // setFriends(friendsRes.data);
      console.log(rooms);
      console.log(friends);
      
      
      
    } catch (err) {
      console.error("Failed to sync NearLink data", err);
    } finally {
      setLoading(false);
    }
  };

  // Logic to handle your 'chat/with/<id>/' URL
  const startChatWithFriend = async (friendId) => {
    try {
      // 1. Get the session from backend
      const res = await API.get(`chat/with/${friendId}/`);
      
      // 2. Format the data to match what your Sidebar/ChatPage expects
      // We need to find the friend's name from our existing friends list
      const friendInfo = friends.find(f => f.id === friendId);
      
      const formattedRoom = {
        id: res.data.group_id, // Backend returns group_id
        display_name: friendInfo ? friendInfo.username : "Chat",
        is_group: false,
        other_user_id: friendId
      };

      // 3. Update rooms list if it's not already there
      setRooms(prevRooms => {
        const exists = prevRooms.find(r => r.id === formattedRoom.id);
        if (!exists) return [formattedRoom, ...prevRooms];
        return prevRooms;
      });

      // 4. Set the active room to open the ChatPage
      setSelectedRoom(formattedRoom);
      
    } catch (err) {
      console.error("Could not initialize chat session", err);
    }
  };
  return (
  <div className="flex bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden" style={{ height: '80vh' }}>
    
    {/* 1. LEFT SIDEBAR: Active Chat Rooms */}
    <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/50">
      <div className="p-6 bg-white border-b border-slate-100">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">Messages</h3>
          <button onClick={() => setIsModalOpen(true)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="p-6 text-slate-400 animate-pulse text-center">Loading...</div>
        ) : (
          rooms.map(room => (
            <div 
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 mb-1 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                selectedRoom?.id === room.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white text-slate-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${selectedRoom?.id === room.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
  {room.is_group 
    ? <Users size={18} /> 
    : (room.display_name ? room.display_name[0].toUpperCase() : '?')
  }
</div>
              <div className="flex-1 truncate">
                <p className="font-bold text-sm truncate">{room.display_name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* 2. CENTER: Chat Interface */}
    <div className="flex-1 bg-white relative flex flex-col border-r border-slate-100">
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
          <p className="text-slate-400">Select a conversation to start</p>
        </div>
      )}
    </div>

    {/* 3. RIGHT SIDEBAR: Friends List */}
    <div className="w-72 flex flex-col bg-slate-50/50">
      <div className="p-6 bg-white border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">Friends</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {friends.length > 0 ? friends.map(friend => (
          <div 
            key={friend.id} 
            onClick={() => startChatWithFriend(friend.id)}
            className="p-3 mb-1 rounded-2xl bg-white border border-transparent hover:border-blue-200 hover:shadow-sm cursor-pointer flex items-center gap-3 group transition-all"
          >
            <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              {friend.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-800 truncate">{friend.username}</p>
              <p className="text-[10px] text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Click to Chat</p>
            </div>
          </div>
        )) : (
          <p className="text-center text-slate-400 mt-10 text-sm">No friends found.</p>
        )}
      </div>
    </div>

    {/* Modal */}
    {isModalOpen && (
      <CreateGroupModal 
        onClose={() => setIsModalOpen(false)} 
        onCreated={() => { setIsModalOpen(false); fetchData(); }} 
      />
    )}
  </div>
);
}