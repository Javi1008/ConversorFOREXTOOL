// =============================================
//           HISTORIAL DE CONVERSIONES
// =============================================

/////////////////**RENDERIZA EL HISTORIAL DE CONVERSIONES EN LA TABLA*/////////////////
function renderizarHistorial() {
    if (!estado.isLoggedIn || !estado.usuarioActivo) {
        if (DOM.historyBody) {
            DOM.historyBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Debes iniciar sesión para ver tu historial</td></tr>';
        }
        return;
    }
    
    if (!estado.historialUsuario || estado.historialUsuario.length === 0) {
        if (DOM.historyBody) {
            DOM.historyBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay conversiones en el historial</td></tr>';
        }
        return;
    }
    
    if (DOM.historyBody) {
        DOM.historyBody.innerHTML = estado.historialUsuario.map(registro => {
            const fecha = new Date(registro.Fecha_Hora);
            return `
                <tr>
                    <td>${fecha.toLocaleString()}</td>
                    <td>${registro.De}</td>
                    <td>${registro.A}</td>
                    <td>${registro.Cantidad}</td>
                    <td>${registro.Resultado}</td>
                </tr>
            `;
        }).join('');
    }
}

/////////////////**ELIMINA TODO EL HISTORIAL DE CONVERSIONES*/////////////////
async function eliminarHistorial() {
    if (!estado.isLoggedIn || !estado.usuarioActivo) {
        mostrarNotificacion('Debes iniciar sesión', 'error');
        return;
    }
    
    if (!confirm('¿Estás seguro de que deseas eliminar todo tu historial?')) {
        return;
    }
    
    try {
        // ELIMINAR HISTORIAL EN MYSQL
        const resultadoMySQL = await eliminarHistorialMySQL(estado.usuarioActivo.email);
        
        if (!resultadoMySQL.success) {
            mostrarNotificacion('Error al eliminar historial en MySQL: ' + resultadoMySQL.error, 'error');
            return;
        }
        
        // Limpiar historial en estado local
        estado.historialUsuario = [];
        
        if (DOM.perfilHistoryCount) {
            DOM.perfilHistoryCount.textContent = '0';
        }
        
        renderizarHistorial();
        mostrarNotificacion('Historial eliminado correctamente de MySQL', 'success');
        
    } catch (error) {
        console.error('Error en eliminar historial:', error);
        mostrarNotificacion('Error al eliminar historial: ' + error.message, 'error');
    }
}

/////////////////**ELIMINA EL HISTORIAL EN MYSQL*/////////////////
async function eliminarHistorialMySQL(emailUsuario) {
    try {
        console.log('🔴 ELIMINANDO HISTORIAL para:', emailUsuario);
        
        const response = await fetch(SERVER_BASE_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deleteUserConversions',
                email: emailUsuario
            })
        });

        if (!response.ok) {
            return { success: false, error: 'Error de conexión HTTP' };
        }

        const resultado = await response.json();
        
        if (resultado.success) {
            console.log('✅ Historial eliminado correctamente ✅ para:', emailUsuario);
            return { success: true };
        } else {
            console.warn('⚠️ MySQL rechazó eliminación de historial:', resultado.error);
            return { success: false, error: resultado.error };
        }
    } catch (error) {
        console.warn('⚠️ Error de conexión MySQL:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
}

/////////////////**INICIALIZA EL MÓDULO DE HISTORIAL*/////////////////
function inicializarHistorial() {
    if (DOM.deleteHistoryBtn) {
        DOM.deleteHistoryBtn.addEventListener('click', eliminarHistorial);
    }
    console.log('✅ Módulo de historial inicializado correctamente');
}

// Inicializa cuando el script se carga
inicializarHistorial();