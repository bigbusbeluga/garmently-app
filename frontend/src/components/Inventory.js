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
        <h1><img src="/images/logo.png" alt="Garmently" style={{ width: '35px', height: '35px', marginRight: '0.8rem', verticalAlign: 'middle' }} /><i className="fas fa-tshirt"></i> My Wardrobe</h1>
        <Link to="/add-garment" className="btn btn-add-minimal" title="Add Garment">
          <i className="fas fa-plus"></i>
        </Link>
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
                <Link to="/add-garment" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Add Your First Garment
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
                    <button className="btn-action btn-edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-action btn-wear">
                      <i className="fas fa-check"></i> Wear
                    </button>
                    <button className="btn-action btn-delete">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
