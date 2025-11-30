import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import './Auth.css';

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Sign Up - Garmently';
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Client-side validation
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
      console.log('Attempting registration with:', formData);
      const response = await apiService.register(formData);
      console.log('Registration successful:', response);
      // Use auth context to store user data
      login(response.user, response.token);
      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.data) {
        // Handle different error formats
        const errorData = err.response.data;
        console.log('Error data:', errorData);
        
        // If it's a simple error object with field names
        if (typeof errorData === 'object' && !errorData.error && !errorData.detail) {
          setErrors(errorData);
        } else {
          // If it's an error/detail message
          const errorMessage = errorData.detail || errorData.error || JSON.stringify(errorData);
          setErrors({ general: errorMessage });
        }
      } else if (err.message) {
        setErrors({ general: `Network error: ${err.message}` });
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/images/logo.png" alt="Garmently Logo" style={{ width: '80px', height: '80px', marginBottom: '1rem' }} />
          <h1>Join Garmently</h1>
          <p>Create your wardrobe management account</p>
        </div>

        {errors.general && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="email">
              <i className="fas fa-envelope"></i>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <span className="field-error">
                {Array.isArray(errors.email) ? errors.email.join(', ') : errors.email}
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
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
