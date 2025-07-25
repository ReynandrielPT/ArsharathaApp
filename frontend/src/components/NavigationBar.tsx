import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Settings, Clock, LogOut } from 'lucide-react';

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
    <div className="fixed left-0 top-0 h-screen w-80 bg-white border-r border-slate-200 shadow-lg z-50 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Arsharatha
          </h1>
        </Link>
        <button
          onClick={onStartSession}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Plus size={20} />
          New Chat
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wide">
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <Link
              key={session._id}
              to={`/session/${session._id}`}
              className="block w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors duration-150 group border border-transparent hover:border-slate-200"
            >
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="text-slate-400 mt-1 group-hover:text-blue-500 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {session.title || 'Untitled Session'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 bg-white">
        <div className="space-y-2">
          
          <Link to="/settings" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-500 hover:bg-red-50 transition-colors duration-150"
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