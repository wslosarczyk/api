const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    zpid: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    price: Number,
    bedrooms: Number,
    bathrooms: Number,
    livingArea: Number,
    propertyType: String,
    yearBuilt: Number,
    description: String
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);