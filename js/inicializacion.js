// =============================================
//            ARCHIVO PRINCIPAL - INICIALIZACIÓN
// =============================================
/////////////////**FUNCIÓN PRINCIPAL DE INICIALIZACIÓN DE LA APLICACIÓN*/////////////////
async function inicializarAplicacion() {
    console.log('🚀 Iniciando FOREX TOOL...');
    
    try {
        // 1. Inicializar referencias DOM
        initializeDOMReferences();
        console.log('✅ Referencias DOM inicializadas');
        
        // 2. Cargar tasas de cambio desde la API
        await cargarTasasCambio();
        console.log('✅ Tasas de cambio cargadas');
        
        // 3. Configurar sistema de autenticación
        inicializarSistemaAutenticacion();
        console.log('✅ Sistema de autenticación inicializado');
        
        // 4. Configurar navegación por pestañas
        if (typeof setupTabNavigation === 'function') {
            setupTabNavigation();
            console.log('✅ Navegación por pestañas configurada');
        } else {
            console.error('❌ Error: setupTabNavigation no está definido');
        }
        
        // 5. Configurar elementos básicos
        configurarElementosBasicos();
        console.log('✅ Elementos básicos configurados');
        
        // 6. Configurar sistema de temas
        configurarSistemaTemas();
        console.log('✅ Sistema de temas configurado');
        
        // 7. Configurar event listeners para eliminar cuenta
        configurarEventListenersEliminarCuenta();
        console.log('✅ Event listeners de eliminar cuenta configurados');
        
        console.log('✅✅✅ FOREX TOOL inicializado correctamente! ✅✅✅');
        console.log('👉 Si ves este mensaje, todos los módulos están conectados');
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        mostrarNotificacion('Error al inicializar la aplicación', 'error');
    }
}

/////////////////**CONFIGURA ELEMENTOS BÁSICOS*/////////////////
function configurarElementosBasicos() {
    if (DOM.botonConvertir) {
        DOM.botonConvertir.addEventListener("click", convertirMoneda);
    }
    
    if (DOM.botonIntercambiar) {
        DOM.botonIntercambiar.addEventListener("click", intercambiarMonedas);
    }
}

/////////////////**CONFIGURA EL SISTEMA DE TEMAS*/////////////////
function configurarSistemaTemas() {
    if (DOM.themeToggle) {
        actualizarBotonModoOscuro();
        DOM.themeToggle.addEventListener("click", alternarModoOscuro);
    }
}

/////////////////**INICIALIZA LA APLICACIÓN CUANDO EL DOM ESTÁ LISTO*/////////////////
document.addEventListener("DOMContentLoaded", inicializarAplicacion);