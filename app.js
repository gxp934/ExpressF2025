const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase, saveHabitData, getAllHabits } = require('./database');

const app = express();
const port = 3000;

let db;

// Express and EJS configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize the database
initializeDatabase()
    .then(database => {
        db = database;
        console.log('SQLite database initialized and ready.');
    })
    .catch(err => {
        console.error('Error initializing the database:', err);
        process.exit(1); // Stop the app if the DB fails
    });

// --- ROUTE 1: Start Page (GET /start) ---
app.get('/', (req, res) => {
    res.redirect('/start');
});

app.get('/start', (req, res) => {
    res.render('start', { pageTitle: 'Start - Your Habit Map', error: null });
});

// --- ROUTE 2: Quiz (POST /quiz) ---
app.post('/quiz', (req, res) => {
    const { userId } = req.body;
    
    if (!userId || userId.trim().length === 0) {
        return res.render('start', { 
            pageTitle: 'Start - Your Habit Map', 
            error: 'User ID cannot be empty.' 
        });
    }

    // Clean the userId to ensure a safe and consistent format
    const cleanUserId = userId.trim().replace(/[^a-zA-Z0-9]/g, '_');
    
    // Redirect to the quiz, passing the clean ID
    res.render('quiz', { pageTitle: 'Habit Questionnaire', userId: cleanUserId });
});

// --- ROUTE 3: Save Data (POST /submit-habit) ---
app.post('/submit-habit', async (req, res) => {
    const { userId, peak_hour, intensity_score, interruptions } = req.body;

    // Convert to integers for consistency in the DB
    const peakHour = parseInt(peak_hour, 10);
    const intensityScore = parseInt(intensity_score, 10);
    const interruptionsCount = parseInt(interruptions, 10);

    try {
        const result = await saveHabitData(db, userId, peakHour, intensityScore, interruptionsCount);
        
        if (result.success) {
            // If successful, redirect to the results page with the ID
            res.redirect(`/mapa/${userId}`);
        } else {
            // Handle duplicate ID error or any other DB error
             res.render('start', { 
                pageTitle: 'Start - Your Habit Map', 
                error: result.message
            });
        }
    } catch (error) {
        console.error("Error processing form submission:", error);
        res.status(500).send("Internal server error while saving data.");
    }
});

// --- ROUTE 4: Map Visualization (GET /mapa/:id) ---
app.get('/mapa/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const allHabits = await getAllHabits(db);
        
        if (allHabits.length === 0) {
            return res.status(404).send("No data found in the database.");
        }

        // 1. Find the current user's record
        const userHabit = allHabits.find(h => h.user_id === userId);

        if (!userHabit) {
            return res.status(404).send(`Data not found for ID: ${userId}.`);
        }

        // 2. Calculate the community average (including the current user)
        const totalParticipants = allHabits.length;
        const sumPeakHour = allHabits.reduce((sum, h) => sum + h.peak_hour, 0);
        const sumIntensityScore = allHabits.reduce((sum, h) => sum + h.intensity_score, 0);
        const sumInterruptions = allHabits.reduce((sum, h) => sum + h.interruptions, 0);

        const communityAvg = {
            peak_hour: parseFloat((sumPeakHour / totalParticipants).toFixed(1)),
            intensity_score: parseFloat((sumIntensityScore / totalParticipants).toFixed(1)),
            interruptions: parseFloat((sumInterruptions / totalParticipants).toFixed(1))
        };

        // 3. Render the results page
        res.render('mapa', { 
            pageTitle: 'Your Habit Map', 
            userId, 
            userHabit, 
            communityAvg,
            totalParticipants
        });

    } catch (error) {
        console.error("Error retrieving data for the map:", error);
        res.status(500).send("Internal server error while loading the map.");
    }
});


app.listen(port, () => {
    console.log(`Express server listening on http://localhost:${port}`);
    console.log("Ready to test the application!");
});