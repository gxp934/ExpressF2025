// We will use the 'sqlite' module to handle the database simply.
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const DB_PATH = './habit_map.db';

// Function that opens the DB connection and initializes the table
async function initializeDatabase() {
    const db = await sqlite.open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    // Create the 'habits' table with the necessary columns
    await db.exec(`
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            peak_hour INTEGER,
            intensity_score INTEGER,
            interruptions INTEGER
        );
    `);
    
    // Insert sample data if the database is empty to have an initial community
    const count = await db.get('SELECT COUNT(*) as count FROM habits');
    if (count.count === 0) {
        console.log("Inserting sample data for initial comparison...");
        await db.run("INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)", "DemoUser1", 10, 85, 2);
        await db.run("INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)", "DemoUser2", 14, 50, 5);
        await db.run("INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)", "DemoUser3", 22, 95, 1);
        await db.run("INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)", "DemoUser4", 8, 30, 8);
    }

    return db;
}

// Function to save the quiz results
async function saveHabitData(db, userId, peakHour, intensityScore, interruptions) {
    try {
        const result = await db.run(
            `INSERT INTO habits (user_id, peak_hour, intensity_score, interruptions) VALUES (?, ?, ?, ?)`,
            userId, peakHour, intensityScore, interruptions
        );
        return { success: true, lastID: result.lastID };
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
             return { success: false, message: `User ID '${userId}' already exists. Please use a different one.` };
        }
        console.error("Error saving data:", error.message);
        return { success: false, message: "Internal error saving data." };
    }
}

// Function to get all data for comparison
async function getAllHabits(db) {
    return db.all('SELECT * FROM habits');
}

module.exports = {
    initializeDatabase,
    saveHabitData,
    getAllHabits
};