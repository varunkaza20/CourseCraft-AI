import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axiosInstance.put('/api/auth/update-profile', { name });
      updateUser(res.data.user);
      setMessage('Name updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    return nameStr.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-6 flex flex-col items-center justify-center border-b border-gray-100 bg-gray-50/50">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold mb-4 shadow-sm">
            {getInitials(user?.name)}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        {/* Update Profile Form */}
        <div className="p-8 border-b border-gray-100">
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Display name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>

            {message && <p className="text-green-600 text-sm font-medium mb-4">{message}</p>}
            {error && <p className="text-red-500 text-sm font-medium mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading || name === user?.name}
              className="w-full py-2.5 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Sign Out Section */}
        <div className="p-8">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900">Session</h3>
            <p className="text-sm text-gray-500 mt-1">You will be returned to the login page.</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
}
