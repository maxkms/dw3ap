<template>
  <div class="favoritos-view">
    <div class="container">
      <!-- Header de favoritos -->
      <section class="favorites-header">
        <div class="header-content">
          <h1 class="favorites-title">
            <span class="favorites-emoji">❤️</span>
            Mis Películas Favoritas
          </h1>
          <p class="favorites-subtitle">
            Tu colección personal de las mejores películas
          </p>
          
          <!-- Estadísticas de favoritos -->
          <div class="favorites-stats" v-if="favoritos.length > 0">
            <div class="stat-item">
              <span class="stat-number">{{ favoritos.length }}</span>
              <span class="stat-label">Película{{ favoritos.length !== 1 ? 's' : '' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ promedioCalificacion }}</span>
              <span class="stat-label">Promedio ⭐</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Controles básicos -->
      <section v-if="favoritos.length > 0" class="favorites-controls">
        <div class="controls-card">
          <div class="controls-grid">
            <!-- Búsqueda en favoritos -->
            <div class="search-group">
              <label class="control-label">
                <span class="label-icon">🔍</span>
                Buscar en favoritos
              </label>
              <input
                type="text"
                v-model="busquedaLocal"
                placeholder="Buscar por título..."
                class="form-input search-input"
              />
            </div>

            <!-- Ordenamiento -->
            <div class="sort-group">
              <label class="control-label">
                <span class="label-icon">📊</span>
                Ordenar por
              </label>
              <select v-model="ordenamiento" class="form-select">
                <option value="fechaAgregada.desc">Agregados recientemente</option>
                <option value="title.asc">Título (A-Z)</option>
                <option value="title.desc">Título (Z-A)</option>
                <option value="vote_average.desc">Mejor puntuadas</option>
                <option value="release_date.desc">Más recientes</option>
              </select>
            </div>

            <!-- Acciones rápidas -->
            <div class="actions-group">
              <button @click="limpiarFiltros" v-if="hayFiltrosActivos" class="btn btn-secondary">
                <span>🗑️</span>
                Limpiar
              </button>
              
              <button @click="exportarFavoritos" class="btn btn-primary">
                <span>📤</span>
                Exportar
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Lista de películas favoritas -->
      <section class="favorites-content">
        <!-- Grid de favoritos -->
        <div v-if="favoritosFiltrados.length > 0" class="favorites-grid">
          <div class="movies-grid grid grid-movies">
            <div
              v-for="(pelicula, index) in favoritosFiltrados"
              :key="`fav-${pelicula.id}-${index}`"
              class="favorite-item"
            >
              <MovieCard
                :pelicula="pelicula"
                @click="navegarADetalle(pelicula)"
                class="favorite-card"
              />
              
              <!-- Información adicional de favorito -->
              <div class="favorite-meta">
                <div class="favorite-date">
                  <span class="meta-icon">📅</span>
                  <span class="meta-text">
                    Agregada {{ formatearFechaRelativa(pelicula.fechaAgregada) }}
                  </span>
                </div>
                
                <div class="favorite-actions">
                  <button
                    @click.stop="quitarDeFavoritos(pelicula.id)"
                    class="remove-btn"
                    title="Quitar de favoritos"
                  >
                    <span>💔</span>
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío cuando hay filtros sin resultados -->
        <div v-else-if="favoritos.length > 0 && favoritosFiltrados.length === 0" class="empty-filtered">
          <div class="empty-content">
            <div class="empty-icon">🔍</div>
            <h3>No se encontraron resultados</h3>
            <p>No hay películas favoritas que coincidan con tu búsqueda</p>
            <div class="empty-actions">
              <button @click="limpiarFiltros" class="btn btn-primary">
                🔄 Ver todos los favoritos
              </button>
            </div>
          </div>
        </div>

        <!-- Estado vacío principal -->
        <div v-else class="empty-favorites">
          <div class="empty-content">
            <div class="empty-icon">💔</div>
            <h3>Aún no tienes películas favoritas</h3>
            <p>Comenzá explorando películas y agregá las que más te gusten a tu colección personal</p>
            
            <div class="empty-actions">
              <router-link to="/" class="btn btn-primary">
                <span>🎬</span>
                Explorar películas
              </router-link>
              
              <router-link to="/buscar" class="btn btn-secondary">
                <span>🔍</span>
                Buscar películas
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritos } from '@/composables/useFavoritos'
import MovieCard from '@/components/MovieCard.vue'

export default {
  name: 'FavoritosView',
  components: {
    MovieCard
  },
  setup() {
    const router = useRouter()
    const { favoritos, quitarDeFavoritos, exportarFavoritos } = useFavoritos()
    
    // Estado reactivo
    const busquedaLocal = ref('')
    const ordenamiento = ref('fechaAgregada.desc')
    
    // Computed properties
    const hayFiltrosActivos = computed(() => {
      return busquedaLocal.value || ordenamiento.value !== 'fechaAgregada.desc'
    })
    
    const promedioCalificacion = computed(() => {
      if (favoritos.value.length === 0) return 0
      const suma = favoritos.value.reduce((acc, p) => acc + (p.vote_average || 0), 0)
      return (suma / favoritos.value.length).toFixed(1)
    })
    
    const favoritosFiltrados = computed(() => {
      let resultado = [...favoritos.value]
      
      // Filtrar por búsqueda
      if (busquedaLocal.value) {
        const termino = busquedaLocal.value.toLowerCase()
        resultado = resultado.filter(pelicula =>
          pelicula.title.toLowerCase().includes(termino)
        )
      }
      
      // Ordenar
      resultado.sort((a, b) => {
        switch (ordenamiento.value) {
          case 'fechaAgregada.desc':
            return new Date(b.fechaAgregada || 0) - new Date(a.fechaAgregada || 0)
          case 'title.asc':
            return a.title.localeCompare(b.title)
          case 'title.desc':
            return b.title.localeCompare(a.title)
          case 'vote_average.desc':
            return (b.vote_average || 0) - (a.vote_average || 0)
          case 'release_date.desc':
            return new Date(b.release_date || 0) - new Date(a.release_date || 0)
          default:
            return 0
        }
      })
      
      return resultado
    })
    
    // Limpiar filtros
    const limpiarFiltros = () => {
      busquedaLocal.value = ''
      ordenamiento.value = 'fechaAgregada.desc'
    }
    
    // Formatear fecha relativa
    const formatearFechaRelativa = (fecha) => {
      if (!fecha) return 'Fecha desconocida'
      
      const fechaAgregada = new Date(fecha)
      const ahora = new Date()
      const diferencia = ahora - fechaAgregada
      
      const minutos = Math.floor(diferencia / (1000 * 60))
      const horas = Math.floor(diferencia / (1000 * 60 * 60))
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
      
      if (minutos < 60) {
        return `hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`
      } else if (horas < 24) {
        return `hace ${horas} hora${horas !== 1 ? 's' : ''}`
      } else if (dias < 30) {
        return `hace ${dias} día${dias !== 1 ? 's' : ''}`
      } else {
        return fechaAgregada.toLocaleDateString()
      }
    }
    
    // Navegar a detalle
    const navegarADetalle = (pelicula) => {
      router.push(`/pelicula/${pelicula.id}`)
    }
    
    // Lifecycle
    onMounted(() => {
      // Cargar favoritos si es necesario
    })
    
    return {
      // Estado
      favoritos,
      busquedaLocal,
      ordenamiento,
      
      // Computed
      hayFiltrosActivos,
      favoritosFiltrados,
      promedioCalificacion,
      
      // Métodos
      limpiarFiltros,
      formatearFechaRelativa,
      navegarADetalle,
      quitarDeFavoritos,
      exportarFavoritos
    }
  }
}
</script>

<style scoped>
.favoritos-view {
  min-height: 100vh;
  padding: 2rem 0;
}

/* Favorites Header */
.favorites-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 0;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.favorites-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.favorites-emoji {
  font-size: 1.2em;
  animation: pulse 2s ease-in-out infinite;
}

.favorites-subtitle {
  font-size: 1.3rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.favorites-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
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

/* Controls Section */
.favorites-controls {
  margin-bottom: 3rem;
}

.controls-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.search-group,
.sort-group,
.actions-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.actions-group {
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}

.control-label {
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

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-secondary {
  background: rgba(0,0,0,0.1);
  color: #333;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* Favorites Content */
.favorites-content {
  margin-bottom: 3rem;
}

.favorites-grid {
  margin-bottom: 2rem;
}

.favorite-item {
  position: relative;
  animation: fadeInUp 0.6s ease-out;
}

.favorite-card {
  margin-bottom: 1rem;
}

.favorite-meta {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 0 0 15px 15px;
  padding: 1rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: -1rem;
}

.favorite-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.meta-icon {
  font-size: 1rem;
}

.favorite-actions {
  display: flex;
  gap: 0.5rem;
}

.remove-btn {
  background: rgba(255,0,0,0.7);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  border-radius: 20px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.remove-btn:hover {
  background: rgba(255,0,0,0.9);
  transform: translateY(-2px);
}

/* Empty States */
.empty-filtered,
.empty-favorites {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  color: white;
  max-width: 600px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-content h3 {
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.empty-content p {
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
  font-size: 1.1rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
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

/* Responsive Design */
@media (max-width: 768px) {
  .favoritos-view {
    padding: 1rem 0;
  }
  
  .favorites-header {
    padding: 2rem 0;
    margin-bottom: 2rem;
  }
  
  .favorites-title {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .favorites-stats {
    gap: 1rem;
  }
  
  .stat-item {
    min-width: 100px;
    padding: 1rem;
  }
  
  .controls-card {
    padding: 1.5rem;
  }
  
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-group {
    justify-content: stretch;
  }
  
  .actions-group .btn {
    flex: 1;
  }
  
  .favorite-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .controls-card {
    padding: 1rem;
  }
  
  .favorites-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-item {
    width: 100%;
    max-width: 200px;
  }
  
  .empty-content {
    padding: 2rem;
  }
  
  .favorite-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>