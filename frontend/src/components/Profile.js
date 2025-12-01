import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import SetPasswordModal from './SetPasswordModal';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    profile_picture: null
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [previewImage, setPreviewImage] = useState(null);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  useEffect(() => {
    document.title = 'Profile - Garmently';
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiService.getCurrentUser();
      setProfileData({
        username: data.username || '',
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        bio: data.bio || '',
        profile_picture: data.profile_picture || null
      });
      if (data.profile_picture) {
        setPreviewImage(data.profile_picture);
      }
      // Check if user has a password set
      setHasPassword(data.has_usable_password);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({ ...prev, profile_picture: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('username', profileData.username);
      formData.append('email', profileData.email);
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('bio', profileData.bio);
      
      if (profileData.profile_picture instanceof File) {
        formData.append('profile_picture', profileData.profile_picture);
      }

      await apiService.updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
      setLoading(false);
      return;
    }

    try {
      await apiService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setMessage({ type: 'error', text: 'Failed to change password. Check your old password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1><i className="fas fa-user-circle"></i> My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-tabs">
        <button 
          className={activeTab === 'profile' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user"></i> Profile Information
        </button>
        <button 
          className={activeTab === 'password' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('password')}
        >
          <i className="fas fa-lock"></i> Change Password
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="profile-picture-section">
              <div className="picture-preview">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" />
                ) : (
                  <div className="no-picture">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              <div className="picture-upload">
                <label htmlFor="profile_picture" className="btn btn-secondary">
                  <i className="fas fa-camera"></i> Choose Picture
                </label>
                <input 
                  type="file" 
                  id="profile_picture"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input 
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea 
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fas fa-save"></i> Save Changes</>
              )}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <>
            {!hasPassword ? (
              <div className="no-password-section">
                <div className="info-box">
                  <i className="fas fa-info-circle"></i>
                  <div>
                    <h4>No Password Set</h4>
                    <p>You signed up with Google and don't have a password yet. Set one now to enable email/password login.</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setShowSetPassword(true)}
                >
                  <i className="fas fa-key"></i>
                  Set Password
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label>Current Password *</label>
              <input 
                type="password"
                name="old_password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <input 
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password *</label>
              <input 
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Changing...</>
              ) : (
                <><i className="fas fa-key"></i> Change Password</>
              )}
            </button>
          </form>
            )}
          </>
        )}
      </div>

      {showSetPassword && (
        <SetPasswordModal 
          onClose={() => setShowSetPassword(false)} 
          onSuccess={(message) => {
            setShowSetPassword(false);
            setMessage({ type: 'success', text: message });
            setHasPassword(true);
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}
    </div>
  );
}

export default Profile;
