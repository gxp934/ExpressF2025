// --- Lógica de Visualización para Your Habit Map ---

/**
 * Normaliza los datos de 0 a 10 para que todos los ejes
 * del gráfico de radar tengan la misma escala.
 */
function normalizeData(data) {
    // Escalas máximas originales:
    const MAX_PEAK_HOUR = 23;      // Hora Pico (0 a 23)
    const MAX_INTENSITY = 100;     // Intensidad (0 a 100)
    const MAX_INTERRUPTIONS = 10;  // Interrupciones (0 a 10)
    const MAX_CHART_SCALE = 10;    // Máximo valor en el gráfico de radar

    return {
        // 1. Hora Pico: (valor / 23) * 10
        peak_hour: (data.peak_hour / MAX_PEAK_HOUR) * MAX_CHART_SCALE,
        // 2. Intensidad: (valor / 100) * 10
        intensity_score: (data.intensity_score / MAX_INTENSITY) * MAX_CHART_SCALE,
        // 3. Interrupciones: (valor / 10) * 10 (Ya está en la escala 0-10, pero se incluye para consistencia)
        interruptions: (data.interruptions / MAX_INTERRUPTIONS) * MAX_CHART_SCALE
    };
}


window.onload = function() {
    // 1. Obtener los datos inyectados por EJS desde el HTML
    const userDataElement = document.getElementById('user-data');
    const communityDataElement = document.getElementById('community-data');

    if (!userDataElement || !communityDataElement) {
        console.error("Datos de usuario/comunidad no encontrados en el DOM. Asegúrate que EJS los haya inyectado.");
        return;
    }

    // Parsear los datos de JSON a objetos JavaScript
    const userData = JSON.parse(userDataElement.textContent);
    const communityAvg = JSON.parse(communityDataElement.textContent);

    // 2. Normalizar los datos para la escala del gráfico
    const userNormalized = normalizeData(userData);
    const communityNormalized = normalizeData(communityAvg);

    // 3. Configuración del Gráfico de Radar
    const ctx = document.getElementById('habitMapChart').getContext('2d');
    
    const data = {
        labels: [
            'Hora Pico (00:00 - 23:00)',
            'Nivel de Intensidad (0 - 100)',
            'Interrupciones (0 - 10)',
        ],
        datasets: [
            {
                label: 'Tus Hábitos',
                data: [
                    userNormalized.peak_hour,
                    userNormalized.intensity_score,
                    userNormalized.interruptions
                ],
                backgroundColor: 'rgba(79, 70, 229, 0.4)', // Azul/Índigo
                borderColor: 'rgb(79, 70, 229)',
                pointBackgroundColor: 'rgb(79, 70, 229)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(79, 70, 229)',
                borderWidth: 2
            },
            {
                label: 'Promedio Comunitario',
                data: [
                    communityNormalized.peak_hour,
                    communityNormalized.intensity_score,
                    communityNormalized.interruptions
                ],
                backgroundColor: 'rgba(220, 38, 38, 0.4)', // Rojo
                borderColor: 'rgb(220, 38, 38)',
                pointBackgroundColor: 'rgb(220, 38, 38)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(220, 38, 38)',
                borderWidth: 2
            }
        ]
    };

    const config = {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Comparación de Hábitos (Tu Mapa vs. Comunidad)',
                    font: { size: 18, weight: 'bold' }
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                r: {
                    angleLines: { display: true },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    pointLabels: { font: { size: 14 } },
                    suggestedMin: 0,
                    suggestedMax: 10, // Escala de 0 a 10
                    ticks: {
                        beginAtZero: true,
                        stepSize: 2,
                        backdropColor: 'rgba(247, 250, 252, 0.7)'
                    }
                }
            }
        },
    };

    // Crear la instancia del gráfico
    new Chart(ctx, config);
};