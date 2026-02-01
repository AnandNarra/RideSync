const express = require("express");
const connectDB = require("./config/db");

const userRouter = require('./routes/auth.router.js')
const adminRouter = require('./routes/admin.router.js')
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Database connection
connectDB();



app.use('/api/v1/', userRouter)
app.use('/api/v1/',adminRouter)

// Port
const PORT = process.env.PORT || 5000;

// Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
