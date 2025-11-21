import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './AddGarment.css';

function AddGarment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    color: '',
    size: 'M',
    brand: '',
    price: '',
    season: 'all',
    material: '',
    care_instructions: '',
    purchase_date: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      await apiService.createGarment(submitData);
      navigate('/wardrobe');
    } catch (error) {
      console.error('Error adding garment:', error);
      setError('Failed to add garment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="add-garment-page">
      <div className="form-card">
        <div className="form-header">
          <h2><i className="fas fa-plus"></i> Add New Garment</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="garment-form">
          {error && (
            <div className="error-alert">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter garment name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">Color *</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g., Navy Blue, Black"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="size">Size *</label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
              >
                <option value="XS">Extra Small</option>
                <option value="S">Small</option>
                <option value="M">Medium</option>
                <option value="L">Large</option>
                <option value="XL">Extra Large</option>
                <option value="XXL">Double Extra Large</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Brand name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="season">Season</label>
              <select
                id="season"
                name="season"
                value={formData.season}
                onChange={handleChange}
              >
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="autumn">Autumn</option>
                <option value="winter">Winter</option>
                <option value="all">All Seasons</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="purchase_date">Purchase Date</label>
              <input
                type="date"
                id="purchase_date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="material">Material</label>
            <input
              type="text"
              id="material"
              name="material"
              value={formData.material}
              onChange={handleChange}
              placeholder="e.g., Cotton, Polyester"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this garment..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="care_instructions">Care Instructions</label>
            <textarea
              id="care_instructions"
              name="care_instructions"
              value={formData.care_instructions}
              onChange={handleChange}
              placeholder="Washing and care instructions..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
            />
            <small className="form-text">
              Upload a photo of your garment. Images will be stored securely on AWS S3.
            </small>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/wardrobe')}
            >
              <i className="fas fa-arrow-left"></i> Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Garment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGarment;
