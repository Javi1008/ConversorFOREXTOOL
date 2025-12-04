// =============================================
//           VALIDACIONES Y UTILITARIAS
// =============================================
/////////////////**VALIDA UN NOMBRE DE USUARIO*/////////////////
function validarNombreUsuario(nombre) {
    if (typeof nombre !== "string" || nombre.trim() === "") return false;
    
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const longitudValida = nombre.trim().length >= 3 && nombre.trim().length <= 20;
    
    return soloLetras.test(nombre.trim()) && longitudValida;
}

/////////////////**VALIDA UN EMAIL*/////////////////
function validarEmail(email) {
    if (typeof email !== "string" || email.trim() === "") return false;
    
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email.trim());
}

/////////////////**VALIDA UNA CONTRASEÑA*/////////////////
function validarPassword(password) {
    return password && password.length >= 4;
}

/////////////////**VALIDA SI UNA CANTIDAD ES VÁLIDA*/////////////////
function esCantidadValida(valor) {
    if (!valor || valor.trim() === "") return false;
    
    const regexCantidad = /^\d+(\.\d{1,2})?$/;
    const esNumerico = regexCantidad.test(valor);
    const esMayorCero = parseFloat(valor) > 0;
    
    return esNumerico && esMayorCero;
}

/////////////////**MUESTRA UNA NOTIFICACIÓN TEMPORAL*/////////////////
function mostrarNotificacion(mensaje, tipo = 'info') {
    if (!DOM.notificacion) {
        alert(mensaje);
        return;
    }
    
    DOM.notificacion.textContent = mensaje;
    DOM.notificacion.className = 'notification';
    
    if (tipo === 'error') {
        DOM.notificacion.classList.add('error');
    } else if (tipo === 'success') {
        DOM.notificacion.classList.add('success');
    }
    
    DOM.notificacion.classList.add('show');
    
    clearTimeout(DOM._notifTimeout);
    DOM._notifTimeout = setTimeout(() => 
        DOM.notificacion.classList.remove('show'), 3000);
}

/////////////////**FORMATEA UN NÚMERO COMO MONEDA*/////////////////
function formatearMoneda(valor) {
    return Number(valor).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/////////////////**INICIALIZA EL MÓDULO DE VALIDACIONES Y UTILITARIAS*/////////////////
function inicializarModuloValidaciones() {
    console.log('✅ Módulo de validaciones y utilitarias inicializado correctamente');
}
inicializarModuloValidaciones();// Inicializa cuando el script se carga