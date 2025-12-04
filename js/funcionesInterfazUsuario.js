// =============================================
//           FUNCIONES DE INTERFAZ DE USUARIO
// =============================================
/////////////////**CREA UNA OPCIÓN DE MONEDA PARA SELECT*/////////////////
function crearOpcionMoneda(codigo) {
    const nombre = NOMBRES_MONEDAS[codigo] || codigo;
    return `<option value="${codigo}">(${codigo}) ${nombre}</option>`;
}

/////////////////**POBLA UN ELEMENTO SELECT CON OPCIONES DE MONEDAS*/////////////////
function poblarSelect(selectElement, monedas) {
    if (!selectElement) return;
    
    selectElement.innerHTML = monedas
        .map(crearOpcionMoneda)
        .join("");
}

/////////////////**HABILITA BÚSQUEDA RÁPIDA EN SELECTS DE MONEDAS*/////////////////
function habilitarBusquedaRapida(selectElement) {
    if (!selectElement) return;
    
    let terminoBusqueda = "";
    let tiempoBusqueda;
    
    selectElement.addEventListener("keydown", (e) => {
        clearTimeout(tiempoBusqueda);
        
        if (e.key.length === 1) {
            terminoBusqueda += e.key.toUpperCase();
            const match = [...selectElement.options].find(opt =>
                opt.value.startsWith(terminoBusqueda));
            if (match) selectElement.value = match.value;
        }
        
        tiempoBusqueda = setTimeout(() => (terminoBusqueda = ""), 1000);
    });
}

/////////////////**INTERCAMBIA LAS MONEDAS EN EL CONVERSOR*/////////////////
function intercambiarMonedas() {
    if (!DOM.monedaOrigen || !DOM.monedaDestino) return;
    
    [DOM.monedaOrigen.value, DOM.monedaDestino.value] = 
        [DOM.monedaDestino.value, DOM.monedaOrigen.value];
}

/////////////////**ALTERNA ENTRE MODO OSCURO Y CLARO*/////////////////
function alternarModoOscuro() {
    document.body.classList.toggle("modo-oscuro");
    actualizarBotonModoOscuro();
}

/////////////////**ACTUALIZA EL ICONO DEL BOTÓN DE TEMA*/////////////////
function actualizarBotonModoOscuro() {
    if (!DOM.themeToggle) return;
    
    const span = DOM.themeToggle.querySelector('span');
    if (span) {
        span.textContent = document.body.classList.contains("modo-oscuro") ? "☀" : "☽";
    }
}

/////////////////**ACTUALIZA LA INTERFAZ DEL PERFIL DE USUARIO*/////////////////
function actualizarPerfilUI() {
    if (!estado.isLoggedIn || !estado.usuarioActivo) {
        if(DOM.perfilUsername) DOM.perfilUsername.textContent = "-";
        if(DOM.perfilEmail) DOM.perfilEmail.textContent = "-";
        if(DOM.perfilCurrency) DOM.perfilCurrency.textContent = "-";
        if(DOM.perfilCreated) DOM.perfilCreated.textContent = "-";
        if(DOM.perfilHistoryCount) DOM.perfilHistoryCount.textContent = "0";
        return;
    }
    
    if(DOM.perfilUsername) DOM.perfilUsername.textContent = estado.usuarioActivo.name || "-";
    if(DOM.perfilEmail) DOM.perfilEmail.textContent = estado.usuarioActivo.email || "-";
    if(DOM.perfilCurrency) DOM.perfilCurrency.textContent = estado.usuarioActivo.prefCurrency || "-";
    if(DOM.perfilCreated) DOM.perfilCreated.textContent = estado.usuarioActivo.created 
        ? new Date(estado.usuarioActivo.created).toLocaleDateString() 
        : "-";
    if(DOM.perfilHistoryCount) DOM.perfilHistoryCount.textContent = estado.historialUsuario 
        ? estado.historialUsuario.length 
        : 0;
}

/////////////////**CONFIGURA LA NAVEGACIÓN POR PESTAÑAS*/////////////////
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Verificar si el usuario está logueado para pestañas restringidas
            const tabId = this.getAttribute('data-tab');
            
            // Pestañas que requieren login
            const tabsRequireLogin = ['comparator', 'inverse', 'favorites', 'history', 'trends'];
            
            if (tabsRequireLogin.includes(tabId) && !estado.isLoggedIn) {
                mostrarNotificacion('Por favor, inicia sesión para acceder a esta sección', 'error');
                mostrarModalLogin();
                return;
            }
            
            // Cambiar pestaña activa
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Ocultar todos los contenidos
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Mostrar el contenido correspondiente
            const targetTab = document.getElementById(`${tabId}-tab`);
            if (targetTab) {
                targetTab.classList.remove('hidden');
                
                // Inicializar funcionalidades según la pestaña activa
                switch(tabId) {
                    case 'trends':
                        setTimeout(() => { 
                            if(typeof renderizarTendencias === 'function') renderizarTendencias(); 
                        }, 100);
                        break;
                    case 'comparator':
                        setTimeout(() => { 
                            if(typeof actualizarComparacionMonedas === 'function') actualizarComparacionMonedas(); 
                        }, 100);
                        break;
                    case 'favorites':
                        setTimeout(() => { 
                            if(typeof updateFavorites === 'function') updateFavorites(); 
                        }, 100);
                        break;
                    case 'history':
                        setTimeout(() => { 
                            if(typeof renderizarHistorial === 'function') renderizarHistorial(); 
                        }, 100);
                        break;
                }
            }
        });
    });
    
    console.log('✅ Navegación por pestañas configurada');
}

/////////////////**INICIALIZA EL MÓDULO DE INTERFAZ DE USUARIO*/////////////////
function inicializarModuloInterfazUsuario() {
    console.log('✅ Módulo de interfaz de usuario inicializado correctamente');
}

// Inicializa cuando el script se carga
inicializarModuloInterfazUsuario();