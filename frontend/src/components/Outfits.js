import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './Outfits.css';

function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.title = 'Outfits - Garmently';
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const data = await apiService.getOutfits();
      console.log('Fetched outfits:', data);
      if (data.length > 0) {
        console.log('First outfit garments:', data[0].garments);
        if (data[0].garments && data[0].garments.length > 0) {
          console.log('First garment image_url:', data[0].garments[0].image_url);
        }
      }
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
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error deleting outfit:', err);
      alert('Failed to delete outfit');
    }
  };

  const openOutfitModal = (outfit) => {
    setSelectedOutfit(outfit);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOutfit(null);
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
        <h1><img src="/images/logo.png" alt="Garmently" style={{ width: '35px', height: '35px', marginRight: '0.8rem', verticalAlign: 'middle' }} /><i className="fas fa-users"></i> My Outfits</h1>
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
                  className={`outfit-card`}
                  onClick={() => openOutfitModal(outfit)}
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
      </div>

      {/* Outfit Detail Modal */}
      {showModal && selectedOutfit && (
        <div className="outfit-modal-overlay" onClick={closeModal}>
          <div className="outfit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedOutfit.name}</h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              {/* Outfit Canvas - Visual Layout */}
              <div className="outfit-canvas">
                <h3>Outfit Layout</h3>
                <div className="canvas-grid">
                  {selectedOutfit.garments && selectedOutfit.garments.map((garment, index) => {
                    console.log('Canvas garment:', garment.name, 'image_url:', garment.image_url);
                    return (
                      <div key={garment.id} className="canvas-item">
                        {garment.image_url ? (
                          <img 
                            src={garment.image_url} 
                            alt={garment.name}
                            onError={(e) => {
                              console.error('Failed to load image:', garment.image_url);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="canvas-placeholder">
                            <i className="fas fa-tshirt"></i>
                          </div>
                        )}
                        <div 
                          className="canvas-placeholder" 
                          style={{ display: garment.image_url ? 'none' : 'flex' }}
                        >
                          <i className="fas fa-tshirt"></i>
                        </div>
                        <div className="canvas-item-label">{garment.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Outfit Details */}
              <div className="outfit-details-section">
                {selectedOutfit.occasion && (
                  <div className="detail-row">
                    <label><i className="fas fa-tag"></i> Occasion:</label>
                    <span className="occasion-badge">{selectedOutfit.occasion}</span>
                  </div>
                )}

                {selectedOutfit.season && (
                  <div className="detail-row">
                    <label><i className="fas fa-sun"></i> Season:</label>
                    <span>{selectedOutfit.season}</span>
                  </div>
                )}

                {selectedOutfit.times_worn > 0 && (
                  <div className="detail-row">
                    <label><i className="fas fa-calendar"></i> Times Worn:</label>
                    <span>{selectedOutfit.times_worn}</span>
                  </div>
                )}

                {selectedOutfit.notes && (
                  <div className="detail-row">
                    <label><i className="fas fa-sticky-note"></i> Description:</label>
                    <p className="notes-text">{selectedOutfit.notes}</p>
                  </div>
                )}

                {/* Garments List */}
                <div className="detail-row">
                  <label><i className="fas fa-list"></i> Items ({selectedOutfit.garments?.length || 0}):</label>
                  <div className="garments-list-modal">
                    {selectedOutfit.garments && selectedOutfit.garments.map((garment) => (
                      <div key={garment.id} className="garment-item-modal">
                        {garment.image_url ? (
                          <img 
                            src={garment.image_url} 
                            alt={garment.name}
                            onError={(e) => {
                              console.error('Failed to load garment image:', garment.image_url);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="garment-thumb-placeholder"
                          style={{ display: garment.image_url ? 'none' : 'flex' }}
                        >
                          <i className="fas fa-tshirt"></i>
                        </div>
                        <div className="garment-item-info">
                          <p className="garment-item-name">{garment.name}</p>
                          <p className="garment-item-meta">
                            {garment.category_name} • {garment.color}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions">
                <button 
                  className="btn btn-favorite"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(selectedOutfit);
                  }}
                >
                  <i className={`fas fa-heart ${selectedOutfit.is_favorite ? '' : 'far'}`}></i>
                  {selectedOutfit.is_favorite ? ' Remove from Favorites' : ' Add to Favorites'}
                </button>
                <button className="btn btn-primary">
                  <i className="fas fa-check"></i> Mark as Worn
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOutfit(selectedOutfit.id);
                  }}
                >
                  <i className="fas fa-trash"></i> Delete Outfit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Outfits;
