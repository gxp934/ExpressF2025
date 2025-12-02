console.log("chartConfig.js: Script loaded and function defined."); // ¡CONFIRMACIÓN DE CARGA!

/**
 * Creates and renders a bar chart for habit comparison (User vs. Community).
 * @param {string} canvasId - The ID of the canvas element where the chart will be drawn.
 * @param {object} userData - Object containing the user's habit data.
 * @param {object} communityData - Object containing the community average data.
 * @param {number} totalParticipants - The total number of participants.
 */
function createHabitComparisonChart(canvasId, userData, communityData, totalParticipants) {
    
    // Verifica que Chart y el canvas existan antes de intentar dibujar
    const canvasElement = document.getElementById(canvasId);
    if (!canvasElement) {
        console.error("Error: Canvas element not found with ID:", canvasId);
        return;
    }
    if (typeof Chart === 'undefined') {
        console.error("Error: Chart.js library not loaded.");
        return;
    }
    
    // Si la función se llama, debería dibujar el gráfico.
    console.log("chartConfig.js: Attempting to draw chart with data:", userData);

    const ctx = canvasElement.getContext('2d');
    
    // Data points for the chart
    const dataLabels = ['Peak Hour (0-23)', 'Intensity Score (0-100)', 'Interruptions (0-10)'];

    // Normaliza la data. Multiplicamos Interrupciones por 10 para usar el eje 0-100.
    const userInterruptions = Math.min(userData.interruptions, 10);
    const communityInterruptions = Math.min(communityData.interruptions, 10);

    // Data sets for the chart
    const data = {
        labels: dataLabels,
        datasets: [
            {
                label: 'Your Score',
                data: [
                    userData.peak_hour, 
                    userData.intensity_score, 
                    userInterruptions * 10
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.7)', // Blue
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            },
            {
                label: `Community Average (${totalParticipants} Total)`,
                data: [
                    communityData.peak_hour, 
                    communityData.intensity_score, 
                    communityInterruptions * 10
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.7)', // Red
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1
            }
        ]
    };

    // Chart configuration options
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100, 
                    title: {
                        display: true,
                        text: 'Score / Value'
                    },
                    ticks: {
                        callback: function(value, index, values) {
                            // Solo ajusta el tick para el índice 2 (Interrupciones)
                            if (index === 2) { 
                                return value / 10;
                            }
                            return value; 
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Habit Dimensions'
                    }
                }
            },
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: 'Habit Comparison: You vs. Community Average'
                }
            }
        }
    };

    new Chart(ctx, config);
}