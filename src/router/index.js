// src/router/index.js - Configuración del router de Vue.js 3
import { createRouter, createWebHistory } from 'vue-router'

// Importar vistas con lazy loading para optimizar el bundle
const HomeView = () => import('../views/HomeView.vue')
const BuscarView = () => import('../views/BuscarView.vue')
const FavoritosView = () => import('../views/FavoritosView.vue')
const DetalleView = () => import('../views/DetalleView.vue')

// Vista 404 para rutas no encontradas
const NotFoundView = () => import('../views/NotFoundView.vue')

/**
 * Definición de rutas de la aplicación
 * Cada ruta define un mapeo entre una URL y un componente Vue
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'Inicio - Movies App',
      description: 'Descubrí las películas más populares y mejor puntuadas',
      icon: '🏠',
      showInNav: true,
      requiresAuth: false
    }
  },
  {
    path: '/buscar',
    name: 'Buscar',
    component: BuscarView,
    meta: {
      title: 'Buscar Películas - Movies App',
      description: 'Buscá tus películas favoritas por título, género o año',
      icon: '🔍',
      showInNav: true,
      requiresAuth: false
    }
  },
  {
    path: '/favoritos',
    name: 'Favoritos',
    component: FavoritosView,
    meta: {
      title: 'Mis Favoritos - Movies App',
      description: 'Tu colección personal de películas favoritas',
      icon: '❤️',
      showInNav: true,
      requiresAuth: false,
      requiresFavorites: true // Verificar si hay favoritos
    }
  },
  {
    path: '/pelicula/:id',
    name: 'Detalle',
    component: DetalleView,
    props: true, // Pasar el parámetro :id como prop al componente
    meta: {
      title: 'Detalle de Película - Movies App',
      description: 'Información detallada de la película seleccionada',
      icon: '🎬',
      showInNav: false,
      requiresAuth: false
    },
    // Validar que el ID sea un número
    beforeEnter: (to, from, next) => {
      const id = parseInt(to.params.id)
      if (isNaN(id) || id <= 0) {
        console.error('❌ ID de película inválido:', to.params.id)
        next({ name: 'NotFound' })
      } else {
        next()
      }
    }
  },
  {
    // Ruta de redirección para URLs antiguas o alternativas
    path: '/movie/:id',
    redirect: to => {
      return { name: 'Detalle', params: { id: to.params.id } }
    }
  },
  {
    // Ruta comodín para manejar páginas no encontradas (404)
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: 'Página no encontrada - Movies App',
      description: 'La página que buscás no existe',
      icon: '❓',
      showInNav: false
    }
  }
]

/**
 * Crear instancia del router con configuración
 */
const router = createRouter({
  // Usar history mode para URLs limpias (sin #)
  history: createWebHistory(process.env.BASE_URL),
  routes,
  
  // Configuración del comportamiento de scroll
  scrollBehavior(to, from, savedPosition) {
    // Si hay una posición guardada (navegación con botones atrás/adelante)
    if (savedPosition) {
      return savedPosition
    }
    
    // Si la ruta tiene hash, hacer scroll al elemento
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // Por defecto, hacer scroll al inicio de la página
    return { top: 0, behavior: 'smooth' }
  }
})

/**
 * Guard global ANTES de cada navegación
 * Se ejecuta antes de que el usuario acceda a cualquier ruta
 */
router.beforeEach((to, from, next) => {
  console.log(`🧭 Navegando de "${from.name || 'inicial'}" a "${to.name}"`)
  
  // Actualizar título de la página
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // Actualizar meta description
  updateMetaDescription(to.meta.description)
  
  // Verificar si la ruta requiere favoritos
  if (to.meta.requiresFavorites) {
    const favoritos = obtenerFavoritosDeLocalStorage()
    if (favoritos.length === 0) {
      console.log('ℹ️ Redirigiendo a inicio: no hay favoritos')
      // Mostrar notificación al usuario
      mostrarNotificacion('Agregá películas a favoritos para ver esta sección', 'info')
      next({ name: 'Home' })
      return
    }
  }
  
  // Verificar si es una ruta válida
  if (to.matched.length === 0) {
    console.log('❌ Ruta no encontrada:', to.path)
    next({ name: 'NotFound' })
    return
  }
  
  // Log para debugging en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('📍 Ruta actual:', {
      path: to.path,
      name: to.name,
      params: to.params,
      query: to.query,
      meta: to.meta
    })
  }
  
  next()
})

/**
 * Guard global DESPUÉS de cada navegación
 * Se ejecuta después de que la navegación se ha completado
 */
router.afterEach((to, from, failure) => {
  if (failure) {
    console.error('❌ Error en navegación:', failure)
    return
  }
  
  // Log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Navegación completada: ${to.name}`)
  }
  
  // Análiticas o tracking (si fuera necesario)
  // trackPageView(to.path, to.name)
  
  // Marcar página como vista en localStorage
  marcarPaginaVista(to.name, to.path)
})

/**
 * Manejo de errores de navegación
 * Se ejecuta cuando hay errores durante la navegación
 */
router.onError((error) => {
  console.error('❌ Error de navegación:', error)
  
  // Manejo específico para errores de carga de chunks (lazy loading)
  if (error.message.includes('Loading chunk')) {
    console.log('🔄 Error de chunk, recargando página...')
    window.location.reload()
    return
  }
  
  // Mostrar notificación de error al usuario
  mostrarNotificacion('Error de navegación. Intentá de nuevo.', 'error')
  
  // En casos críticos, redirigir al inicio
  if (error.message.includes('Cannot resolve component')) {
    router.push({ name: 'Home' })
  }
})

/**
 * Funciones auxiliares
 */

// Actualizar meta description de la página
function updateMetaDescription(description) {
  if (!description) return
  
  let metaDescription = document.querySelector('meta[name="description"]')
  
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    document.head.appendChild(metaDescription)
  }
  
  metaDescription.setAttribute('content', description)
}

// Obtener favoritos de localStorage
function obtenerFavoritosDeLocalStorage() {
  try {
    const favoritos = localStorage.getItem('moviesFavoritos')
    return favoritos ? JSON.parse(favoritos) : []
  } catch (error) {
    console.error('Error leyendo favoritos:', error)
    return []
  }
}

// Mostrar notificación al usuario
function mostrarNotificacion(mensaje, tipo = 'info') {
  const colores = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3'
  }

  const notificacion = document.createElement('div')
  notificacion.textContent = mensaje
  Object.assign(notificacion.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    backgroundColor: colores[tipo],
    color: 'white',
    borderRadius: '8px',
    zIndex: '9999',
    fontWeight: '600',
    maxWidth: '300px',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease'
  })
  
  document.body.appendChild(notificacion)
  
  setTimeout(() => {
    notificacion.style.transform = 'translateX(0)'
  }, 100)
  
  setTimeout(() => {
    notificacion.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (document.body.contains(notificacion)) {
        document.body.removeChild(notificacion)
      }
    }, 300)
  }, 4000)
}

// Marcar página como vista (para analíticas internas)
function marcarPaginaVista(name, path) {
  try {
    const vistas = JSON.parse(localStorage.getItem('paginasVistas') || '[]')
    const vistaActual = {
      name,
      path,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 50) // Solo primeros 50 caracteres
    }
    
    vistas.push(vistaActual)
    
    // Mantener solo las últimas 100 vistas para no saturar localStorage
    if (vistas.length > 100) {
      vistas.splice(0, vistas.length - 100)
    }
    
    localStorage.setItem('paginasVistas', JSON.stringify(vistas))
  } catch (error) {
    console.error('Error marcando página vista:', error)
  }
}

/**
 * Función para obtener rutas de navegación (para menús)
 * @returns {Array} Array de rutas que deben mostrarse en navegación
 */
export function obtenerRutasNavegacion() {
  return routes.filter(route => route.meta?.showInNav)
}

/**
 * Función para verificar si una ruta existe
 * @param {string} name - Nombre de la ruta
 * @returns {boolean} True si la ruta existe
 */
export function existeRuta(name) {
  return routes.some(route => route.name === name)
}

/**
 * Función para obtener información de una ruta
 * @param {string} name - Nombre de la ruta
 * @returns {Object|null} Información de la ruta o null si no existe
 */
export function obtenerInfoRuta(name) {
  const route = routes.find(route => route.name === name)
  return route ? {
    name: route.name,
    path: route.path,
    meta: route.meta
  } : null
}

/**
 * Función para navegar programáticamente con manejo de errores
 * @param {string|Object} to - Destino de navegación
 * @returns {Promise} Promesa de navegación
 */
export function navegarA(to) {
  return router.push(to).catch(error => {
    // Ignorar errores de navegación duplicada
    if (error.name !== 'NavigationDuplicated') {
      console.error('Error navegando:', error)
      throw error
    }
  })
}

/**
 * Función para obtener el historial de navegación
 * @returns {Array} Historial de páginas vistas
 */
export function obtenerHistorialNavegacion() {
  try {
    return JSON.parse(localStorage.getItem('paginasVistas') || '[]')
  } catch (error) {
    console.error('Error obteniendo historial:', error)
    return []
  }
}

// Export por defecto
export default router