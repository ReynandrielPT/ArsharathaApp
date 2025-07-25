import React from 'react';
import { User, Palette, LogOut, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsPageProps {
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const { adhdEnabled, setAdhdEnabled } = useSettings();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account and app preferences</p>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Palette className="text-purple-500" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Preferences</h2>
          </div>
          
          <div className="space-y-6">
            {/* ADHD Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-medium text-slate-800">ADHD Mode</h3>
                  <p className="text-sm text-slate-600">Adjusts UI for better focus</p>
                </div>
              </div>
              <button
                onClick={() => setAdhdEnabled(!adhdEnabled)}
                className={`${adhdEnabled ? 'bg-blue-500' : 'bg-slate-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${adhdEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <LogOut className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Account</h2>
          </div>
          
          <div className="space-y-4">
            <button onClick={onLogout} className="w-full text-left p-4 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-600">
              <h3 className="font-medium">Logout</h3>
              <p className="text-sm text-red-500 mt-1">Logout from your account and return to Landing Page</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
