const axios = require('axios');
require('dotenv').config();

const zillowAPI = axios.create({
    baseURL: 'https://zillow-com1.p.rapidapi.com',
    headers: {
        'X-RapidAPI-Key': process.env.ZILLOW_API_KEY,
        'X-RapidAPI-Host': process.env.ZILLOW_API_HOST
    }
});

/**
 * Funkcja do transformacji danych - usuwa niechciane pola, takie jak 'photos'
 * @param {Array} properties - Lista nieruchomości do przetworzenia
 */
const transformProperties = (properties) => {
    return properties.map(property => {
        const { photos, ...filteredProperty } = property; // Usuwamy pole 'photos'
        return filteredProperty;
    });
};

/**
 * Wyszukiwanie nieruchomości na podstawie lokalizacji
 * @param {string} location - Lokalizacja (np. miasto, dzielnica)
 */
const searchProperties = async (location) => {
    try {
        const response = await zillowAPI.get('/propertyExtendedSearch', {
            params: { location }
        });

        // Create a filtered response structure that matches the original
        const cleanResponse = {
            success: true,
            data: {}
        };

        // Check if the response has the expected structure
        if (response.data && response.data.props && Array.isArray(response.data.props)) {
            // Map only the fields we want from each property
            cleanResponse.data.props = response.data.props.map(property => {
                return {
                    propertyType: property.propertyType,
                    address: property.address,
                    price: property.price,
                    bedrooms: property.bedrooms,
                    listingStatus: property.listingStatus,
                    country: property.country
                };
            });
        } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
            // Alternative structure - some APIs return results instead of props
            cleanResponse.data.props = response.data.results.map(property => {
                return {
                    propertyType: property.propertyType,
                    address: property.address,
                    price: property.price,
                    bedrooms: property.bedrooms,
                    listingStatus: property.listingStatus,
                    country: property.country
                };
            });
        } else {
            cleanResponse.data.props = [];
        }

        return cleanResponse;
    } catch (error) {
        console.error('Error fetching property data from Zillow API:', error);
        throw new Error('Could not retrieve property data');
    }
};

/**
 * Pobieranie szczegółów nieruchomości na podstawie ID
 * @param {string} zpid - Zillow Property ID
 */
const getPropertyDetails = async (zpid) => {
    try {
        const response = await zillowAPI.get('/property', {
            params: { zpid }
        });

        // Extract only the fields we want
        const {
            propertyType,
            address,
            price,
            bedrooms,
            listingStatus,
            country
        } = response.data;

        // Return only the selected fields
        return {
            propertyType,
            address,
            price,
            bedrooms,
            listingStatus,
            country
        };
    } catch (error) {
        console.error('Błąd podczas pobierania szczegółów nieruchomości:', error);
        throw new Error('Nie można pobrać szczegółów nieruchomości');
    }
};

module.exports = {
    searchProperties,
    getPropertyDetails
};