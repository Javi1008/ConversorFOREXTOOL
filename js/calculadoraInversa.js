// =============================================
//              CALCULADORA INVERSA
// =============================================
/////////////////**CONFIGURA LA CALCULADORA INVERSA*/////////////////
function configurarCalculadoraInversa() {
    if (!DOM.inverseForm) return;
    DOM.inverseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        ejecutarCalculoInverso();
    });
}

/////////////////**EJECUTA EL CÁLCULO INVERSO*/////////////////
function ejecutarCalculoInverso() {
    if (!estado.isLoggedIn) {
        mostrarNotificacion('Por favor, inicia sesión para usar la calculadora', 'error');
        return;
    }
    const datosCalculo = obtenerDatosCalculoInverso();
    
    if (!validarDatosCalculoInverso(datosCalculo)) {
        return;
    }
    const resultado = calcularCantidadNecesaria(datosCalculo);
    
    if (resultado) {
        mostrarResultadoCalculoInverso(datosCalculo, resultado);
        mostrarNotificacion('Cálculo realizado exitosamente', 'success');
    }
}

/////////////////**OBTIENE LOS DATOS DEL FORMULARIO DE CÁLCULO INVERSO*/////////////////
function obtenerDatosCalculoInverso() {
    return {
        cantidadDeseada: parseFloat(DOM.inverseTarget.value),
        monedaDestino: DOM.inverseToCurrency.value,
        monedaOrigen: DOM.inverseFromCurrency.value,
        textoCantidad: DOM.inverseTarget.value.trim()
    };
}

/////////////////**VALIDA LOS DATOS DEL CÁLCULO INVERSO*/////////////////
function validarDatosCalculoInverso(datos) {
    if (!datos.textoCantidad) {// Validar campo de cantidad
        mostrarNotificacion('Por favor, ingresa la cantidad deseada', 'error');
        if (DOM.inverseTarget) DOM.inverseTarget.focus();
        return false;
    }
    
    if (isNaN(datos.cantidadDeseada) || datos.cantidadDeseada <= 0) {// Validar que la cantidad sea un número válido
        mostrarNotificacion('Por favor, ingresa una cantidad válida mayor que 0', 'error');
        if (DOM.inverseTarget) DOM.inverseTarget.focus();
        return false;
    }
    
    if (!datos.monedaDestino) { // Validar selección de moneda destino
        mostrarNotificacion('Por favor, selecciona la moneda destino', 'error');
        if (DOM.inverseToCurrency) DOM.inverseToCurrency.focus();
        return false;
    }
    
    if (!datos.monedaOrigen) {// Validar selección de moneda origen
        mostrarNotificacion('Por favor, selecciona la moneda origen', 'error');
        if (DOM.inverseFromCurrency) DOM.inverseFromCurrency.focus();
        return false;
    }
    
    if (!validarTasasDisponibles(datos.monedaOrigen, datos.monedaDestino)) {// Validar disponibilidad de tasas de cambio
        mostrarNotificacion('Tipo de cambio no disponible para estas monedas', 'error');
        return false;
    }
    return true;
}

/////////////////**VALIDA QUE LAS TASAS DE CAMBIO ESTÉN DISPONIBLES*/////////////////
function validarTasasDisponibles(monedaOrigen, monedaDestino) {
    const tasaOrigen = estado.tasas[monedaOrigen];
    const tasaDestino = estado.tasas[monedaDestino];
    return !!(tasaOrigen && tasaDestino);
}

/////////////////**CALCULA LA CANTIDAD NECESARIA EN MONEDA ORIGEN*/////////////////
function calcularCantidadNecesaria(datos) {
    if (datos.monedaOrigen === datos.monedaDestino) {// Caso especial: mismas monedas
        return {
            cantidadNecesaria: datos.cantidadDeseada,
            tasaCambio: 1,
            esMismaMoneda: true
        };
    }

    const tasaOrigen = estado.tasas[datos.monedaOrigen];// Cálculo para monedas diferentes
    const tasaDestino = estado.tasas[datos.monedaDestino];
  
    const cantidadNecesaria = (datos.cantidadDeseada / tasaDestino) * tasaOrigen;
    const tasaCambio = tasaDestino / tasaOrigen;
    
    return {
        cantidadNecesaria: cantidadNecesaria,
        tasaCambio: tasaCambio,
        esMismaMoneda: false
    };
}

/////////////////**MUESTRA EL RESULTADO DEL CÁLCULO INVERSO*/////////////////
function mostrarResultadoCalculoInverso(datos, resultado) {
    if (!DOM.inverseResult) return;
    
    if (resultado.esMismaMoneda) {
        DOM.inverseResult.textContent = 
            `Para obtener ${formatearMoneda(datos.cantidadDeseada)} ${datos.monedaDestino} ` +
            `necesitas ${formatearMoneda(resultado.cantidadNecesaria)} ${datos.monedaOrigen}`;
    } else {
        DOM.inverseResult.innerHTML = generarHTMLResultado(datos, resultado);
    }
    DOM.inverseResult.style.display = 'block';
}

/////////////////**GENERA EL HTML PARA MOSTRAR EL RESULTADO*/////////////////
function generarHTMLResultado(datos, resultado) {
    return `
        <div style="text-align: center;">
            <div style="font-size: 18px; margin-bottom: 10px; color: #8A2BE2;">
                <strong>Resultado:</strong>
            </div>
            <div style="font-size: 16px; margin-bottom: 5px;">
                Para obtener <strong style="color: #008080;">${formatearMoneda(datos.cantidadDeseada)} ${datos.monedaDestino}</strong>
            </div>
            <div style="font-size: 16px;">
                necesitas <strong style="color: #8A2BE2;">${formatearMoneda(resultado.cantidadNecesaria)} ${datos.monedaOrigen}</strong>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #666;">
                Tasa: 1 ${datos.monedaOrigen} = ${resultado.tasaCambio.toFixed(4)} ${datos.monedaDestino}
            </div>
        </div>
    `;
}

/////////////////**INICIALIZA LA CALCULADORA INVERSA*/////////////////
function inicializarCalculadoraInversa() {
    configurarCalculadoraInversa();
    console.log('✅ Calculadora inversa inicializada correctamente');
}

// Inicializa cuando el script se carga
inicializarCalculadoraInversa();