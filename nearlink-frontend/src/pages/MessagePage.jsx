import { useState, useEffect } from 'react';
import API from '../api';
import ChatPage from './ChatPage';
import { MessageCircle, Users, Plus } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';

export default function MessagePage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Fetches both 1v1 and Groups that have already been started
    API.get('chat/rooms/')
      .then(res => {
        setRooms(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden" style={{ height: '75vh' }}>
      
      {/* Sidebar: All Active Conversations */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">NearLink</h3>
          <button 
  onClick={() => setIsModalOpen(true)} // <-- Add this!
  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
>
  <Plus size={20} />
</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-slate-400 animate-pulse">Syncing Cloud...</div>
          ) : (
            rooms.map(room => (
              <div 
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 mx-2 my-1 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                  selectedRoom?.id === room.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'hover:bg-white text-slate-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${
                  selectedRoom?.id === room.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                }`}>
                  {room.is_group ? <Users size={20} /> : room.display_name[0].toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold truncate">{room.display_name}</p>
                  <p className={`text-xs truncate ${selectedRoom?.id === room.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {room.is_group ? 'Group Chat' : 'Direct Message'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  
      {/* Main Chat Area */}
      <div className="flex-1 bg-white relative flex flex-col">
        {selectedRoom ? (
          <ChatPage 
            room_id={selectedRoom.id} 
            room_name={selectedRoom.display_name}
            is_group={selectedRoom.is_group}
            other_user_id={selectedRoom.other_user_id} // Used if is_group is false
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <MessageCircle size={48} className="mb-2 opacity-20" />
            <p className="font-bold text-slate-400">Select a room to chat</p>
          </div>
        )}
      </div>
      <div className="flex bg-white rounded-[2rem] shadow-xl ...">
    {/* Sidebar & Chat components */}
    
    {/* MODAL INJECTION */}
    {isModalOpen && (
      <CreateGroupModal 
        onClose={() => setIsModalOpen(false)} 
        onCreated={() => {
          setIsModalOpen(false);
          // Re-fetch rooms logic here if you have it
          window.location.reload(); // Quickest way to refresh for now
        }} 
      />
    )}
  </div>

    </div>

    
  );
}