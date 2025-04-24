const express = require('express');
const router = express.Router();
const propertyAnalytics = require('../analytics/property-analytics');

// GET /api/analytics/price-stats
router.get('/price-stats', async (req, res, next) => {
    try {
        const stats = await propertyAnalytics.getPriceStatsByLocation();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/price-trends/:city?monthsBack=12
router.get('/price-trends/:city', async (req, res, next) => {
    try {
        const { city } = req.params;
        const monthsBack = parseInt(req.query.monthsBack) || 12;

        const trends = await propertyAnalytics.getPriceTrendsByMonth(city, monthsBack);
        res.status(200).json({
            success: true,
            data: trends
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/feature-correlation
router.get('/feature-correlation', async (req, res, next) => {
    try {
        const correlation = await propertyAnalytics.getFeatureCorrelation();
        res.status(200).json({
            success: true,
            data: correlation
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;