// =============================================
//           CONVERSIONES FAVORITAS
// =============================================
/////////////////**ACTUALIZA LAS CONVERSIONES FAVORITAS*/////////////////
function updateFavorites() {
    if (!DOM.favoritesResults) return;
    
    if (!estado.isLoggedIn || !estado.usuarioActivoId) {
        DOM.favoritesResults.innerHTML = '<p>Debes iniciar sesión para ver tus favoritos</p>';
        return;
    }
    
    const userFavorites = estado.favoriteConversions[estado.usuarioActivoId] || {};
    
    if (Object.keys(userFavorites).length === 0) {
        DOM.favoritesResults.innerHTML = '<p>No tienes conversiones favoritas aún. Realiza conversiones para verlas aquí.</p>';
        return;
    }
    
    const conversionTop = obtenerConversionTop(userFavorites);
    
    if (!conversionTop) {
        DOM.favoritesResults.innerHTML = '<p>No tienes conversiones favoritas aún.</p>';
        return;
    }
    
    mostrarConversionesFavoritas(conversionTop, userFavorites);
}

/////////////////**OBTIENE LA CONVERSIÓN MÁS FRECUENTE*/////////////////
function obtenerConversionTop(userFavorites) {
    let maxCount = 0;
    let topConversion = null;
    
    for (const [pair, count] of Object.entries(userFavorites)) {
        if (count > maxCount) {
            maxCount = count;
            topConversion = pair;
        }
    }
    
    if (!topConversion) return null;
    
    const [from, to] = topConversion.split('-');
    return { from, to, count: maxCount };
}

/////////////////**MUESTRA LAS CONVERSIONES FAVORITAS EN EL DOM*/////////////////
function mostrarConversionesFavoritas(conversionTop, userFavorites) {
    let html = generarHTMLConversionTop(conversionTop);
    
    const otrasConversiones = obtenerOtrasConversiones(userFavorites, conversionTop);
    
    if (otrasConversiones.length > 0) {
        html += generarHTMLOtrasConversiones(otrasConversiones, conversionTop.count);
    }
    
    DOM.favoritesResults.innerHTML = html;
}

/////////////////**GENERA EL HTML PARA LA CONVERSIÓN TOP*/////////////////
function generarHTMLConversionTop(conversionTop) {
    return `
        <div class="favorite-item-main">
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: white; margin-bottom: 10px;">Tu Conversión Favorita</h3>
                <p style="color: rgba(255,255,255,0.8); font-size: 14px;">La conversión que más has realizado</p>
            </div>
            <div class="favorite-pair-main">${conversionTop.from} → ${conversionTop.to}</div>
            <div class="favorite-count-main">Realizada ${conversionTop.count} ${conversionTop.count === 1 ? 'vez' : 'veces'}</div>
            <div class="favorite-progress">
                <div class="favorite-progress-bar" style="width: 100%"></div>
            </div>
        </div>
    `;
}

/////////////////**OBTIENE LAS OTRAS CONVERSIONES*/////////////////
function obtenerOtrasConversiones(userFavorites, conversionTop) {
    const topPair = `${conversionTop.from}-${conversionTop.to}`;
    
    return Object.entries(userFavorites)
        .filter(([pair]) => pair !== topPair)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
}

/////////////////**GENERA EL HTML PARA LAS OTRAS CONVERSIONES*/////////////////
function generarHTMLOtrasConversiones(otrasConversiones, maxCount) {
    let html = '<div style="margin-top: 30px;"><h4 style="color: #008080; margin-bottom: 15px;">Otras Conversiones</h4><div class="favorites-grid">';
    
    otrasConversiones.forEach(([pair, count]) => {
        const [from, to] = pair.split('-');
        const percentage = (count / maxCount) * 100;
        html += `
            <div class="favorite-item">
                <div class="favorite-pair">${from} → ${to}</div>
                <div class="favorite-count">${count} ${count === 1 ? 'vez' : 'veces'}</div>
                <div class="favorite-progress">
                    <div class="favorite-progress-bar" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    return html;
}

/////////////////**AGREGA UNA CONVERSIÓN A FAVORITOS*/////////////////
function addToFavorites(fromCurrency, toCurrency) {
    if (!estado.isLoggedIn || !estado.usuarioActivoId) return;
    
    const pair = `${fromCurrency}-${toCurrency}`;
    
    if (!estado.favoriteConversions[estado.usuarioActivoId]) {
        estado.favoriteConversions[estado.usuarioActivoId] = {};
    }
    
    if (!estado.favoriteConversions[estado.usuarioActivoId][pair]) {
        estado.favoriteConversions[estado.usuarioActivoId][pair] = 1;
    } else {
        estado.favoriteConversions[estado.usuarioActivoId][pair]++;
    }
    
    updateFavorites();
}

/////////////////**LIMPIA LAS CONVERSIONES FAVORITAS*/////////////////
function clearFavorites() {
    if (!estado.isLoggedIn || !estado.usuarioActivoId) return;
    
    if (estado.favoriteConversions[estado.usuarioActivoId]) {
        estado.favoriteConversions[estado.usuarioActivoId] = {};
    }
    updateFavorites();
}

/////////////////**INICIALIZA LOS FAVORITOS*/////////////////
function inicializarFavoritos() {
    // Los favoritos se cargan desde MySQL al iniciar sesión
    console.log('✅ Favoritos inicializados (se cargarán al iniciar sesión)');
}

/////////////////**INICIALIZA EL MÓDULO DE FAVORITOS*/////////////////
function inicializarModuloFavoritos() {
    inicializarFavoritos();
    console.log('✅ Módulo de favoritos inicializado correctamente');
}

inicializarModuloFavoritos();