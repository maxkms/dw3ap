// src/config/api.js - Configuración centralizada de la API de TMDB

/**
 * Configuración principal de la API de The Movie Database (TMDB)
 * 
 * IMPORTANTE: Para que la aplicación funcione correctamente:
 * 1. Visitá https://www.themoviedb.org/
 * 2. Creá una cuenta gratuita
 * 3. Ve a tu perfil → Configuración → API
 * 4. Solicitá una API key (proceso gratuito e instantáneo)
 * 5. Reemplazá 'TU_API_KEY_AQUI' con tu API key real
 */

export const API_CONFIG = {
  // 🔑 REEMPLAZAR ESTA LÍNEA CON TU API KEY REAL
  API_KEY: '137bbf5e3ada258d211d40445e3fb40f',
  
  // URLs base de la API de TMDB
  BASE_URL: 'https://api.themoviedb.org/3',
  
  // URLs para imágenes (diferentes tamaños disponibles)
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  
  // Otras URLs útiles para diferentes tamaños de imagen
  IMAGE_URLS: {
    poster: {
      small: 'https://image.tmdb.org/t/p/w154',      // 154px ancho
      medium: 'https://image.tmdb.org/t/p/w342',     // 342px ancho  
      large: 'https://image.tmdb.org/t/p/w500',      // 500px ancho
      xlarge: 'https://image.tmdb.org/t/p/w780',     // 780px ancho
      original: 'https://image.tmdb.org/t/p/original' // Tamaño original
    },
    backdrop: {
      small: 'https://image.tmdb.org/t/p/w300',      // 300px ancho
      medium: 'https://image.tmdb.org/t/p/w780',     // 780px ancho
      large: 'https://image.tmdb.org/t/p/w1280',     // 1280px ancho
      original: 'https://image.tmdb.org/t/p/original' // Tamaño original
    },
    profile: {
      small: 'https://image.tmdb.org/t/p/w45',       // 45px ancho (personas)
      medium: 'https://image.tmdb.org/t/p/w185',     // 185px ancho
      large: 'https://image.tmdb.org/t/p/w632',      // 632px ancho
      original: 'https://image.tmdb.org/t/p/original' // Tamaño original
    }
  },
  
  // Configuración regional y de idioma
  LANGUAGE: 'es-ES',                    // Español de España
  REGION: 'AR',                         // Región Argentina
  
  // Configuraciones adicionales
  INCLUDE_ADULT: false,                 // No incluir contenido para adultos
  TIMEOUT: 15000,                       // Timeout de 15 segundos para peticiones
  
  // Límites de la API
  RATE_LIMIT: {
    requestsPerSecond: 40,              // Máximo 40 requests por segundo
    requestsPerDay: 1000000             // Máximo 1 millón por día (plan gratuito)
  }
}

/**
 * Verificar si la API key está configurada correctamente
 * @returns {boolean} true si la API key está configurada
 */
export const verificarAPIKey = () => {
  if (!API_CONFIG.API_KEY || API_CONFIG.API_KEY === 'TU_API_KEY_AQUI') {
    console.error('❌ API Key de TMDB no configurada')
    console.group('📋 Instrucciones para configurar API Key:')
    console.log('1. Visitá: https://www.themoviedb.org/')
    console.log('2. Creá una cuenta gratuita')
    console.log('3. Ve a tu perfil → Configuración → API')
    console.log('4. Solicitá una API key')
    console.log('5. Reemplazá "TU_API_KEY_AQUI" en src/config/api.js')
    console.groupEnd()
    return false
  }
  
  // Validar formato básico de API key (32 caracteres hexadecimales)
  const apiKeyRegex = /^[a-f0-9]{32}$/i
  if (!apiKeyRegex.test(API_CONFIG.API_KEY)) {
    console.warn('⚠️ El formato de la API key parece incorrecto')
    console.log('💡 Una API key válida tiene 32 caracteres (letras y números)')
    return false
  }
  
  console.log('✅ API Key configurada correctamente')
  return true
}

/**
 * Obtener URL completa para imágenes
 * @param {string} path - Ruta de la imagen (ej: "/abc123.jpg")
 * @param {string} tipo - Tipo de imagen: 'poster', 'backdrop', 'profile'
 * @param {string} tamaño - Tamaño: 'small', 'medium', 'large', 'xlarge', 'original'
 * @returns {string} URL completa de la imagen
 */
export const obtenerURLImagen = (path, tipo = 'poster', tamaño = 'medium') => {
  // Verificar si hay path
  if (!path) {
    // Devolver placeholder según el tipo
    const placeholders = {
      poster: 'https://via.placeholder.com/342x513/667eea/ffffff?text=Sin+Poster',
      backdrop: 'https://via.placeholder.com/780x439/667eea/ffffff?text=Sin+Backdrop', 
      profile: 'https://via.placeholder.com/185x278/667eea/ffffff?text=Sin+Foto'
    }
    return placeholders[tipo] || placeholders.poster
  }
  
  // Verificar que el tipo y tamaño sean válidos
  const tiposValidos = ['poster', 'backdrop', 'profile']
  const tamañosValidos = ['small', 'medium', 'large', 'xlarge', 'original']
  
  const tipoFinal = tiposValidos.includes(tipo) ? tipo : 'poster'
  const tamañoFinal = tamañosValidos.includes(tamaño) ? tamaño : 'medium'
  
  // Obtener URL base para el tipo y tamaño especificado
  const urlBase = API_CONFIG.IMAGE_URLS[tipoFinal][tamañoFinal]
  
  return `${urlBase}${path}`
}

/**
 * Configuración de endpoints más utilizados
 */
export const ENDPOINTS = {
  // Películas
  MOVIES: {
    POPULAR: '/movie/popular',
    TOP_RATED: '/movie/top_rated',
    UPCOMING: '/movie/upcoming',
    NOW_PLAYING: '/movie/now_playing',
    DETAILS: (id) => `/movie/${id}`,
    SEARCH: '/search/movie',
    DISCOVER: '/discover/movie'
  },
  
  // Géneros
  GENRES: {
    MOVIE_LIST: '/genre/movie/list'
  },
  
  // Tendencias
  TRENDING: {
    MOVIES_DAY: '/trending/movie/day',
    MOVIES_WEEK: '/trending/movie/week'
  },
  
  // Configuración
  CONFIGURATION: '/configuration'
}

/**
 * Parámetros de consulta más comunes
 */
export const QUERY_PARAMS = {
  // Ordenamiento para discover
  SORT_BY: {
    POPULARITY_DESC: 'popularity.desc',
    POPULARITY_ASC: 'popularity.asc', 
    RELEASE_DATE_DESC: 'release_date.desc',
    RELEASE_DATE_ASC: 'release_date.asc',
    REVENUE_DESC: 'revenue.desc',
    REVENUE_ASC: 'revenue.asc',
    VOTE_AVERAGE_DESC: 'vote_average.desc',
    VOTE_AVERAGE_ASC: 'vote_average.asc',
    VOTE_COUNT_DESC: 'vote_count.desc',
    VOTE_COUNT_ASC: 'vote_count.asc',
    TITLE_ASC: 'title.asc',
    TITLE_DESC: 'title.desc'
  },
  
  // Géneros más populares (IDs de TMDB)
  GENRES: {
    ACTION: 28,
    ADVENTURE: 12,
    ANIMATION: 16,
    COMEDY: 35,
    CRIME: 80,
    DOCUMENTARY: 99,
    DRAMA: 18,
    FAMILY: 10751,
    FANTASY: 14,
    HISTORY: 36,
    HORROR: 27,
    MUSIC: 10402,
    MYSTERY: 9648,
    ROMANCE: 10749,
    SCIENCE_FICTION: 878,
    TV_MOVIE: 10770,
    THRILLER: 53,
    WAR: 10752,
    WESTERN: 37
  }
}

/**
 * Configuración para diferentes entornos
 */
export const ENV_CONFIG = {
  development: {
    enableLogs: true,
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutos
    retryAttempts: 3
  },
  
  production: {
    enableLogs: false,
    enableCache: true,
    cacheTimeout: 15 * 60 * 1000, // 15 minutos
    retryAttempts: 5
  },
  
  test: {
    enableLogs: false,
    enableCache: false,
    cacheTimeout: 0,
    retryAttempts: 1
  }
}

/**
 * Obtener configuración según el entorno actual
 * @returns {Object} Configuración del entorno
 */
export const obtenerConfigEntorno = () => {
  const entorno = process.env.NODE_ENV || 'development'
  return ENV_CONFIG[entorno] || ENV_CONFIG.development
}

/**
 * Validar respuesta de la API
 * @param {Object} response - Respuesta de la API
 * @returns {boolean} true si la respuesta es válida
 */
export const validarRespuestaAPI = (response) => {
  if (!response || typeof response !== 'object') {
    return false
  }
  
  // Verificar estructura básica esperada
  const estructurasValidas = [
    'results',           // Para búsquedas y listas
    'genres',           // Para géneros
    'id',               // Para detalles de película
    'images'            // Para configuración
  ]
  
  return estructurasValidas.some(campo => campo in response)
}

/**
 * Función de utilidad para construir URLs de la API
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} params - Parámetros de consulta
 * @returns {string} URL completa
 */
export const construirURLAPI = (endpoint, params = {}) => {
  const url = new URL(endpoint, API_CONFIG.BASE_URL)
  
  // Agregar API key
  url.searchParams.set('api_key', API_CONFIG.API_KEY)
  
  // Agregar idioma por defecto
  url.searchParams.set('language', API_CONFIG.LANGUAGE)
  
  // Agregar parámetros adicionales
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor !== null && valor !== undefined && valor !== '') {
      url.searchParams.set(clave, valor)
    }
  })
  
  return url.toString()
}

/**
 * Función para generar headers HTTP recomendados
 * @returns {Object} Headers HTTP
 */
export const obtenerHeadersHTTP = () => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Movies-App-Vue3/1.0',
    // No incluir API key en headers (se envía como query param)
  }
}

/**
 * Configuración de timeout y reintentos
 */
export const NETWORK_CONFIG = {
  timeout: API_CONFIG.TIMEOUT,
  retries: 3,
  retryDelay: 1000, // 1 segundo
  retryMultiplier: 2 // Duplicar delay en cada reintento
}

// Verificar configuración al cargar el módulo
verificarAPIKey()

// Export por defecto
export default {
  API_CONFIG,
  verificarAPIKey,
  obtenerURLImagen,
  ENDPOINTS,
  QUERY_PARAMS,
  ENV_CONFIG,
  obtenerConfigEntorno,
  validarRespuestaAPI,
  construirURLAPI,
  obtenerHeadersHTTP,
  NETWORK_CONFIG
}