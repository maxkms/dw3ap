<template>
  <header class="main-header" :class="{ 'scrolled': scrolled }">
    <div class="header-container">
      <!-- Logo y título principal -->
      <div class="header-brand" @click="navegarInicio">
        <div class="logo-container">
          <span class="logo-icon">🎬</span>
          <div class="logo-text">
            <h1 class="brand-title">Movies App</h1>
            <p class="brand-subtitle">Tu cine digital</p>
          </div>
        </div>
      </div>

      <!-- Barra de búsqueda principal -->
      <div class="header-search" v-if="mostrarBusqueda">
        <div class="search-wrapper">
          <input
            type="text"
            v-model="terminoBusqueda"
            @input="manejarBusqueda"
            @focus="busquedaActiva = true"
            @blur="ocultarResultados"
            @keydown.enter="buscarEnter"
            @keydown.escape="limpiarBusqueda"
            placeholder="Buscar películas..."
            class="search-input"
            :class="{ 'active': busquedaActiva }"
          />
          
          <button 
            @click="ejecutarBusqueda"
            class="search-button"
            :disabled="!terminoBusqueda.trim()"
          >
            <span class="search-icon">🔍</span>
          </button>
          
          <!-- Botón limpiar búsqueda -->
          <button 
            v-if="terminoBusqueda"
            @click="limpiarBusqueda"
            class="clear-button"
          >
            <span class="clear-icon">✕</span>
          </button>
        </div>

        <!-- Resultados de búsqueda rápida -->
        <div 
          v-if="busquedaActiva && resultadosRapidos.length > 0"
          class="search-results"
        >
          <div class="results-header">
            <span class="results-title">Resultados rápidos:</span>
          </div>
          
          <div class="results-list">
            <div
              v-for="pelicula in resultadosRapidos.slice(0, 5)"
              :key="pelicula.id"
              @click="seleccionarPelicula(pelicula)"
              class="result-item"
            >
              <img 
                :src="obtenerImagenPequeña(pelicula.poster_path)"
                :alt="pelicula.title"
                class="result-poster"
                @error="manejarErrorImagen"
              />
              <div class="result-info">
                <h4 class="result-title">{{ pelicula.title }}</h4>
                <p class="result-year">{{ obtenerAno(pelicula.release_date) }}</p>
                <div class="result-rating">
                  <span class="rating-star">⭐</span>
                  <span>{{ pelicula.vote_average.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Ver todos los resultados -->
          <div class="results-footer" v-if="resultadosRapidos.length > 5">
            <button @click="verTodosLosResultados" class="see-all-btn">
              Ver todos los {{ resultadosRapidos.length }} resultados
            </button>
          </div>
        </div>

        <!-- Mensaje sin resultados -->
        <div 
          v-if="busquedaActiva && terminoBusqueda && resultadosRapidos.length === 0 && !cargandoBusqueda"
          class="no-results"
        >
          <p>No se encontraron películas para "{{ terminoBusqueda }}"</p>
        </div>

        <!-- Loading de búsqueda -->
        <div 
          v-if="busquedaActiva && cargandoBusqueda"
          class="search-loading"
        >
          <div class="search-spinner"></div>
          <p>Buscando...</p>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="header-stats" v-if="mostrarEstadisticas">
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-text">{{ totalPeliculasVistas || 0 }} vistas</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">❤️</span>
          <span class="stat-text">{{ favoritos.length }} favoritas</span>
        </div>
      </div>

      <!-- Botón toggle búsqueda móvil -->
      <button 
        @click="toggleBusquedaMovil"
        class="mobile-search-toggle"
        v-if="!mostrarBusqueda"
      >
        <span class="search-icon">🔍</span>
      </button>
    </div>

    <!-- Búsqueda móvil expandida -->
    <div 
      v-if="busquedaMovilActiva"
      class="mobile-search"
    >
      <div class="mobile-search-container">
        <input
          type="text"
          v-model="terminoBusqueda"
          @input="manejarBusqueda"
          @keydown.enter="buscarEnter"
          placeholder="¿Qué película buscás?"
          class="mobile-search-input"
          ref="mobileSearchInput"
        />
        <button @click="cerrarBusquedaMovil" class="mobile-close-btn">
          ✕
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { movieService } from '@/services/movieService'
import { useFavoritos } from '@/composables/useFavoritos'

export default {
  name: 'HeaderComponent',
  props: {
    // Mostrar barra de búsqueda
    mostrarBusqueda: {
      type: Boolean,
      default: true
    },
    
    // Mostrar estadísticas
    mostrarEstadisticas: {
      type: Boolean,
      default: true
    },
    
    // Término de búsqueda inicial
    busquedaInicial: {
      type: String,
      default: ''
    }
  },
  emits: ['busqueda', 'pelicula-seleccionada'],
  setup(props, { emit }) {
    const router = useRouter()
    const { favoritos } = useFavoritos()
    
    // Estado reactivo
    const terminoBusqueda = ref(props.busquedaInicial)
    const busquedaActiva = ref(false)
    const busquedaMovilActiva = ref(false)
    const cargandoBusqueda = ref(false)
    const resultadosRapidos = ref([])
    const scrolled = ref(false)
    const totalPeliculasVistas = ref(0)
    const mobileSearchInput = ref(null)
    
    // Timeouts para debouncing
    let timeoutBusqueda = null
    let timeoutOcultar = null
    
    // Manejar scroll para efecto header
    const manejarScroll = () => {
      scrolled.value = window.scrollY > 50
    }
    
    // Navegar al inicio
    const navegarInicio = () => {
      router.push('/')
    }
    
    // Manejar búsqueda con debouncing
    const manejarBusqueda = () => {
      clearTimeout(timeoutBusqueda)
      
      if (!terminoBusqueda.value.trim()) {
        resultadosRapidos.value = []
        return
      }
      
      timeoutBusqueda = setTimeout(async () => {
        await buscarPeliculasRapido()
      }, 300) // 300ms de delay
    }
    
    // Búsqueda rápida para autocompletado
    const buscarPeliculasRapido = async () => {
      if (!terminoBusqueda.value.trim()) return
      
      try {
        cargandoBusqueda.value = true
        const response = await movieService.buscarPeliculas(terminoBusqueda.value.trim(), 1)
        resultadosRapidos.value = response.results || []
      } catch (error) {
        console.error('Error en búsqueda rápida:', error)
        resultadosRapidos.value = []
      } finally {
        cargandoBusqueda.value = false
      }
    }
    
    // Ejecutar búsqueda completa
    const ejecutarBusqueda = () => {
      if (!terminoBusqueda.value.trim()) return
      
      // Emitir evento de búsqueda
      emit('busqueda', terminoBusqueda.value.trim())
      
      // Navegar a página de búsqueda si no estamos ahí
      if (router.currentRoute.value.name !== 'Buscar') {
        router.push({
          name: 'Buscar',
          query: { q: terminoBusqueda.value.trim() }
        })
      }
      
      // Ocultar resultados
      ocultarResultados()
    }
    
    // Búsqueda al presionar Enter
    const buscarEnter = () => {
      ejecutarBusqueda()
    }
    
    // Limpiar búsqueda
    const limpiarBusqueda = () => {
      terminoBusqueda.value = ''
      resultadosRapidos.value = []
      busquedaActiva.value = false
      busquedaMovilActiva.value = false
    }
    
    // Seleccionar película de resultados rápidos
    const seleccionarPelicula = (pelicula) => {
      emit('pelicula-seleccionada', pelicula)
      router.push(`/pelicula/${pelicula.id}`)
      ocultarResultados()
    }
    
    // Ver todos los resultados
    const verTodosLosResultados = () => {
      ejecutarBusqueda()
    }
    
    // Ocultar resultados con delay
    const ocultarResultados = () => {
      timeoutOcultar = setTimeout(() => {
        busquedaActiva.value = false
      }, 200)
    }
    
    // Toggle búsqueda móvil
    const toggleBusquedaMovil = async () => {
      busquedaMovilActiva.value = true
      await nextTick()
      if (mobileSearchInput.value) {
        mobileSearchInput.value.focus()
      }
    }
    
    // Cerrar búsqueda móvil
    const cerrarBusquedaMovil = () => {
      busquedaMovilActiva.value = false
      limpiarBusqueda()
    }
    
    // Obtener imagen pequeña
    const obtenerImagenPequeña = (posterPath) => {
      if (!posterPath) {
        return 'https://via.placeholder.com/50x75/667eea/ffffff?text=?'
      }
      return `https://image.tmdb.org/t/p/w92${posterPath}`
    }
    
    // Manejar error de imagen
    const manejarErrorImagen = (event) => {
      event.target.src = 'https://via.placeholder.com/50x75/cccccc/666666?text=N/A'
    }
    
    // Obtener año de fecha
    const obtenerAno = (fecha) => {
      if (!fecha) return 'N/A'
      return new Date(fecha).getFullYear()
    }
    
    // Cargar estadísticas desde localStorage
    const cargarEstadisticas = () => {
      try {
        const vistas = localStorage.getItem('peliculasVistas')
        if (vistas) {
          const peliculasVistas = JSON.parse(vistas)
          totalPeliculasVistas.value = peliculasVistas.length || 0
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      }
    }
    
    // Ciclo de vida
    onMounted(() => {
      window.addEventListener('scroll', manejarScroll)
      cargarEstadisticas()
      
      // Cargar búsqueda inicial si existe
      if (props.busquedaInicial) {
        terminoBusqueda.value = props.busquedaInicial
      }
    })
    
    onUnmounted(() => {
      window.removeEventListener('scroll', manejarScroll)
      clearTimeout(timeoutBusqueda)
      clearTimeout(timeoutOcultar)
    })
    
    return {
      // Estado
      terminoBusqueda,
      busquedaActiva,
      busquedaMovilActiva,
      cargandoBusqueda,
      resultadosRapidos,
      scrolled,
      totalPeliculasVistas,
      favoritos,
      mobileSearchInput,
      
      // Métodos
      navegarInicio,
      manejarBusqueda,
      ejecutarBusqueda,
      buscarEnter,
      limpiarBusqueda,
      seleccionarPelicula,
      verTodosLosResultados,
      ocultarResultados,
      toggleBusquedaMovil,
      cerrarBusquedaMovil,
      obtenerImagenPequeña,
      manejarErrorImagen,
      obtenerAno
    }
  }
}
</script>

<style scoped>
/* Header principal */
.main-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  padding: 1rem 0;
}

.main-header.scrolled {
  background: rgba(102, 126, 234, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0 1rem;
}

/* Brand/Logo */
.header-brand {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.header-brand:hover {
  transform: scale(1.05);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  font-size: 2.5rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.logo-text {
  color: white;
}

.brand-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

/* Búsqueda principal */
.header-search {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 12px 50px 12px 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus,
.search-input.active {
  border-color: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
  background: white;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: rgba(102, 126, 234, 0.1);
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-button:hover {
  background: rgba(0, 0, 0, 0.2);
}

.search-icon,
.clear-icon {
  font-size: 1.2rem;
  color: #666;
}

/* Resultados de búsqueda */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1001;
}

.results-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.results-title {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.results-list {
  padding: 0.5rem 0;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.result-item:hover {
  background: #f8f9fa;
}

.result-poster {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-year {
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 0.25rem 0;
}

.result-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #666;
}

.rating-star {
  font-size: 0.7rem;
}

.results-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  text-align: center;
}

.see-all-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.see-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Estados especiales */
.no-results,
.search-loading {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.search-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #eee;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* Estadísticas */
.header-stats {
  display: flex;
  gap: 1rem;
  color: white;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-icon {
  font-size: 1.1rem;
}

/* Búsqueda móvil */
.mobile-search-toggle {
  display: none;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 45px;
  height: 45px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.mobile-search-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.mobile-search {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.mobile-search-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.mobile-search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
}

.mobile-close-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    gap: 1rem;
  }
  
  .logo-icon {
    font-size: 2rem;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .header-search {
    display: none;
  }
  
  .header-stats {
    display: none;
  }
  
  .mobile-search-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 0.5rem;
  }
  
  .logo-container {
    gap: 0.5rem;
  }
  
  .logo-icon {
    font-size: 1.8rem;
  }
  
  .brand-title {
    font-size: 1.3rem;
  }
}

/* Animaciones */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .search-spinner {
    animation: none;
  }
  
  .header-brand:hover,
  .search-button:hover,
  .mobile-search-toggle:hover {
    transform: none;
  }
}
</style>