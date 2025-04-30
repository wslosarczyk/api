const zillowService = require('../services/zillow.service');
const Property = require('../models/property.model');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Funkcja do połączenia z bazą danych
async function connectToDatabase() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect('mongodb://localhost:27017/yourdbname', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 15000, // Zwiększony timeout
                socketTimeoutMS: 45000,
            });
            console.log('Połączono z MongoDB');
        }
        return mongoose.connection;
    } catch (error) {
        console.error('Błąd połączenia z MongoDB:', error);
        throw error;
    }
}

// Funkcja do ekstrakcji danych z API i zapisania ich do pliku
async function extractDataToFile(location, outputFileName) {
    try {
        console.log(`Rozpoczynam ekstrakcję danych dla lokalizacji: ${location}`);
        const data = await zillowService.searchProperties(location);

        // Zapisz surowe dane do pliku JSON
        const outputPath = path.join(__dirname, '../../data/raw', outputFileName);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

        console.log(`Dane zapisane do: ${outputPath}`);
        return data;
    } catch (error) {
        console.error('Błąd podczas ekstrakcji danych:', error);
        throw error;
    }
}

function transformProperties(rawData) {
    console.log('Rozpoczynam transformację danych...');

    // Extract properties from the correct location in the data structure
    const properties = rawData.data?.props || [];

    if (!properties.length) {
        console.warn('Brak wyników do transformacji');
        return [];
    }

    // Transform the data
    return properties.map(property => ({
        zpid: property.zpid || `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        address: property.address || '',
        price: property.price || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        propertyType: property.propertyType || 'unknown',
        listingStatus: property.listingStatus || '',
        country: property.country || '',
        // Add other fields as needed
        lastUpdated: new Date()
    }));
}

function calculateDataQualityScore(property) {
    let score = 0;
    if (property.price) score += 20;
    if (property.bedrooms) score += 10;
    if (property.bathrooms) score += 10;
    if (property.livingArea) score += 15;
    if (property.yearBuilt) score += 10;
    if (property.address?.streetAddress) score += 15;
    if (property.address?.city) score += 10;
    if (property.address?.state) score += 5;
    if (property.address?.zipcode) score += 5;
    return score;
}

// Zmodyfikowana funkcja do ładowania danych do bazy danych
async function loadDataToDb(transformedData) {
    console.log(`Ładowanie ${transformedData.length} rekordów do bazy danych...`);

    try {
        // Najpierw upewnij się, że połączenie z bazą danych jest aktywne
        await connectToDatabase();

        // Użyj insertMany zamiast bulkWrite dla prostszej operacji
        const result = await Property.insertMany(transformedData, {
            ordered: false  // Kontynuuj nawet jeśli niektóre dokumenty mają błędy
        });

        console.log(`Załadowano ${result.length} rekordów do bazy danych`);
        return result;
    } catch (error) {
        console.error('Błąd podczas ładowania danych do bazy:', error);
        throw error;
    }
}

async function runETLPipeline(location = 'warszawa') {
    try {
        console.log('Uruchamiam pipeline ETL...');

        // 1. Extract - pobierz dane
        const rawFileName = `${location.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;
        const rawData = await extractDataToFile(location, rawFileName);

        // 2. Transform - przekształć dane
        const transformedData = transformProperties(rawData);

        // Zapisz przetworzone dane do pliku
        const transformedPath = path.join(__dirname, '../../data/processed', rawFileName);
        fs.mkdirSync(path.dirname(transformedPath), { recursive: true });
        fs.writeFileSync(transformedPath, JSON.stringify(transformedData, null, 2));

        // 3. Load - załaduj do bazy danych
        if (transformedData.length > 0) {
            await loadDataToDb(transformedData);
        }

        console.log('Pipeline ETL zakończony sukcesem!');
        return {
            extractedCount: rawData.results?.length || 0,
            transformedCount: transformedData.length,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Błąd podczas wykonywania ETL:', error);
        throw error;
    } finally {
        // Opcjonalnie, zamknij połączenie jeśli nie jest potrzebne gdzie indziej
        // await mongoose.connection.close();
    }
}

module.exports = {
    runETLPipeline,
    extractDataToFile,
    transformProperties,
    loadDataToDb
};