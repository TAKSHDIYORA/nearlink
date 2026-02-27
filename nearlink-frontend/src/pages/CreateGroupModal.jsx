import { useState, useEffect } from 'react';
import { X, Check, Users } from 'lucide-react';
import API from '../api';

export default function CreateGroupModal({ onClose, onCreated }) {
  const [friends, setFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('accounts/friends/list/')
      .then(res => {
        setFriends(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleMember = (id) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return alert("Please enter a group name");
    if (selectedMembers.length < 1) return alert("Select at least one member");

    try {
      await API.post('chat/groups/create/', { 
        name: groupName, 
        members: selectedMembers 
      });
      onCreated(); // Refresh the list and close modal
    } catch (err) {
      alert("Failed to create group. Check console.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/20 border border-slate-100">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Start a Group</h2>
            <p className="text-slate-400 text-sm">Create your inner circle</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Group Name Input */}
        <div className="mb-6">
          <label className="text-xs font-black text-slate-400 uppercase ml-2 mb-2 block">Group Identity</label>
          <input 
            placeholder="e.g. NearLink Developers 🚀"
            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
        </div>

        {/* Member Selection */}
        <div className="mb-8">
          <label className="text-xs font-black text-slate-400 uppercase ml-2 mb-2 block">Select Connections</label>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {loading ? (
              <p className="p-4 text-center text-slate-400">Loading friends...</p>
            ) : friends.length > 0 ? (
              friends.map(f => (
                <div 
                  key={f.id} 
                  onClick={() => toggleMember(f.id)}
                  className={`p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all border-2 ${
                    selectedMembers.includes(f.id) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-slate-50 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {f.username[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-700">{f.username}</span>
                  </div>
                  {selectedMembers.includes(f.id) && <Check size={18} className="text-blue-600" />}
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-slate-400 italic">No friends found.</p>
            )}
          </div>
        </div>

        <button 
          onClick={handleCreate}
          className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Users size={20} /> Launch Group
        </button>
      </div>
    </div>
  );
}