<template>
  <div id="app">
    <!-- Navegación principal -->
    <nav class="main-navigation" :class="{ 'scrolled': navScrolled }">
      <div class="nav-container">
        <!-- Logo y título -->
        <div class="nav-brand" @click="navegarInicio">
          <span class="brand-icon">🎬</span>
          <div class="brand-text">
            <h1 class="brand-title">Movies App</h1>
            <span class="brand-subtitle">Tu cine digital</span>
          </div>
        </div>

        <!-- Enlaces de navegación -->
        <div class="nav-links">
          <router-link 
            to="/" 
            class="nav-link"
            :class="{ 'active': $route.name === 'Home' }"
            title="Página principal"
          >
            <span class="nav-icon">🏠</span>
            <span class="nav-text">Inicio</span>
          </router-link>

          <router-link 
            to="/buscar" 
            class="nav-link"
            :class="{ 'active': $route.name === 'Buscar' }"
            title="Buscar películas"
          >
            <span class="nav-icon">🔍</span>
            <span class="nav-text">Buscar</span>
          </router-link>

          <router-link 
            to="/favoritos" 
            class="nav-link favoritos-link"
            :class="{ 'active': $route.name === 'Favoritos' }"
            title="Tus películas favoritas"
          >
            <span class="nav-icon">❤️</span>
            <span class="nav-text">Favoritos</span>
            <span v-if="favoritosCount > 0" class="favorites-badge">
              {{ favoritosCount }}
            </span>
          </router-link>
        </div>

        <!-- Botón hamburguesa para móvil -->
        <button 
          @click="toggleMobileMenu"
          class="mobile-menu-btn"
          :class="{ 'active': mobileMenuOpen }"
          title="Menú"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>

      <!-- Menú móvil -->
      <div class="mobile-menu" :class="{ 'open': mobileMenuOpen }">
        <router-link 
          to="/" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">🏠</span>
          Inicio
        </router-link>

        <router-link 
          to="/buscar" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">🔍</span>
          Buscar
        </router-link>

        <router-link 
          to="/favoritos" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">❤️</span>
          Favoritos
          <span v-if="favoritosCount > 0" class="mobile-favorites-badge">
            {{ favoritosCount }}
          </span>
        </router-link>
      </div>
    </nav>

    <!-- Contenido principal de la aplicación -->
    <main class="main-content" :class="{ 'menu-open': mobileMenuOpen }">
      <!-- Transiciones entre vistas -->
      <router-view v-slot="{ Component, route }">
        <transition 
          :name="transitionName" 
          mode="out-in"
          @enter="onTransitionEnter"
          @leave="onTransitionLeave"
        >
          <component 
            :is="Component" 
            :key="route.path"
            class="page-component"
          />
        </transition>
      </router-view>
    </main>

    <!-- Loading global (si fuera necesario) -->
    <div v-if="globalLoading" class="global-loading">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Footer -->
    <footer class="app-footer" v-if="!mobileMenuOpen">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>🎬 Movies App</h3>
            <p>Descubrí, explorá y guardá tus películas favoritas</p>
          </div>
          
          <div class="footer-section">
            <h4>Navegación</h4>
            <ul class="footer-links">
              <li><router-link to="/">Inicio</router-link></li>
              <li><router-link to="/buscar">Buscar</router-link></li>
              <li><router-link to="/favoritos">Favoritos</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Información</h4>
            <p class="footer-note">
              Datos proporcionados por 
              <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">
                The Movie Database (TMDB)
              </a>
            </p>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} Movies App - Trabajo Práctico Vue.js 3</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFavoritos } from './composables/useFavoritos'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { favoritos, cargarFavoritos } = useFavoritos()
    
    // Estado reactivo
    const navScrolled = ref(false)
    const mobileMenuOpen = ref(false)
    const globalLoading = ref(false)
    const loadingMessage = ref('Cargando...')
    const transitionName = ref('fade')
    
    // Computed properties
    const favoritosCount = computed(() => favoritos.value.length)
    const currentYear = computed(() => new Date().getFullYear())
    
    // Manejar scroll para efecto de navegación
    const handleScroll = () => {
      navScrolled.value = window.scrollY > 50
    }
    
    // Navegar al inicio
    const navegarInicio = () => {
      router.push('/')
      closeMobileMenu()
    }
    
    // Toggle menú móvil
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
      
      // Prevenir scroll del body cuando el menú está abierto
      if (mobileMenuOpen.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    }
    
    // Cerrar menú móvil
    const closeMobileMenu = () => {
      mobileMenuOpen.value = false
      document.body.style.overflow = 'auto'
    }
    
    // Determinar tipo de transición basado en la navegación
    const determineTransition = (to, from) => {
      // Rutas con orden lógico para transiciones direccionales
      const routeOrder = ['Home', 'Buscar', 'Favoritos', 'Detalle']
      const fromIndex = routeOrder.indexOf(from?.name)
      const toIndex = routeOrder.indexOf(to?.name)
      
      if (fromIndex !== -1 && toIndex !== -1) {
        // Transición hacia adelante o atrás
        transitionName.value = fromIndex < toIndex ? 'slide-left' : 'slide-right'
      } else {
        // Transición por defecto
        transitionName.value = 'fade'
      }
    }
    
    // Callbacks de transición
    const onTransitionEnter = (el) => {
      // Hacer scroll al inicio en transiciones
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    const onTransitionLeave = (el) => {
      // Cleanup si fuera necesario
    }
    
    // Manejar clics fuera del menú móvil
    const handleClickOutside = (event) => {
      if (mobileMenuOpen.value) {
        const nav = document.querySelector('.main-navigation')
        if (nav && !nav.contains(event.target)) {
          closeMobileMenu()
        }
      }
    }
    
    // Manejar tecla Escape
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen.value) {
        closeMobileMenu()
      }
    }
    
    // Mostrar loading global (función utilitaria)
    const showGlobalLoading = (message = 'Cargando...') => {
      loadingMessage.value = message
      globalLoading.value = true
    }
    
    // Ocultar loading global
    const hideGlobalLoading = () => {
      globalLoading.value = false
    }
    
    // Watcher para cambios de ruta
    watch(
      () => route.name,
      (to, from) => {
        // Cerrar menú móvil al cambiar de ruta
        closeMobileMenu()
        
        // Determinar transición
        determineTransition({ name: to }, { name: from })
        
        // Log en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`🧭 Ruta cambiada: ${from} → ${to}`)
        }
      }
    )
    
    // Lifecycle hooks
    onMounted(() => {
      // Cargar favoritos al inicializar
      cargarFavoritos()
      
      // Agregar event listeners
      window.addEventListener('scroll', handleScroll, { passive: true })
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
      
      // Verificar configuración de API
      verificarConfiguracionAPI()
      
      console.log('🎬 Movies App inicializada correctamente')
    })
    
    onUnmounted(() => {
      // Limpiar event listeners
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
      
      // Restaurar scroll del body
      document.body.style.overflow = 'auto'
    })
    
    // Verificar configuración de API
    const verificarConfiguracionAPI = () => {
      try {
        // Importar dinámicamente para evitar errores en build
        import('./config/api.js').then(({ verificarAPIKey }) => {
          if (!verificarAPIKey()) {
            // Mostrar aviso al usuario si la API no está configurada
            setTimeout(() => {
              mostrarAvisoConfiguracion()
            }, 2000)
          }
        })
      } catch (error) {
        console.error('Error verificando configuración API:', error)
      }
    }
    
    // Mostrar aviso de configuración
    const mostrarAvisoConfiguracion = () => {
      const aviso = document.createElement('div')
      aviso.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          z-index: 10000;
          max-width: 500px;
          text-align: center;
        ">
          <h3 style="color: #333; margin-bottom: 1rem;">⚙️ Configuración requerida</h3>
          <p style="color: #666; margin-bottom: 1.5rem;">
            Para que la aplicación funcione correctamente, necesitás configurar tu API key de TMDB.
          </p>
          <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <small style="color: #333;">
              1. Visitá <strong>themoviedb.org</strong><br>
              2. Creá una cuenta gratuita<br>  
              3. Obtené tu API key<br>
              4. Configurala en <strong>src/config/api.js</strong>
            </small>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #667eea;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
          ">
            Entendido
          </button>
        </div>
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
        " onclick="this.parentElement.remove()"></div>
      `
      document.body.appendChild(aviso)
    }
    
    return {
      // Estado
      navScrolled,
      mobileMenuOpen,
      globalLoading,
      loadingMessage,
      transitionName,
      
      // Computed
      favoritosCount,
      currentYear,
      
      // Métodos
      navegarInicio,
      toggleMobileMenu,
      closeMobileMenu,
      onTransitionEnter,
      onTransitionLeave,
      showGlobalLoading,
      hideGlobalLoading
    }
  }
}
</script>

<style>
/* Importar estilos globales */
@import './assets/css/global.css';

/* Estilos específicos del componente App */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navegación principal */
.main-navigation {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  padding: 0.75rem 0;
}

.main-navigation.scrolled {
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

/* Brand/Logo */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.nav-brand:hover {
  transform: scale(1.05);
}

.brand-icon {
  font-size: 2rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.brand-text {
  color: white;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Enlaces de navegación */
.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-2px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-text {
  font-size: 0.9rem;
}

/* Badge de favoritos */
.favorites-badge {
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  margin-left: 0.25rem;
  animation: pulse 2s infinite;
}

/* Botón menú móvil */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  gap: 4px;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Menú móvil */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(102, 126, 234, 0.98);
  backdrop-filter: blur(20px);
  padding: 1rem;
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-menu.open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  transition: background 0.3s ease;
  font-weight: 500;
}

.mobile-nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mobile-favorites-badge {
  background: #ff4757;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: auto;
}

/* Contenido principal */
.main-content {
  flex: 1;
  margin-top: 80px; /* Altura de la navegación */
  transition: all 0.3s ease;
}

.main-content.menu-open {
  filter: blur(2px);
}

/* Transiciones de página */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Loading global */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* Footer */
.app-footer {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 3rem;
  padding: 2rem 0 1rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
  color: white;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.footer-note {
  font-size: 0.9rem;
  line-height: 1.5;
}

.footer-note a {
  color: #FFD700;
  text-decoration: none;
}

.footer-bottom {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

/* Animaciones */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .main-content {
    margin-top: 70px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .nav-text {
    display: none;
  }
  
  .brand-subtitle {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.5rem;
  }
  
  .brand-title {
    font-size: 1.3rem;
  }
  
  .main-content {
    margin-top: 65px;
  }
}

/* Estados de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .mobile-nav-link,
  .fade-enter-active,
  .fade-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: none;
  }
  
  .loading-spinner,
  .favorites-badge {
    animation: none;
  }
}
</style>