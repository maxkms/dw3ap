// src/services/movieService.js - Servicio para interactuar con la API de TMDB
import axios from 'axios'
import { API_CONFIG } from '../config/api.js'

// Verificar configuración de API al cargar el módulo
if (!API_CONFIG.API_KEY || API_CONFIG.API_KEY === 'TU_API_KEY_AQUI') {
  console.error('❌ API Key de TMDB no configurada correctamente')
  console.log('📋 Para configurar:')
  console.log('1. Visitá https://www.themoviedb.org/')
  console.log('2. Creá una cuenta gratuita')
  console.log('3. Obtené tu API key en Configuración → API')
  console.log('4. Reemplazá "TU_API_KEY_AQUI" en src/config/api.js')
}

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 15000, // 15 segundos timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para agregar API key y configuración a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Agregar parámetros globales
    config.params = {
      ...config.params,
      api_key: API_CONFIG.API_KEY,
      language: 'es-ES' // Idioma español por defecto
    }
    
    // Log en modo desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Request:', config.method.toUpperCase(), config.url, config.params)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores globalmente
api.interceptors.response.use(
  (response) => {
    // Log en modo desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', response.status, response.config.url)
    }
    
    return response
  },
  (error) => {
    // Manejo de errores específicos
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          console.error('❌ Error 401: API key inválida o expirada')
          mostrarErrorAlUsuario('Clave de API inválida. Verificá la configuración.')
          break
        case 404:
          console.error('❌ Error 404: Recurso no encontrado')
          break
        case 429:
          console.error('❌ Error 429: Límite de peticiones excedido')
          mostrarErrorAlUsuario('Demasiadas peticiones. Intentá de nuevo en unos minutos.')
          break
        case 500:
          console.error('❌ Error 500: Error interno del servidor')
          mostrarErrorAlUsuario('Error del servidor. Intentá de nuevo más tarde.')
          break
        default:
          console.error(`❌ Error ${status}:`, data.status_message || error.message)
      }
    } else if (error.request) {
      console.error('❌ Error de red: No se pudo conectar con el servidor')
      mostrarErrorAlUsuario('Error de conexión. Verificá tu internet.')
    } else {
      console.error('❌ Error de configuración:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Función auxiliar para mostrar errores al usuario
const mostrarErrorAlUsuario = (mensaje) => {
  // Crear notificación simple
  const notificacion = document.createElement('div')
  notificacion.textContent = mensaje
  Object.assign(notificacion.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    borderRadius: '8px',
    zIndex: '9999',
    fontWeight: '600',
    maxWidth: '300px'
  })
  
  document.body.appendChild(notificacion)
  setTimeout(() => {
    if (document.body.contains(notificacion)) {
      document.body.removeChild(notificacion)
    }
  }, 5000)
}

// Cache simple para mejorar rendimiento
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

const obtenerDeCache = (clave) => {
  const item = cache.get(clave)
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data
  }
  cache.delete(clave)
  return null
}

const guardarEnCache = (clave, data) => {
  cache.set(clave, {
    data,
    timestamp: Date.now()
  })
}

// Servicio principal de películas
export const movieService = {
  /**
   * Obtener películas populares
   * @param {number} pagina - Número de página (1-1000)
   * @returns {Promise<Object>} Respuesta con results, total_pages, etc.
   */
  async obtenerPeliculasPopulares(pagina = 1) {
    try {
      const cacheKey = `popular_${pagina}`
      const cached = obtenerDeCache(cacheKey)
      if (cached) {
        console.log('📦 Usando cache para películas populares')
        return cached
      }

      const response = await api.get('/movie/popular', {
        params: { page: Math.min(Math.max(1, pagina), 1000) } // Validar rango
      })
      
      const data = response.data
      guardarEnCache(cacheKey, data)
      
      return data
    } catch (error) {
      console.error('❌ Error obteniendo películas populares:', error)
      throw new Error('No se pudieron cargar las películas populares')
    }
  },

  /**
   * Buscar películas por título
   * @param {string} query - Término de búsqueda
   * @param {number} pagina - Número de página
   * @returns {Promise<Object>} Respuesta con results de búsqueda
   */
  async buscarPeliculas(query, pagina = 1) {
    try {
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return { results: [], total_pages: 0, total_results: 0 }
      }

      const queryLimpio = query.trim()
      const cacheKey = `search_${queryLimpio}_${pagina}`
      const cached = obtenerDeCache(cacheKey)
      if (cached) {
        console.log('📦 Usando cache para búsqueda')
        return cached
      }

      const response = await api.get('/search/movie', {
        params: { 
          query: queryLimpio,
          page: Math.min(Math.max(1, pagina), 1000),
          include_adult: false // Filtrar contenido para adultos
        }
      })
      
      const data = response.data
      guardarEnCache(cacheKey, data)
      
      return data
    } catch (error) {
      console.error('❌ Error buscando películas:', error)
      throw new Error(`No se pudo buscar "${query}"`)
    }
  },

  /**
   * Obtener detalles completos de una película
   * @param {number|string} id - ID de la película
   * @returns {Promise<Object>} Detalles completos de la película
   */
  async obtenerDetallesPelicula(id) {
    try {
      if (!id) {
        throw new Error('ID de película requerido')
      }

      const peliculaId = parseInt(id)
      if (isNaN(peliculaId) || peliculaId <= 0) {
        throw new Error('ID de película inválido')
      }

      const cacheKey = `movie_${peliculaId}`
      const cached = obtenerDeCache(cacheKey)
      if (cached) {
        console.log('📦 Usando cache para detalles de película')
        return cached
      }

      const response = await api.get(`/movie/${peliculaId}`, {
        params: {
          append_to_response: 'credits,videos,similar,reviews' // Datos adicionales
        }
      })
      
      const data = response.data
      guardarEnCache(cacheKey, data)
      
      return data
    } catch (error) {
      console.error('❌ Error obteniendo detalles de película:', error)
      if (error.response?.status === 404) {
        throw new Error('Película no encontrada')
      }
      throw new Error('No se pudieron cargar los detalles de la película')
    }
  },

  /**
   * Obtener lista de géneros disponibles
   * @returns {Promise<Object>} Lista de géneros con id y name
   */
  async obtenerGeneros() {
    try {
      const cacheKey = 'genres'
      const cached = obtenerDeCache(cacheKey)
      if (cached) {
        console.log('📦 Usando cache para géneros')
        return cached
      }

      const response = await api.get('/genre/movie/list')
      
      const data = response.data
      // Cache más largo para géneros (raramente cambian)
      guardarEnCache(cacheKey, data)
      
      return data
    } catch (error) {
      console.error('❌ Error obteniendo géneros:', error)
      // Devolver géneros por defecto en caso de error
      return {
        genres: [
          { id: 28, name: 'Acción' },
          { id: 12, name: 'Aventura' },
          { id: 16, name: 'Animación' },
          { id: 35, name: 'Comedia' },
          { id: 80, name: 'Crimen' },
          { id: 18, name: 'Drama' },
          { id: 14, name: 'Fantasía' },
          { id: 27, name: 'Terror' },
          { id: 10749, name: 'Romance' },
          { id: 878, name: 'Ciencia ficción' }
        ]
      }
    }
  },

  /**
   * Descubrir películas con filtros avanzados
   * @param {Object} filtros - Objeto con parámetros de filtrado
   * @returns {Promise<Object>} Películas que coinciden con los filtros
   */
  async descubrirPeliculas(filtros = {}) {
    try {
      const parametrosDefecto = {
        page: 1,
        sort_by: 'popularity.desc',
        include_adult: false,
        include_video: false,
        'vote_count.gte': 100 // Mínimo de votos para calidad
      }

      const parametros = { ...parametrosDefecto, ...filtros }
      
      // Validar página
      parametros.page = Math.min(Math.max(1, parametros.page), 1000)

      const cacheKey = `discover_${JSON.stringify(parametros)}`
      const cached = obtenerDeCache(cacheKey)
      if (cached) {
        console.log('📦 Usando cache para discover')
        return cached
      }

      const response = await api.get('/discover/movie', {
        params: parametros
      })
      
      const data = response.data
      guardarEnCache(cacheKey, data)
      
      return data
    } catch (error) {
      console.error('❌ Error en discover películas:', error)
      throw new Error('No se pudieron cargar películas con los filtros especificados')
    }
  },

  /**
   * Obtener películas trending (tendencias)
   * @param {string} ventanaTiempo - 'day' o 'week'
   * @returns {Promise<Object>} Películas en tendencia
   */
  async obtenerPeliculasTrending(ventanaTiempo = 'week') {
    try {
      const tiempoValido = ['day', 'week'].includes(ventanaTiempo) ? ventanaTiempo : 'week'
      
      const cacheKey = `trending_${tiempoValido}`
      const cached = obtenerDeCache(cacheKey)
      if (cached) {
        console.log('📦 Usando cache para trending')
        return cached
      }

      const response = await api.get(`/trending/movie/${tiempoValido}`)
      
      const data = response.data
      guardarEnCache(cacheKey, data)
      
      return data
    } catch (error) {
      console.error('❌ Error obteniendo películas trending:', error)
      throw new Error('No se pudieron cargar las películas en tendencia')
    }
  },

  /**
   * Obtener configuración de imágenes de TMDB
   * @returns {Promise<Object>} Configuración de URLs de imágenes
   */
  async obtenerConfiguracionImagenes() {
    try {
      const cacheKey = 'image_config'
      const cached = obtenerDeCache(cacheKey)
      if (cached) {
        return cached
      }

      const response = await api.get('/configuration')
      const data = response.data
      
      // Cache muy largo para configuración (casi nunca cambia)
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        duration: 24 * 60 * 60 * 1000 // 24 horas
      })
      
      return data
    } catch (error) {
      console.error('❌ Error obteniendo configuración de imágenes:', error)
      // Devolver configuración por defecto
      return {
        images: {
          base_url: 'https://image.tmdb.org/t/p/',
          poster_sizes: ['w154', 'w185', 'w342', 'w500', 'w780', 'original'],
          backdrop_sizes: ['w300', 'w780', 'w1280', 'original']
        }
      }
    }
  },

  /**
   * Utilidad para obtener URL completa de imagen
   * @param {string} path - Ruta de la imagen
   * @param {string} tamaño - Tamaño deseado (w154, w185, w342, w500, w780, original)
   * @returns {string} URL completa de la imagen
   */
  obtenerURLImagen(path, tamaño = 'w500') {
    if (!path) {
      return 'https://via.placeholder.com/500x750/667eea/ffffff?text=Sin+Imagen'
    }
    
    // Validar tamaño
    const tamañosValidos = ['w154', 'w185', 'w342', 'w500', 'w780', 'original']
    const tamañoFinal = tamañosValidos.includes(tamaño) ? tamaño : 'w500'
    
    return `${API_CONFIG.IMAGE_BASE_URL.replace('w500', tamañoFinal)}${path}`
  },

  /**
   * Utilidad para obtener URL de backdrop
   * @param {string} path - Ruta del backdrop
   * @param {string} tamaño - Tamaño deseado
   * @returns {string} URL completa del backdrop
   */
  obtenerURLBackdrop(path, tamaño = 'w1280') {
    if (!path) {
      return 'https://images.unsplash.com/photo-1489599904379-7620a2c3d0c8?w=1280&h=720&fit=crop'
    }
    
    return `https://image.tmdb.org/t/p/${tamaño}${path}`
  },

  /**
   * Limpiar cache manualmente
   */
  limpiarCache() {
    cache.clear()
    console.log('🗑️ Cache limpiado')
  },

  /**
   * Obtener estadísticas del cache
   * @returns {Object} Información sobre el estado del cache
   */
  obtenerEstadisticasCache() {
    const ahora = Date.now()
    let itemsValidos = 0
    let itemsExpirados = 0
    
    for (const [clave, item] of cache.entries()) {
      const tiempoExpiracion = item.duration || CACHE_DURATION
      if (ahora - item.timestamp < tiempoExpiracion) {
        itemsValidos++
      } else {
        itemsExpirados++
      }
    }
    
    return {
      totalItems: cache.size,
      itemsValidos,
      itemsExpirados,
      tamaño: `${Math.round(JSON.stringify([...cache.entries()]).length / 1024)} KB`
    }
  },

  /**
   * Verificar estado de la API
   * @returns {Promise<boolean>} true si la API está funcionando
   */
  async verificarEstadoAPI() {
    try {
      await api.get('/configuration', { timeout: 5000 })
      return true
    } catch (error) {
      console.error('❌ API no disponible:', error.message)
      return false
    }
  }
}

// Limpiar cache expirado cada 10 minutos
setInterval(() => {
  const ahora = Date.now()
  for (const [clave, item] of cache.entries()) {
    const tiempoExpiracion = item.duration || CACHE_DURATION
    if (ahora - item.timestamp > tiempoExpiracion) {
      cache.delete(clave)
    }
  }
}, 10 * 60 * 1000)

// Exportar configuración para uso externo
export { API_CONFIG }

// Export por defecto
export default movieService