# RideSync

A modern ride-sharing application built with React and Node.js.

## Features

- 🗺️ **Interactive Map** - Mapbox integration for route visualization
- 🚗 **Multiple Route Options** - Choose from different route alternatives
- 📍 **Location Autocomplete** - Smart location search with Mapbox Geocoding
- 🔐 **User Authentication** - Secure login and registration
- 🎨 **Modern UI** - Clean and responsive design

## Tech Stack

### Frontend
- React + Vite
- Mapbox GL JS
- React Leaflet
- TailwindCSS

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Zod for validation

## Getting Started

### Frontend Setup
```bash
cd Appwrite
npm install
npm run dev
```

### Backend Setup
```bash
cd Backend
npm install
npm run dev
```

## Environment Variables

### Frontend (.env)
```
VITE_MAPBOX_KEY=your_mapbox_access_token
```

### Backend (.env)
```
MONGODB_URL=your_mongodb_connection_string
PORT=5000
JWT_Secret=your_jwt_secret
```

## Project Structure

```
RideSync/
├── Appwrite/          # Frontend React application
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── utils/     # Utility components
│   │   └── ...
│   └── ...
└── Backend/           # Node.js backend API
    ├── controllers/   # Route controllers
    ├── models/        # Database models
    ├── routes/        # API routes
    ├── middlewares/   # Custom middlewares
    └── ...
```

## License

MIT
