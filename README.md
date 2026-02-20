# 🚗 RideSync

RideSync is a premium, modern ride-sharing platform built with the MERN stack (MongoDB, Express, React, Node.js). It offers a seamless experience for both drivers and passengers, featuring real-time chat, interactive maps, and a robust driver approval system.

## ✨ Key Features

### 👤 For Passengers
- **📍 Smart Search**: Quick location discovery with Mapbox Geocoding.
- **🗺️ Interactive Map**: Real-time route visualization using Mapbox GL JS.
- **🛣️ Multiple Routes**: Choose from various route alternatives for your destination.
- **💬 Real-time Chat**: Instant communication with drivers after booking confirmation.
- **🗂️ Booking Management**: View and track your past and upcoming rides.

### 🚘 For Drivers
- **📝 Publish Rides**: Effortlessly offer available seats on your planned routes.
- **📬 Request Management**: Review and accept/reject passenger booking requests.
- **👨‍💼 Driver Profiles**: Formal verification process for trust and safety.
- **💬 Direct Chat**: Chat with confirmed passengers directly within the app.

### 🛠️ Admin Features
- **📊 Analytics Dashboard**: Monitor user activity, ride statistics, and platform growth.
- **✅ Driver Verification**: Review and approve/reject driver applications.
- **🛡️ Content Management**: Full control over platform listings and users.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js + Vite
- **Styling**: TailwindCSS + Framer Motion (for premium animations)
- **Maps**: Mapbox GL JS + React Leaflet
- **State Management**: React Query (TanStack Query) + Context API
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (AccessToken & RefreshToken) + Bcrypt
- **Files**: Cloudinary + Multer (for profile photos and documents)
- **Reliability**: Zod (Validation), Nodemailer (Email notifications)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB
- Mapbox Access Token
- Cloudinary Account

### 📂 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/RideSync.git
   cd RideSync
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   # Create .env file with following keys:
   # PORT=5000
   # MONGODB_URL=your_mongodb_url
   # JWT_Secret=your_secret
   # CLOUDINARY_CLOUD_NAME=name
   # CLOUDINARY_API_KEY=key
   # CLOUDINARY_API_SECRET=secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd Appwrite
   npm install
   # Create .env file with following keys:
   # VITE_MAPBOX_KEY=your_mapbox_key
   # VITE_API_URL=http://localhost:5000/api
   npm run dev
   ```

## 🏗️ Project Structure

```text
RideSync/
├── Appwrite/               # Frontend React Application
│   ├── src/
│   │   ├── pages/         # User, Driver, and Admin Dashboards
│   │   ├── components/    # Reusable UI components
│   │   ├── api's/         # React Query API integrations
│   │   └── store/         # Global state management
│   └── ...
└── Backend/                # Node.js Express API
    ├── src/
    │   ├── controllers/   # Business logic
    │   ├── models/        # Mongoose schemas
    │   ├── routes/        # API endpoints
    │   └── middlewares/   # Auth and error handling
    └── ...
```

## 📄 License

This project is licensed under the MIT License.
