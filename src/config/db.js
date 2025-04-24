const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Połączono z bazą danych MongoDB');
    } catch (error) {
        console.error('Błąd podczas łączenia z bazą danych:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;