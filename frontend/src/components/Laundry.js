import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './Laundry.css';

function Laundry() {
  const [garments, setGarments] = useState([]);
  const [dirtyGarments, setDirtyGarments] = useState([]);
  const [washingGarments, setWashingGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dirty'); // 'dirty', 'washing', 'all'

  useEffect(() => {
    document.title = 'Laundry - Garmently';
    fetchGarments();
  }, []);

  const fetchGarments = async () => {
    try {
      const data = await apiService.getGarments();
      setGarments(data);
      
      // Filter by status
      setDirtyGarments(data.filter(g => g.status === 'dirty'));
      setWashingGarments(data.filter(g => g.status === 'washing'));
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching garments:', err);
      setLoading(false);
    }
  };

  const updateGarmentStatus = async (garmentId, newStatus) => {
    try {
      await apiService.updateGarment(garmentId, { status: newStatus });
      await fetchGarments(); // Refresh the list
    } catch (err) {
      console.error('Error updating garment:', err);
      alert('Failed to update garment status');
    }
  };

  const markAsDirty = async (garmentId) => {
    await updateGarmentStatus(garmentId, 'dirty');
  };

  const startWashing = async (garmentId) => {
    await updateGarmentStatus(garmentId, 'washing');
  };

  const markAsClean = async (garmentId) => {
    await updateGarmentStatus(garmentId, 'clean');
  };

  const renderGarmentCard = (garment, showActions = true) => (
    <div key={garment.id} className="laundry-card">
      <div className="laundry-card-image">
        {garment.image_url ? (
          <img src={garment.image_url} alt={garment.name} />
        ) : (
          <div className="placeholder">
            <i className="fas fa-tshirt"></i>
          </div>
        )}
      </div>
      
      <div className="laundry-card-content">
        <h3>{garment.name}</h3>
        <div className="garment-details">
          <span className="category">
            <i className="fas fa-tag"></i> {garment.category_name}
          </span>
          <span className="color">
            <i className="fas fa-palette"></i> {garment.color}
          </span>
        </div>
        
        <div className={`status-badge status-${garment.status}`}>
          {garment.status === 'clean' && <><i className="fas fa-check-circle"></i> Clean</>}
          {garment.status === 'dirty' && <><i className="fas fa-times-circle"></i> Dirty</>}
          {garment.status === 'washing' && <><i className="fas fa-sync fa-spin"></i> Washing</>}
          {garment.status === 'damaged' && <><i className="fas fa-exclamation-triangle"></i> Damaged</>}
        </div>

        {showActions && (
          <div className="laundry-actions">
            {garment.status === 'clean' && (
              <button 
                className="btn btn-sm btn-warning"
                onClick={() => markAsDirty(garment.id)}
              >
                <i className="fas fa-times"></i> Mark Dirty
              </button>
            )}
            
            {garment.status === 'dirty' && (
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => startWashing(garment.id)}
              >
                <i className="fas fa-soap"></i> Start Washing
              </button>
            )}
            
            {garment.status === 'washing' && (
              <button 
                className="btn btn-sm btn-success"
                onClick={() => markAsClean(garment.id)}
              >
                <i className="fas fa-check"></i> Mark Clean
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <h1>Loading laundry...</h1>
        </div>
      </div>
    );
  }

  const displayGarments = activeTab === 'dirty' ? dirtyGarments :
                          activeTab === 'washing' ? washingGarments :
                          garments;

  return (
    <div className="laundry-page">
      <div className="laundry-header">
        <h1><i className="fas fa-soap"></i> Laundry Tracker</h1>
        <p>Manage your dirty clothes and washing schedule</p>
      </div>

      {/* Statistics */}
      <div className="laundry-stats">
        <div className="stat-card dirty">
          <i className="fas fa-times-circle"></i>
          <div className="stat-info">
            <h3>{dirtyGarments.length}</h3>
            <p>Dirty Items</p>
          </div>
        </div>
        
        <div className="stat-card washing">
          <i className="fas fa-sync"></i>
          <div className="stat-info">
            <h3>{washingGarments.length}</h3>
            <p>In Laundry</p>
          </div>
        </div>
        
        <div className="stat-card clean">
          <i className="fas fa-check-circle"></i>
          <div className="stat-info">
            <h3>{garments.filter(g => g.status === 'clean').length}</h3>
            <p>Clean Items</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="laundry-tabs">
        <button 
          className={`tab ${activeTab === 'dirty' ? 'active' : ''}`}
          onClick={() => setActiveTab('dirty')}
        >
          <i className="fas fa-times-circle"></i> Dirty ({dirtyGarments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'washing' ? 'active' : ''}`}
          onClick={() => setActiveTab('washing')}
        >
          <i className="fas fa-sync"></i> Washing ({washingGarments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <i className="fas fa-list"></i> All Items ({garments.length})
        </button>
      </div>

      {/* Content */}
      <div className="laundry-content">
        {displayGarments.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-check-circle fa-4x"></i>
            <h2>No items here</h2>
            {activeTab === 'dirty' && <p>All your clothes are clean!</p>}
            {activeTab === 'washing' && <p>Nothing in the wash right now</p>}
            {activeTab === 'all' && <p>Add garments to your wardrobe first</p>}
          </div>
        ) : (
          <div className="laundry-grid">
            {displayGarments.map(garment => renderGarmentCard(garment))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Laundry;
