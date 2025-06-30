<template>
  <div class="buscar-view">
    <div class="container">
      <!-- Header de búsqueda -->
      <section class="search-header">
        <div class="search-hero">
          <h1 class="search-title">
            <span class="search-emoji">🔍</span>
            Buscá tu Película Favorita
          </h1>
          <p class="search-subtitle">
            Explorá miles de películas por título, actor, director o palabra clave
          </p>
        </div>
      </section>

      <!-- Barra de búsqueda principal -->
      <section class="search-section">
        <div class="search-card">
          <div class="search-form">
            <div class="search-input-wrapper">
              <input
                type="text"
                v-model="terminoBusqueda"
                @input="manejarBusqueda"
                @keydown.enter="buscarAhora"
                @focus="inputActivo = true"
                @blur="inputActivo = false"
                placeholder="Escribí el nombre de una película..."
                class="search-input"
                :class="{ 'active': inputActivo || terminoBusqueda }"
                ref="searchInput"
              />
              
              <button 
                @click="buscarAhora"
                :disabled="!terminoBusqueda.trim() || cargando"
                class="search-btn"
              >
                <span v-if="cargando" class="btn-spinner"></span>
                <span v-else class="search-icon">🔍</span>
                {{ cargando ? 'Buscando...' : 'Buscar' }}
              </button>
              
              <button 
                v-if="terminoBusqueda"
                @click="limpiarBusqueda"
                class="clear-search-btn"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Loading de búsqueda -->
      <LoadingSpinner 
        v-if="cargando && resultados.length === 0"
        mensaje="Buscando películas..."
        :fullscreen="false"
        size="medium"
      />

      <!-- Resultados de búsqueda -->
      <section v-else-if="resultados.length > 0" class="results-section">
        <div class="results-info">
          <h2 class="results-title">
            Resultados para: <span class="search-term">"{{ terminoBusqueda }}"</span>
          </h2>
          <p class="results-count">
            {{ totalResultados }} resultado{{ totalResultados !== 1 ? 's' : '' }} encontrado{{ totalResultados !== 1 ? 's' : '' }}
          </p>
        </div>

        <div class="movies-grid grid grid-movies">
          <MovieCard
            v-for="pelicula in resultados"
            :key="`search-${pelicula.id}`"
            :pelicula="pelicula"
            @click="navegarADetalle(pelicula)"
            class="search-result-item"
          />
        </div>
        
        <!-- Botón cargar más -->
        <div v-if="puedeCargarMas" class="load-more-section">
          <button @click="cargarMasResultados" class="btn btn-primary load-more-btn">
            📽️ Cargar más resultados
          </button>
        </div>
      </section>

      <!-- Estado vacío - sin resultados -->
      <section v-else-if="terminoBusqueda && !cargando" class="empty-results">
        <div class="empty-content">
          <div class="empty-icon">🎭</div>
          <h3>No se encontraron resultados</h3>
          <p>No encontramos películas que coincidan con tu búsqueda</p>
          <div class="empty-actions">
            <button @click="limpiarBusqueda" class="btn btn-primary">
              🔄 Nueva búsqueda
            </button>
          </div>
        </div>
      </section>

      <!-- Estado inicial - sin búsqueda -->
      <section v-else-if="!terminoBusqueda && !cargando" class="search-initial">
        <div class="initial-content">
          <div class="initial-icon">🎬</div>
          <h3>¿Qué película buscás?</h3>
          <p>Comenzá escribiendo el nombre de una película en la barra de búsqueda</p>
          
          <!-- Búsquedas populares -->
          <div class="popular-searches">
            <h4>Búsquedas populares:</h4>
            <div class="popular-list">
              <button
                v-for="busqueda in busquedasPopulares"
                :key="busqueda"
                @click="aplicarBusquedaPopular(busqueda)"
                class="popular-item"
              >
                {{ busqueda }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { movieService } from '@/services/movieService'
import MovieCard from '@/components/MovieCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'BuscarView',
  components: {
    MovieCard,
    LoadingSpinner
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // Referencias
    const searchInput = ref(null)
    
    // Estado reactivo
    const terminoBusqueda = ref('')
    const resultados = ref([])
    const cargando = ref(false)
    const inputActivo = ref(false)
    
    // Paginación
    const paginaActual = ref(1)
    const totalPaginas = ref(1)
    const totalResultados = ref(0)
    
    // Búsquedas populares
    const busquedasPopulares = [
      'Avengers', 'Spider-Man', 'Batman', 'Star Wars', 'Marvel',
      'Disney', 'Harry Potter', 'Fast and Furious', 'Jurassic Park'
    ]
    
    // Timeout para debouncing
    let timeoutBusqueda = null
    
    // Computed properties
    const puedeCargarMas = computed(() => {
      return paginaActual.value < totalPaginas.value && !cargando.value
    })
    
    // Manejar búsqueda con debouncing
    const manejarBusqueda = () => {
      clearTimeout(timeoutBusqueda)
      
      if (!terminoBusqueda.value.trim()) {
        resultados.value = []
        return
      }
      
      timeoutBusqueda = setTimeout(() => {
        buscarPeliculas(true)
      }, 500)
    }
    
    // Buscar películas
    const buscarPeliculas = async (limpiarResultados = true) => {
      if (!terminoBusqueda.value.trim()) return
      
      try {
        if (limpiarResultados) {
          cargando.value = true
          paginaActual.value = 1
        }
        
        const response = await movieService.buscarPeliculas(
          terminoBusqueda.value.trim(),
          limpiarResultados ? 1 : paginaActual.value + 1
        )
        
        if (limpiarResultados) {
          resultados.value = response.results || []
          paginaActual.value = 1
        } else {
          resultados.value = [...resultados.value, ...(response.results || [])]
          paginaActual.value = paginaActual.value + 1
        }
        
        totalPaginas.value = response.total_pages || 1
        totalResultados.value = response.total_results || 0
        
        // Actualizar URL con query parameter
        if (limpiarResultados) {
          router.replace({
            name: 'Buscar',
            query: { q: terminoBusqueda.value.trim() }
          })
        }
        
      } catch (error) {
        console.error('Error buscando películas:', error)
        mostrarError('Error al buscar películas')
      } finally {
        cargando.value = false
      }
    }
    
    // Buscar ahora (botón o Enter)
    const buscarAhora = () => {
      if (!terminoBusqueda.value.trim()) return
      buscarPeliculas(true)
    }
    
    // Aplicar búsqueda popular
    const aplicarBusquedaPopular = (busqueda) => {
      terminoBusqueda.value = busqueda
      buscarPeliculas(true)
    }
    
    // Limpiar búsqueda
    const limpiarBusqueda = () => {
      terminoBusqueda.value = ''
      resultados.value = []
      paginaActual.value = 1
      
      router.replace({ name: 'Buscar' })
      
      nextTick(() => {
        if (searchInput.value) {
          searchInput.value.focus()
        }
      })
    }
    
    // Cargar más resultados
    const cargarMasResultados = () => {
      if (puedeCargarMas.value) {
        buscarPeliculas(false)
      }
    }
    
    // Navegar a detalle
    const navegarADetalle = (pelicula) => {
      router.push(`/pelicula/${pelicula.id}`)
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
        backgroundColor: '#f44336'
      })
      
      document.body.appendChild(notificacion)
      
      setTimeout(() => {
        if (document.body.contains(notificacion)) {
          document.body.removeChild(notificacion)
        }
      }, 4000)
    }
    
    // Lifecycle
    onMounted(() => {
      // Cargar búsqueda desde query parameter
      if (route.query.q) {
        terminoBusqueda.value = route.query.q
        buscarPeliculas(true)
      }
      
      // Focus en input
      nextTick(() => {
        if (searchInput.value) {
          searchInput.value.focus()
        }
      })
    })
    
    return {
      // Referencias
      searchInput,
      
      // Estado
      terminoBusqueda,
      resultados,
      cargando,
      inputActivo,
      totalResultados,
      busquedasPopulares,
      
      // Computed
      puedeCargarMas,
      
      // Métodos
      manejarBusqueda,
      buscarAhora,
      aplicarBusquedaPopular,
      limpiarBusqueda,
      cargarMasResultados,
      navegarADetalle
    }
  }
}
</script>

<style scoped>
.buscar-view {
  min-height: 100vh;
  padding: 2rem 0;
}

/* Search Header */
.search-header {
  text-align: center;
  margin-bottom: 3rem;
}

.search-hero {
  max-width: 800px;
  margin: 0 auto;
}

.search-title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.search-emoji {
  font-size: 1.2em;
}

.search-subtitle {
  font-size: 1.2rem;
  color: rgba(255,255,255,0.9);
  line-height: 1.6;
}

/* Search Section */
.search-section {
  margin-bottom: 3rem;
}

.search-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  max-width: 900px;
  margin: 0 auto;
}

.search-form {
  margin-bottom: 2rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 15px 50px 15px 20px;
  border: 3px solid #e1e5e9;
  border-radius: 25px;
  font-size: 18px;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

.search-input.active,
.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn {
  padding: 15px 30px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
  justify-content: center;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.clear-search-btn {
  position: absolute;
  right: 160px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.1);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: rgba(0,0,0,0.2);
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Results Section */
.results-section {
  margin-bottom: 3rem;
}

.results-info {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.results-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.search-term {
  color: #FFD700;
  font-style: italic;
}

.results-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

.search-result-item {
  animation: fadeInUp 0.6s ease-out;
}

.load-more-section {
  text-align: center;
  margin-top: 3rem;
}

.load-more-btn {
  font-size: 1.1rem;
  padding: 15px 30px;
  min-width: 250px;
}

/* Empty States */
.empty-results,
.search-initial {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content,
.initial-content {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  color: white;
  max-width: 600px;
  margin: 0 auto;
}

.empty-icon,
.initial-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-content h3,
.initial-content h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.empty-content p,
.initial-content p {
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

.popular-searches {
  margin-bottom: 2rem;
}

.popular-searches h4 {
  margin-bottom: 1rem;
  color: #FFD700;
  font-size: 1.1rem;
}

.popular-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.popular-item {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.popular-item:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  .buscar-view {
    padding: 1rem 0;
  }
  
  .search-title {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-card {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  .search-input-wrapper {
    flex-direction: column;
  }
  
  .clear-search-btn {
    position: absolute;
    right: 10px;
    top: 15px;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .popular-list {
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .search-card {
    padding: 1rem;
  }
  
  .search-input {
    font-size: 16px;
    padding: 12px 40px 12px 16px;
  }
  
  .search-btn {
    padding: 12px 20px;
    font-size: 14px;
    min-width: 120px;
  }
  
  .results-title {
    font-size: 1.5rem;
  }
  
  .initial-content,
  .empty-content {
    padding: 2rem;
  }
  
  .load-more-btn {
    min-width: 200px;
  }
}
</style>