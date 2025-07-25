import React, { useState, useEffect } from 'react';
import { User, Bell, Palette, Volume2, Globe, Shield, LogOut, Loader2, Brain } from 'lucide-react';
import { useSettings, Language } from '../contexts/SettingsContext';
import { useToast } from '../hooks/useToast';
import { getAssessmentStatus } from '../services/assessmentService';

interface UserProfile {
  username: string;
}

interface SettingsPageProps {
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language, setLanguage, isADHD, adhdMode, toggleAdhdFeature } = useSettings();
  const { addToast } = useToast();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as Language;
    setLanguage(newLanguage);
    addToast(`Language changed to ${newLanguage === 'id-ID' ? 'Bahasa Indonesia' : 'English'}`, 'success');
  };

  useEffect(() => {
    const fetchProfileAndStatus = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const [profileResponse, statusResponse] = await Promise.all([
          fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
          getAssessmentStatus()
        ]);

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }
        const profileData: UserProfile = await profileResponse.json();
        setProfile(profileData);

        // The status is already being set in the SettingsProvider, 
        // but we can re-sync here if needed or just rely on the context.

      } catch (error) {
        console.error('Error fetching data:', error);
        addToast('Failed to load settings data.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndStatus();
  }, []);

  const handleToggleAdhdMode = async () => {
    try {
      await toggleAdhdFeature();
      addToast(`ADHD Mode ${!adhdMode ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      addToast('Failed to update ADHD mode.', 'error');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-200 mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and app preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <User className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-gray-200">Profile</h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : profile ? (
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">{getInitials(profile.username)}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-200">{profile.username}</h3>
                <p className="text-gray-400">Vika Learner</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Could not load profile information.</p>
          )}
        </div>

        {/* Preferences Section */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Palette className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-gray-200">Preferences</h2>
          </div>
          
          <div className="space-y-6">
            {/* Speech Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="text-gray-400" size={20} />
                <div>
                  <h3 className="font-medium text-gray-200">Speech Language</h3>
                  <p className="text-sm text-gray-400">Select the language for speech recognition and synthesis</p>
                </div>
              </div>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-200"
              >
                <option value="en-US">English</option>
                <option value="id-ID">Bahasa Indonesia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Brain className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-gray-200">Accessibility</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-gray-200">ADHD Status</h3>
                    <p className="text-sm text-gray-400">
                        {isADHD ? "ADHD traits detected based on assessment." : "ADHD traits not detected."}
                    </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${isADHD ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                    {isADHD ? 'Detected' : 'Not Detected'}
                </span>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-gray-200">ADHD Mode</h3>
                    <p className="text-sm text-gray-400">Toggle UI enhancements for focus and readability.</p>
                </div>
                <button
                    onClick={handleToggleAdhdMode}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${adhdMode ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${adhdMode ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <LogOut className="text-red-400" size={24} />
            <h2 className="text-xl font-bold text-gray-200">Account</h2>
          </div>
          
          <div className="space-y-4">
            <button onClick={onLogout} className="w-full text-left p-4 rounded-lg border border-red-600 hover:bg-red-900/20 transition-colors text-red-400">
              <h3 className="font-medium">Logout</h3>
              <p className="text-sm text-red-400 mt-1">Logout from your account and return to Landing Page</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
