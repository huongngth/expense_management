import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Camera, Save } from 'lucide-react';
import { MOCK_USER } from '../lib/mockData';
export function Profile() {
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };
  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaving(true);
    setTimeout(() => setIsPasswordSaving(false), 1000);
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">Profile Settings</h2>
        <p className="text-slate-500 text-sm">
          Manage your account details and security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer">
              <img
                src={MOCK_USER.avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
              
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">
              {MOCK_USER.fullName}
            </h3>
            <p className="text-sm text-slate-500 mb-4">{MOCK_USER.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Active Account
            </span>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Personal Information
            </h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={MOCK_USER.fullName}
                    className="input-field pl-10" />
                  
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    defaultValue={MOCK_USER.email}
                    disabled
                    className="input-field pl-10 bg-slate-50 text-slate-500 cursor-not-allowed" />
                  
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Email cannot be changed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    defaultValue={MOCK_USER.phone}
                    className="input-field pl-10" />
                  
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex items-center">
                  
                  {isSaving ?
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> :

                  <Save className="w-4 h-4 mr-2" />
                  }
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Change Password
            </h3>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-10" />
                  
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-10" />
                  
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-10" />
                  
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isPasswordSaving}
                  className="btn-secondary flex items-center">
                  
                  {isPasswordSaving ?
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-2" /> :

                  <Lock className="w-4 h-4 mr-2" />
                  }
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border-red-100 bg-red-50/30">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <button className="btn-danger">Delete Account</button>
          </div>
        </div>
      </div>
    </div>);

}