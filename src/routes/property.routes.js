const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');

// Make sure you're using express.Router() not the 'router' npm package
router.get('/search', propertyController.searchProperties);

// Other routes
// router.get('/all', propertyController.getAllProperties);
// router.get('/:id', propertyController.getPropertyById);

module.exports = router;