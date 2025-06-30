<template>
  <div class="home-view">
    <div class="container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-emoji">🎬</span>
            Descubrí las Mejores Películas
          </h1>
          <p class="hero-subtitle">
            Explorá, buscá y guardá tus películas favoritas en un solo lugar
          </p>
          <div class="hero-stats">
            <div class="stat-card">
              <span class="stat-number">{{ totalPeliculas }}</span>
              <span class="stat-label">Películas</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ favoritos.length }}</span>
              <span class="stat-label">Favoritas</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ generos.length }}</span>
              <span class="stat-label">Géneros</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección de filtros y controles -->
      <section class="filters-section">
        <div class="filters-card">
          <h2 class="filters-title">🎯 Filtros y Ordenamiento</h2>
          
          <div class="filters-grid">
            <!-- Filtro por género -->
            <div class="filter-group">
              <label class="filter-label">
                <span class="label-icon">🎭</span>
                Género
              </label>
              <select 
                v-model="generoSeleccionado" 
                @change="aplicarFiltros"
                class="form-select"
              >
                <option value="">Todos los géneros</option>
                <option 
                  v-for="genero in generos" 
                  :key="genero.id" 
                  :value="genero.id"
                >
                  {{ genero.name }}
                </option>
              </select>
            </div>

            <!-- Ordenamiento -->
            <div class="filter-group">
              <label class="filter-label">
                <span class="label-icon">📊</span>
                Ordenar por
              </label>
              <select 
                v-model="ordenamiento" 
                @change="aplicarFiltros"
                class="form-select"
              >
                <option value="popularity.desc">Más populares</option>
                <option value="release_date.desc">Más recientes</option>
                <option value="vote_average.desc">Mejor puntuadas</option>
                <option value="vote_count.desc">Más votadas</option>
              </select>
            </div>

            <!-- Año de lanzamiento -->
            <div class="filter-group">
              <label class="filter-label">
                <span class="label-icon">📅</span>
                Año
              </label>
              <select 
                v-model="anoSeleccionado" 
                @change="aplicarFiltros"
                class="form-select"
              >
                <option value="">Todos los años</option>
                <option 
                  v-for="ano in anosDisponibles" 
                  :key="ano" 
                  :value="ano"
                >
                  {{ ano }}
                </option>
              </select>
            </div>

            <!-- Botones de acción -->
            <div class="filter-actions">
              <button 
                @click="limpiarFiltros"
                v-if="hayFiltrosActivos"
                class="btn btn-secondary"
              >
                <span>🗑️</span>
                Limpiar filtros
              </button>
              
              <button 
                @click="filtrosAleatorios"
                class="btn btn-primary"
              >
                <span>🎲</span>
                Sorprendeme
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Estado de carga inicial -->
      <LoadingSpinner 
        v-if="cargandoInicial" 
        mensaje="Cargando las mejores películas..."
        :fullscreen="false"
        size="large"
      />

      <!-- Sección principal de películas -->
      <section v-else class="movies-section">
        <!-- Título dinámico -->
        <div class="section-header">
          <h2 class="section-title">
            {{ tituloSeccion }}
          </h2>
          <div class="section-info">
            <span class="movies-count">
              {{ peliculas.length }} película{{ peliculas.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="paginaActual > 1" class="page-info">
              - Página {{ paginaActual }}
            </span>
          </div>
        </div>

        <!-- Grid de películas -->
        <div 
          v-if="peliculas.length > 0"
          class="movies-grid grid grid-movies"
        >
          <MovieCard
            v-for="pelicula in peliculas"
            :key="`${pelicula.id}-${paginaActual}`"
            :pelicula="pelicula"
            :generos="generos"
            @click="navegarADetalle(pelicula)"
            class="movie-item"
          />
        </div>

        <!-- Estado vacío -->
        <div v-else class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">🎭</div>
            <h3>No se encontraron películas</h3>
            <p>Intentá cambiar los filtros o explorar otros géneros</p>
            <div class="empty-actions">
              <button @click="limpiarFiltros" class="btn btn-primary">
                🔄 Reiniciar filtros
              </button>
              <button @click="cargarPeliculasPopulares" class="btn btn-secondary">
                🎬 Ver populares
              </button>
            </div>
          </div>
        </div>

        <!-- Sección de carga más películas -->
        <div v-if="peliculas.length > 0" class="load-more-section">
          <!-- Indicador de carga -->
          <div v-if="cargando" class="loading-more">
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p>Cargando más películas...</p>
            </div>
          </div>

          <!-- Botón cargar más -->
          <div v-else-if="puedeCargarMas" class="load-more-actions">
            <button 
              @click="cargarMasPeliculas"
              class="btn btn-primary load-more-btn"
            >
              <span>📽️</span>
              Cargar más películas
            </button>
            
            <p class="load-info">
              Mostrando {{ peliculas.length }} de {{ totalPeliculas }} películas
            </p>
          </div>

          <!-- Mensaje final -->
          <div v-else class="end-message">
            <div class="end-content">
              <span class="end-icon">🎉</span>
              <p>¡Has visto todas las películas disponibles!</p>
              <button @click="volverAlInicio" class="btn btn-secondary">
                🔝 Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección de acceso rápido -->
      <section class="quick-access" v-if="!cargandoInicial">
        <h3 class="quick-title">🚀 Acceso Rápido</h3>
        <div class="quick-grid">
          <router-link to="/buscar" class="quick-card">
            <span class="quick-icon">🔍</span>
            <h4>Buscar Películas</h4>
            <p>Encontrá películas específicas</p>
          </router-link>
          
          <router-link to="/favoritos" class="quick-card">
            <span class="quick-icon">❤️</span>
            <h4>Mis Favoritos</h4>
            <p>{{ favoritos.length }} película{{ favoritos.length !== 1 ? 's' : '' }} guardada{{ favoritos.length !== 1 ? 's' : '' }}</p>
          </router-link>
          
          <button @click="filtrosAleatorios" class="quick-card quick-button">
            <span class="quick-icon">🎲</span>
            <h4>Descubrir</h4>
            <p>Películas aleatorias</p>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { movieService } from '@/services/movieService'
import { useFavoritos } from '@/composables/useFavoritos'
import MovieCard from '@/components/MovieCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'HomeView',
  components: {
    MovieCard,
    LoadingSpinner
  },
  setup() {
    const router = useRouter()
    const { favoritos } = useFavoritos()
    
    // Estado reactivo
    const peliculas = ref([])
    const generos = ref([])
    const cargando = ref(false)
    const cargandoInicial = ref(true)
    const paginaActual = ref(1)
    const totalPaginas = ref(1)
    const totalPeliculas = ref(0)
    
    // Filtros
    const generoSeleccionado = ref('')
    const ordenamiento = ref('popularity.desc')
    const anoSeleccionado = ref('')
    
    // Computed properties
    const hayFiltrosActivos = computed(() => {
      return generoSeleccionado.value || 
             ordenamiento.value !== 'popularity.desc' || 
             anoSeleccionado.value
    })
    
    const puedeCargarMas = computed(() => {
      return paginaActual.value < totalPaginas.value && !cargando.value
    })
    
    const tituloSeccion = computed(() => {
      if (generoSeleccionado.value) {
        const genero = generos.value.find(g => g.id === parseInt(generoSeleccionado.value))
        return `🎭 Películas de ${genero?.name || 'Género'}`
      }
      
      switch (ordenamiento.value) {
        case 'popularity.desc':
          return '🔥 Películas Más Populares'
        case 'release_date.desc':
          return '🆕 Películas Más Recientes'
        case 'vote_average.desc':
          return '⭐ Películas Mejor Puntuadas'
        case 'vote_count.desc':
          return '👥 Películas Más Votadas'
        default:
          return '🎬 Películas Destacadas'
      }
    })
    
    const anosDisponibles = computed(() => {
      const anoActual = new Date().getFullYear()
      const anos = []
      for (let ano = anoActual; ano >= 1970; ano--) {
        anos.push(ano)
      }
      return anos
    })
    
    // Cargar géneros disponibles
    const cargarGeneros = async () => {
      try {
        const response = await movieService.obtenerGeneros()
        generos.value = response.genres || []
      } catch (error) {
        console.error('Error cargando géneros:', error)
        mostrarError('Error al cargar géneros')
      }
    }
    
    // Cargar películas populares
    const cargarPeliculasPopulares = async () => {
      try {
        cargando.value = true
        const response = await movieService.obtenerPeliculasPopulares(1)
        peliculas.value = response.results || []
        totalPaginas.value = response.total_pages || 1
        totalPeliculas.value = response.total_results || 0
        paginaActual.value = 1
      } catch (error) {
        console.error('Error cargando películas populares:', error)
        mostrarError('Error al cargar películas populares')
      } finally {
        cargando.value = false
      }
    }
    
    // Aplicar filtros y obtener películas
    const aplicarFiltros = async (limpiar = true) => {
      try {
        cargando.value = true
        
        const filtros = {
          page: limpiar ? 1 : paginaActual.value + 1,
          sort_by: ordenamiento.value
        }
        
        if (generoSeleccionado.value) {
          filtros.with_genres = generoSeleccionado.value
        }
        
        if (anoSeleccionado.value) {
          filtros.year = anoSeleccionado.value
        }
        
        let response
        if (hayFiltrosActivos.value && (generoSeleccionado.value || anoSeleccionado.value)) {
          response = await movieService.descubrirPeliculas(filtros)
        } else {
          response = await movieService.obtenerPeliculasPopulares(filtros.page)
        }
        
        if (limpiar) {
          peliculas.value = response.results || []
          paginaActual.value = 1
        } else {
          peliculas.value = [...peliculas.value, ...(response.results || [])]
          paginaActual.value = filtros.page
        }
        
        totalPaginas.value = response.total_pages || 1
        totalPeliculas.value = response.total_results || 0
        
      } catch (error) {
        console.error('Error aplicando filtros:', error)
        mostrarError('Error al aplicar filtros')
      } finally {
        cargando.value = false
      }
    }
    
    // Cargar más películas (scroll infinito)
    const cargarMasPeliculas = async () => {
      if (!puedeCargarMas.value) return
      await aplicarFiltros(false)
    }
    
    // Limpiar todos los filtros
    const limpiarFiltros = () => {
      generoSeleccionado.value = ''
      ordenamiento.value = 'popularity.desc'
      anoSeleccionado.value = ''
      cargarPeliculasPopulares()
    }
    
    // Aplicar filtros aleatorios para descubrimiento
    const filtrosAleatorios = () => {
      if (generos.value.length === 0) return
      
      const generoAleatorio = generos.value[Math.floor(Math.random() * generos.value.length)]
      const ordenamientos = ['popularity.desc', 'release_date.desc', 'vote_average.desc']
      const ordenamientoAleatorio = ordenamientos[Math.floor(Math.random() * ordenamientos.length)]
      
      generoSeleccionado.value = generoAleatorio.id
      ordenamiento.value = ordenamientoAleatorio
      anoSeleccionado.value = ''
      
      aplicarFiltros()
    }
    
    // Navegar a detalle de película
    const navegarADetalle = (pelicula) => {
      // Guardar película vista en localStorage
      try {
        const vistas = JSON.parse(localStorage.getItem('peliculasVistas') || '[]')
        const yaVista = vistas.find(v => v.id === pelicula.id)
        
        if (!yaVista) {
          vistas.push({
            id: pelicula.id,
            title: pelicula.title,
            fechaVista: new Date().toISOString()
          })
          localStorage.setItem('peliculasVistas', JSON.stringify(vistas))
        }
      } catch (error) {
        console.error('Error guardando película vista:', error)
      }
      
      router.push(`/pelicula/${pelicula.id}`)
    }
    
    // Volver al inicio de la página
    const volverAlInicio = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    // Mostrar errores
    const mostrarError = (mensaje) => {
      const notificacion = document.createElement('div')
      notificacion.className = 'notification error show'
      notificacion.textContent = mensaje
      
      Object.assign(notificacion.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        backgroundColor: '#f44336',
        transform: 'translateX(0)',
        transition: 'transform 0.3s ease'
      })
      
      document.body.appendChild(notificacion)
      
      setTimeout(() => {
        notificacion.style.transform = 'translateX(100%)'
        setTimeout(() => {
          if (document.body.contains(notificacion)) {
            document.body.removeChild(notificacion)
          }
        }, 300)
      }, 4000)
    }
    
    // Watcher para detectar cambios en filtros
    watch([generoSeleccionado, ordenamiento, anoSeleccionado], () => {
      if (!cargandoInicial.value) {
        aplicarFiltros()
      }
    }, { deep: true })
    
    // Cargar datos iniciales
    onMounted(async () => {
      try {
        await cargarGeneros()
        await cargarPeliculasPopulares()
      } catch (error) {
        console.error('Error en carga inicial:', error)
        mostrarError('Error al cargar datos iniciales')
      } finally {
        cargandoInicial.value = false
      }
    })
    
    return {
      // Estado
      peliculas,
      generos,
      cargando,
      cargandoInicial,
      paginaActual,
      totalPeliculas,
      favoritos,
      
      // Filtros
      generoSeleccionado,
      ordenamiento,
      anoSeleccionado,
      
      // Computed
      hayFiltrosActivos,
      puedeCargarMas,
      tituloSeccion,
      anosDisponibles,
      
      // Métodos
      aplicarFiltros,
      cargarMasPeliculas,
      limpiarFiltros,
      filtrosAleatorios,
      navegarADetalle,
      volverAlInicio,
      cargarPeliculasPopulares
    }
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  padding: 2rem 0;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  padding: 3rem 0;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.hero-emoji {
  font-size: 1.2em;
  animation: bounce 2s ease-in-out infinite;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  color: white;
  min-width: 120px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Filters Section */
.filters-section {
  margin-bottom: 3rem;
}

.filters-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
}

.filters-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.label-icon {
  font-size: 1.1rem;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Movies Section */
.movies-section {
  margin-bottom: 4rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  color: white;
  font-size: 2rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.section-info {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
}

.movies-count {
  font-weight: 600;
}

.page-info {
  opacity: 0.8;
}

.movie-item {
  animation: fadeInUp 0.6s ease-out;
}

/* Load More Section */
.load-more-section {
  margin-top: 3rem;
  text-align: center;
}

.loading-more {
  padding: 2rem;
  color: white;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.load-more-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.load-more-btn {
  font-size: 1.1rem;
  padding: 15px 30px;
  min-width: 250px;
}

.load-info {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  margin: 0;
}

.end-message {
  padding: 2rem;
}

.end-content {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  max-width: 400px;
  margin: 0 auto;
}

.end-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

/* Quick Access */
.quick-access {
  margin-top: 4rem;
  text-align: center;
}

.quick-title {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.quick-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 15px;
  padding: 2rem;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.quick-card:hover,
.quick-button:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.quick-button {
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.quick-icon {
  font-size: 2.5rem;
}

.quick-card h4 {
  margin: 0;
  font-size: 1.2rem;
}

.quick-card p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  color: white;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-content h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.empty-content p {
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Animations */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .home-view {
    padding: 1rem 0;
  }
  
  .hero-section {
    padding: 2rem 0;
    margin-bottom: 3rem;
  }
  
  .hero-title {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .hero-stats {
    gap: 1rem;
  }
  
  .stat-card {
    min-width: 100px;
    padding: 1rem;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    justify-content: center;
  }
  
  .section-header {
    flex-direction: column;
    text-align: center;
  }
  
  .quick-grid {
    grid-template-columns: 1fr;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .filters-card {
    padding: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .load-more-btn {
    min-width: 200px;
  }
}
</style>