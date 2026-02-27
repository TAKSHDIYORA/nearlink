import { useState, useEffect } from 'react';
import { Clock, Check, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import API from '../api';

export default function PendingPage() {
  const [data, setData] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await API.get('accounts/friends/pending/');
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching pending requests");
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (requestId, action) => {
    try {
      await API.patch(`accounts/friends/requests/${requestId}/`, { action });
      fetchPending(); // Refresh both lists
    } catch (err) {
      alert("Action failed.");
    }
  };

  if (loading) return <div className="p-10 text-slate-400">Loading requests...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* 📥 INCOMING REQUESTS */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><ArrowDownLeft size={20}/></div>
          <h3 className="text-xl font-bold text-slate-800">Received Requests</h3>
        </div>

        <div className="space-y-4">
          {data.received.length > 0 ? data.received.map(req => (
            <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold">{req.username[0]}</div>
                <span className="font-bold">{req.username}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(req.id, 'accepted')} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition"><Check size={18}/></button>
                <button onClick={() => handleAction(req.id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition"><X size={18}/></button>
              </div>
            </div>
          )) : <p className="text-slate-400 text-sm italic">No one is waiting for your reply.</p>}
        </div>
      </section>

      {/* 📤 OUTGOING REQUESTS */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><ArrowUpRight size={20}/></div>
          <h3 className="text-xl font-bold text-slate-800">Sent Requests</h3>
        </div>

        <div className="space-y-4">
          {data.sent.length > 0 ? data.sent.map(req => (
            <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between opacity-80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">{req.username[0]}</div>
                <div>
                  <p className="font-bold text-slate-700">{req.username}</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Waiting for response</p>
                </div>
              </div>
              <div className="p-2 text-slate-300"><Clock size={18}/></div>
            </div>
          )) : <p className="text-slate-400 text-sm italic">You haven't sent any requests.</p>}
        </div>
      </section>

    </div>
  );
}