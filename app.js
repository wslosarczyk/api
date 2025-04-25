const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const propertyRoutes = require('./src/routes/property.routes');
const errorHandler = require('./src/middleware/errorHandler');
const connectDB = require('./src/config/db'); // Odkomentuj jeśli używasz MongoDB

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/properties', propertyRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({ message: 'Witaj w API Nieruchomości' });
});

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
    connectDB();
    console.log('Połączono z bazą danych MongoDB');
});