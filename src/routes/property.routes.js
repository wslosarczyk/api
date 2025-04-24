const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');

// GET /api/properties/search?location=warszawa
router.get('/search', propertyController.searchProperties);

// GET /api/properties/:id
router.get('/:id', propertyController.getPropertyDetails);

module.exports = router;