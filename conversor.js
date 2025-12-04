// =============================================
//            CONVERSOR DE MONEDAS
// =============================================
/////////////////**EJECUTA LA CONVERSIÓN DE MONEDAS*/////////////////
async function convertirMoneda() {
    try {
        if (!validarSesionActiva()) return;
        const datosConversion = obtenerDatosConversion();
        
        if (!validarDatosConversion(datosConversion)) return;
        const resultado = calcularConversion(datosConversion);
        
        mostrarResultadoConversion(datosConversion, resultado);
        await guardarConversionEnMySQL(datosConversion, resultado);
        await actualizarHistorialUsuario(datosConversion, resultado);
        actualizarFavoritos(datosConversion.monedaOrigen, datosConversion.monedaDestino);
        
    } catch (error) {
        mostrarNotificacion('Error al convertir: ' + (error.message || error), 'error');
    }
}

/////////////////**GUARDA LA CONVERSIÓN EN MYSQL*/////////////////
async function guardarConversionEnMySQL(datosConversion, resultado) {
    try {
        if (!estado.isLoggedIn || !estado.usuarioActivo) return;
        
        const datosMySQL = {
            action: 'saveConversion',
            user_email: estado.usuarioActivo.email,
            from_currency: datosConversion.monedaOrigen,
            to_currency: datosConversion.monedaDestino,
            amount: datosConversion.cantidad,
            converted_amount: resultado.resultado,
            exchange_rate: resultado.tasaCambio
        };
        
        const response = await fetch(SERVER_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosMySQL)
        });
        
        const resultadoMySQL = await response.json();
        
        if (resultadoMySQL.success) {
            console.log('✅ Conversión guardada en MySQL con ID:', resultadoMySQL.conversion_id);
        } else {
            console.warn('⚠️ No se pudo guardar en MySQL:', resultadoMySQL.error);
        }
    } catch (error) {
        console.warn('⚠️ Error al guardar en MySQL:', error);
    }
}

/////////////////**VALIDA QUE EL USUARIO TENGA SESIÓN ACTIVA*/////////////////
function validarSesionActiva() {
    if (!estado.isLoggedIn) {
        mostrarNotificacion('Por favor, inicia sesión para usar el conversor', 'error');
        return false;
    }
    return true;
}

/////////////////**OBTIENE LOS DATOS DEL FORMULARIO DE CONVERSIÓN*/////////////////
function obtenerDatosConversion() {
    return {
        monedaOrigen: DOM.monedaOrigen.value,
        monedaDestino: DOM.monedaDestino.value,
        textoCantidad: DOM.inputCantidad.value.trim(),
        cantidad: parseFloat(DOM.inputCantidad.value)
    };
}

/////////////////**VALIDA LOS DATOS DE LA CONVERSIÓN*/////////////////
function validarDatosConversion(datos) {
    if (!datos.monedaOrigen || !datos.monedaDestino) {
        mostrarNotificacion('Por favor selecciona las monedas de origen y destino', 'error');
        return false;
    }
    
    if (!esCantidadValida(datos.textoCantidad)) {
        mostrarNotificacion('Ingrese un número válido (máx. 2 decimales, mayor que 0)', 'error');
        return false;
    }
    
    if (datos.monedaOrigen === datos.monedaDestino) {
        mostrarNotificacion('Seleccione dos monedas diferentes', 'error');
        return false;
    }
    
    if (!validarTasasDisponiblesConversion(datos.monedaOrigen, datos.monedaDestino)) {
        mostrarNotificacion('Tasas no disponibles. Intente nuevamente más tarde', 'error');
        return false;
    }
    
    return true;
}

/////////////////**VALIDA LA DISPONIBILIDAD DE TASAS DE CAMBIO*/////////////////
function validarTasasDisponiblesConversion(monedaOrigen, monedaDestino) {
    return !!(estado.tasas && estado.tasas[monedaOrigen] && estado.tasas[monedaDestino]);
}

/////////////////**CALCULA EL RESULTADO DE LA CONVERSIÓN*/////////////////
function calcularConversion(datos) {
    const cantidadUSD = datos.cantidad / estado.tasas[datos.monedaOrigen];
    const resultado = cantidadUSD * estado.tasas[datos.monedaDestino];
    const tasaCambio = estado.tasas[datos.monedaDestino] / estado.tasas[datos.monedaOrigen];
    
    return {
        resultado: resultado,
        tasaCambio: tasaCambio
    };
}

/////////////////**MUESTRA EL RESULTADO EN LA INTERFAZ*/////////////////
function mostrarResultadoConversion(datos, resultado) {
    if (DOM.textoTasa) DOM.textoTasa.textContent = `1 ${datos.monedaOrigen} = ${resultado.tasaCambio.toFixed(4)} ${datos.monedaDestino}`;
    if (DOM.textoResultado) DOM.textoResultado.textContent = `${formatearMoneda(datos.cantidad)} ${datos.monedaOrigen} = ${formatearMoneda(resultado.resultado)} ${datos.monedaDestino}`;
}

/////////////////**ACTUALIZA EL HISTORIAL DEL USUARIO*/////////////////
async function actualizarHistorialUsuario(datos, resultado) {
    if (!estado.usuarioActivo) return;
    
    // Recargar historial desde MySQL
    await cargarHistorialDesdeMySQL(estado.usuarioActivo.email);
    
    // Actualizar contador
    actualizarContadorHistorial(estado.historialUsuario.length);
}

/////////////////**ACTUALIZA LOS FAVORITOS CON LA CONVERSIÓN*/////////////////
function actualizarFavoritos(monedaOrigen, monedaDestino) {
    if (!estado.usuarioActivoId) return;
    
    const pair = `${monedaOrigen}-${monedaDestino}`;
    
    if (!estado.favoriteConversions[estado.usuarioActivoId]) {
        estado.favoriteConversions[estado.usuarioActivoId] = {};
    }
    
    if (!estado.favoriteConversions[estado.usuarioActivoId][pair]) {
        estado.favoriteConversions[estado.usuarioActivoId][pair] = 1;
    } else {
        estado.favoriteConversions[estado.usuarioActivoId][pair]++;
    }
    
    if (typeof updateFavorites === 'function') {
        updateFavorites();
    }
}

/////////////////**CARGA LAS TASAS DE CAMBIO DESDE LA API*/////////////////
async function cargarTasasCambio() {
    try {
        await cargarTasasDesdeAPI();
        console.log('✅ Tasas de cambio cargadas'); 
    } catch (error) {
        console.warn("Error cargando tasas:", error);
        mostrarNotificacion('No se pudieron obtener las tasas (modo ejemplo)', 'error');
        cargarTasasEjemplo();
    }
}

/////////////////**CARGA TASAS DESDE LA API EXTERNA*/////////////////
async function cargarTasasDesdeAPI() {
    const respuesta = await fetch("https://open.er-api.com/v6/latest/USD");
    const datos = await respuesta.json();
    
    if (datos.result !== "success") {
        throw new Error("API no retornó success");
    }
    estado.tasas = datos.rates;
    configurarSelectsMonedas();
}

/////////////////**CARGA TASAS DE EJEMPLO COMO FALLBACK*/////////////////
function cargarTasasEjemplo() {
    estado.tasas = {
        USD: 1, EUR: 0.92, JPY: 149.50, GBP: 0.79,
        AUD: 1.52, CAD: 1.36, CHF: 0.89, CNY: 7.24,
        HKD: 7.82, NZD: 1.66, SEK: 10.68, KRW: 1330.50,
        SGD: 1.35, NOK: 10.92, MXN: 17.20, INR: 83.25,
        RUB: 92.50, ZAR: 18.75, TRY: 30.85, BRL: 4.95,
        TWD: 31.45, DKK: 6.88, PLN: 4.05, THB: 35.80,
        IDR: 15650, HUF: 355.20, CZK: 22.45, ILS: 3.85,
        CLP: 890, PHP: 56.30, AED: 3.67, COP: 3950,
        SAR: 3.75, MYR: 4.70, RON: 4.55, PEN: 3.75,
        ARS: 350.25, VND: 24350, EGP: 30.90, UAH: 36.75
    };
    configurarSelectsMonedas();
}

/////////////////**CONFIGURA LOS SELECTS DE MONEDAS*/////////////////
function configurarSelectsMonedas() {
    const monedasDisponibles = MONEDAS_FRECUENTES.filter(moneda => 
        estado.tasas.hasOwnProperty(moneda)
    );
    
    poblarSelectsConversor(monedasDisponibles);
    poblarSelectsCalculadoraInversa(monedasDisponibles);
    poblarSelectsMonedaPreferida();
    
    console.log('✅ Todos los selects de monedas configurados');
}

/////////////////**POBLA LOS SELECTS DEL CONVERSOR*/////////////////
function poblarSelectsConversor(monedasDisponibles) {
    if (DOM.monedaOrigen && DOM.monedaDestino) {
        poblarSelect(DOM.monedaOrigen, monedasDisponibles);
        poblarSelect(DOM.monedaDestino, monedasDisponibles);
        DOM.monedaOrigen.value = "USD";
        DOM.monedaDestino.value = "PEN";
    }
}

/////////////////**POBLA LOS SELECTS DE LA CALCULADORA INVERSA*/////////////////
function poblarSelectsCalculadoraInversa(monedasDisponibles) {
    if (DOM.inverseFromCurrency && DOM.inverseToCurrency) {
        poblarSelect(DOM.inverseFromCurrency, monedasDisponibles);
        poblarSelect(DOM.inverseToCurrency, monedasDisponibles);
        DOM.inverseFromCurrency.value = "USD";
        DOM.inverseToCurrency.value = "PEN";
    }
}

/////////////////**POBLA LOS SELECTS DE MONEDA PREFERIDA*/////////////////
function poblarSelectsMonedaPreferida() {
    const monedasDisponibles = MONEDAS_FRECUENTES.filter(moneda => 
        estado.tasas.hasOwnProperty(moneda)
    );
    
    // Select de registro
    const selectRegistro = document.getElementById('registerPrefCurrency');
    if (selectRegistro) {
        selectRegistro.innerHTML = monedasDisponibles
            .map(moneda => `<option value="${moneda}">${moneda} - ${NOMBRES_MONEDAS[moneda] || moneda}</option>`)
            .join('');
        selectRegistro.value = "USD";
    }
    
    // Select de edición de perfil
    const selectEdicion = document.getElementById('editProfilePrefCurrency');
    if (selectEdicion) {
        selectEdicion.innerHTML = monedasDisponibles
            .map(moneda => `<option value="${moneda}">${moneda} - ${NOMBRES_MONEDAS[moneda] || moneda}</option>`)
            .join('');
    }
    
    console.log('✅ Selects de moneda preferida poblados con', monedasDisponibles.length, 'monedas');
}

/////////////////**ACTUALIZA EL CONTADOR DE HISTORIAL*/////////////////
function actualizarContadorHistorial(cantidad) {
    if (DOM.perfilHistoryCount) {
        DOM.perfilHistoryCount.textContent = cantidad;
    }
}

/////////////////**INICIALIZA EL MÓDULO DEL CONVERSOR*/////////////////
function inicializarModuloConversor() {
    console.log('✅ Módulo conversor inicializado correctamente');
}

inicializarModuloConversor();