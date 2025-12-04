// =============================================
//            SISTEMA DE AUTENTICACIÓN 
// =============================================

/////////////**MUESTRA EL MODAL DE INICIO DE SESIÓN*/////////////
function mostrarModalLogin() {
    DOM.loginModal.style.display = 'flex';
    setTimeout(() => DOM.loginModal.classList.add('active'), 10);
    limpiarFormularioLogin();
}

/////////////**OCULTA EL MODAL DE INICIO DE SESIÓN*/////////////
function ocultarModalLogin() {
    DOM.loginModal.classList.remove('active');
    setTimeout(() => DOM.loginModal.style.display = 'none', 300);
}

/////////////**MUESTRA EL MODAL DE REGISTRO DE USUARIO*/////////////
function mostrarModalRegistro() {
    ocultarModalLogin();
    DOM.registerModal.style.display = 'flex';
    setTimeout(() => DOM.registerModal.classList.add('active'), 10);
    limpiarFormularioRegistro();
}

/////////////**OCULTA EL MODAL DE REGISTRO DE USUARIO*/////////////
function ocultarModalRegistro() {
    DOM.registerModal.classList.remove('active');
    setTimeout(() => DOM.registerModal.style.display = 'none', 300);
}

/////////////*LIMPIA Y RESETEA EL FORMULARIO DE LOGIN*/////////
function limpiarFormularioLogin() {
    DOM.loginEmail.value = '';
    DOM.loginPassword.value = '';
    DOM.loginError.textContent = '';
    DOM.loginError.style.display = 'none';
}

////////////**LIMPIA Y RESETEA EL FORMULARIO DE REGISTRO*////////////
function limpiarFormularioRegistro() {
    DOM.registerName.value = '';
    DOM.registerEmail.value = '';
    DOM.registerPassword.value = '';
    DOM.registerConfirmPassword.value = '';
    DOM.registerPrefCurrency.value = 'USD';    
    
    // Ocultar mensajes de error
    DOM.registerNameError.style.display = 'none';
    DOM.registerEmailError.style.display = 'none';
    DOM.registerPasswordError.style.display = 'none';
}

/**VALIDA LAS CREDENCIALES DE LOGIN
 * @param {string} email 
 * @param {string} password 
 * @returns {Object|null} */
async function validarCredencialesLogin(email, password) {
    if (!email || !password) {
        return { valido: false, error: 'Por favor, completa todos los campos' };
    }
    
    // Validar contra MySQL
    const resultado = await validarLoginEnMySQL(email, password);
    
    if (!resultado.success) {
        return { valido: false, error: resultado.error };
    }
    
    return { 
        valido: true, 
        usuario: {
            id: resultado.usuario.id,
            name: resultado.usuario.name,
            email: resultado.usuario.email,
            prefCurrency: resultado.usuario.pref_currency,
            created: resultado.usuario.created
        }
    };
}

/**PROCESA EL INICIO DE SESIÓN DEL USUARIO
 * @param {Event} e - EVENTO FORMULARIO*/
async function procesarLogin(e) {
    e.preventDefault();
    
    const email = DOM.loginEmail.value.trim();
    const password = DOM.loginPassword.value;
    
    const validacion = await validarCredencialesLogin(email, password);
    
    if (!validacion.valido) {
        DOM.loginError.textContent = validacion.error;
        DOM.loginError.style.display = 'block';
        return;
    }
    
    iniciarSesionUsuario(validacion.usuario);
}

/**INICIA SESIÓN CON EL USUARIO PROPORCIONADO
 * @param {Object} usuario - OBJETO USUARIO*/
function iniciarSesionUsuario(usuario) {
    estado.usuarioActivoId = usuario.id;
    estado.isLoggedIn = true;
    estado.usuarioActivo = usuario;
    
    // Cargar historial desde MySQL
    cargarHistorialDesdeMySQL(usuario.email);
    
    // Cargar favoritos desde MySQL
    cargarFavoritosDesdeMySQL(usuario.id);
    
    // Limpiar pantalla del conversor
    limpiarPantallaConversor();
    
    actualizarInterfazPostLogin();
    ocultarModalLogin();
    mostrarNotificacion(`¡Bienvenido, ${usuario.name}!`, 'success');
}

/////////////////**LIMPIA LA PANTALLA DEL CONVERSOR*/////////////////
function limpiarPantallaConversor() {
    if (DOM.inputCantidad) DOM.inputCantidad.value = '';
    if (DOM.textoResultado) DOM.textoResultado.textContent = '';
    if (DOM.textoTasa) DOM.textoTasa.textContent = '';
    
    // Resetear selects a valores por defecto
    if (DOM.monedaOrigen) DOM.monedaOrigen.value = 'USD';
    if (DOM.monedaDestino) DOM.monedaDestino.value = 'PEN';
}

function actualizarInterfazPostLogin() {
    actualizarPerfilUI();
    
    // Habilitar todas las pestañas
    document.querySelectorAll('.nav-tab').forEach(pestana => {
        pestana.style.pointerEvents = 'auto';
        pestana.style.opacity = '1';
    });
}

/////////**HABILITA TODAS LAS PESTAÑAS DE NAVEGACIÓN*/////////
function habilitarPestanasNavegacion() {
    document.querySelectorAll('.nav-tab').forEach(pestana => {
        pestana.style.pointerEvents = 'auto';
        pestana.style.opacity = '1';
    });
}

/**VALIDA LOS DATOS DEL FORMULARIO DE REGISTRO
 * @param {Object} datos - DATOS DEL FORMULARIO
 * @returns {Object} RESULTADO DE LA VALIDACIÓN*/
async function validarDatosRegistro(datos) {
    const errores = {};
    
    if (!validarNombreUsuario(datos.nombre)) {
        errores.nombre = 'El nombre debe tener entre 3 y 20 letras (solo letras y espacios)';
    }
    
    if (!validarEmail(datos.email)) {
        errores.email = 'Por favor, ingrese un email válido';
    } else {
        // Verificar si email existe en MySQL
        const emailExiste = await verificarEmailEnMySQL(datos.email);
        if (emailExiste) {
            errores.email = 'Este email ya está registrado';
        }
    }
    
    if (!validarPassword(datos.password)) {
        errores.password = 'La contraseña debe tener al menos 4 caracteres';
    } else if (datos.password !== datos.confirmPassword) {
        errores.password = 'Las contraseñas no coinciden';
    }
    return {
        esValido: Object.keys(errores).length === 0,
        errores: errores
    };
}

/**PROCESA EL REGISTRO DE UN NUEVO USUARIO
 * @param {Event} e - EVENTO DEL FORMULARIO*/
async function procesarRegistro(e) {
    e.preventDefault();

    ocultarErroresRegistro();
    const datosFormulario = recogerDatosRegistro();// Recoger datos del formulario
    const validacion = await validarDatosRegistro(datosFormulario);// Validar datos

    if (!validacion.esValido) {
        mostrarErroresRegistro(validacion.errores);
        return;
    }
    await registrarNuevoUsuario(datosFormulario);
}

/**RECOGE LOS DATOS DEL FORMULARIO DE REGISTRO
 * @returns {Object} DATOS DEL FORMULARIO*/
function recogerDatosRegistro() {
    return {
        nombre: DOM.registerName.value.trim(),
        email: DOM.registerEmail.value.trim(),
        password: DOM.registerPassword.value,
        confirmPassword: DOM.registerConfirmPassword.value,
        monedaPreferida: DOM.registerPrefCurrency.value
    };
}

///////**OCULTA TODOS LOS MENSAJES DE ERROR DEL REGISTRO*////////
function ocultarErroresRegistro() {
    DOM.registerNameError.style.display = 'none';
    DOM.registerEmailError.style.display = 'none';
    DOM.registerPasswordError.style.display = 'none';
}

/**MUESTRA LOS ERRORES DE VALIDACIÓN EN EL FORMULARIO
* @param {Object} errores - OBJETO CON ERRORES*/
function mostrarErroresRegistro(errores) {
    if (errores.nombre) {
        DOM.registerNameError.textContent = errores.nombre;
        DOM.registerNameError.style.display = 'block';
    }
    if (errores.email) {
        DOM.registerEmailError.textContent = errores.email;
        DOM.registerEmailError.style.display = 'block';
    }
    if (errores.password) {
        DOM.registerPasswordError.textContent = errores.password;
        DOM.registerPasswordError.style.display = 'block';
    }
}

/**REGISTRA UN NUEVO USUARIO EN EL SISTEMA
 @param {Object} datos DATOS DEL USUARIO*/
async function registrarNuevoUsuario(datos) {
    try {
        // Registrar en MySQL
        const resultado = await registrarUsuarioEnMySQL(datos);
        
        if (resultado.success) {
            // Iniciar sesión automáticamente después del registro
            const usuario = {
                id: resultado.userId,
                name: datos.nombre,
                email: datos.email,
                prefCurrency: datos.monedaPreferida,
                created: new Date().toISOString()
            };
            
            iniciarSesionUsuario(usuario);
            ocultarModalRegistro();
            mostrarNotificacion(`¡Cuenta creada exitosamente! Bienvenido, ${datos.nombre}`, 'success');
        } else {
            mostrarNotificacion('Error al crear cuenta: ' + resultado.error, 'error');
        }
        
    } catch (error) {
        console.error('❌ Error en registro:', error);
        mostrarNotificacion('Error al crear cuenta: ' + error.message, 'error');
    }
}

/////////**CIERRA LA SESIÓN DEL USUARIO ACTUAL*/////////
function cerrarSesionUsuario() {
    if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        return;
    }
    
    estado.usuarioActivoId = null;// Limpia el estado de sesión
    estado.isLoggedIn = false;
    estado.usuarioActivo = null;
    estado.historialUsuario = [];
    estado.favoriteConversions = {};

    // Limpiar pantalla al cerrar sesión
    limpiarPantallaConversor();

    actualizarInterfazPostLogout();
    mostrarNotificacion('Sesión cerrada', 'info');
    mostrarModalLogin();
}

///////**ACTUALIZA LA INTERFAZ DESPUÉS DEL CERRADO DE SESIÓN *///////
function actualizarInterfazPostLogout() {
    actualizarPerfilUI();
    
    // Deshabilitar pestañas que requieren login
    document.querySelectorAll('.nav-tab').forEach(pestana => {
        const tabId = pestana.getAttribute('data-tab');
        if (tabId !== 'converter') {
            pestana.style.pointerEvents = 'none';
            pestana.style.opacity = '0.5';
        }
        pestana.classList.remove('active');
    });
    
    // Mostrar solo la pestaña del conversor
    mostrarPestanaConversor();
}

/////////////**DESHABILITA LAS PESTAÑAS DE NAVEGACIÓN (excepto la del conversor)*///////
function deshabilitarPestanasNavegacion() {
    document.querySelectorAll('.nav-tab').forEach(pestana => {
        const tabId = pestana.getAttribute('data-tab');
        if (tabId !== 'converter') {
            pestana.style.pointerEvents = 'none';
            pestana.style.opacity = '0.5';
        }
        pestana.classList.remove('active');
    });
}

///////////////////**MUESTRA SOLO LA PESTAÑA DEL CONVERSOR*///////////////////
function mostrarPestanaConversor() {
    const pestanaConversor = document.querySelector('.nav-tab[data-tab="converter"]');
    if (pestanaConversor) {
        pestanaConversor.classList.add('active');
    }
    
    document.querySelectorAll('.tab-content').forEach(contenido => {
        contenido.classList.add('hidden');
    });
    
    const contenidoConversor = document.getElementById('converter-tab');
    if (contenidoConversor) {
        contenidoConversor.classList.remove('hidden');
    }
}

//////////////** CONFIGURA TODOS LOS EVENT LISTENERS DE AUTENTICACIÓN*////////////
function configurarEventListenersAutenticacion() {
    // Login
    if (DOM.btnLogin) {
        DOM.btnLogin.addEventListener('click', procesarLogin);
    }
    
    // Registro
    if (DOM.btnRegister) {
        DOM.btnRegister.addEventListener('click', procesarRegistro);
    }
    
    // Navegación entre modales
    if (DOM.btnShowRegister) {
        DOM.btnShowRegister.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarModalRegistro();
        });
    }
    
    if (DOM.btnShowLogin) {
        DOM.btnShowLogin.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarModalRegistro();
            mostrarModalLogin();
        });
    }
    
    // Cerrar sesión
    if (DOM.btnEliminarUsuario) {
        DOM.btnEliminarUsuario.addEventListener('click', cerrarSesionUsuario);
    }
    
    // Eliminar cuenta
    if (DOM.btnEliminarCuenta) {
        DOM.btnEliminarCuenta.addEventListener('click', mostrarConfirmacionEliminarCuenta);
    }
}

/////////////////////**Inicializa el sistema de autenticación*/////////////////////
function inicializarSistemaAutenticacion() {
    configurarEstadoInicialSesion();
    configurarEventListenersAutenticacion();
    
    // Mostrar modal de login al inicio
    setTimeout(() => {
        mostrarModalLogin();
    }, 500);
}

////////////////////**CONFIGURA EL ESTADO INICIAL DE LA SESIÓN*//////////////////////
function configurarEstadoInicialSesion() {
    estado.usuarioActivoId = null;
    estado.isLoggedIn = false;
    estado.usuarioActivo = null;
    estado.historialUsuario = [];
    estado.favoriteConversions = {};
    
    // Deshabilita todas las pestañas excepto conversor
    deshabilitarPestanasNavegacion();
}

// =============================================
//            FUNCIONES MYSQL
// =============================================

/////////////////**ENDPOINT 1: POST - REGISTRAR USUARIO EN MYSQL*/////////////////
async function registrarUsuarioEnMySQL(datosUsuario) {
    try {
        console.log('🔵 EJECUTANDO ENDPOINT 1: POST - Registrar usuario en MySQL');
        
        const response = await fetch(SERVER_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: datosUsuario.nombre,
                email: datosUsuario.email,
                password: datosUsuario.password,
                prefCurrency: datosUsuario.monedaPreferida
            })
        });

        if (!response.ok) {
            return { success: false, error: 'Error de conexión HTTP' };
        }

        const resultado = await response.json();
        
        if (resultado.success) {
            console.log('✅ Usuario registrado en MySQL con ID:', resultado.userId);
            return { success: true, userId: resultado.userId };
        } else {
            console.warn('⚠️ MySQL rechazó registro:', resultado.error);
            return { success: false, error: resultado.error };
        }
    } catch (error) {
        console.warn('⚠️ Error de conexión MySQL:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/////////////////**VALIDAR LOGIN EN MYSQL*/////////////////
async function validarLoginEnMySQL(email, password) {
    try {
        const response = await fetch(SERVER_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            return { success: false, error: 'Error de conexión HTTP' };
        }

        const resultado = await response.json();
        
        if (resultado.success) {
            return { success: true, usuario: resultado.usuario };
        } else {
            return { success: false, error: resultado.error };
        }
    } catch (error) {
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/////////////////**VERIFICAR EMAIL EN MYSQL*/////////////////
async function verificarEmailEnMySQL(email) {
    try {
        const response = await fetch(SERVER_BASE_URL + '?action=checkEmail&email=' + encodeURIComponent(email));
        const resultado = await response.json();
        
        return resultado.exists;
    } catch (error) {
        console.error('Error verificando email:', error);
        return false;
    }
}

/////////////////**ENDPOINT 2: PUT - ACTUALIZAR PERFIL EN MYSQL*/////////////////
async function actualizarPerfilEnMySQL(datosUsuario) {
    try {
        console.log('🟡 EJECUTANDO ENDPOINT 2: PUT - Actualizar perfil en MySQL');
        
        const response = await fetch(SERVER_BASE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                originalEmail: datosUsuario.originalEmail,
                name: datosUsuario.name,
                email: datosUsuario.email,
                prefCurrency: datosUsuario.prefCurrency,
                password: datosUsuario.password || ''
            })
        });

        if (!response.ok) {
            return { success: false, error: 'Error de conexión HTTP: ' + response.status };
        }

        const resultado = await response.json();
        console.log('📥 Respuesta del servidor:', resultado);
        
        if (resultado.success) {
            console.log('✅ Perfil actualizado ');
            return { success: true };
        } else {
            console.warn('⚠️ MySQL rechazó actualización:', resultado.error);
            return { success: false, error: resultado.error };
        }
    } catch (error) {
        console.warn('⚠️ Error de conexión MySQL:', error);
        return { success: false, error: 'Error de conexión con el servidor: ' + error.message };
    }
}

/////////////////**ENDPOINT 3: DELETE - ELIMINAR USUARIO DE MYSQL*/////////////////
async function eliminarUsuarioDeMySQL(email) {
    try {
        console.log('🔴 EJECUTANDO ENDPOINT 3: DELETE - Eliminar usuario de MySQL');
        
        const response = await fetch(SERVER_BASE_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            })
        });

        if (!response.ok) {
            return { success: false, error: 'Error de conexión HTTP' };
        }

        const resultado = await response.json();
        
        if (resultado.success) {
            console.log('✅ Usuario eliminado de MySQL:', email);
            return { success: true };
        } else {
            console.warn('⚠️ MySQL rechazó eliminación:', resultado.error);
            return { success: false, error: resultado.error };
        }
    } catch (error) {
        console.warn('⚠️ Error de conexión MySQL:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/////////////////**CARGAR HISTORIAL DESDE MYSQL*/////////////////
async function cargarHistorialDesdeMySQL(email) {
    try {
        const conversiones = await obtenerConversionesUsuarioMySQL(email);
        estado.historialUsuario = conversiones;
        
        if (typeof renderizarHistorial === 'function') {
            renderizarHistorial();
        }
        
        if (DOM.perfilHistoryCount) {
            DOM.perfilHistoryCount.textContent = conversiones.length;
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
    }
}

/////////////////**CARGAR FAVORITOS DESDE MYSQL*/////////////////
async function cargarFavoritosDesdeMySQL(userId) {
    try {
        // Por ahora, inicializamos favoritos vacíos
        estado.favoriteConversions = {};
        
        if (typeof updateFavorites === 'function') {
            updateFavorites();
        }
    } catch (error) {
        console.error('Error cargando favoritos:', error);
    }
}

/////////////////**OBTIENE LAS CONVERSIONES DEL USUARIO DESDE MYSQL*/////////////////
async function obtenerConversionesUsuarioMySQL(email) {
    try {
        const response = await fetch(SERVER_BASE_URL + '?action=getUserConversions&email=' + encodeURIComponent(email));
        const resultado = await response.json();
        
        if (resultado.success) {
            console.log('✅ Conversiones obtenidas desde MySQL:', resultado.conversiones);
            return resultado.conversiones;
        } else {
            console.error('❌ Error al obtener conversiones:', resultado.error);
            return [];
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        return [];
    }
}

/////////////////**ELIMINAR CUENTA*/////////////////

/////////////////**MUESTRA LA CONFIRMACIÓN PARA ELIMINAR CUENTA*/////////////////
function mostrarConfirmacionEliminarCuenta() {
    if (!estado.isLoggedIn || !estado.usuarioActivo) {
        mostrarNotificacion('Debes iniciar sesión para eliminar la cuenta', 'error');
        return;
    }

    const modal = document.getElementById('confirmDeleteModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

/////////////////**OCULTA LA CONFIRMACIÓN DE ELIMINAR CUENTA*/////////////////
function ocultarConfirmacionEliminarCuenta() {
    const modal = document.getElementById('confirmDeleteModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

/////////////////**CONFIRMA LA ELIMINACIÓN DE LA CUENTA*/////////////////
async function confirmarEliminarCuenta() {
    if (!estado.isLoggedIn || !estado.usuarioActivo) {
        mostrarNotificacion('Error: No hay usuario activo', 'error');
        return;
    }

    try {
        // Eliminar de MySQL usando ENDPOINT 3: DELETE
        const resultadoMySQL = await eliminarUsuarioDeMySQL(estado.usuarioActivo.email);
        
        if (!resultadoMySQL.success) {
            mostrarNotificacion('Error al eliminar cuenta en MySQL: ' + resultadoMySQL.error, 'error');
            return;
        }

        // Limpiar datos de sesión
        estado.usuarioActivoId = null;
        estado.isLoggedIn = false;
        estado.usuarioActivo = null;
        estado.historialUsuario = [];
        estado.favoriteConversions = {};

        // Limpiar pantalla al eliminar cuenta
        limpiarPantallaConversor();

        mostrarNotificacion('✅ Cuenta eliminada correctamente. Todos tus datos e historial han sido eliminados ✅.', 'success');
        
        // Actualizar interfaz y volver al login
        actualizarInterfazPostLogout();
        ocultarConfirmacionEliminarCuenta();
        setTimeout(() => mostrarModalLogin(), 1000);
        
    } catch (error) {
        console.error('Error en eliminar cuenta:', error);
        mostrarNotificacion('Error al eliminar cuenta: ' + error.message, 'error');
    }
}

/////////////////**CONFIGURA EVENT LISTENERS PARA ELIMINAR CUENTA*/////////////////
function configurarEventListenersEliminarCuenta() {
    if (DOM.btnEliminarCuenta) {
        DOM.btnEliminarCuenta.addEventListener('click', mostrarConfirmacionEliminarCuenta);
    }
    if (DOM.btnCancelDelete) {
        DOM.btnCancelDelete.addEventListener('click', ocultarConfirmacionEliminarCuenta);
    }
    if (DOM.btnConfirmDelete) {
        DOM.btnConfirmDelete.addEventListener('click', confirmarEliminarCuenta);
    }
}

// Configurar event listeners cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    configurarEventListenersEliminarCuenta();
});

console.log('✅ Sistema de autenticación inicializado correctamente');