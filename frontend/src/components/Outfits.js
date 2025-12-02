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
      console.log('=== OUTFITS FETCH DEBUG ===');
      console.log('Total outfits:', data.length);
      console.log('Full outfits data:', JSON.stringify(data, null, 2));
      
      if (data.length > 0) {
        data.forEach((outfit, index) => {
          console.log(`\nOutfit ${index + 1} (${outfit.name}):`);
          console.log('  - ID:', outfit.id);
          console.log('  - Garments array:', outfit.garments);
          console.log('  - Garments count:', outfit.garments?.length || 0);
          
          if (outfit.garments && outfit.garments.length > 0) {
            outfit.garments.forEach((garment, gIndex) => {
              console.log(`    Garment ${gIndex + 1}:`, {
                id: garment.id,
                name: garment.name,
                image_url: garment.image_url,
                has_image: !!garment.image_url
              });
            });
          } else {
            console.warn(`  ⚠️ Outfit "${outfit.name}" has NO garments!`);
          }
        });
      }
      console.log('=== END DEBUG ===\n');
      
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

  const downloadOutfitImage = async (outfit) => {
    try {
      const canvas = document.getElementById(`outfit-canvas-${outfit.id}`);
      
      if (!canvas) {
        alert('Canvas not found');
        return;
      }

      // Create a temporary canvas to draw the outfit
      const tempCanvas = document.createElement('canvas');
      const images = canvas.querySelectorAll('.outfit-garment-item img');
      
      if (images.length === 0) {
        alert('No images to download');
        return;
      }

      // Calculate canvas size based on positioned elements
      let maxX = 0, maxY = 0;
      const items = canvas.querySelectorAll('.canvas-item-positioned');
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const x = rect.left - canvasRect.left + rect.width;
        const y = rect.top - canvasRect.top + rect.height;
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });

      tempCanvas.width = Math.max(maxX + 40, 400);
      tempCanvas.height = Math.max(maxY + 40, 400);
      const ctx = tempCanvas.getContext('2d');
      
      // Fill background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw each garment image at its position
      const drawPromises = Array.from(items).map((item, index) => {
        return new Promise((resolve) => {
          const img = item.querySelector('img');
          if (!img || img.style.display === 'none') {
            resolve();
            return;
          }

          const tempImg = new Image();
          tempImg.crossOrigin = 'anonymous';
          
          tempImg.onload = () => {
            const rect = item.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const x = rect.left - canvasRect.left;
            const y = rect.top - canvasRect.top;
            
            // Draw white background for garment
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, 150, 150);
            
            // Draw image
            ctx.drawImage(tempImg, x + 5, y + 5, 140, 140);
            resolve();
          };
          
          tempImg.onerror = () => {
            console.error('Failed to load:', img.src);
            resolve();
          };
          
          tempImg.src = img.src;
        });
      });

      await Promise.all(drawPromises);

      // Download
      tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${outfit.name.replace(/\s+/g, '_')}_outfit.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error('Error downloading outfit:', err);
      alert('Failed to download outfit image. Please try again.');
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
        <h1>My Outfits</h1>
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
              <a href="/mixmatch" className="empty-state-link">
                Go to Mix & Match
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
                {selectedOutfit.garments && selectedOutfit.garments.length > 0 ? (
                  <div 
                    id={`outfit-canvas-${selectedOutfit.id}`}
                    className="canvas-positioned" 
                    style={{ 
                      position: 'relative', 
                      width: '100%', 
                      minHeight: '500px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed rgba(0,0,0,0.1)', 
                      borderRadius: '12px', 
                      background: '#f8f9fa',
                      overflow: 'hidden'
                    }}
                  >
                    {(() => {
                      // Parse layout data if available
                      let layoutMap = {};
                      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                      
                      if (selectedOutfit.layout) {
                        try {
                          const layoutData = JSON.parse(selectedOutfit.layout);
                          layoutData.forEach(item => {
                            layoutMap[item.id] = item;
                            // Calculate bounds
                            minX = Math.min(minX, item.position.x);
                            maxX = Math.max(maxX, item.position.x + 150);
                            minY = Math.min(minY, item.position.y);
                            maxY = Math.max(maxY, item.position.y + 150);
                          });
                          console.log('Parsed layout data:', layoutMap);
                          console.log('Bounds:', { minX, maxX, minY, maxY });
                        } catch (e) {
                          console.error('Failed to parse layout:', e);
                        }
                      }

                      // Calculate centering offset
                      const contentWidth = maxX - minX;
                      const contentHeight = maxY - minY;
                      const containerWidth = 800; // Approximate container width
                      const offsetX = (containerWidth - contentWidth) / 2 - minX;
                      const offsetY = 20 - minY; // Small top padding

                      return selectedOutfit.garments.map((garment, index) => {
                        const layout = layoutMap[garment.id];
                        const basePosition = layout?.position || { 
                          x: 325 + (index % 2) * 20, // Center with slight offset
                          y: 20 + index * 160  // Stack vertically
                        };
                        
                        // Apply centering offset if we have layout data
                        const position = Object.keys(layoutMap).length > 0 ? {
                          x: basePosition.x + offsetX,
                          y: basePosition.y + offsetY
                        } : basePosition;
                        
                        const zIndex = layout?.zIndex || index;

                        console.log(`Canvas render - Garment ${index + 1}:`, {
                          name: garment.name,
                          position,
                          zIndex,
                          image_url: garment.image_url
                        });

                        return (
                          <div 
                            key={garment.id} 
                            className="canvas-item-positioned outfit-garment-item"
                            style={{
                              position: 'absolute',
                              left: `${position.x}px`,
                              top: `${position.y}px`,
                              width: '150px',
                              height: '150px',
                              zIndex: zIndex,
                            }}
                          >
                            {garment.image_url ? (
                              <img 
                                src={garment.image_url} 
                                alt={garment.name}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'contain',
                                  background: 'white',
                                  borderRadius: '8px',
                                  padding: '5px'
                                }}
                                onLoad={() => console.log('✅ Image loaded:', garment.image_url)}
                                onError={(e) => {
                                  console.error('❌ Failed to load image:', garment.image_url);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <div className="canvas-placeholder" style={{ 
                                width: '100%', 
                                height: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                background: 'white', 
                                borderRadius: '8px',
                                border: '2px solid #dee2e6'
                              }}>
                                <i className="fas fa-tshirt" style={{ fontSize: '2.5rem', color: '#adb5bd' }}></i>
                              </div>
                            )}
                            <div 
                              className="canvas-placeholder" 
                              style={{ 
                                display: garment.image_url ? 'none' : 'flex', 
                                width: '100%', 
                                height: '100%', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                background: 'white', 
                                borderRadius: '8px',
                                border: '2px solid #dee2e6'
                              }}
                            >
                              <i className="fas fa-tshirt" style={{ fontSize: '2.5rem', color: '#adb5bd' }}></i>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="empty-canvas">
                    <i className="fas fa-inbox fa-3x"></i>
                    <p>This outfit has no garments</p>
                    <small>Outfits created must contain at least one garment</small>
                  </div>
                )}
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
              
              {/* Download Button */}
              {selectedOutfit.garments && selectedOutfit.garments.length > 0 && (
                <div style={{ marginTop: '1rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <button 
                    onClick={() => downloadOutfitImage(selectedOutfit)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #6c757d',
                      color: '#6c757d',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#6c757d';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#6c757d';
                    }}
                  >
                    <i className="fas fa-download" style={{ marginRight: '0.5rem' }}></i>
                    Download Outfit Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Outfits;
