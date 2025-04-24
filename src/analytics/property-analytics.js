const Property = require('../models/property.model');

// Podstawowe statystyki cenowe według lokalizacji
async function getPriceStatsByLocation() {
    try {
        return await Property.aggregate([
            {
                $group: {
                    _id: "$address.city",
                    count: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                    medianPricePerSqft: { $avg: "$pricePerSqft" }
                }
            },
            { $sort: { averagePrice: -1 } }
        ]);
    } catch (error) {
        console.error('Błąd podczas generowania statystyk cen:', error);
        throw error;
    }
}

// Analiza trendów czasowych (zakładając, że mamy dane historyczne)
async function getPriceTrendsByMonth(city, monthsBack = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    try {
        return await Property.aggregate([
            {
                $match: {
                    "address.city": city,
                    "lastUpdated": { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$lastUpdated" },
                        month: { $month: "$lastUpdated" }
                    },
                    averagePrice: { $avg: "$price" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
    } catch (error) {
        console.error(`Błąd podczas analizy trendów dla ${city}:`, error);
        throw error;
    }
}

// Korelacja między cechami a ceną
async function getFeatureCorrelation() {
    try {
        const bedroomsCorrelation = await Property.aggregate([
            { $match: { bedrooms: { $gt: 0 }, price: { $gt: 0 } } },
            {
                $group: {
                    _id: "$bedrooms",
                    averagePrice: { $avg: "$price" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const bathroomsCorrelation = await Property.aggregate([
            { $match: { bathrooms: { $gt: 0 }, price: { $gt: 0 } } },
            {
                $group: {
                    _id: "$bathrooms",
                    averagePrice: { $avg: "$price" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const areaCorrelation = await Property.aggregate([
            { $match: { livingArea: { $gt: 0 }, price: { $gt: 0 } } },
            {
                $bucket: {
                    groupBy: "$livingArea",
                    boundaries: [0, 50, 100, 150, 200, 300, 500, 1000],
                    default: "1000+",
                    output: {
                        averagePrice: { $avg: "$price" },
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        return {
            bedroomsCorrelation,
            bathroomsCorrelation,
            areaCorrelation
        };
    } catch (error) {
        console.error('Błąd podczas analizy korelacji:', error);
        throw error;
    }
}

module.exports = {
    getPriceStatsByLocation,
    getPriceTrendsByMonth,
    getFeatureCorrelation
};