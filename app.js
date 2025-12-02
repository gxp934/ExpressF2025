const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase, saveHabitData, getAllHabits } = require('./database');

const app = express();
const port = 3000;

let db;

// Configuración de Express y EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar la base de datos
initializeDatabase()
    .then(database => {
        db = database;
        console.log('Base de datos SQLite inicializada y lista.');
    })
    .catch(err => {
        console.error('Error al inicializar la base de datos:', err);
        process.exit(1); // Detener la app si la DB falla
    });

// --- RUTA 1: Inicio (GET /start) ---
app.get('/', (req, res) => {
    res.redirect('/start');
});

app.get('/start', (req, res) => {
    res.render('start', { pageTitle: 'Inicio - Your Habit Map', error: null });
});

// --- RUTA 2: Cuestionario (POST /quiz) ---
app.post('/quiz', (req, res) => {
    const { userId } = req.body;
    
    if (!userId || userId.trim().length === 0) {
        return res.render('start', { 
            pageTitle: 'Inicio - Your Habit Map', 
            error: 'El ID de usuario no puede estar vacío.' 
        });
    }

    // Limpia el userId para asegurar un formato seguro y consistente
    const cleanUserId = userId.trim().replace(/[^a-zA-Z0-9]/g, '_');
    
    // Redirige al cuestionario, pasando el ID limpio
    res.render('quiz', { pageTitle: 'Cuestionario de Hábitos', userId: cleanUserId });
});

// --- RUTA 3: Guardar Datos (POST /submit-habit) ---
app.post('/submit-habit', async (req, res) => {
    const { userId, peak_hour, intensity_score, interruptions } = req.body;

    // Convertir a enteros para asegurar la consistencia en la DB
    const peakHour = parseInt(peak_hour, 10);
    const intensityScore = parseInt(intensity_score, 10);
    const interruptionsCount = parseInt(interruptions, 10);

    try {
        const result = await saveHabitData(db, userId, peakHour, intensityScore, interruptionsCount);
        
        if (result.success) {
            // Si es exitoso, redirige a la página de resultados con el ID
            res.redirect(`/mapa/${userId}`);
        } else {
            // Maneja el error de ID duplicado o cualquier otro error de la DB
             res.render('start', { 
                pageTitle: 'Inicio - Your Habit Map', 
                error: result.message
            });
        }
    } catch (error) {
        console.error("Error al procesar el envío del formulario:", error);
        res.status(500).send("Error interno del servidor al guardar datos.");
    }
});

// --- RUTA 4: Visualización del Mapa (GET /mapa/:id) ---
app.get('/mapa/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const allHabits = await getAllHabits(db);
        
        if (allHabits.length === 0) {
            return res.status(404).send("No hay datos en la base de datos.");
        }

        // 1. Encontrar el registro del usuario actual
        const userHabit = allHabits.find(h => h.user_id === userId);

        if (!userHabit) {
            return res.status(404).send(`Datos no encontrados para el ID: ${userId}.`);
        }

        // 2. Calcular el promedio de la comunidad (incluyendo al usuario)
        const totalParticipants = allHabits.length;
        const sumPeakHour = allHabits.reduce((sum, h) => sum + h.peak_hour, 0);
        const sumIntensityScore = allHabits.reduce((sum, h) => sum + h.intensity_score, 0);
        const sumInterruptions = allHabits.reduce((sum, h) => sum + h.interruptions, 0);

        const communityAvg = {
            peak_hour: parseFloat((sumPeakHour / totalParticipants).toFixed(1)),
            intensity_score: parseFloat((sumIntensityScore / totalParticipants).toFixed(1)),
            interruptions: parseFloat((sumInterruptions / totalParticipants).toFixed(1))
        };

        // 3. Renderizar la página de resultados
        res.render('mapa', { 
            pageTitle: 'Tu Habit Map', 
            userId, 
            userHabit, 
            communityAvg,
            totalParticipants
        });

    } catch (error) {
        console.error("Error al obtener datos para el mapa:", error);
        res.status(500).send("Error interno del servidor al cargar el mapa.");
    }
});


app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
    console.log("¡Listo para probar la aplicación!");
});