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

        // Przetwarzamy dane, aby usunąć obrazki
        const transformedData = transformProperties(response.data.results || []);
        return {
            ...response.data,
            results: transformedData // Zwracamy przetworzone wyniki
        };
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