const zillowService = require('../services/zillow.service');
const Property = require('../models/property.model');
const fs = require('fs');
const path = require('path');

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

// Funkcja do transformacji danych
function transformProperties(rawData) {
    console.log('Rozpoczynam transformację danych...');

    if (!rawData.results || !Array.isArray(rawData.results)) {
        console.warn('Brak wyników do transformacji');
        return [];
    }

    // Transformacja danych - przykładowo normalizacja i wzbogacenie
    return rawData.results.map(property => ({
        zpid: property.zpid,
        address: {
            street: property.address?.streetAddress || '',
            city: property.address?.city || '',
            state: property.address?.state || '',
            zipcode: property.address?.zipcode || ''
        },
        price: property.price || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        livingArea: property.livingArea || 0,
        propertyType: property.propertyType || 'unknown',
        yearBuilt: property.yearBuilt || null,
        hasGarage: property.hasGarage || false,
        hasPool: property.hasPool || false,
        // Dodane pola wzbogacające dane
        pricePerSqft: property.livingArea ? Math.round(property.price / property.livingArea) : null,
        isNewConstruction: property.yearBuilt && new Date().getFullYear() - property.yearBuilt <= 3,
        dataQualityScore: calculateDataQualityScore(property),
        lastUpdated: new Date()
    }));
}

// Pomocnicza funkcja do wyliczania jakości danych
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

// Funkcja do ładowania danych do bazy danych
async function loadDataToDb(transformedData) {
    console.log(`Ładowanie ${transformedData.length} rekordów do bazy danych...`);

    try {
        // Opcjonalnie: wyczyść kolekcję przed załadowaniem nowych danych
        // await Property.deleteMany({});

        // Użyj bulkWrite dla wydajnego zapisu wielu rekordów
        const operations = transformedData.map(property => ({
            updateOne: {
                filter: { zpid: property.zpid },
                update: { $set: property },
                upsert: true // Stwórz jeśli nie istnieje
            }
        }));

        if (operations.length > 0) {
            const result = await Property.bulkWrite(operations);
            console.log(`Załadowano dane do bazy. Zmodyfikowano: ${result.modifiedCount}, Wstawiono: ${result.upsertedCount}`);
            return result;
        } else {
            console.log('Brak danych do załadowania');
            return null;
        }
    } catch (error) {
        console.error('Błąd podczas ładowania danych do bazy:', error);
        throw error;
    }
}

// Główna funkcja ETL
async function runETLPipeline(location = 'warszawa') {
    try {
        console.log('Uruchamiam pipeline ETL...');

        // 1. Extract - pobierz dane
        const rawFileName = `${location.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;
        const rawData = await extractDataToFile(location, rawFileName);

        // 2. Transform - przekształć dane
        const transformedData = transformProperties(rawData);

        // Zapisz przetworzone dane do pliku (opcjonalnie)
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
    }
}

module.exports = {
    runETLPipeline,
    extractDataToFile,
    transformProperties,
    loadDataToDb
};