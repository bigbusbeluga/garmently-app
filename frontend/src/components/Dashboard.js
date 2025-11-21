import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    total_garments: 0,
    clean_garments: 0,
    dirty_garments: 0,
    favorite_garments: 0
  });
  const [recentGarments, setRecentGarments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const garments = await apiService.getGarments();
      
      // Calculate stats
      const total = garments.length;
      const clean = garments.filter(g => g.status === 'clean').length;
      const dirty = garments.filter(g => g.status === 'dirty').length;
      const favorites = garments.filter(g => g.is_favorite).length;
      
      setStats({
        total_garments: total,
        clean_garments: clean,
        dirty_garments: dirty,
        favorite_garments: favorites
      });
      
      // Get recent garments (last 5)
      setRecentGarments(garments.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><i className="fas fa-tachometer-alt"></i> Dashboard</h1>
        <Link to="/add-garment" className="btn btn-primary">
          <i className="fas fa-plus"></i> Add Garment
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-tshirt stat-icon text-primary"></i>
          <h3>{stats.total_garments}</h3>
          <p>Total Garments</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-check-circle stat-icon text-success"></i>
          <h3>{stats.clean_garments}</h3>
          <p>Clean Items</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-soap stat-icon text-warning"></i>
          <h3>{stats.dirty_garments}</h3>
          <p>Dirty Items</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-heart stat-icon text-danger"></i>
          <h3>{stats.favorite_garments}</h3>
          <p>Favorites</p>
        </div>
      </div>

      {/* Recent Garments & Outfits */}
      <div className="dashboard-sections">
        {/* Recent Garments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h5><i className="fas fa-clock"></i> Recent Garments</h5>
            <Link to="/wardrobe" className="btn-view-all">View All</Link>
          </div>
          <div className="card-body">
            {recentGarments.length > 0 ? (
              <div className="recent-list">
                {recentGarments.map(garment => (
                  <div key={garment.id} className="recent-item">
                    <div className="item-info">
                      {garment.image_url ? (
                        <img src={garment.image_url} alt={garment.name} className="item-thumb" />
                      ) : (
                        <div className="item-thumb-placeholder">
                          <i className="fas fa-tshirt"></i>
                        </div>
                      )}
                      <div>
                        <h6>{garment.name}</h6>
                        <small>{garment.category_name} • {garment.color}</small>
                      </div>
                    </div>
                    <span className={`status-badge status-${garment.status || 'clean'}`}>
                      {garment.status || 'clean'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">
                No garments yet. <Link to="/add-garment">Add your first garment!</Link>
              </p>
            )}
          </div>
        </div>

        {/* Recent Outfits */}
        <div className="dashboard-card">
          <div className="card-header">
            <h5><i className="fas fa-users"></i> Recent Outfits</h5>
            <Link to="/outfits" className="btn-view-all">View All</Link>
          </div>
          <div className="card-body">
            <p className="empty-message">
              No outfits yet. <Link to="/create-outfit">Create your first outfit!</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <div className="card-header">
          <h5><i className="fas fa-bolt"></i> Quick Actions</h5>
        </div>
        <div className="card-body">
          <div className="quick-actions">
            <Link to="/add-garment" className="action-btn btn-primary">
              <i className="fas fa-plus"></i>
              <span>Add Garment</span>
            </Link>
            <Link to="/create-outfit" className="action-btn btn-success">
              <i className="fas fa-users"></i>
              <span>Create Outfit</span>
            </Link>
            <Link to="/laundry" className="action-btn btn-warning">
              <i className="fas fa-soap"></i>
              <span>Laundry ({stats.dirty_garments})</span>
            </Link>
            <Link to="/mixmatch" className="action-btn btn-info">
              <i className="fas fa-magic"></i>
              <span>Mix & Match</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
