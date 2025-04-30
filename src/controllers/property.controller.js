const Property = require('../models/Property.model');
const zillowService = require('../services/zillow.service');

const searchProperties = async (req, res, next) => {
    try {
        const { location } = req.query;
        console.log(`Searching for location: ${location}`);

        if (!location) {
            return res.status(400).json({
                success: false,
                message: 'Nie podano lokalizacji do wyszukiwania'
            });
        }

        const response = await zillowService.searchProperties(location);

        // Extract properties from the correct path in the response
        const properties = response.data?.props || [];
        console.log(`Found ${properties.length} properties`);

        // Make sure we have properties to save
        if (properties.length > 0) {
            console.log('Saving properties to database...');
            const savedProperties = [];

            for (const prop of properties) {
                // Generate a unique ID if zpid doesn't exist
                const propId = prop.zpid || `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                try {
                    // Map property to match your schema
                    const propertyData = {
                        zpid: propId,
                        address: prop.address,
                        price: prop.price,
                        bedrooms: prop.bedrooms,
                        propertyType: prop.propertyType,
                        listingStatus: prop.listingStatus
                    };

                    const savedProp = await Property.findOneAndUpdate(
                        { zpid: propId },
                        propertyData,
                        { upsert: true, new: true }
                    );
                    savedProperties.push(savedProp);
                } catch (saveErr) {
                    console.error(`Error saving property:`, saveErr);
                }
            }
            console.log(`Successfully saved ${savedProperties.length} properties`);
        }

        res.status(200).json({
            success: true,
            count: properties.length,
            data: response
        });
    } catch (error) {
        console.error('Search error:', error);
        next(error);
    }
};

module.exports = {
    searchProperties
};