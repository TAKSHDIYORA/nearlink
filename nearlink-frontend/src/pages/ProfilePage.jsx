import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Edit3 } from 'lucide-react';
import API from '../api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Assuming you have an endpoint like /api/auth/me/ or similar
    API.get('auth/me/').then(res => setProfile(res.data));
  }, []);

  if (!profile) return <div className="p-10 text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative">
          <div className="w-32 h-32 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-2xl shadow-blue-200">
            {profile.username[0].toUpperCase()}
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-900">{profile.username}</h2>
            <p className="text-blue-600 font-bold mt-1">NearLink Explorer</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
               <span className="flex items-center gap-1 text-slate-500 text-sm bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                 <MapPin size={14}/> {profile.latitude.toFixed(2)}, {profile.longitude.toFixed(2)}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <Edit3 size={16}/> About Me
          </h4>
          <p className="text-slate-700 leading-relaxed italic">
            "{profile.bio || "No bio set yet. Tell the world who you are!"}"
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
            <User size={16}/> Account Details
          </h4>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Mail size={20}/></div>
            <div>
              <p className="text-xs text-slate-400 font-bold">Email</p>
              <p className="font-bold text-slate-800">{profile.email || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calendar size={20}/></div>
            <div>
              <p className="text-xs text-slate-400 font-bold">Member Since</p>
              <p className="font-bold text-slate-800">Feb 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}