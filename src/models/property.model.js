const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    zpid: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: Object,
        required: true
    },
    bedrooms: Number,
    bathrooms: Number,
    livingArea: Number,
    price: Number,
    description: String,
    photos: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Property', PropertySchema);