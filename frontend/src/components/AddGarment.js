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
  const [removingBg, setRemovingBg] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);

  useEffect(() => {
    document.title = 'Add Garment - Garmently';
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('About to call apiService.getCategories()...');
      const data = await apiService.getCategories();
      console.log('Fetched categories:', data);
      console.log('Categories type:', typeof data, 'Is array:', Array.isArray(data));
      console.log('Categories length:', data?.length);
      setCategories(data);
      console.log('Categories state updated');
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data, error.message);
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
      setOriginalImage(file);
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

  const removeBackground = async () => {
    if (!originalImage) return;

    setRemovingBg(true);
    setError(null);

    try {
      // Use remove.bg API
      const formData = new FormData();
      formData.append('image_file', originalImage);
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'S4VY4wdgg43h4nvdE3M6KnSD',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Remove.bg error:', errorData);
        
        // Fallback: Use client-side canvas processing for basic background removal
        await removeBackgroundCanvas();
        return;
      }

      const blob = await response.blob();
      const file = new File([blob], originalImage.name.replace(/\.[^/.]+$/, '') + '.png', { type: 'image/png' });
      
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

    } catch (error) {
      console.error('Error removing background:', error);
      
      // Try fallback method
      try {
        await removeBackgroundCanvas();
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setError('Failed to remove background. Please get a free API key from remove.bg/api');
      }
    } finally {
      setRemovingBg(false);
    }
  };

  const removeBackgroundCanvas = async () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple background removal: make white/light pixels transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // If pixel is very light (near white), make it transparent
          const brightness = (r + g + b) / 3;
          if (brightness > 240) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }

        // Put modified image data back
        ctx.putImageData(imageData, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], originalImage.name.replace(/\.[^/.]+$/, '') + '.png', { type: 'image/png' });
            
            setFormData(prev => ({
              ...prev,
              image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result);
              resolve();
            };
            reader.readAsDataURL(file);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imagePreview;
    });
  };

  const restoreOriginal = () => {
    if (originalImage) {
      setFormData(prev => ({
        ...prev,
        image: originalImage
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(originalImage);
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

      console.log('Submitting garment to API...', {
        hasImage: !!formData.image,
        name: formData.name,
        category: formData.category
      });

      const result = await apiService.createGarment(submitData);
      console.log('Garment created successfully:', result);
      navigate('/wardrobe');
    } catch (error) {
      console.error('Error adding garment:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || 'Failed to add garment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="add-garment-page">
      <div className="form-card">
        <div className="form-header">
          <h2><img src="/images/logo.png" alt="Garmently" style={{ width: '32px', height: '32px', marginRight: '0.8rem', verticalAlign: 'middle' }} /><i className="fas fa-plus"></i> Add New Garment</h2>
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
              Upload a photo of your garment. For best results with background removal, use images with solid/light backgrounds.
              Get a free API key from <a href="https://www.remove.bg/users/sign_up" target="_blank" rel="noopener noreferrer">remove.bg</a> for better results.
            </small>
            {imagePreview && (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
                <div className="bg-remove-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-magic"
                    onClick={removeBackground}
                    disabled={removingBg}
                  >
                    {removingBg ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Removing Background...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic"></i> Remove Background
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={restoreOriginal}
                    disabled={removingBg}
                  >
                    <i className="fas fa-undo"></i> Restore Original
                  </button>
                </div>
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
