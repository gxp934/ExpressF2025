// Usaremos el módulo 'sqlite' para manejar la base de datos de forma simple.
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const DB_PATH = './habit_map.db';

// Función que abre la conexión a la DB e inicializa la tabla
async function initializeDatabase() {
    const db = await sqlite.open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    // Crea la tabla 'habits' con las columnas necesarias
    await db.exec(`
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            peak_hour INTEGER,
            intensity_score INTEGER,
            interruptions INTEGER
        );
    `);
    
    // Inserta datos de ejemplo si la base de datos está vacía para tener una comunidad inicial
    const count = await db.get('SELECT COUNT(*) as count FROM habits');
    if (count.count === 0) {
        console.log("Insertando datos de ejemplo para la comparación inicial...");
        await db.run("INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)", "DemoUser1", 10, 85, 2);
        await db.run("INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)", "DemoUser2", 14, 50, 5);
        await db.run("INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)", "DemoUser3", 22, 95, 1);
        await db.run("INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)", "DemoUser4", 8, 30, 8);
    }

    return db;
}

// Función para guardar los resultados del quiz
async function saveHabitData(db, userId, peakHour, intensityScore, interruptions) {
    try {
        const result = await db.run(
            `INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)`,
            userId, peakHour, intensityScore, interruptions
        );
        return { success: true, lastID: result.lastID };
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
             return { success: false, message: `El ID de usuario '${userId}' ya existe. Por favor, usa otro.` };
        }
        console.error("Error al guardar datos:", error.message);
        return { success: false, message: "Error interno al guardar los datos." };
    }
}

// Función para obtener todos los datos para la comparación
async function getAllHabits(db) {
    return db.all('SELECT * FROM habits');
}

module.exports = {
    initializeDatabase,
    saveHabitData,
    getAllHabits
};