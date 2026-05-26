import React, { useEffect, useState } from 'react';
import { consumerAPI, authAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../../components/Badge.jsx';
import { FiUser, FiMail, FiPhone, FiMapPin, FiHash, FiZap, FiCalendar, FiLock, FiCamera, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../admin/Page.css';
import './Consumer.css';

export default function ConsumerProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', address: '', area: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await consumerAPI.getProfile();
      const p = res.data.data;
      setProfile(p);
      setProfileForm({
        fullName: p.fullName || '',
        phone: p.phone || '',
        address: p.address || '',
        area: p.area || ''
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (e.g., 2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image size should be less than 2MB');
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const res = await consumerAPI.updateAvatar(formData);
      setProfile(res.data.data);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await consumerAPI.updateProfile(profileForm);
      setProfile(res.data.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.changePassword(passForm);
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '' });
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to change password'); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // For local uploads, ensure it's absolute from the root (Vite proxy will handle it)
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Account Settings</h1>
        <p>Manage your profile and security preferences</p>
      </div>

      <div className="profile-grid">
        {/* Left Column - Profile Info */}
        <div className="profile-left">
          <div className="card profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper">
                {profile?.profileImage ? (
                  <img src={getImageUrl(profile.profileImage)} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {uploading ? <div className="spinner-sm" /> : profile?.fullName?.[0]}
                  </div>
                )}
                <label className={`avatar-edit-btn ${uploading ? 'disabled' : ''}`}>
                  <FiCamera />
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="profile-header-info">
                <h2>{profile?.fullName}</h2>
                <p>{profile?.email}</p>
                <Badge value={profile?.status} />
              </div>
            </div>

            <div className="profile-nav">
              <button className={`p-nav-item ${!isEditing ? 'active' : ''}`} onClick={() => setIsEditing(false)}>
                <FiUser /> Overview
              </button>
              <button className={`p-nav-item ${isEditing ? 'active' : ''}`} onClick={() => setIsEditing(true)}>
                <FiEdit2 /> Edit Profile
              </button>
            </div>
          </div>

          <div className="card connection-info-card">
            <h3><FiZap /> Connection Details</h3>
            <div className="conn-info-grid">
              <div className="conn-item">
                <span className="label">Consumer ID</span>
                <span className="value">#{profile?._id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="conn-item">
                <span className="label">Meter Number</span>
                <span className="value">{profile?.meterNumber}</span>
              </div>
              <div className="conn-item">
                <span className="label">Type</span>
                <span className="value">{profile?.connectionType}</span>
              </div>
              <div className="conn-item">
                <span className="label">Joined</span>
                <span className="value">{new Date(profile?.installationDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="profile-right">
          {!isEditing ? (
            <div className="card">
              <div className="card-header-row">
                <h3>Personal Information</h3>
                <button className="btn btn--outline btn--sm" onClick={() => setIsEditing(true)}><FiEdit2 /> Edit</button>
              </div>
              <div className="info-display-grid">
                <div className="info-box">
                  <FiUser className="info-icon" />
                  <div className="info-content">
                    <label>Full Name</label>
                    <p>{profile?.fullName}</p>
                  </div>
                </div>
                <div className="info-box">
                  <FiHash className="info-icon" />
                  <div className="info-content">
                    <label>CNIC</label>
                    <p>{profile?.cnic}</p>
                  </div>
                </div>
                <div className="info-box">
                  <FiMail className="info-icon" />
                  <div className="info-content">
                    <label>Email Address</label>
                    <p>{profile?.email}</p>
                  </div>
                </div>
                <div className="info-box">
                  <FiPhone className="info-icon" />
                  <div className="info-content">
                    <label>Phone Number</label>
                    <p>{profile?.phone}</p>
                  </div>
                </div>
                <div className="info-box full-width">
                  <FiMapPin className="info-icon" />
                  <div className="info-content">
                    <label>Address</label>
                    <p>{profile?.address}</p>
                  </div>
                </div>
                <div className="info-box">
                  <FiMapPin className="info-icon" />
                  <div className="info-content">
                    <label>Area</label>
                    <p>{profile?.area || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <h3>Edit Profile</h3>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.fullName} 
                      onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Area</label>
                  <input 
                    type="text" 
                    value={profileForm.area} 
                    onChange={(e) => setProfileForm({...profileForm, area: e.target.value})} 
                    placeholder="Enter your locality/area"
                  />
                </div>
                <div className="form-group">
                  <label>Full Address</label>
                  <textarea 
                    value={profileForm.address} 
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} 
                    required 
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn--light" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn--primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <h3><FiLock /> Security Settings</h3>
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passForm.currentPassword} 
                    onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={passForm.newPassword} 
                    onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})} 
                    required 
                    minLength={6} 
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
