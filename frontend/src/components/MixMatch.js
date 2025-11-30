import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './MixMatch.css';

function MixMatch() {
  const [garments, setGarments] = useState([]);
  const [selectedGarments, setSelectedGarments] = useState([]);
  const [outfitName, setOutfitName] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('');
  const [outfitNotes, setOutfitNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.title = 'Mix & Match - Garmently';
    fetchGarments();
    fetchCategories();
  }, []);

  const fetchGarments = async () => {
    try {
      const data = await apiService.getGarments();
      // Only show clean garments for mix & match
      setGarments(data.filter(g => g.status === 'clean'));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching garments:', err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(['All', ...data.map(cat => cat.name)]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleDragStart = (e, garment) => {
    e.dataTransfer.setData('garment', JSON.stringify(garment));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const garmentData = e.dataTransfer.getData('garment');
    
    if (garmentData) {
      const garment = JSON.parse(garmentData);
      // Check if garment is already in the outfit
      if (!selectedGarments.find(g => g.id === garment.id)) {
        const itemWidth = 150;
        const itemHeight = 150;
        
        let x = e.clientX - canvasRect.left - 75; // Center the item
        let y = e.clientY - canvasRect.top - 75;
        
        // Constrain within canvas bounds
        x = Math.max(0, Math.min(x, canvasRect.width - itemWidth));
        y = Math.max(0, Math.min(y, canvasRect.height - itemHeight));
        
        const newGarment = {
          ...garment,
          position: { x, y },
          zIndex: selectedGarments.length,
        };
        setSelectedGarments([...selectedGarments, newGarment]);
      }
    }
  };

  const handleCanvasItemDragStart = (e, garment) => {
    setDraggingItem(garment.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCanvasItemDrag = (e) => {
    if (!draggingItem || e.clientX === 0 && e.clientY === 0) return;
    
    const canvas = document.querySelector('.outfit-canvas');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const itemWidth = 150;
    const itemHeight = 150;
    
    let newX = e.clientX - canvasRect.left - dragOffset.x;
    let newY = e.clientY - canvasRect.top - dragOffset.y;
    
    // Constrain within canvas bounds
    newX = Math.max(0, Math.min(newX, canvasRect.width - itemWidth));
    newY = Math.max(0, Math.min(newY, canvasRect.height - itemHeight));

    setSelectedGarments(prev => prev.map(g => 
      g.id === draggingItem 
        ? { ...g, position: { x: newX, y: newY } }
        : g
    ));
  };

  const handleCanvasItemDragEnd = () => {
    setDraggingItem(null);
  };

  const bringToFront = (garmentId) => {
    const maxZIndex = Math.max(...selectedGarments.map(g => g.zIndex || 0));
    setSelectedGarments(prev => prev.map(g =>
      g.id === garmentId ? { ...g, zIndex: maxZIndex + 1 } : g
    ));
  };

  const removeGarment = (garmentId) => {
    setSelectedGarments(selectedGarments.filter(g => g.id !== garmentId));
  };

  const clearCanvas = () => {
    setSelectedGarments([]);
    setOutfitName('');
    setOutfitOccasion('');
    setOutfitNotes('');
  };

  const saveOutfit = async () => {
    if (selectedGarments.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one garment to the outfit' });
      return;
    }

    if (!outfitName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name for the outfit' });
      return;
    }

    setSaving(true);
    try {
      const outfitData = {
        name: outfitName,
        garments: selectedGarments.map(g => g.id),
        occasion: outfitOccasion,
        notes: outfitNotes,
      };

      await apiService.createOutfit(outfitData);
      setMessage({ type: 'success', text: 'Outfit saved successfully!' });
      
      // Clear the canvas after successful save
      setTimeout(() => {
        clearCanvas();
        setMessage(null);
      }, 2000);
    } catch (err) {
      console.error('Error saving outfit:', err);
      setMessage({ type: 'error', text: 'Failed to save outfit. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredGarments = filterCategory === 'All' 
    ? garments 
    : garments.filter(g => g.category_name === filterCategory);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <h1>Loading wardrobe...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mixmatch-page">
      <div className="mixmatch-header">
        <h1><img src="/images/logo.png" alt="Garmently" style={{ width: '35px', height: '35px', marginRight: '0.8rem', verticalAlign: 'middle' }} /><i className="fas fa-magic"></i> Mix & Match</h1>
        <p>Drag and drop garments to create your perfect outfit</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="mixmatch-content">
        {/* Canvas Area - Left Side */}
        <div className="canvas-section">
          <div className="canvas-header">
            <h2>Your Outfit</h2>
            <div className="canvas-actions">
              <button 
                onClick={clearCanvas} 
                className="btn btn-secondary btn-sm"
                disabled={selectedGarments.length === 0}
              >
                <i className="fas fa-trash"></i> Clear
              </button>
            </div>
          </div>

          <div 
            className="outfit-canvas"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {selectedGarments.length === 0 ? (
              <div className="canvas-placeholder">
                <i className="fas fa-tshirt fa-3x"></i>
                <p>Drag garments here to create an outfit</p>
              </div>
            ) : (
              <div className="canvas-items-free">
                {selectedGarments.map((garment) => (
                  <div 
                    key={garment.id} 
                    className="canvas-item-free"
                    style={{
                      left: `${garment.position?.x || 0}px`,
                      top: `${garment.position?.y || 0}px`,
                      zIndex: garment.zIndex || 0,
                    }}
                    draggable
                    onDragStart={(e) => handleCanvasItemDragStart(e, garment)}
                    onDrag={handleCanvasItemDrag}
                    onDragEnd={handleCanvasItemDragEnd}
                    onClick={() => bringToFront(garment.id)}
                  >
                    <button 
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGarment(garment.id);
                      }}
                      title="Remove from outfit"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    {garment.image_url ? (
                      <img 
                        src={garment.image_url} 
                        alt={garment.name}
                        className="canvas-item-image-free"
                        draggable={false}
                      />
                    ) : (
                      <div className="canvas-item-placeholder-free">
                        <i className="fas fa-tshirt"></i>
                        <p className="no-image-text">{garment.name}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outfit Details Form */}
          {selectedGarments.length > 0 && (
            <div className="outfit-details">
              <h3>Outfit Details</h3>
              <div className="form-group">
                <label>Outfit Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Casual Friday Look"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Occasion</label>
                <select
                  className="form-control"
                  value={outfitOccasion}
                  onChange={(e) => setOutfitOccasion(e.target.value)}
                >
                  <option value="">Select occasion...</option>
                  <option value="casual">Casual</option>
                  <option value="work">Work</option>
                  <option value="formal">Formal</option>
                  <option value="party">Party</option>
                  <option value="date">Date</option>
                  <option value="exercise">Exercise</option>
                  <option value="travel">Travel</option>
                  <option value="special">Special Event</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Add any notes about this outfit..."
                  value={outfitNotes}
                  onChange={(e) => setOutfitNotes(e.target.value)}
                ></textarea>
              </div>
              <button 
                onClick={saveOutfit}
                className="btn btn-primary btn-block"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Outfit
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Garments List - Right Side */}
        <div className="garments-section">
          <div className="garments-header">
            <h2>Available Garments</h2>
            <p className="garment-count">{filteredGarments.length} items</p>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            <label>Filter by Category:</label>
            <select
              className="form-control"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Garments Grid */}
          <div className="garments-grid">
            {filteredGarments.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-tshirt fa-3x"></i>
                <p>No clean garments available</p>
              </div>
            ) : (
              filteredGarments.map((garment) => (
                <div
                  key={garment.id}
                  className={`garment-card ${
                    selectedGarments.find(g => g.id === garment.id) ? 'selected' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, garment)}
                >
                  {garment.image_url ? (
                    <img 
                      src={garment.image_url} 
                      alt={garment.name}
                      className="garment-image"
                    />
                  ) : (
                    <div className="garment-placeholder">
                      <i className="fas fa-tshirt"></i>
                    </div>
                  )}
                  <div className="garment-info">
                    <p className="garment-name">{garment.name}</p>
                    <p className="garment-category">{garment.category_name}</p>
                    <p className="garment-details">
                      {garment.color} • {garment.size}
                    </p>
                  </div>
                  {selectedGarments.find(g => g.id === garment.id) && (
                    <div className="selected-badge">
                      <i className="fas fa-check"></i>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MixMatch;
