import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import SetPasswordModal from './SetPasswordModal';
import './Auth.css';

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: Email, 2: Verification Code, 3: Registration
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    username: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  useEffect(() => {
    document.title = 'Sign Up - Garmently';
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSendVerification = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      setLoading(false);
      return;
    }

    try {
      await apiService.sendVerificationCode(formData.email);
      setVerificationSent(true);
      setStep(2);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.suggestion === 'google_signin') {
        setErrors({ 
          email: errorData.error + ' Click the Google button below to sign in.',
          isGoogleAccount: true 
        });
      } else {
        setErrors({ email: errorData?.error || 'Failed to send verification code' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (formData.verificationCode.length !== 6) {
      setErrors({ verificationCode: 'Please enter the complete 6-digit code' });
      setLoading(false);
      return;
    }

    try {
      await apiService.verifyCode(formData.email, formData.verificationCode);
      setStep(3);
    } catch (err) {
      setErrors({ verificationCode: err.response?.data?.error || 'Invalid verification code' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (formData.password !== formData.password2) {
      setErrors({ password2: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.first_name,
        last_name: formData.last_name
      };
      
      const response = await apiService.register(registrationData);
      login(response.user, response.token);
      navigate('/');
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object' && !errorData.error && !errorData.detail) {
          setErrors(errorData);
        } else {
          const errorMessage = errorData.detail || errorData.error || JSON.stringify(errorData);
          setErrors({ general: errorMessage });
        }
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrors({});
    setLoading(true);

    try {
      const response = await apiService.googleAuth(credentialResponse.credential);
      login(response.user, response.token);
      
      // Check if user needs to set password (no usable password)
      if (!response.user.has_usable_password) {
        setGoogleUser(response.user);
        setShowSetPassword(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Google sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ general: 'Google sign-in was unsuccessful. Please try again.' });
  };

  const handleSetPasswordSuccess = (message) => {
    setShowSetPassword(false);
    // Navigate to dashboard
    navigate('/');
  };

  const handleSetPasswordSkip = () => {
    setShowSetPassword(false);
    // Navigate to dashboard anyway
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/images/logo.png" alt="Garmently Logo" style={{ width: '80px', height: '80px', marginBottom: '1rem' }} />
          <h1>Join Garmently</h1>
          <p>{step === 1 ? 'Verify your email to get started' : step === 2 ? 'Enter verification code' : 'Create your account'}</p>
          
          {/* Progress indicator */}
          <div className="signup-progress" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            <div style={{ width: '30px', height: '4px', borderRadius: '2px', backgroundColor: step >= 1 ? '#6366f1' : '#e5e7eb' }}></div>
            <div style={{ width: '30px', height: '4px', borderRadius: '2px', backgroundColor: step >= 2 ? '#6366f1' : '#e5e7eb' }}></div>
            <div style={{ width: '30px', height: '4px', borderRadius: '2px', backgroundColor: step >= 3 ? '#6366f1' : '#e5e7eb' }}></div>
          </div>
        </div>

        {errors.general && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {errors.general}
          </div>
        )}

        {/* Step 1: Email Verification */}
        {step === 1 && (
          <form onSubmit={handleSendVerification} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                autoFocus
              />
              {errors.email && (
                <span className="field-error">
                  {errors.email}
                </span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending Code...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Send Verification Code
                </>
              )}
            </button>

            <div className="divider" style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
              <span style={{ padding: '0 1rem', color: '#6b7280', fontSize: '0.875rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
            </div>

            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  text="signup_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>
            </GoogleOAuthProvider>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="auth-form">
            <div className="info-message" style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <i className="fas fa-info-circle"></i>
              We sent a 6-digit code to <strong>{formData.email}</strong>
            </div>

            <div className="form-group">
              <label htmlFor="verificationCode">
                <i className="fas fa-key"></i>
                Verification Code *
              </label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                required
                placeholder="Enter 6-digit code"
                maxLength="6"
                minLength="6"
                inputMode="numeric"
                autoFocus
                style={{ fontSize: '1rem', letterSpacing: '0.3rem', textAlign: 'center' }}
              />
              {errors.verificationCode && (
                <span className="field-error">
                  {errors.verificationCode}
                </span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i>
                  Verify Code
                </>
              )}
            </button>

            <button 
              type="button" 
              onClick={handleSendVerification}
              className="btn-secondary"
              style={{ marginTop: '0.5rem' }}
              disabled={loading}
            >
              <i className="fas fa-redo"></i>
              Resend Code
            </button>
          </form>
        )}

        {/* Step 3: Registration Form */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="success-message" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <i className="fas fa-check-circle"></i>
              Email verified! Complete your profile below
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">
                  <i className="fas fa-user"></i>
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">
                  <i className="fas fa-user"></i>
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user-circle"></i>
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
                autoFocus
              />
              {errors.username && (
                <span className="field-error">
                  {Array.isArray(errors.username) ? errors.username.join(', ') : errors.username}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 8 characters"
              />
              {errors.password && (
                <span className="field-error">
                  {Array.isArray(errors.password) ? errors.password.join(', ') : errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password2">
                <i className="fas fa-lock"></i>
                Confirm Password *
              </label>
              <input
                type="password"
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
              />
              {errors.password2 && (
                <span className="field-error">
                  {Array.isArray(errors.password2) ? errors.password2.join(', ') : errors.password2}
                </span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Complete Signup
                </>
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>

      {showSetPassword && (
        <SetPasswordModal 
          onClose={handleSetPasswordSkip} 
          onSuccess={handleSetPasswordSuccess}
        />
      )}
    </div>
  );
}

export default Signup;
