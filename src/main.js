// src/main.js - Punto de entrada principal de la aplicación Vue.js 3
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar estilos globales
import './assets/css/global.css'

// Importar composables que necesitan inicialización
import { inicializarFavoritos } from './composables/useFavoritos'

// Importar configuración de API para verificaciones iniciales
import { verificarAPIKey } from './config/api'

/**
 * Configuración de la aplicación Vue
 */
console.log('🚀 Iniciando Movies App...')

// Crear instancia de la aplicación
const app = createApp(App)

// Configurar router
app.use(router)

/**
 * Configuraciones globales de la aplicación
 */

// Variables globales para componentes
app.config.globalProperties.$appName = 'Movies App'
app.config.globalProperties.$version = '1.0.0'
app.config.globalProperties.$author = 'Estudiante Vue.js'

// Configuración del manejo de errores global
app.config.errorHandler = (error, instance, info) => {
  console.error('❌ Error global capturado:', error)
  console.log('📍 Información del error:', info)
  console.log('🔧 Instancia del componente:', instance?.$options.name || 'Desconocido')
  
  // En desarrollo, mostrar más detalles
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Stack trace completo:', error.stack)
  }
  
  // Mostrar notificación al usuario en producción
  if (process.env.NODE_ENV === 'production') {
    mostrarErrorGlobal('Ha ocurrido un error inesperado. La página se recargará automáticamente.')
    
    // Recargar la página después de 3 segundos en errores críticos
    setTimeout(() => {
      window.location.reload()
    }, 3000)
  }
}

// Configuración de warnings (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('⚠️ Vue Warning:', msg)
    console.log('📍 Trace:', trace)
  }
}

/**
 * Configuración de propiedades globales útiles
 */

// Función global para formatear fechas
app.config.globalProperties.$formatDate = (date, options = {}) => {
  if (!date) return 'Fecha no disponible'
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  try {
    return new Intl.DateTimeFormat('es-ES', { ...defaultOptions, ...options }).format(new Date(date))
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return 'Fecha inválida'
  }
}

// Función global para formatear números
app.config.globalProperties.$formatNumber = (number) => {
  if (typeof number !== 'number') return '0'
  
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M'
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K'
  }
  return number.toString()
}

// Función global para truncar texto
app.config.globalProperties.$truncate = (text, length = 100) => {
  if (!text || typeof text !== 'string') return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Funciones de inicialización
 */

// Función para verificar compatibilidad del navegador
const verificarCompatibilidad = () => {
  const features = {
    localStorage: typeof Storage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    Promise: typeof Promise !== 'undefined',
    URLSearchParams: typeof URLSearchParams !== 'undefined'
  }
  
  const incompatibleFeatures = Object.entries(features)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature)
  
  if (incompatibleFeatures.length > 0) {
    console.error('❌ Navegador incompatible. Características no soportadas:', incompatibleFeatures)
    mostrarErrorCompatibilidad(incompatibleFeatures)
    return false
  }
  
  console.log('✅ Navegador compatible')
  return true
}

// Función para configurar Service Worker (PWA básico)
const configurarServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registrado:', registration.scope)
        })
        .catch(registrationError => {
          console.log('❌ Error registrando Service Worker:', registrationError)
        })
    })
  }
}

// Función para configurar analíticas básicas
const configurarAnaliticas = () => {
  // Tracking básico de páginas vistas (localStorage)
  const trackPageView = (path, title) => {
    try {
      const analytics = JSON.parse(localStorage.getItem('appAnalytics') || '{}')
      
      if (!analytics.pageViews) {
        analytics.pageViews = []
      }
      
      analytics.pageViews.push({
        path,
        title,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100)
      })
      
      // Mantener solo las últimas 50 vistas
      if (analytics.pageViews.length > 50) {
        analytics.pageViews = analytics.pageViews.slice(-50)
      }
      
      localStorage.setItem('appAnalytics', JSON.stringify(analytics))
    } catch (error) {
      console.error('Error en analytics:', error)
    }
  }
  
  // Registrar analíticas en router
  router.afterEach((to) => {
    trackPageView(to.path, to.meta.title || 'Movies App')
  })
}

// Función para mostrar información de la app en consola
const mostrarInfoApp = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`
🎬 Movies App - Vue.js 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Versión: 1.0.0
🚀 Framework: Vue.js 3 (Composition API)
📱 Responsive: Mobile-first design
🎯 Funcionalidades:
   • Listado de películas populares
   • Búsqueda por título
   • Sistema de favoritos (localStorage)
   • Detalles de películas
   • Filtros por género
   • Diseño responsive
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Configuración necesaria:
   Agregá tu API key de TMDB en src/config/api.js
   Registrate gratis en: https://www.themoviedb.org/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `)
  }
}

// Función para mostrar errores de compatibilidad
const mostrarErrorCompatibilidad = (features) => {
  const errorDiv = document.createElement('div')
  errorDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #f44336;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 2rem;
    ">
      <div>
        <h2>⚠️ Navegador no compatible</h2>
        <p>Tu navegador no soporta algunas características necesarias:</p>
        <ul style="text-align: left; margin: 1rem 0;">
          ${features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <p>Por favor, actualizá tu navegador o usá uno más moderno como:</p>
        <p><strong>Chrome, Firefox, Safari o Edge</strong></p>
      </div>
    </div>
  `
  document.body.appendChild(errorDiv)
}

// Función para mostrar errores globales al usuario
const mostrarErrorGlobal = (mensaje) => {
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    max-width: 400px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
  `
  errorDiv.textContent = mensaje
  
  document.body.appendChild(errorDiv)
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (document.body.contains(errorDiv)) {
      document.body.removeChild(errorDiv)
    }
  }, 5000)
}

/**
 * Inicialización principal de la aplicación
 */
const inicializarApp = async () => {
  try {
    console.log('🔧 Verificando compatibilidad del navegador...')
    if (!verificarCompatibilidad()) {
      return // No continuar si el navegador no es compatible
    }
    
    console.log('🔧 Configurando Service Worker...')
    configurarServiceWorker()
    
    console.log('🔧 Inicializando sistema de favoritos...')
    inicializarFavoritos()
    
    console.log('🔧 Configurando analíticas...')
    configurarAnaliticas()
    
    console.log('🔧 Verificando configuración de API...')
    verificarAPIKey()
    
    console.log('🔧 Montando aplicación Vue...')
    app.mount('#app')
    
    console.log('✅ Movies App inicializada correctamente')
    mostrarInfoApp()
    
    // Mostrar notificación de bienvenida (solo primera vez)
    if (!localStorage.getItem('appInitialized')) {
      setTimeout(() => {
        mostrarBienvenida()
        localStorage.setItem('appInitialized', 'true')
      }, 1000)
    }
    
  } catch (error) {
    console.error('❌ Error crítico inicializando la aplicación:', error)
    
    // Mostrar error crítico al usuario
    const errorDiv = document.createElement('div')
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        text-align: center;
        max-width: 500px;
        z-index: 10000;
      ">
        <h3 style="color: #f44336; margin-bottom: 1rem;">❌ Error de inicialización</h3>
        <p style="color: #666; margin-bottom: 1.5rem;">
          No se pudo inicializar la aplicación correctamente.
        </p>
        <button onclick="window.location.reload()" style="
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        ">
          🔄 Recargar página
        </button>
      </div>
    `
    document.body.appendChild(errorDiv)
  }
}

// Función para mostrar mensaje de bienvenida
const mostrarBienvenida = () => {
  const bienvenidaDiv = document.createElement('div')
  bienvenidaDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    z-index: 9999;
    max-width: 350px;
    font-family: Arial, sans-serif;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `
  
  bienvenidaDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
      <span style="font-size: 1.2rem;">🎬</span>
      <strong>¡Bienvenido a Movies App!</strong>
    </div>
    <p style="font-size: 0.9rem; opacity: 0.9; margin: 0;">
      Descubrí, buscá y guardá tus películas favoritas
    </p>
  `
  
  document.body.appendChild(bienvenidaDiv)
  
  // Mostrar con animación
  setTimeout(() => {
    bienvenidaDiv.style.transform = 'translateX(0)'
  }, 100)
  
  // Ocultar después de 4 segundos
  setTimeout(() => {
    bienvenidaDiv.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (document.body.contains(bienvenidaDiv)) {
        document.body.removeChild(bienvenidaDiv)
      }
    }, 300)
  }, 4000)
}

/**
 * Manejar errores no capturados
 */
window.addEventListener('error', (event) => {
  console.error('❌ Error no capturado:', event.error)
  if (process.env.NODE_ENV === 'production') {
    mostrarErrorGlobal('Ha ocurrido un error inesperado.')
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rechazada no manejada:', event.reason)
  if (process.env.NODE_ENV === 'production') {
    mostrarErrorGlobal('Error de conexión o procesamiento.')
  }
  event.preventDefault() // Prevenir que se muestre en consola
})

/**
 * Configurar eventos de visibilidad de página
 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('👁️ Página visible - usuario activo')
  } else {
    console.log('🙈 Página oculta - usuario inactivo')
  }
})

/**
 * Inicializar aplicación cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarApp)
} else {
  inicializarApp()
}

// Log final
console.log('📝 main.js cargado correctamente')