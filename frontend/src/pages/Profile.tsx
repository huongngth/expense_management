import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import { api } from '../lib/api';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

export function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      setUser(parsed);
      setFullName(parsed.fullName || '');
      setPhone(parsed.phone || '');
    }
    
    // Fetch fresh from backend
    api.get('/api/auth/me')
      .then((data) => {
        setUser(data);
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        localStorage.setItem('user', JSON.stringify(data));
      })
      .catch((err) => console.error('Lỗi khi tải thông tin hồ sơ:', err));
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    // Since we just simulate update, we will update localStorage and state
    setTimeout(() => {
      setIsSaving(false);
      if (user) {
        const updated = { ...user, fullName, phone };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        setMessage('Cập nhật hồ sơ thành công.');
      }
    }, 1000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaving(true);
    setTimeout(() => {
      setIsPasswordSaving(false);
      alert('Cập nhật mật khẩu thành công.');
    }, 1000);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-slate-500 text-sm">
          Quản lý chi tiết tài khoản và bảo mật của bạn
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 cursor-pointer">
              <img
                src={user.avatarUrl || 'https://i.pravatar.cc/150'}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
              />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">
              {user.fullName}
            </h3>
            <p className="text-sm text-slate-500 mb-4">{user.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Tài khoản hoạt động
            </span>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Thông tin cá nhân
            </h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input-field pl-10 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Email không thể thay đổi.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex items-center"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Đổi mật khẩu
            </h3>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isPasswordSaving}
                  className="btn-secondary flex items-center"
                >
                  {isPasswordSaving ? (
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}