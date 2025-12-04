// =============================================
//            ESTADO GLOBAL Y REFERENCIAS DOM
// =============================================
/////////////////**OBJETO DE ESTADO GLOBAL DE LA APLICACIÓN*/////////////////
const estado = {
  tasas: {},
  usuarioActivoId: null,
  usuarioActivo: null,
  favoriteConversions: {},
  historialUsuario: [],
  isLoggedIn: false
};

/////////////////**OBJETO PARA REFERENCIAS A ELEMENTOS DEL DOM*/////////////////
const DOM = {};

/////////////////**INICIALIZA TODAS LAS REFERENCIAS A ELEMENTOS DEL DOM*/////////////////
function initializeDOMReferences() {
  try {
    // Elementos principales del conversor
    DOM.monedaOrigen = document.getElementById("monedaOrigen");
    DOM.monedaDestino = document.getElementById("monedaDestino");
    DOM.inputCantidad = document.getElementById("amount");
    DOM.botonConvertir = document.getElementById("convertir");
    DOM.botonIntercambiar = document.getElementById("intercambiar");
    DOM.textoResultado = document.getElementById("resultado");
    DOM.textoTasa = document.getElementById("tasa");
    DOM.notificacion = document.getElementById("notification");
    DOM.themeToggle = document.getElementById("theme-toggle");
    
    // Elementos de perfil de usuario
    DOM.perfilUsername = document.getElementById("profile-username");
    DOM.perfilEmail = document.getElementById("profile-email");
    DOM.perfilCurrency = document.getElementById("profile-currency");
    DOM.perfilCreated = document.getElementById("profile-created");
    DOM.perfilHistoryCount = document.getElementById("profile-history-count");
    
    // Botones de gestión de perfil
    DOM.btnEliminarUsuario = document.getElementById("btnEliminarUsuario");
    DOM.btnEliminarCuenta = document.getElementById("btnEliminarCuenta");
    
    // Elementos del modal de inicio de sesión
    DOM.loginModal = document.getElementById("loginModal");
    DOM.loginForm = document.getElementById("loginForm");
    DOM.loginEmail = document.getElementById("loginEmail");
    DOM.loginPassword = document.getElementById("loginPassword");
    DOM.btnLogin = document.getElementById("btnLogin");
    DOM.btnShowRegister = document.getElementById("btnShowRegister");
    DOM.loginError = document.getElementById("loginError");
    
    // Elementos del modal de registro de usuario
    DOM.registerModal = document.getElementById("registerModal");
    DOM.registerForm = document.getElementById("registerForm");
    DOM.registerName = document.getElementById("registerName");
    DOM.registerEmail = document.getElementById("registerEmail");
    DOM.registerPassword = document.getElementById("registerPassword");
    DOM.registerConfirmPassword = document.getElementById("registerConfirmPassword");
    DOM.registerPrefCurrency = document.getElementById("registerPrefCurrency");
    DOM.btnRegister = document.getElementById("btnRegister");
    DOM.btnShowLogin = document.getElementById("btnShowLogin");
    DOM.registerNameError = document.getElementById("registerNameError");
    DOM.registerEmailError = document.getElementById("registerEmailError");
    DOM.registerPasswordError = document.getElementById("registerPasswordError");
    
    // Elementos de historial de conversiones
    DOM.historyBody = document.getElementById("history-body");
    DOM.deleteHistoryBtn = document.getElementById("delete-conversions");
    
    // Elementos de tendencias y gráficos
    DOM.trendsChart = document.getElementById("trendsChart");
    
    // Elementos de conversiones favoritas
    DOM.favoritesResults = document.getElementById("favorites-results");
    
    // Elementos del comparador de monedas
    DOM.baseCurrency = document.getElementById("base-currency");
    DOM.comparatorResults = document.getElementById("comparator-results");
    
    // Elementos de la calculadora inversa
    DOM.inverseForm = document.getElementById("inverse-form");
    DOM.inverseTarget = document.getElementById("inverse-target");
    DOM.inverseToCurrency = document.getElementById("inverse-to-currency");
    DOM.inverseFromCurrency = document.getElementById("inverse-from-currency");
    DOM.inverseResult = document.getElementById("inverse-result");
    
    // Elementos del modal de edición de perfil
    DOM.editProfileModal = document.getElementById("editProfileModal");
    DOM.btnShowEditProfile = document.getElementById("btnShowEditProfile");
    DOM.btnCloseEditProfile = document.getElementById("btnCloseEditProfile");
    DOM.editProfileName = document.getElementById("editProfileName");
    DOM.editProfileEmail = document.getElementById("editProfileEmail");
    DOM.editProfilePrefCurrency = document.getElementById("editProfilePrefCurrency");
    DOM.btnUpdateProfile = document.getElementById("btnUpdateProfile");
    DOM.editProfileNameError = document.getElementById("editProfileNameError");
    
    // Elementos del modal de confirmación eliminar cuenta
    DOM.confirmDeleteModal = document.getElementById("confirmDeleteModal");
    DOM.btnCancelDelete = document.getElementById("btnCancelDelete");
    DOM.btnConfirmDelete = document.getElementById("btnConfirmDelete");
    
    console.log('✅ Referencias DOM inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar referencias DOM:', error);
  }
}

/////////////////**INICIALIZA EL MÓDULO DE ESTADO Y DOM*/////////////////
function inicializarEstadoYDom() {
  initializeDOMReferences();
  console.log('✅ Módulo de estado y DOM inicializado correctamente');
}

inicializarEstadoYDom();