

const mongoose = require('mongoose'); // Corrected require statement
require('dotenv').config(); 

const connectDB = async () => {
    try {
        // Corrected mongoose.connect call, also a common env var name is MONGODB_URL
        await mongoose.connect(process.env.MONGODB_URL); 
        console.log('MongoDb connected successfully....'); 
    } catch (error) {
        console.log('mongoDb connection failed....', error);
        // It's good practice to exit the process if the connection fails
        process.exit(1);
    }
};

module.exports = connectDB;
