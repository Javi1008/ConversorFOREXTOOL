<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'conversormonedas';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'error' => 'Error de conexión a la base de datos'
    ]);
    exit;
}

// Obtener el método de la solicitud
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// RUTAS REST CORRECTAS
switch ($method) {
    case 'POST':
        if (isset($input['action'])) {
            switch ($input['action']) {
                case 'saveConversion':
                    guardarConversion($pdo, $input);
                    break;
                case 'login':
                    validarLogin($pdo, $input);
                    break;
                default:
                    registrarUsuario($pdo, $input);
            }
        } else {
            registrarUsuario($pdo, $input);
        }
        break;
        
    case 'PUT':
        actualizarPerfil($pdo, $input);
        break;
        
    case 'DELETE':
        if (isset($input['action']) && $input['action'] === 'deleteUserConversions') {
            eliminarHistorialUsuario($pdo, $input);
        } else {
            eliminarUsuario($pdo, $input);
        }
        break;
        
    case 'GET':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'getUsers':
                    obtenerUsuarios($pdo);
                    break;
                case 'getUsersCount':
                    obtenerConteoUsuarios($pdo);
                    break;
                case 'getUserConversions':
                    obtenerConversionesUsuario($pdo, $_GET['email']);
                    break;
                case 'checkEmail':
                    verificarEmail($pdo, $_GET['email']);
                    break;
                default:
                    echo json_encode(['success' => false, 'error' => 'Acción GET no válida']);
            }
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}

// =============================================
// NUEVA FUNCIÓN: VALIDAR LOGIN
// =============================================
function validarLogin($pdo, $data) {
    try {
        if (empty($data['email']) || empty($data['password'])) {
            echo json_encode(['success' => false, 'error' => 'Email y contraseña son requeridos']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT id, name, email, pref_currency, created FROM usuarios WHERE email = ? AND password = ?");
        $stmt->execute([$data['email'], $data['password']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($usuario) {
            echo json_encode([
                'success' => true, 
                'usuario' => $usuario
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Email o contraseña incorrectos']);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}

// =============================================
// NUEVA FUNCIÓN: VERIFICAR EMAIL
// =============================================
function verificarEmail($pdo, $email) {
    try {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $existe = $stmt->fetch() !== false;
        
        echo json_encode(['exists' => $existe]);
        
    } catch (PDOException $e) {
        echo json_encode(['exists' => false]);
    }
}

// El resto de las funciones se mantienen igual que en tu código original...
function eliminarHistorialUsuario($pdo, $data) {
    try {
        if (empty($data['email'])) {
            echo json_encode(['success' => false, 'error' => 'Email es requerido']);
            return;
        }
        
        // Buscar usuario por email
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$data['email']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$usuario) {
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
            return;
        }
        
        // Eliminar solo las conversiones del usuario (NO el usuario)
        $stmt = $pdo->prepare("DELETE FROM conversiones WHERE user_id = ?");
        $result = $stmt->execute([$usuario['id']]);
        
        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Historial de conversiones eliminado exitosamente',
                'conversiones_eliminadas' => $stmt->rowCount()
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al eliminar historial']);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}

function registrarUsuario($pdo, $data) {
    try {
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            echo json_encode(['success' => false, 'error' => 'Todos los campos son requeridos']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$data['email']]);
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Este email ya está registrado']);
            return;
        }
        
        $stmt = $pdo->prepare("INSERT INTO usuarios (name, email, password, pref_currency) VALUES (?, ?, ?, ?)");
        $result = $stmt->execute([
            $data['name'],
            $data['email'],
            $data['password'],
            $data['prefCurrency'] ?? 'USD'
        ]);
        
        if ($result) {
            $userId = $pdo->lastInsertId();
            echo json_encode([
                'success' => true, 
                'message' => 'Usuario registrado exitosamente',
                'userId' => $userId
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al registrar usuario']);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}

function guardarConversion($pdo, $data) {
    try {
        if (empty($data['user_email']) || empty($data['from_currency']) || empty($data['to_currency']) || 
            empty($data['amount']) || empty($data['converted_amount']) || empty($data['exchange_rate'])) {
            echo json_encode(['success' => false, 'error' => 'Todos los campos de conversión son requeridos']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$data['user_email']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$usuario) {
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
            return;
        }
        
        $userId = $usuario['id'];
        
        $stmt = $pdo->prepare("INSERT INTO conversiones (user_id, from_currency, to_currency, amount, converted_amount, exchange_rate) VALUES (?, ?, ?, ?, ?, ?)");
        $result = $stmt->execute([
            $userId,
            $data['from_currency'],
            $data['to_currency'],
            $data['amount'],
            $data['converted_amount'],
            $data['exchange_rate']
        ]);
        
        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Conversión guardada exitosamente',
                'conversion_id' => $pdo->lastInsertId()
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al guardar conversión']);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}

function obtenerConversionesUsuario($pdo, $email) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                c.from_currency AS 'De',
                c.to_currency AS 'A',
                FORMAT(c.amount, 2) AS 'Cantidad',
                FORMAT(c.converted_amount, 2) AS 'Resultado',
                FORMAT(c.exchange_rate, 4) AS 'Tasa',
                c.created_at AS 'Fecha_Hora'
            FROM conversiones c
            INNER JOIN usuarios u ON c.user_id = u.id
            WHERE u.email = ?
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([$email]);
        $conversiones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'conversiones' => $conversiones,
            'total' => count($conversiones)
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error al obtener conversiones: ' . $e->getMessage()]);
    }
}

function actualizarPerfil($pdo, $data) {
    try {
        if (empty($data['originalEmail'])) {
            echo json_encode(['success' => false, 'error' => 'Email original es requerido']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT id, name, email, pref_currency FROM usuarios WHERE email = ?");
        $stmt->execute([$data['originalEmail']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$usuario) {
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
            return;
        }
        
        $userId = $usuario['id'];
        
        $nuevoNombre = isset($data['name']) ? $data['name'] : $usuario['name'];
        $nuevoEmail = isset($data['email']) ? $data['email'] : $usuario['email'];
        $nuevaMoneda = isset($data['prefCurrency']) ? $data['prefCurrency'] : $usuario['pref_currency'];
        
        if ($nuevoEmail !== $usuario['email']) {
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
            $stmt->execute([$nuevoEmail, $userId]);
            
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'error' => 'Este email ya está registrado por otro usuario']);
                return;
            }
        }
        
        if (isset($data['password']) && !empty($data['password'])) {
            $stmt = $pdo->prepare("UPDATE usuarios SET name = ?, email = ?, password = ?, pref_currency = ? WHERE id = ?");
            $result = $stmt->execute([
                $nuevoNombre,
                $nuevoEmail,
                $data['password'],
                $nuevaMoneda,
                $userId
            ]);
        } else {
            $stmt = $pdo->prepare("UPDATE usuarios SET name = ?, email = ?, pref_currency = ? WHERE id = ?");
            $result = $stmt->execute([
                $nuevoNombre,
                $nuevoEmail,
                $nuevaMoneda,
                $userId
            ]);
        }
        
        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Perfil actualizado exitosamente'
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al actualizar perfil']);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}

function eliminarUsuario($pdo, $data) {
    try {
        if (empty($data['email'])) {
            echo json_encode(['success' => false, 'error' => 'Email es requerido']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$data['email']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$usuario) {
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
            return;
        }
        
        $stmt = $pdo->prepare("DELETE FROM conversiones WHERE user_id = ?");
        $stmt->execute([$usuario['id']]);
        
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
        $result = $stmt->execute([$usuario['id']]);
        
        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Usuario y sus conversiones eliminados exitosamente'
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al eliminar usuario']);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}

function obtenerUsuarios($pdo) {
    try {
        $stmt = $pdo->query("SELECT id, name, email, pref_currency, created FROM usuarios ORDER BY created DESC");
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'usuarios' => $usuarios,
            'total' => count($usuarios)
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error al obtener usuarios']);
    }
}

function obtenerConteoUsuarios($pdo) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'total' => $result['total']
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error al obtener conteo']);
    }
}
?>