// =============================================
//            EDICIÓN DE PERFIL DE USUARIO 
// =============================================

/////////////////**MUESTRA EL MODAL DE EDICIÓN DE PERFIL*/////////////////
function mostrarEditarPerfil() {
  if (!estado.isLoggedIn || !estado.usuarioActivo) {
    mostrarNotificacion('Debes iniciar sesión primero', 'error');
    return;
  }
  
  // 1. Actualizar Título Dinámico
  const tituloModal = document.getElementById('editProfileTitle');
  if(tituloModal) tituloModal.textContent = `EDITAR PERFIL : "${estado.usuarioActivo.name || 'Usuario'}"`;

  // 2. Cargar datos actuales en los campos del formulario
  document.getElementById('editProfileName').value = estado.usuarioActivo.name || '';
  document.getElementById('editProfileEmail').value = estado.usuarioActivo.email || '';
  document.getElementById('editProfilePrefCurrency').value = estado.usuarioActivo.prefCurrency || 'USD';
  
  // 3. Limpiar campos de contraseña y errores previos
  document.getElementById('editProfileNewPass').value = '';
  document.getElementById('editProfileConfirmPass').value = '';
  
  const nameError = document.getElementById('editProfileNameError');
  const passError = document.getElementById('editProfilePassError');
  if(nameError) nameError.style.display = 'none';
  if(passError) {
      passError.style.display = 'none';
      passError.textContent = '';
  }

  // Mostrar modal con animación
  const modal = document.getElementById('editProfileModal');
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
}

/////////////////**OCULTA EL MODAL DE EDICIÓN DE PERFIL*/////////////////
function ocultarEditarPerfil() {
  const modal = document.getElementById('editProfileModal');
  modal.classList.remove('active');
  setTimeout(() => modal.style.display = 'none', 300);
}

/////////////////**ACTUALIZA LOS DATOS DEL PERFIL DEL USUARIO*/////////////////
async function actualizarPerfil() {
  if (!estado.isLoggedIn || !estado.usuarioActivo) {
    mostrarNotificacion('Debes iniciar sesión primero', 'error');
    return;
  }
  
  // Obtener referencias a los elementos del formulario
  const nameInput = document.getElementById('editProfileName');
  const emailInput = document.getElementById('editProfileEmail');
  const currencyInput = document.getElementById('editProfilePrefCurrency');
  const newPassInput = document.getElementById('editProfileNewPass');
  const confirmPassInput = document.getElementById('editProfileConfirmPass');
  
  const nameError = document.getElementById('editProfileNameError');
  const passError = document.getElementById('editProfilePassError');

  // Limpiar errores previos antes de validar
  if(nameError) nameError.style.display = 'none';
  if(passError) {
      passError.style.display = 'none';
      passError.textContent = '';
  }

  ///// VALIDACIONES DE DATOS ////

  // 1. Validar Nombre de Usuario
  const nombre = nameInput.value.trim();
  if (typeof validarNombreUsuario === 'function' && !validarNombreUsuario(nombre)) {
    if(nameError) {
        nameError.textContent = 'Nombre inválido (3-20 letras)';
        nameError.style.display = 'block';
    }
    return;
  }

  // 2. Validar Email
  const nuevoEmail = emailInput.value.trim();
  if (typeof validarEmail === 'function' && !validarEmail(nuevoEmail)) {
    if(passError) {
        passError.textContent = 'Por favor, ingrese un email válido';
        passError.style.display = 'block';
    }
    return;
  }

  // 3. Validar Contraseñas (Solo si el usuario escribió algo)
  const newPass = newPassInput.value;
  const confirmPass = confirmPassInput.value;
  let cambiarPass = false;

  if (newPass || confirmPass) {
      if (newPass !== confirmPass) {
          if(passError) {
              passError.textContent = 'Las contraseñas no coinciden';
              passError.style.display = 'block';
          }
          return;
      }
      if (newPass.length < 4) {
          if(passError) {
              passError.textContent = 'La contraseña debe tener al menos 4 caracteres';
              passError.style.display = 'block';
          }
          return;
      }
      cambiarPass = true;
  }

  // --- ACTUALIZACIÓN DEL PERFIL EN MYSQL ---
  try {
    // Preparar datos para MySQL
    const datosActualizacion = {
      originalEmail: estado.usuarioActivo.email,
      name: nombre,
      email: nuevoEmail,
      prefCurrency: currencyInput.value
    };

    // Si hay nueva contraseña, agregarla a los datos
    if (cambiarPass) {
      datosActualizacion.password = newPass;
    }

    console.log("🔄 Enviando datos a MySQL:", datosActualizacion);

    // Actualizar en MySQL usando ENDPOINT PUT
    const resultadoMySQL = await actualizarPerfilEnMySQL(datosActualizacion);
    
    if (!resultadoMySQL.success) {
      mostrarNotificacion('Error al actualizar perfil en MySQL: ' + resultadoMySQL.error, 'error');
      return;
    }

    // Actualizar datos en el estado local
    estado.usuarioActivo.name = nombre;
    estado.usuarioActivo.email = nuevoEmail;
    estado.usuarioActivo.prefCurrency = currencyInput.value;
    
    // Actualizar interfaz de usuario
    if(typeof actualizarPerfilUI === 'function') actualizarPerfilUI();
    
    ocultarEditarPerfil();
    mostrarNotificacion('✅ Perfil actualizado correctamente ✅', 'success');
    
  } catch (error) {
    console.error('❌ Error en actualizarPerfil:', error);
    mostrarNotificacion('Error al actualizar perfil: ' + error.message, 'error');
  }
}

/////////////////**INICIALIZA EL MÓDULO DE EDICIÓN DE PERFIL*/////////////////
function inicializarProfile() {
  const btnShow = document.getElementById('btnShowEditProfile');
  const btnClose = document.getElementById('btnCloseEditProfile'); 
  const btnUpdate = document.getElementById('btnUpdateProfile'); 
  const btnCancel = document.getElementById('btnCancelProfile');

  if (btnShow) btnShow.addEventListener('click', mostrarEditarPerfil);
  if (btnClose) btnClose.addEventListener('click', ocultarEditarPerfil);
  if (btnUpdate) btnUpdate.addEventListener('click', actualizarPerfil);
  if (btnCancel) btnCancel.addEventListener('click', ocultarEditarPerfil);
  
  console.log('✅ Módulo de edición de perfil inicializado');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  inicializarProfile();
});