const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Drop the old numberPlate index
        try {
            await mongoose.connection.db.collection('drivers').dropIndex('numberPlate_1');
            console.log('✅ Successfully dropped numberPlate_1 index');
        } catch (error) {
            console.log('Error dropping index:', error.message);
        }

        // Close connection
        await mongoose.connection.close();
        console.log('Connection closed');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });
