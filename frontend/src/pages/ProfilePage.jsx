import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../constants/routes';

function Card({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
        <Icon className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-medium text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder, show, onToggle }) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      />
      <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {show ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // -- Display name --
  const [name, setName]           = useState(user?.name || '');
  const [nameMsg, setNameMsg]     = useState(null);

  // -- Password change --
  const [curPwd, setCurPwd]       = useState('');
  const [newPwd, setNewPwd]       = useState('');
  const [confPwd, setConfPwd]     = useState('');
  const [showCur, setShowCur]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [pwdMsg, setPwdMsg]       = useState(null);

  // -- Custom instructions --
  const [instructions, setInstructions]   = useState(user?.customInstructions || '');
  const [instrMsg, setInstrMsg]           = useState(null);

  // -- Reset modal --
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetInput, setResetInput]         = useState('');
  const [resetting, setResetting]           = useState(false);

  useEffect(() => {
    // Refresh user to get customInstructions
    axiosInstance.get('/api/auth/me').then(r => {
      setInstructions(r.data.user?.customInstructions || '');
    }).catch(() => {});
  }, []);

  const saveName = async () => {
    try {
      const r = await axiosInstance.put('/api/auth/update-profile', { name });
      updateUser(r.data.user);
      setNameMsg({ type: 'success', text: 'Name updated successfully' });
    } catch (e) {
      setNameMsg({ type: 'error', text: e.response?.data?.message || 'Failed to update' });
    }
    setTimeout(() => setNameMsg(null), 3000);
  };

  const savePassword = async () => {
    if (!curPwd || !newPwd || !confPwd) return setPwdMsg({ type: 'error', text: 'All fields required' });
    if (newPwd.length < 6)             return setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters' });
    if (newPwd !== confPwd)            return setPwdMsg({ type: 'error', text: 'Passwords do not match' });
    try {
      const r = await axiosInstance.put('/api/auth/change-password', { currentPassword: curPwd, newPassword: newPwd });
      setCurPwd(''); setNewPwd(''); setConfPwd('');
      setPwdMsg({ type: 'success', text: r.data.message });
    } catch (e) {
      setPwdMsg({ type: 'error', text: e.response?.data?.message || 'Failed to update password' });
    }
    setTimeout(() => setPwdMsg(null), 3000);
  };

  const saveInstructions = async () => {
    try {
      await axiosInstance.put('/api/auth/update-profile', { customInstructions: instructions });
      setInstrMsg({ type: 'success', text: 'Instructions saved' });
    } catch (e) {
      setInstrMsg({ type: 'error', text: 'Failed to save' });
    }
    setTimeout(() => setInstrMsg(null), 3000);
  };

  const confirmReset = async () => {
    if (resetInput !== 'DELETE') return;
    setResetting(true);
    try {
      await axiosInstance.delete('/api/auth/reset-profile');
      setShowResetModal(false);
      setResetInput('');
      navigate(ROUTES.DASHBOARD);
    } catch (e) {
      alert(e.response?.data?.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
  const msgCls   = (type) => `text-xs mt-2 ${type === 'success' ? 'text-green-600' : 'text-red-500'}`;
  const btnCls   = "px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Account */}
      <Card icon={User} title="Account">
        {/* Display name */}
        <div className="mb-6 pb-6 border-b border-gray-50">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Display name</label>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          {nameMsg && <p className={msgCls(nameMsg.type)}>{nameMsg.text}</p>}
          <button onClick={saveName} className={`${btnCls} mt-3`}>Save changes</button>
        </div>

        {/* Change password */}
        <div className="mb-6 pb-6 border-b border-gray-50">
          <h3 className="text-xs font-medium text-gray-700 mb-3">Change password</h3>
          <div className="space-y-3">
            <PasswordInput value={curPwd}  onChange={e => setCurPwd(e.target.value)}  placeholder="Current password" show={showCur}  onToggle={() => setShowCur(!showCur)} />
            <PasswordInput value={newPwd}  onChange={e => setNewPwd(e.target.value)}  placeholder="New password"     show={showNew}  onToggle={() => setShowNew(!showNew)} />
            <PasswordInput value={confPwd} onChange={e => setConfPwd(e.target.value)} placeholder="Confirm new password" show={showConf} onToggle={() => setShowConf(!showConf)} />
          </div>
          {pwdMsg && <p className={msgCls(pwdMsg.type)}>{pwdMsg.text}</p>}
          <button onClick={savePassword} className={`${btnCls} mt-3`}>Update password</button>
        </div>

        {/* Danger zone */}
        <div className="border border-red-100 rounded-xl p-4">
          <h3 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Reset profile
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            This will permanently delete all your generated curriculums, courses, and outcome mappings. This action cannot be undone.
          </p>
          <button onClick={() => setShowResetModal(true)} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
            Reset all data
          </button>
        </div>
      </Card>

      {/* Personalization */}
      <Card icon={Settings} title="Personalization">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Custom instructions for AI</label>
          <p className="text-xs text-gray-400 mb-2 leading-relaxed">
            These instructions are appended to every AI generation request. Use this to tailor outputs to your institution's style, naming conventions, or preferences.
          </p>
          <textarea
            rows={5}
            maxLength={500}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="e.g. Always use the semester system used at Anna University. Course codes must follow the pattern used in affiliated colleges..."
            className={`${inputCls} resize-none`}
          />
          <div className="flex items-center justify-between mt-1">
            {instrMsg ? <p className={msgCls(instrMsg.type)}>{instrMsg.text}</p> : <span />}
            <p className="text-xs text-gray-400">{instructions.length} / 500</p>
          </div>
          <button onClick={saveInstructions} className={`${btnCls} mt-3`}>Save instructions</button>
        </div>
      </Card>

      {/* Sign out */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <button
          onClick={() => { logout(); navigate(ROUTES.LOGIN); }}
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-medium text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-500 mb-4">Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm. This cannot be undone.</p>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 mb-4"
              value={resetInput}
              onChange={e => setResetInput(e.target.value)}
              placeholder="Type DELETE"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowResetModal(false); setResetInput(''); }} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmReset}
                disabled={resetInput !== 'DELETE' || resetting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resetting ? 'Resetting...' : 'Confirm reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
