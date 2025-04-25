const zillowService = require('../services/zillow.service');

/**
 * Wyszukaj nieruchomości
 * GET /api/properties/search?location=new-york
 */
const searchProperties = async (req, res, next) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({
                success: false,
                message: 'Nie podano lokalizacji do wyszukiwania'
            });
        }

        const properties = await zillowService.searchProperties(location);

        res.status(200).json({
            success: true,
            count: properties.results?.length || 0,
            data: properties
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Pobierz szczegóły nieruchomości
 * GET /api/properties/:id
 */
const getPropertyDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const property = await zillowService.getPropertyDetails(id);

        res.status(200).json({
            success: true,
            data: property
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchProperties,
    getPropertyDetails
};