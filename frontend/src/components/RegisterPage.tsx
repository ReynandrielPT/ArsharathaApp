import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Check, Shield, Zap, Users, Star, BookOpen, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import vikaaiLogo from '../../assets/logo-vika.svg';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
  ];

  const passwordStrength = passwordRequirements.filter(req => req.met).length;
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length > 15) {
      newErrors.username = 'Username cannot exceed 15 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRequirements.every(req => req.met)) {
      newErrors.password = 'Password does not meet requirements';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register.');
      }
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => onRegisterSuccess(), 2000);

    } catch (err: any) {
      setErrors({ api: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-800/20 to-gray-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className={`text-center mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">

              <img src={vikaaiLogo} alt="Vika Logo" className="w-16 h-16 rounded-lg" />
            </div>
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-blue-400 to-blue-200 bg-clip-text text-transparent">
                    Vika

                    </h1>
                    <p className="text-sm text-gray-400 font-medium">AI Learning Platform</p>
                </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-200">Join the Future of Learning</h2>
              <p className="text-gray-400">Create your account and start your personalized journey</p>
            </div>
          </div>

          {/* Register Form */}
          <div className={`bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-700/30 p-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.api && (
                  <p className="text-red-400 text-sm text-center p-3 bg-red-900/30 rounded-xl animate-in slide-in-from-left-2 duration-300">
                      {errors.api}
                  </p>
              )}
              {success && (
                  <p className="text-green-400 text-sm text-center p-3 bg-green-900/30 rounded-xl animate-in slide-in-from-left-2 duration-300">
                      {success}
                  </p>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </label>
                <div className="relative group">
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-gray-200 placeholder-gray-400 ${
                      errors.username
                        ? 'border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/20'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 group-hover:border-gray-500'
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && <p className="text-red-400 text-sm flex items-center gap-1">{errors.username}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:outline-none transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-gray-200 placeholder-gray-400 ${
                      errors.password
                        ? 'border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/20'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 group-hover:border-gray-500'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-4 p-4 bg-gray-700/50 rounded-2xl border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-300">Password Strength</p>
                      <span className={`text-xs font-bold ${strengthColors[passwordStrength - 1]}`}>
                        {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                      </span>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-600'}`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-600'}`}>
                            {req.met && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={`text-xs ${req.met ? 'text-green-400' : 'text-gray-400'}`}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-red-400 text-sm flex items-center gap-1">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:outline-none transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-gray-200 placeholder-gray-400 ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/20'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-500 focus:border-green-400 focus:ring-4 focus:ring-green-500/20'
                        : 'border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 group-hover:border-gray-500'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm flex items-center gap-1">{errors.confirmPassword}</p>}
              </div>

              

              {/* Submit Button */}
              <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-3">
                {isLoading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition-colors">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
