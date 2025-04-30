const propertyETL = require('./src/etl/property-etl');

const location = process.argv[2];
console.log(`Running ETL pipeline for location: ${location}`);

propertyETL.runETLPipeline(location)
    .then(result => console.log('ETL complete:', result))
    .catch(err => console.error('ETL failed:', err));