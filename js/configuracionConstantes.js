// =============================================
//            CONFIGURACIÓN DE CONSTANTES
// =============================================
const API_URL = "https://open.er-api.com/v6/latest/USD";
const SERVER_BASE_URL = 'http://localhost:80/ConversorMonedas/server.php';

// Lista de monedas frecuentes
const MONEDAS_FRECUENTES = [
    'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY',
    'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR',
    'RUB', 'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB',
    'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP',
    'SAR', 'MYR', 'RON', 'PEN', 'ARS', 'VND', 'EGP', 'UAH'
];

// Nombres completos de monedas
const NOMBRES_MONEDAS = {
    'USD': 'Dólar Estadounidense', 'EUR': 'Euro', 'JPY': 'Yen Japonés',
    'GBP': 'Libra Esterlina', 'AUD': 'Dólar Australiano', 'CAD': 'Dólar Canadiense',
    'CHF': 'Franco Suizo', 'CNY': 'Yuan Chino', 'HKD': 'Dólar de Hong Kong',
    'NZD': 'Dólar Neozelandés', 'SEK': 'Corona Sueca', 'KRW': 'Won Surcoreano',
    'SGD': 'Dólar de Singapur', 'NOK': 'Corona Noruega', 'MXN': 'Peso Mexicano',
    'INR': 'Rupia India', 'RUB': 'Rublo Ruso', 'ZAR': 'Rand Sudafricano',
    'TRY': 'Lira Turca', 'BRL': 'Real Brasileño', 'TWD': 'Nuevo Dólar Taiwanés',
    'DKK': 'Corona Danesa', 'PLN': 'Zloty Polaco', 'THB': 'Baht Tailandés',
    'IDR': 'Rupia Indonesia', 'HUF': 'Florín Húngaro', 'CZK': 'Corona Checa',
    'ILS': 'Nuevo Shekel Israelí', 'CLP': 'Peso Chileno', 'PHP': 'Peso Filipino',
    'AED': 'Dirham de los EAU', 'COP': 'Peso Colombiano', 'SAR': 'Riyal Saudí',
    'MYR': 'Ringgit Malayo', 'RON': 'Leu Rumano', 'PEN': 'Sol Peruano',
    'ARS': 'Peso Argentino', 'VND': 'Dong Vietnamita', 'EGP': 'Libra Egipcia',
    'UAH': 'Grivna Ucraniana'
};

console.log('✅ Configuración de constantes cargada correctamente');