import { MapPin, Users, UserPlus, LogOut, User, UserPenIcon, MessageSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ onLogout }) {
  const menuItems = [
    { id: 'nearby', name: 'Nearby', icon: MapPin, path: '/nearby' },
    { id: 'message', name: 'Messages', icon: MessageSquare, path: '/message' },
    { id: 'friends', name: 'Friends', icon: Users, path: '/friends' },
    { id: 'requests', name: 'Requests', icon: UserPlus, path: '/requests' },
    { id: 'profile', name: 'My Profile', icon: User, path: '/profile' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <h1 className="text-2xl font-black text-blue-600 tracking-tight">NearLink.</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}