const mongoose = require('mongoose');

// URI de origen (Local Docker o Local Mongo)
const sourceUri = 'mongodb://localhost:27017/kinefy';
// URI de destino (Atlas) - Se lee del argumento de consola o de variable
const targetUri = process.argv[2];

if (!targetUri) {
    console.error('ERROR: Debes proporcionar la URI de destino (MongoDB Atlas) como argumento.');
    console.log('Ejemplo: node src/scripts/migrate-db.js "mongodb+srv://usuario:password@cluster.mongodb.net/kinefy"');
    process.exit(1);
}

async function migrate() {
    console.log('Conectando a base de datos de origen (local)...');
    const sourceConnection = await mongoose.createConnection(sourceUri).asPromise();
    console.log('¡Conectado a origen local con éxito!');

    console.log('Conectando a base de datos de destino (Atlas)...');
    const targetConnection = await mongoose.createConnection(targetUri).asPromise();
    console.log('¡Conectado a destino Atlas con éxito!');

    // Obtener todas las colecciones de la base de datos de origen
    const collections = await sourceConnection.db.listCollections().toArray();
    console.log(`Se encontraron ${collections.length} colecciones para migrar.`);

    for (const colInfo of collections) {
        const colName = colInfo.name;
        // Evitar colecciones del sistema de MongoDB
        if (colName.startsWith('system.')) continue;

        console.log(`\nProcesando colección: "${colName}"...`);

        // Leer todos los documentos de la colección de origen
        const documents = await sourceConnection.db.collection(colName).find({}).toArray();
        console.log(`-> Leídos ${documents.length} documentos de origen.`);

        if (documents.length === 0) {
            console.log(`-> Saltando colección "${colName}" porque está vacía.`);
            continue;
        }

        // Limpiar la colección de destino para evitar duplicados
        await targetConnection.db.collection(colName).deleteMany({});
        console.log(`-> Limpiada colección de destino "${colName}".`);

        // Insertar los documentos en destino
        const result = await targetConnection.db.collection(colName).insertMany(documents);
        console.log(`-> Insertados ${result.insertedCount} documentos en destino con éxito.`);
    }

    console.log('\n=========================================');
    console.log('¡MIGRACIÓN COMPLETADA CON ÉXITO!');
    console.log('Todos los datos locales se han copiado a tu base de datos de Atlas.');
    console.log('=========================================');

    // Cerrar conexiones
    await sourceConnection.close();
    await targetConnection.close();
    process.exit(0);
}

migrate().catch(err => {
    console.error('ERROR DURANTE LA MIGRACIÓN:', err);
    process.exit(1);
});
