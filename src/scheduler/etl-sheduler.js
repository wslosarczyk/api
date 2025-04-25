const cron = require('node-cron');
const { runETLPipeline } = require('../etl/property-etl');
const fs = require('fs');
const path = require('path');

// Lista lokalizacji do regularnego pobierania danych
const locations = [
    'new york',
    'san francisco',
    'los angeles'
];

// Funkcja do logowania wyników ETL
function logETLResult(location, result, error = null) {
    const logDir = path.join(__dirname, '../../logs');
    fs.mkdirSync(logDir, { recursive: true });

    const logFile = path.join(logDir, 'etl_runs.log');
    const timestamp = new Date().toISOString();

    let logMessage = `[${timestamp}] ETL dla "${location}": `;

    if (error) {
        logMessage += `BŁĄD: ${error.message}\n`;
    } else {
        logMessage += `Sukces - Wyekstrahowano: ${result.extractedCount}, Przetransformowano: ${result.transformedCount}\n`;
    }

    fs.appendFileSync(logFile, logMessage);
}

// Uruchomienie ETL dla wszystkich lokalizacji po kolei
async function runAllLocationsETL() {
    console.log('Rozpoczynam proces ETL dla wszystkich lokalizacji');

    for (const location of locations) {
        try {
            console.log(`Przetwarzam lokalizację: ${location}`);
            const result = await runETLPipeline(location);
            logETLResult(location, result);
        } catch (error) {
            console.error(`Błąd podczas przetwarzania lokalizacji ${location}:`, error);
            logETLResult(location, null, error);
        }
    }

    console.log('Proces ETL dla wszystkich lokalizacji zakończony');
}

// Zaplanuj zadania ETL przy użyciu cron
function scheduleETLJobs() {
    // Codziennie o północy
    cron.schedule('0 0 * * *', async () => {
        console.log('Uruchamiam zaplanowany ETL - codzienna aktualizacja');
        await runAllLocationsETL();
    });

    // Aktualizacja popularnych lokalizacji co 6 godzin
    cron.schedule('0 */6 * * *', async () => {
        try {
            console.log('Uruchamiam częstszą aktualizację dla Nowego Yorku');
            const result = await runETLPipeline('new york');
            logETLResult('new york (co 6h)', result);
        } catch (error) {
            console.error('Błąd podczas częstej aktualizacji Nowego Yorku:', error);
            logETLResult('new york (co 6h)', null, error);
        }
    });

    console.log('Zaplanowano zadania ETL');
}

module.exports = {
    scheduleETLJobs,
    runAllLocationsETL
};