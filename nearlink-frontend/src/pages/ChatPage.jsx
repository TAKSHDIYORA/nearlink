import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import API from '../api';
import Pusher from 'pusher-js';

// Added is_group and room_id to props
export default function ChatPage({ other_user_id, other_username, is_group, room_id }) {
  const [messages, setMessages] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [text, setText] = useState("");
  const pusherRef = useRef(null);
  const scrollRef = useRef(null);

  const myUsername = localStorage.getItem('username')?.toLowerCase() || "";

  // 1. Unified Fetch: Handles both 1v1 and Group endpoints
  useEffect(() => {
    // Determine the correct endpoint based on the selection
    const endpoint = is_group 
      ? `chat/groups/${room_id}/` 
      : `chat/with/${other_user_id}/`;

    API.get(endpoint).then(res => {
      setMessages(res.data.messages);
      setGroupId(res.data.group_id); // This is the ID for Pusher subscription
    }).catch(err => console.error("Fetch error:", err));

    if (!pusherRef.current) {
      pusherRef.current = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER
      });
    }

    return () => {
      if (groupId && pusherRef.current) {
        pusherRef.current.unsubscribe(`chat-${groupId}`);
      }
    };
  }, [other_user_id, room_id, is_group]); // Added room_id and is_group as dependencies

  // 2. Real-time Subscription (Remains the same as it's channel-based)
  useEffect(() => {
    if (!groupId || !pusherRef.current) return;

    const channel = pusherRef.current.subscribe(`chat-${groupId}`);
    
    channel.bind('new-message', (data) => {
      setMessages(prev => (prev.find(m => m.id === data.id) ? prev : [...prev, data]));
    });

    return () => {
      pusherRef.current.unsubscribe(`chat-${groupId}`);
    };
  }, [groupId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Unified Send Logic
  const onSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const endpoint = is_group 
      ? `chat/groups/${room_id}/` 
      : `chat/with/${other_user_id}/`;

    const currentText = text;
    setText("");

    try {
      await API.post(endpoint, { content: currentText });
    } catch (err) {
      console.error("Send failed:", err);
      setText(currentText); // Restore text on failure
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white sticky top-0 z-10">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-blue-50">
          {other_username ? other_username[0].toUpperCase() : '?'}
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-lg leading-tight">{other_username}</h3>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
            {is_group ? 'Group Chat' : 'Active Connection'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          const isMe = msg.sender_username?.toLowerCase() === myUsername;
          
          return (
            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`max-w-[75%] p-4 rounded-[1.5rem] shadow-sm ${
                isMe 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                {/* Identity line for Group Chats */}
                {!isMe && (
                  <p className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-tighter">
                    {msg.sender_username}
                  </p>
                )}
                
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                
                <p className={`text-[10px] mt-2 opacity-60 font-bold ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={onSend} className="p-6 bg-white border-t border-slate-100 flex gap-3">
        <input 
          className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 transition-all"
          placeholder={`Message ${other_username}...`}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center"
        >
          <Send size={20} />
        </button>
      </form>
    </>
  );
}