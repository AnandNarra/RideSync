const express = require("express");
const connectDB = require("./config/db");

const userRouter = require('./routes/auth.router.js')
const adminRouter = require('./routes/admin.router.js')
const cors = require('cors')
const cookieParser = require('cookie-parser')

require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigin =[
  "http://localhost:5173",
  "https://anand.vercel.app"
];


// CORS options

const corsOptions = {
  origin:(origin , callback) =>{
    if(allowedOrigin.includes(origin) || !origin) {
      callback(null , true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials : true,
};

app.use(cors(corsOptions));

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
