// =============================================
//            COMPARADOR DE MONEDAS
// =============================================
/////////////////**CONFIGURA EL COMPARADOR DE MONEDAS*/////////////////
function configurarComparadorMonedas() {
    if (!DOM.baseCurrency) return;
    inicializarSelectorMonedaBase();
    DOM.baseCurrency.addEventListener('change', actualizarComparacionMonedas);
    actualizarComparacionMonedas();
}

/////////////////**INICIALIZA EL SELECTOR DE MONEDA BASE*/////////////////
function inicializarSelectorMonedaBase() {
    if (DOM.baseCurrency) {
        DOM.baseCurrency.innerHTML = `
            <option value="USD">USD (Dólar Estadounidense)</option>
            <option value="EUR">EUR (Euro)</option>
            <option value="PEN">PEN (Sol Peruano)</option>
        `;
    }
}

/////////////////**ACTUALIZA LA COMPARACIÓN DE MONEDAS*/////////////////
function actualizarComparacionMonedas() {
    if (!DOM.baseCurrency || !DOM.comparatorResults) return;
    
    const monedaBase = DOM.baseCurrency.value;
    
    if (!validarMonedaBase(monedaBase)) {
        mostrarMensajeErrorComparador('Selecciona una moneda base válida');
        return;
    }
    const comparacion = generarComparacionMonedas(monedaBase);
    DOM.comparatorResults.innerHTML = comparacion;
}

/////////////////**VALIDA LA MONEDA BASE SELECCIONADA*/////////////////
function validarMonedaBase(monedaBase) {
    return monedaBase && estado.tasas[monedaBase];
}

/////////////////**MUESTRA MENSAJE DE ERROR EN EL COMPARADOR*/////////////////
function mostrarMensajeErrorComparador(mensaje) {
    if (DOM.comparatorResults) {
        DOM.comparatorResults.innerHTML = `<p class="error-mensaje">${mensaje}</p>`;
    }
}

/////////////////**GENERA LA COMPARACIÓN DE MONEDAS*/////////////////
function generarComparacionMonedas(monedaBase) {
    const monedasAComparar = obtenerMonedasParaComparar(monedaBase);
    
    if (monedasAComparar.length === 0) {
        return '<p class="info-mensaje">No hay tasas disponibles para comparación</p>';
    }
    
    return monedasAComparar.map(moneda => 
        generarItemComparacion(monedaBase, moneda)
    ).join('');
}

/////////////////**OBTIENE LAS MONEDAS PARA COMPARAR*/////////////////
function obtenerMonedasParaComparar(monedaBase) {
    // Monedas fijas para comparación según requerimiento
    const monedasComparacionFijas = [
        'EUR', 'GBP', 'COP', 'MXN', 'BRL', 'CAD', 'USD', 'PEN'
    ];
    let monedasDisponibles = monedasComparacionFijas
        .filter(moneda => moneda !== monedaBase && estado.tasas[moneda]);
    
    // Si PEN no está en la lista y no es la moneda base, forzar su inclusión
    if (monedaBase !== 'PEN' && !monedasDisponibles.includes('PEN') && estado.tasas['PEN']) {
        monedasDisponibles.push('PEN');
    }
    
    if (monedasDisponibles.length > 7) {
        // Separar PEN del resto
        const otrasMonedas = monedasDisponibles.filter(moneda => moneda !== 'PEN');
        const penIncluido = monedasDisponibles.includes('PEN') ? ['PEN'] : [];
      
        monedasDisponibles = [...otrasMonedas.slice(0, 6), ...penIncluido];
    }
    
    return monedasDisponibles.slice(0, 7);
}

/////////////////**GENERA UN ITEM DE COMPARACIÓN INDIVIDUAL*/////////////////
function generarItemComparacion(monedaBase, monedaComparar) {
    const tasaCambio = calcularTasaCambio(monedaBase, monedaComparar);
    const nombreMoneda = obtenerNombreMonedaComparador(monedaComparar);
    
    return `
        <div class="comparator-item">
            <div class="comparator-currency">${monedaComparar} (${nombreMoneda})</div>
            <div class="comparator-label">1 ${monedaBase} =</div>
            <div class="comparator-value">${tasaCambio.toFixed(4)} ${monedaComparar}</div>
        </div>
    `;
}

/////////////////**CALCULA LA TASA DE CAMBIO ENTRE DOS MONEDAS*/////////////////
function calcularTasaCambio(monedaBase, monedaComparar) {
    const tasaBase = estado.tasas[monedaBase];
    const tasaComparar = estado.tasas[monedaComparar];
    return tasaComparar / tasaBase;
}

/////////////////**OBTIENE EL NOMBRE COMPLETO DE LA MONEDA*/////////////////
function obtenerNombreMonedaComparador(codigoMoneda) {
    const nombresMonedasComparador = {
        'USD': 'Dólar Estadounidense', 'EUR': 'Euro', 'GBP': 'Libra Esterlina', 'COP': 'Peso Colombiano',
        'MXN': 'Peso Mexicano','BRL': 'Real Brasileño','CAD': 'Dólar Canadiense','PEN': 'Sol Peruano'
    };
    
    return nombresMonedasComparador[codigoMoneda] || codigoMoneda;
}

/////////////////**INICIALIZA EL COMPARADOR DE MONEDAS*/////////////////
function inicializarComparadorMonedas() {
    configurarComparadorMonedas();
    console.log('✅ Comparador de monedas inicializado correctamente');
}

// Inicializar cuando el script se carga
inicializarComparadorMonedas();