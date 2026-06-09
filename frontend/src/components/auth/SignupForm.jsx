import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ROUTES from '../../constants/routes';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupForm() {
  const [name, setName]                         = useState('');
  const [email, setEmail]                       = useState('');
  const [password, setPassword]                 = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [errors, setErrors]                     = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!name)               e.name     = "Name is required";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!email)              e.email    = "Email is required";
    else if (!validateEmail(email)) e.email = "Enter a valid email address";
    if (!password)           e.password = "Password is required";
    else if (password.length < 6)  e.password = "Password must be at least 6 characters";
    if (!confirmPassword)    e.confirm  = "Please confirm your password";
    else if (password !== confirmPassword) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    const res = await register(name, email, password);
    if (res.success) {
      navigate(ROUTES.DASHBOARD);
    } else {
      setErrors({ api: res.message });
      setLoading(false);
    }
  };

  const field = (label, value, setter, errorKey, type = "text", icon, extra = {}) => (
    <div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={e => setter(e.target.value)}
          placeholder={label}
          className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm outline-none ${errors[errorKey] ? 'border-red-400' : 'border-gray-200'}`}
          {...extra}
        />
      </div>
      {errors[errorKey] && <p className="mt-1 text-xs text-red-500">{errors[errorKey]}</p>}
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-medium text-gray-900 mb-1">Create your account</h2>
        <p className="text-gray-500 text-sm">Start designing programs for free</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {field("Full name", name, setName, "name", "text", <User className="h-5 w-5 text-gray-400" />)}
        {field("Email address", email, setEmail, "email", "email", <Mail className="h-5 w-5 text-gray-400" />)}

        {/* Password with eye */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm outline-none ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        {/* Confirm Password with eye */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm outline-none ${errors.confirm ? 'border-red-400' : 'border-gray-200'}`}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
            </button>
          </div>
          {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
        </div>

        {errors.api && <p className="text-red-500 text-sm font-medium text-center">{errors.api}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {loading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />Creating account...</> : 'Create account'}
        </button>
      </form>
    </div>
  );
}
