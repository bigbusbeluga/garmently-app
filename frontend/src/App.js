import React from 'react';
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
import './App.css';

// Layout Component with Sidebar
function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="navbar-brand">
          <i className="fas fa-tshirt"></i> Garmently
        </div>
        <div className="navbar-user">
          <i className="fas fa-user"></i>
          <span>{user?.username || 'User'}</span>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </nav>

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
          </ul>
        </aside>

        {/* Main Content */}
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}

// Placeholder components for other pages
function Laundry() {
  return (
    <div className="page-placeholder">
      <i className="fas fa-soap fa-4x"></i>
      <h2>Laundry</h2>
      <p>Track items that need washing</p>
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
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
