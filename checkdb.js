const mongoose = require('mongoose');
require('dotenv').config();
const Property = require('./src/models/Property.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nieruchomosci');
        console.log('Connected to MongoDB');

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Check Property model
        const count = await Property.countDocuments();
        console.log(`Number of properties: ${count}`);

        if (count > 0) {
            const properties = await Property.find().limit(3);
            console.log('Sample properties:', JSON.stringify(properties, null, 2));
        } else {
            console.log('No properties found in the database');
        }

    } catch (err) {
        console.error('MongoDB connection error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
};

connectDB();