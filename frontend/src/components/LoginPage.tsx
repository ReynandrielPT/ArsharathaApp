import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import vikaaiLogo from '../../assets/logo-vika.svg';

interface LoginPageProps {
  onLoginSuccess: (user: { hasCompletedAssessment: boolean }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; api?: string }>({});
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length > 15) {
      newErrors.username = 'Username cannot exceed 15 characters';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login.');
      }
      
      localStorage.setItem('token', data.token);
      onLoginSuccess(data.user);

    } catch (err: any) {
      setErrors({ api: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-800/20 to-gray-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-700/15 to-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating particles */}
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Enhanced Logo and Brand */}
          <div className={`text-center mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-4 mb-6">
              <div 
                className="w-16 h-16 bg-cover bg-center rounded-lg"
                style={{ backgroundImage: `url(${vikaaiLogo})` }}
              >
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-blue-400 to-blue-200 bg-clip-text text-transparent">

                  VikaAI
                </h1>
                <p className="text-sm text-gray-400 font-medium">AI Learning Platform</p>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-200">Welcome back!</h2>
              <p className="text-gray-400">Continue your personalized learning journey</p>
            </div>
          </div>

          {/* Enhanced Login Form */}
          <div className={`bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-700/30 p-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.api && (
                  <p className="text-red-400 text-sm text-center p-3 bg-red-900/30 rounded-xl animate-in slide-in-from-left-2 duration-300">
                    {errors.api}
                  </p>
              )}
              {/* Enhanced Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Username
                </label>
                <div className="relative group">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      clearError('username');
                    }}
                    className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-gray-200 placeholder-gray-400 ${
                      errors.username
                        ? 'border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/20'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 group-hover:border-gray-500'
                    }`}
                    placeholder="Enter your username"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.username && (
                  <p className="text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-left-2 duration-300">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError('password');
                    }}
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:outline-none transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-gray-200 placeholder-gray-400 ${
                      errors.password
                        ? 'border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/20'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 group-hover:border-gray-500'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-left-2 duration-300">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Enhanced Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors hover:underline"
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </div>

          {/* Enhanced Features Preview */}
          <div className={`mt-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-blue-700/10 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 py-2">
                <Sparkles className="text-blue-400 w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
                  Empowering all learners worldwide
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
