const express = require('express');
const router = express.Router(); // This line is missing
const zillowService = require('../services/zillow.service');

router.get('/search', async (req, res, next) => {
    try {
        const { location } = req.query;
        if (!location) {
            return res.status(400).json({
                success: false,
                error: 'Location parameter is required'
            });
        }

        const properties = await zillowService.searchProperties(location);

        // Return the already filtered data directly
        res.json(properties);
    } catch (error) {
        next(error);
    }
});

router.get('/:zpid', async (req, res, next) => {
    try {
        const { zpid } = req.params;
        const property = await zillowService.getPropertyDetails(zpid);

        res.json({
            success: true,
            data: property
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; // Make sure to export the router