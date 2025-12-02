import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';
import './Inventory.css';

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All', 'Favorites']);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    document.title = 'Wardrobe - Garmently';
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await apiService.getGarments();
      console.log('Fetched garments:', data);
      if (data.length > 0) {
        console.log('First garment image_url:', data[0].image_url);
        console.log('First garment image:', data[0].image);
        console.log('First garment category_name:', data[0].category_name);
      }
      setItems(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Backend not connected.');
      setLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiService.deleteGarment(deletingItem.id);
      setItems(items.filter(item => item.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (err) {
      console.error('Error deleting garment:', err);
      alert('Failed to delete garment. Please try again.');
      setDeletingItem(null);
    }
  };

  const handleWear = async (itemId) => {
    try {
      await apiService.wearGarment(itemId);
      // Refresh items to show updated wear count
      fetchItems();
    } catch (err) {
      console.error('Error marking garment as worn:', err);
      alert('Failed to mark as worn. Please try again.');
    }
  };

  const handleToggleFavorite = async (itemId) => {
    try {
      const updatedGarment = await apiService.toggleFavorite(itemId);
      setItems(items.map(item => 
        item.id === itemId ? updatedGarment : item
      ));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to toggle favorite. Please try again.');
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      color: item.color,
      size: item.size,
      brand: item.brand || '',
      status: item.status || 'clean'
    });
    setEditImage(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('category', editForm.category);
      formData.append('color', editForm.color);
      formData.append('size', editForm.size);
      formData.append('brand', editForm.brand);
      formData.append('status', editForm.status);
      
      if (editImage) {
        formData.append('image', editImage);
      }

      await apiService.updateGarment(editingItem.id, formData);
      setEditingItem(null);
      setEditForm({});
      setEditImage(null);
      fetchItems();
    } catch (err) {
      console.error('Error updating garment:', err);
      alert('Failed to update garment. Please try again.');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      console.log('Fetched categories:', data);
      // Build category list: All, Favorites, then actual categories from DB
      if (Array.isArray(data) && data.length > 0) {
        const categoryNames = data.map(cat => cat.name);
        setCategories(['All', 'Favorites', ...categoryNames]);
        console.log('Categories set to:', ['All', 'Favorites', ...categoryNames]);
      } else {
        console.warn('No categories returned, using fallback');
        setCategories(['All', 'Favorites']);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to default categories if fetch fails
      setCategories(['All', 'Favorites']);
    }
  };

  // Filter items based on selected category
  const filteredItems = React.useMemo(() => {
    console.log('Filtering with category:', selectedCategory);
    console.log('Total items:', items.length);
    
    if (selectedCategory === 'All') {
      return items;
    }
    
    if (selectedCategory === 'Favorites') {
      const favorites = items.filter(item => item.is_favorite);
      console.log('Filtered favorites:', favorites.length);
      return favorites;
    }
    
    // Filter by category name
    const filtered = items.filter(item => {
      const matches = item.category_name === selectedCategory;
      if (!matches) {
        console.log(`Item "${item.name}" category_name: "${item.category_name}" vs selected: "${selectedCategory}"`);
      }
      return matches;
    });
    
    console.log(`Filtered ${filtered.length} items for category: ${selectedCategory}`);
    return filtered;
  }, [items, selectedCategory]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <h1>Loading your wardrobe...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="wardrobe-page">
      <div className="wardrobe-header">
        <h1><i className="fas fa-tshirt"></i> My Wardrobe</h1>
        <p>Manage your digital closet</p>
      </div>

      <div className="wardrobe-content">
        {/* Category Filter */}
        <aside className="category-filter-sidebar">
          <h2 className="filter-title">Category</h2>
          <ul className="filter-list">
            {categories.map(category => (
              <li key={category}>
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`filter-item ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Items Grid */}
        <div className="wardrobe-items">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
            </div>
          )}

          <div className="items-grid">
            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-tshirt fa-4x"></i>
                <h2>No garments found</h2>
                <p>Start building your digital wardrobe!</p>
                <Link to="/add-garment" className="empty-state-link">
                  Add your first garment
                </Link>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="garment-card">
                  <span className={`status-badge-top status-${item.status || 'clean'}`}>
                    {item.status || 'clean'}
                  </span>
                  
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="garment-image"
                      onError={(e) => {
                        console.error('Image failed to load:', item.image_url);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  <div 
                    className="garment-placeholder" 
                    style={{ display: item.image_url ? 'none' : 'flex' }}
                  >
                    <i className="fas fa-tshirt"></i>
                    <small>No Image</small>
                  </div>
                  
                  <div className="garment-info">
                    <h6 className="garment-name">
                      {item.name}
                      {item.is_favorite && <i className="fas fa-heart text-danger"></i>}
                    </h6>
                    <p className="garment-details">
                      <small>
                        <i className="fas fa-tag"></i> {item.category_name || 'Uncategorized'}<br />
                        <i className="fas fa-palette"></i> {item.color} • {item.size}<br />
                        {item.brand && <><i className="fas fa-copyright"></i> {item.brand}<br /></>}
                        <i className="fas fa-calendar"></i> Worn {item.times_worn || 0} time{item.times_worn !== 1 ? 's' : ''}
                      </small>
                    </p>
                  </div>
                  
                  <div className="garment-actions">
                    <button 
                      className={`btn-action btn-favorite ${item.is_favorite ? 'active' : ''}`}
                      onClick={() => handleToggleFavorite(item.id)}
                      title="Toggle favorite"
                    >
                      <i className={`fa${item.is_favorite ? 's' : 'r'} fa-heart`}></i>
                    </button>
                    <button 
                      className="btn-action btn-edit" 
                      onClick={() => handleEditClick(item)}
                      title="Edit garment"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn-action btn-wear"
                      onClick={() => handleWear(item.id)}
                      title="Mark as worn"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteClick(item)}
                      title="Delete garment"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Garment</h3>
              <button className="modal-close" onClick={() => setEditingItem(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  value={editForm.color}
                  onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Size</label>
                <input
                  type="text"
                  value={editForm.size}
                  onChange={(e) => setEditForm({...editForm, size: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={editForm.brand}
                  onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  required
                >
                  <option value="clean">Clean</option>
                  <option value="dirty">Dirty</option>
                  <option value="washing">Washing</option>
                </select>
              </div>
              <div className="form-group">
                <label>New Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="modal-overlay" onClick={() => setDeletingItem(null)}>
          <div className="modal-content modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Garment</h3>
              <button className="modal-close" onClick={() => setDeletingItem(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p className="delete-message">
                Are you sure you want to delete <strong>{deletingItem.name}</strong>?
              </p>
              <p className="delete-warning">
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeletingItem(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
