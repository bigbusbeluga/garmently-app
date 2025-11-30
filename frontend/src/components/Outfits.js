import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './Outfits.css';

function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  useEffect(() => {
    document.title = 'Outfits - Garmently';
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const data = await apiService.getOutfits();
      setOutfits(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching outfits:', err);
      setError('Failed to load outfits');
      setLoading(false);
    }
  };

  const deleteOutfit = async (outfitId) => {
    if (!window.confirm('Are you sure you want to delete this outfit?')) {
      return;
    }

    try {
      await apiService.deleteOutfit(outfitId);
      setOutfits(outfits.filter(o => o.id !== outfitId));
      if (selectedOutfit?.id === outfitId) {
        setSelectedOutfit(null);
      }
    } catch (err) {
      console.error('Error deleting outfit:', err);
      alert('Failed to delete outfit');
    }
  };

  const toggleFavorite = async (outfit) => {
    try {
      const updatedOutfit = await apiService.updateOutfit(outfit.id, {
        is_favorite: !outfit.is_favorite
      });
      setOutfits(outfits.map(o => o.id === outfit.id ? updatedOutfit : o));
      if (selectedOutfit?.id === outfit.id) {
        setSelectedOutfit(updatedOutfit);
      }
    } catch (err) {
      console.error('Error updating outfit:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <h1>Loading outfits...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="outfits-page">
      <div className="outfits-header">
        <h1><i className="fas fa-users"></i> My Outfits</h1>
        <p>View and manage your saved outfit combinations</p>
      </div>

      <div className="outfits-content">
        {/* Outfits Grid */}
        <div className="outfits-grid-section">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
            </div>
          )}

          {outfits.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-users fa-4x"></i>
              <h2>No outfits yet</h2>
              <p>Create your first outfit in Mix & Match!</p>
              <a href="/mixmatch" className="btn btn-primary">
                <i className="fas fa-magic"></i> Go to Mix & Match
              </a>
            </div>
          ) : (
            <div className="outfits-grid">
              {outfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className={`outfit-card ${selectedOutfit?.id === outfit.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOutfit(outfit)}
                >
                  <div className="outfit-images">
                    {outfit.garments && outfit.garments.length > 0 ? (
                      <>
                        {outfit.garments.slice(0, 4).map((garment, index) => (
                          <div key={garment.id || index} className="outfit-garment-preview">
                            {garment.image_url ? (
                              <img src={garment.image_url} alt={garment.name} />
                            ) : (
                              <div className="preview-placeholder">
                                <i className="fas fa-tshirt"></i>
                              </div>
                            )}
                          </div>
                        ))}
                        {outfit.garments.length > 4 && (
                          <div className="more-items">
                            +{outfit.garments.length - 4}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="preview-placeholder-large">
                        <i className="fas fa-tshirt"></i>
                      </div>
                    )}
                  </div>

                  <div className="outfit-info">
                    <h3 className="outfit-name">
                      {outfit.name}
                      {outfit.is_favorite && (
                        <i className="fas fa-heart text-danger"></i>
                      )}
                    </h3>
                    <div className="outfit-meta">
                      <span>
                        <i className="fas fa-tshirt"></i> {outfit.garments?.length || 0} items
                      </span>
                      {outfit.occasion && (
                        <span className="outfit-occasion">
                          <i className="fas fa-tag"></i> {outfit.occasion}
                        </span>
                      )}
                    </div>
                    {outfit.times_worn > 0 && (
                      <p className="outfit-worn">
                        <i className="fas fa-calendar"></i> Worn {outfit.times_worn} time{outfit.times_worn !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  <div className="outfit-actions">
                    <button
                      className="btn-action btn-favorite"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(outfit);
                      }}
                      title={outfit.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <i className={`fas fa-heart ${outfit.is_favorite ? '' : 'far'}`}></i>
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOutfit(outfit.id);
                      }}
                      title="Delete outfit"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outfit Detail Panel */}
        {selectedOutfit && (
          <div className="outfit-detail-panel">
            <div className="panel-header">
              <h2>{selectedOutfit.name}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedOutfit(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="panel-content">
              {selectedOutfit.occasion && (
                <div className="detail-item">
                  <label>Occasion:</label>
                  <span className="occasion-badge">{selectedOutfit.occasion}</span>
                </div>
              )}

              {selectedOutfit.season && (
                <div className="detail-item">
                  <label>Season:</label>
                  <span>{selectedOutfit.season}</span>
                </div>
              )}

              {selectedOutfit.notes && (
                <div className="detail-item">
                  <label>Notes:</label>
                  <p className="notes-text">{selectedOutfit.notes}</p>
                </div>
              )}

              <div className="detail-item">
                <label>Garments ({selectedOutfit.garments?.length || 0}):</label>
                <div className="garments-list">
                  {selectedOutfit.garments && selectedOutfit.garments.map((garment) => (
                    <div key={garment.id} className="garment-detail-item">
                      {garment.image_url ? (
                        <img src={garment.image_url} alt={garment.name} />
                      ) : (
                        <div className="garment-placeholder-small">
                          <i className="fas fa-tshirt"></i>
                        </div>
                      )}
                      <div className="garment-detail-info">
                        <p className="garment-detail-name">{garment.name}</p>
                        <p className="garment-detail-meta">
                          {garment.category_name} • {garment.color}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-actions">
                <button className="btn btn-primary btn-block">
                  <i className="fas fa-check"></i> Mark as Worn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Outfits;
