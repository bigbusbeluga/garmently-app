# 🎨 Garmently Frontend - Backend Connection Guide

## Overview
Your Garmently app now has a complete frontend that matches the backend design! Here's how everything works together:

## 🌐 Architecture

### Backend (Django) - Port 8000
- **Purpose**: API server + Admin panel
- **URL**: http://127.0.0.1:8000
- **What it does**:
  - Provides REST API endpoints (`/api/garments/`, `/api/categories/`)
  - Django Admin panel for database management
  - User authentication
  - File storage (images)

### Frontend (React) - Port 3000
- **Purpose**: User interface
- **URL**: http://localhost:3000
- **What it does**:
  - Beautiful UI matching backend design
  - Fetches data from backend API
  - Router-based navigation
  - Component-based architecture

## 📁 Frontend Structure

```
frontend/src/
├── App.js                      # Main app with routing & layout
├── App.css                     # Global styles (backend-inspired)
├── components/
│   ├── Dashboard.js            # Home page with stats
│   ├── Dashboard.css
│   ├── Inventory.js            # Wardrobe page
│   └── Inventory.css
└── services/
    └── api.js                  # Backend API connection
```

## 🔗 How Frontend Connects to Backend

### 1. API Service (`src/services/api.js`)
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Fetches garments from backend
apiService.getGarments() → GET http://localhost:8000/api/garments/
```

### 2. Components Use API Service
```javascript
// In Dashboard.js or Inventory.js
import { apiService } from '../services/api';

const garments = await apiService.getGarments();
// Now you have backend data in React!
```

### 3. Backend API Endpoints
Your Django backend provides these endpoints:
- `GET /api/garments/` - List all garments
- `POST /api/garments/` - Create new garment
- `GET /api/categories/` - List categories
- `GET /api/garments/{id}/` - Get specific garment
- `PUT /api/garments/{id}/` - Update garment
- `DELETE /api/garments/{id}/` - Delete garment

## 🎯 What Users See

### Navigation Flow:
1. **Dashboard (/)** → Stats overview, recent items
2. **Wardrobe (/wardrobe)** → All garments with filters
3. **Outfits (/outfits)** → Placeholder (to be built)
4. **Laundry (/laundry)** → Placeholder (to be built)
5. **Mix & Match (/mixmatch)** → Placeholder (to be built)
6. **Add Garment (/add-garment)** → Placeholder (to be built)

### Design Features:
✅ Purple gradient sidebar (matching backend)
✅ Top navbar with branding
✅ Stats cards on dashboard
✅ Garment grid with images
✅ Category filters
✅ Status badges (clean/dirty/washing)
✅ Action buttons (edit/wear/delete)
✅ Responsive design

## 🚀 Running the App

### Start Both Servers:

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
# Runs on http://127.0.0.1:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### What You'll See:
- Open http://localhost:3000 in your browser
- Frontend will automatically fetch data from backend
- If backend is down, you'll see an error message
- If backend has no data, you'll see empty state

## 🔧 CORS Configuration

Your backend needs CORS enabled for frontend to connect:

**backend/garmently_backend/settings.py:**
```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

## 📊 Data Flow Example

1. **User opens Dashboard**
   - Dashboard.js calls `apiService.getGarments()`
   - API service sends GET request to `http://localhost:8000/api/garments/`
   - Backend returns JSON: `[{id: 1, name: "Blue Shirt", ...}, ...]`
   - Dashboard displays stats and recent items

2. **User clicks "Wardrobe"**
   - Router navigates to `/wardrobe`
   - Inventory.js calls `apiService.getGarments()`
   - Same backend data displayed in grid view
   - User can filter by category

3. **User filters by "Tops"**
   - Frontend filters data locally (no backend call needed)
   - Only "Tops" items shown in grid

## 🎨 Design Matching Backend

The frontend now looks like the Django dashboard because:
- **Purple gradient theme** (same colors)
- **White card layouts** (same style)
- **Bootstrap-inspired components** (buttons, badges)
- **FontAwesome icons** (same icons)
- **Similar spacing and shadows**

## 🔮 Next Steps

### To Complete the App:
1. **Add Garment Form** - Create component to add new items
2. **Edit Garment** - Make edit functionality work
3. **Delete Garment** - Connect delete button to API
4. **Image Upload** - Handle file uploads
5. **Authentication** - Add login/signup
6. **Outfits Page** - Build outfit creation
7. **Laundry Page** - Track dirty items
8. **Mix & Match** - AI outfit suggestions

### To Deploy:
1. Deploy backend to Vercel (serverless)
2. Deploy frontend to Vercel (static)
3. Update `REACT_APP_API_URL` environment variable
4. Configure CORS for production domain

## 🎓 Key Concepts

### Why Two Servers?
- **Separation of Concerns**: Backend handles data, frontend handles UI
- **Flexibility**: Can deploy separately
- **Scalability**: Frontend can be cached (CDN), backend scales independently
- **Development**: Different teams can work on each

### API Communication
- Frontend uses **fetch/axios** to make HTTP requests
- Backend responds with **JSON data**
- React **state management** stores the data
- Components **re-render** when data changes

### Production Setup
- Backend: Python server (Django)
- Frontend: Static files (HTML/CSS/JS)
- Users only see frontend
- Frontend talks to backend API behind the scenes

## ✅ Verification

**Backend is working when:**
- ✅ http://127.0.0.1:8000/api/garments/ returns JSON
- ✅ Django admin accessible at http://127.0.0.1:8000/admin/

**Frontend is working when:**
- ✅ http://localhost:3000 shows UI
- ✅ No console errors in browser DevTools
- ✅ Data loads from backend (or shows proper error)

**Connection is working when:**
- ✅ Dashboard shows actual garment counts
- ✅ Wardrobe shows garment cards with data
- ✅ No "Backend not connected" error messages

---

🎉 **Your app is now fully connected!** Users will see the beautiful React frontend which gets all its data from the Django backend API.
