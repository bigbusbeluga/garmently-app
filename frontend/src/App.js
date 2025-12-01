import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import AddGarment from './components/AddGarment';
import MixMatch from './components/MixMatch';
import Outfits from './components/Outfits';
import Calendar from './components/Calendar';
import Laundry from './components/Laundry';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import InstallPrompt from './components/InstallPrompt';
import './App.css';

// Layout Component with Sidebar
function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(0);
  
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for notifications
  useEffect(() => {
    const checkNotifications = () => {
      const scheduled = localStorage.getItem('scheduled_outfits');
      if (!scheduled) return;
      
      const outfits = JSON.parse(scheduled);
      const today = new Date().toISOString().split('T')[0];
      let count = 0;
      
      if (outfits[today]) count++;
      
      for (let i = 1; i <= 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        if (outfits[dateStr]) count++;
      }
      
      setNotificationCount(count);
    };
    
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="navbar-brand">
          <img src="/images/logo.png" alt="Garmently Logo" style={{ width: '32px', height: '32px', marginRight: '8px' }} />
          Garmently
        </div>
        <div className="navbar-user">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="notification-btn" 
            title="Notifications"
          >
            <i className="fas fa-bell"></i>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>
          <Link to="/profile" className="profile-link" title="Profile">
            <i className="fas fa-user"></i>
            <span>{user?.username || 'User'}</span>
          </Link>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </nav>

      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      <div className="app-layout">
        {/* Sidebar */}
        <aside className="app-sidebar">
          <ul className="sidebar-menu">
            <li>
              <Link to="/" className={isActive('/')}>
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/wardrobe" className={isActive('/wardrobe')}>
                <i className="fas fa-tshirt"></i>
                <span>Wardrobe</span>
              </Link>
            </li>
            <li>
              <Link to="/outfits" className={isActive('/outfits')}>
                <i className="fas fa-users"></i>
                <span>Outfits</span>
              </Link>
            </li>
            <li>
              <Link to="/calendar" className={isActive('/calendar')}>
                <i className="fas fa-calendar-alt"></i>
                <span>Calendar</span>
              </Link>
            </li>
            <li>
              <Link to="/laundry" className={isActive('/laundry')}>
                <i className="fas fa-soap"></i>
                <span>Laundry</span>
              </Link>
            </li>
            <li>
              <Link to="/mixmatch" className={isActive('/mixmatch')}>
                <i className="fas fa-magic"></i>
                <span>Mix & Match</span>
              </Link>
            </li>
            <li className="menu-divider"></li>
            <li>
              <Link to="/add-garment" className={isActive('/add-garment')}>
                <i className="fas fa-plus"></i>
                <span>Add Garment</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className={isActive('/profile')}>
                <i className="fas fa-user-circle"></i>
                <span>Profile</span>
              </Link>
            </li>
          </ul>
          
          {/* Clock in sidebar footer */}
          <div className="sidebar-footer">
            <div className="current-time">
              <i className="fas fa-clock"></i>
              <div className="time-display">
                <div className="time">{currentTime.toLocaleTimeString()}</div>
                <div className="date">{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/wardrobe" element={
        <ProtectedRoute>
          <Layout>
            <Inventory />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/outfits" element={
        <ProtectedRoute>
          <Layout>
            <Outfits />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          <Layout>
            <Calendar />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/laundry" element={
        <ProtectedRoute>
          <Layout>
            <Laundry />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/mixmatch" element={
        <ProtectedRoute>
          <Layout>
            <MixMatch />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/add-garment" element={
        <ProtectedRoute>
          <Layout>
            <AddGarment />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <InstallPrompt />
      </AuthProvider>
    </Router>
  );
}

export default App;
