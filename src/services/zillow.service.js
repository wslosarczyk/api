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



        // Clean response to remove image data
        const cleanResponse = { ...response.data };

        if (cleanResponse.results && Array.isArray(cleanResponse.results)) {
            cleanResponse.results = cleanResponse.results.map(property => {
                // Remove all image-related fields
                const {
                    imgSrc,
                    carouselPhotos,
                    photos,
                    photoUrls,
                    images,
                    imageUrls,
                    thumbnail,
                    thumbnailUrl,
                    detailUrl,
                    hdpPhotos,
                    ...cleanedProperty
                } = property;

                return cleanedProperty;
            });
        }

        return cleanResponse;
    } catch (error) {
        console.error('Błąd podczas pobierania danych z Zillow API:', error);
        throw new Error('Nie można pobrać danych nieruchomości');
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
        return response.data;
    } catch (error) {
        console.error('Błąd podczas pobierania szczegółów nieruchomości:', error);
        throw new Error('Nie można pobrać szczegółów nieruchomości');
    }
};

module.exports = {
    searchProperties,
    getPropertyDetails
};