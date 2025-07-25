import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';

interface DashboardPageProps {}

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.fullName);
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{username || '...'}</span>!
            </h1>
            <p className="text-slate-600">Continue your learning journey with Arsharatha.</p>
          </div>

        <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {}}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Start New Session
            </button>
            <button 
              onClick={() => {}}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Upload Documents
            </button>
            
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default DashboardPage;
