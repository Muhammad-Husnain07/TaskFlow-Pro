import { useState, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input, Button, Checkbox } from '../../components/ui';
import { Toaster, toast } from 'react-hot-toast';
import { CheckSquare, Mail, Lock, User, ArrowRight, Users, Shield, Zap } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [validationErrors, setValidationErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const passwordStrength = useMemo(() => {
    const { password } = formData;
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: 'bg-danger-500' },
      { score: 2, label: 'Fair', color: 'bg-yellow-500' },
      { score: 3, label: 'Good', color: 'bg-blue-500' },
      { score: 4, label: 'Strong', color: 'bg-green-500' },
    ];
    return levels[score];
  }, [formData.password]);

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) errors.agreeTerms = 'You must agree to the terms';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});

    if (!validate()) return;

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      toast.success('Account created successfully!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
  };

  const features = [
    { icon: Shield, text: 'Secure authentication' },
    { icon: Zap, text: 'Fast and responsive' },
    { icon: Users, text: 'Team collaboration' },
  ];

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-right" />
      
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-500 to-secondary-600 p-12 flex-col justify-between relative overflow-hidden">
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
              Start your journey!
            </h1>
            <p className="text-secondary-100 text-lg mt-4 max-w-md">
              Create an account and start managing your projects more efficiently.
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

        <div className="relative z-10 text-secondary-200 text-sm">
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
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Create account</h2>
              <p className="text-gray-500 mt-2">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 rounded-lg text-sm border border-danger-200 dark:border-danger-800">
                  {error}
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={validationErrors.name}
                prefix={<User className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={validationErrors.email}
                prefix={<Mail className="w-4 h-4 text-gray-400" />}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={validationErrors.password}
                  prefix={<Lock className="w-4 h-4 text-gray-400" />}
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <span className={`text-xs font-medium ${
                        passwordStrength.score === 1 ? 'text-danger-500' :
                        passwordStrength.score === 2 ? 'text-yellow-500' :
                        passwordStrength.score === 3 ? 'text-blue-500' :
                        'text-green-500'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={validationErrors.confirmPassword}
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
              />

              <Checkbox
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                label={
                  <span className="text-sm">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                  </span>
                }
              />
              {validationErrors.agreeTerms && (
                <p className="text-sm text-danger-500">{validationErrors.agreeTerms}</p>
              )}

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Create Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;