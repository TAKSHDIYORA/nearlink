import { useState, useEffect } from 'react';
import { Check, X, UserPlus } from 'lucide-react';
import API from '../api';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = () => {
    API.get('accounts/friends/requests/').then(res => setRequests(res.data));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      // action will be 'accepted' or 'rejected'
      await API.patch(`accounts/friends/requests/${requestId}/`, { action });
      // Refresh the list
      fetchRequests();
      alert(`Request ${action}!`);
    } catch (err) {
      alert("Something went wrong.");
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {requests.length > 0 ? requests.map(req => (
        <div key={req.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
              {req.sender[0].toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{req.sender}</h4>
              <p className="text-xs text-slate-500 font-medium">wants to connect</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleAction(req.id, 'accepted')}
              className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
            >
              <Check size={20} />
            </button>
            <button 
              onClick={() => handleAction(req.id, 'rejected')}
              className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )) : (
        <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
          <div className="inline-flex p-4 bg-white rounded-3xl shadow-sm mb-4">
            <UserPlus className="text-slate-300" size={32} />
          </div>
          <p className="text-slate-500 font-medium">No pending friend requests.</p>
        </div>
      )}
    </div>
  );
}