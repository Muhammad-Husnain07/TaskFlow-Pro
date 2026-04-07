import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input, Button, Checkbox } from '../../components/ui';
import { Toaster, toast } from 'react-hot-toast';
import { CheckSquare, Mail, Lock, ArrowRight, Users, FolderKanban, Clock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [validationErrors, setValidationErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});

    if (!validate()) return;

    try {
      await login(formData);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
    }
  };

  const features = [
    { icon: FolderKanban, text: 'Manage projects with ease' },
    { icon: Users, text: 'Collaborate with your team' },
    { icon: Clock, text: 'Track time and progress' },
  ];

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-right" />
      
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <CheckSquare className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-white">TaskFlow Pro</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white leading-tight">
              Welcome back!
            </h1>
            <p className="text-primary-100 text-lg mt-4 max-w-md">
              Sign in to continue managing your projects and collaborating with your team.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-4 text-white/90">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-base">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-primary-200 text-sm">
          © 2026 TaskFlow Pro. All rights reserved.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-heading font-bold text-primary-600">TaskFlow Pro</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-large p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Sign in</h2>
              <p className="text-gray-500 mt-2">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 rounded-lg text-sm border border-danger-200 dark:border-danger-800">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={validationErrors.email}
                prefix={<Mail className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={validationErrors.password}
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
              />

              <div className="flex items-center justify-between">
                <Checkbox
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  label="Remember me"
                />
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;