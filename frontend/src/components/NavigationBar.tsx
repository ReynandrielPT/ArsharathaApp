import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Settings, Clock, LogOut } from 'lucide-react';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import vikaaiLogo from '../../assets/logo-vika.svg';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

interface Session {
  _id: string;
  title?: string;
  updatedAt?: string;
}

interface NavigationBarProps {
  sessions: Session[];
  onStartSession: () => void;
  onLogout: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  sessions,
  onStartSession,
  onLogout
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-gray-800 border-r border-gray-700 shadow-lg z-50 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <Link to="/app" className="flex items-center gap-3 mb-6">
          <img src={vikaaiLogo} alt="Vika Logo" className="w-8 h-8 rounded-md" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
            Vika
          </h1>
        </Link>
        <button
          onClick={onStartSession}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Plus size={20} />
          New Chat
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <Link
              key={session._id}
              to={`/app/${session._id}`}
              className="block w-full text-left p-3 rounded-lg hover:bg-gray-700 transition-colors duration-150 group border border-transparent hover:border-gray-600"
            >
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="text-gray-400 mt-1 group-hover:text-blue-400 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {session.title || 'Untitled Session'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {session.updatedAt ? timeAgo.format(new Date(session.updatedAt)) : 'No date'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-700 bg-gray-800">
        <div className="space-y-2">
          
          <Link to="/app/settings" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-200 hover:bg-gray-700">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-400 hover:bg-red-900/20 transition-colors duration-150"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;