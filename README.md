# Garmently - React + Django Full-Stack Application

A full-stack web application built with React (TypeScript) frontend and Django REST API backend.

## Project Structure

```
Garmently/
├── backend/           # Django REST API
│   ├── api/          # Django app with API endpoints
│   ├── garmently_backend/  # Django project settings
│   ├── manage.py     # Django management script
│   └── requirements.txt
├── frontend/         # React TypeScript application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service functions
│   │   └── ...
│   ├── package.json
│   └── ...
└── README.md
```

## Features

- **Backend (Django)**:
  - REST API with Django REST Framework
  - CORS enabled for frontend communication
  - Sample garments API endpoints
  - SQLite database (development)

- **Frontend (React)**:
  - TypeScript for type safety
  - Tailwind CSS for styling
  - Axios for API communication
  - Responsive design

## Setup Instructions

### Backend Setup (Django)

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```

2. The Python virtual environment should already be configured. If not, run:
   ```powershell
   # The environment is already set up at: C:/Users/ojena/Desktop/Garmently/.venv/
   ```

3. Install dependencies (if not already installed):
   ```powershell
   # Dependencies are already installed: django, djangorestframework, django-cors-headers, python-dotenv, pillow
   ```

4. Run migrations (if not already done):
   ```powershell
   C:/Users/ojena/Desktop/Garmently/.venv/Scripts/python.exe manage.py migrate
   ```

5. Start the Django development server:
   ```powershell
   C:/Users/ojena/Desktop/Garmently/.venv/Scripts/python.exe manage.py runserver
   ```

   The backend will be available at: `http://localhost:8000`

### Frontend Setup (React)

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Dependencies are already installed. If you need to install them again:
   ```powershell
   npm install
   ```

3. Start the React development server:
   ```powershell
   npm start
   ```

   The frontend will be available at: `http://localhost:3000`

## API Endpoints

- `GET /api/hello/` - Test connection endpoint
- `GET /api/status/` - API status information
- `GET /api/garments/` - Get all garments
- `POST /api/garments/` - Create new garment

## Running the Full Application

1. **Start the Django backend** (in one terminal):
   ```powershell
   cd backend
   C:/Users/ojena/Desktop/Garmently/.venv/Scripts/python.exe manage.py runserver
   ```

2. **Start the React frontend** (in another terminal):
   ```powershell
   cd frontend
   npm start
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/

## Technology Stack

### Backend
- **Django 5.2.7** - Web framework
- **Django REST Framework** - API development
- **django-cors-headers** - CORS handling
- **SQLite** - Database (development)

### Frontend
- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Development Notes

- The backend runs on port 8000
- The frontend runs on port 3000
- CORS is configured to allow communication between frontend and backend
- The application includes sample data for testing the integration

## Next Steps

To extend this application, you can:

1. Add user authentication
2. Implement CRUD operations for garments
3. Add image upload functionality
4. Implement search and filtering
5. Add a proper database (PostgreSQL, MySQL)
6. Deploy to production (Heroku, AWS, etc.)

## Troubleshooting

- **CORS errors**: Make sure the Django server is running and CORS is properly configured
- **Module not found**: Ensure all dependencies are installed
- **Port conflicts**: Change the ports in settings if needed