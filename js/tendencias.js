// =============================================
//           TENDENCIAS USD Y EUR
// =============================================
/////////////////**RENDERIZA EL GRÁFICO DE TENDENCIAS DE MONEDAS*/////////////////
function renderizarTendencias() {
    if (!DOM.trendsChart) return;
    
    const ctx = DOM.trendsChart.getContext("2d");
    
    const datosTendencias = obtenerDatosTendencias();
    const configuracionGrafico = obtenerConfiguracionGrafico(datosTendencias);
    
    destruirGraficoExistente();
    crearNuevoGrafico(ctx, configuracionGrafico);
    
    console.log('✅ Gráfico de tendencias renderizado correctamente');
}

/////////////////**OBTIENE LOS DATOS DE TENDENCIAS PARA EL GRÁFICO*/////////////////
function obtenerDatosTendencias() {
    // Datos simulados de tendencias USD y EUR a PEN
    const usdData = [3.74, 3.75, 3.76, 3.75, 3.74, 3.75, 3.76];
    const eurData = [4.08, 4.10, 4.11, 4.09, 4.08, 4.10, 4.12];
    const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    
    return {
        usdData: usdData,
        eurData: eurData,
        diasSemana: diasSemana
    };
}

/////////////////**DESTRUYE EL GRÁFICO EXISTENTE SI HAY UNO*/////////////////
function destruirGraficoExistente() {
    if (window.miGraficoTendencias && typeof window.miGraficoTendencias.destroy === 'function') {
        window.miGraficoTendencias.destroy();
    }
}

/////////////////**CREA UN NUEVO GRÁFICO DE TENDENCIAS*/////////////////
function crearNuevoGrafico(ctx, configuracion) {
    window.miGraficoTendencias = new Chart(ctx, configuracion);
}

////////////////////**CONFIGURA LAS OPCIONES DEL GRÁFICO DE TENDENCIAS*/////////////////
function obtenerConfiguracionGrafico(datos) {
    return {
        type: "line",
        data: {
            labels: datos.diasSemana, // Días de la semana en el eje X
            datasets: [
                {
                    label: "USD a PEN", // Línea morada para USD
                    data: datos.usdData,
                    borderColor: "#8A2BE2", // Color morado
                    backgroundColor: "rgba(138, 43, 226, 0.1)", // Fondo morado claro
                    borderWidth: 3,
                    tension: 0.3, // Línea suave
                    fill: true // Relleno bajo la línea
                },
                {
                    label: "EUR a PEN", // Línea turquesa para EUR
                    data: datos.eurData,
                    borderColor: "#008080", // Color turquesa
                    backgroundColor: "rgba(0, 128, 128, 0.1)", // Fondo turquesa claro
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true, // Se adapta al tamaño del contenedor
            maintainAspectRatio: false, // No mantiene proporción fija
            
            plugins: {
                title: {
                    display: true,
                    text: 'Tendencias USD/EUR a PEN - Última Semana'
                },
                tooltip: {
                    mode: 'index', // Muestra todos los datasets en el tooltip
                    intersect: false, // Tooltip se activa al pasar cerca
                    callbacks: {
                        label: function(context) {
                            // Formato: "USD a PEN: S/ 3.75"
                            return `${context.dataset.label}: S/ ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                },
                legend: {
                    position: 'top', // Leyenda en la parte superior
                    labels: { font: { size: 12 } }
                }
            },
            
            scales: {
                y: {
                    beginAtZero: false,
                    title: { 
                        display: true, 
                        text: 'Valor en PEN (Soles)'
                    },
                    ticks: { 
                        // Formato: "S/ 3.75"
                        callback: value => 'S/ ' + value.toFixed(2) 
                    }
                },
                x: {
                    title: { 
                        display: true, 
                        text: 'Días de la Semana'
                    }
                }
            },
            
            interaction: {
                intersect: false, // Interacción sin necesidad de click exacto
                mode: 'index' // Muestra todos los puntos del mismo índice
            }
        }
    };
}

/////////////////**INICIALIZA EL MÓDULO DE TENDENCIAS*/////////////////
function inicializarModuloTendencias() {
    console.log('✅ Módulo de tendencias inicializado correctamente');
}

inicializarModuloTendencias();// Inicializa cuando el script se carga