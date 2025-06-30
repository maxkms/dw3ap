<template>
  <div class="detalle-view">
    <!-- Loading inicial -->
    <LoadingSpinner 
      v-if="cargando" 
      mensaje="Cargando detalles de la película..."
      :fullscreen="true"
      size="large"
    />

    <!-- Contenido principal -->
    <div v-else-if="pelicula" class="detalle-content">
      <!-- Hero section con backdrop -->
      <section class="hero-section" :style="{ backgroundImage: `url(${backdropUrl})` }">
        <div class="hero-overlay">
          <div class="container">
            <div class="hero-content">
              <!-- Poster y información principal -->
              <div class="movie-header">
                <div class="movie-poster-large">
                  <img 
                    :src="posterUrl" 
                    :alt="pelicula.title"
                    class="poster-image"
                    @error="manejarErrorImagen"
                  />
                  
                  <!-- Badge de favorito -->
                  <div class="favorite-badge" v-if="esFavorito(pelicula.id)">
                    <span class="favorite-icon">❤️</span>
                    <span class="favorite-text">Favorito</span>
                  </div>
                </div>

                <div class="movie-info-main">
                  <h1 class="movie-title">{{ pelicula.title }}</h1>
                  
                  <!-- Título original si es diferente -->
                  <h2 v-if="pelicula.original_title !== pelicula.title" class="original-title">
                    {{ pelicula.original_title }}
                  </h2>

                  <!-- Metadata principal -->
                  <div class="movie-meta-primary">
                    <div class="meta-item">
                      <span class="meta-icon">⭐</span>
                      <span class="meta-value">{{ pelicula.vote_average.toFixed(1) }}/10</span>
                      <span class="meta-label">({{ pelicula.vote_count }} votos)</span>
                    </div>
                    
                    <div class="meta-item">
                      <span class="meta-icon">📅</span>
                      <span class="meta-value">{{ obtenerAno(pelicula.release_date) }}</span>
                    </div>
                    
                    <div class="meta-item" v-if="pelicula.runtime">
                      <span class="meta-icon">⏱️</span>
                      <span class="meta-value">{{ formatearDuracion(pelicula.runtime) }}</span>
                    </div>
                    
                    <div class="meta-item" v-if="pelicula.status">
                      <span class="meta-icon">📊</span>
                      <span class="meta-value">{{ traducirEstado(pelicula.status) }}</span>
                    </div>
                  </div>

                  <!-- Géneros -->
                  <div class="genres-section" v-if="pelicula.genres && pelicula.genres.length > 0">
                    <span 
                      v-for="genero in pelicula.genres" 
                      :key="genero.id"
                      class="genre-chip"
                    >
                      {{ genero.name }}
                    </span>
                  </div>

                  <!-- Descripción -->
                  <div class="overview-section" v-if="pelicula.overview">
                    <h3 class="section-subtitle">Sinopsis</h3>
                    <p class="overview-text">{{ pelicula.overview }}</p>
                  </div>

                  <!-- Acciones principales -->
                  <div class="main-actions">
                    <button 
                      @click="toggleFavorito(pelicula)"
                      :class="{ 'favorito': esFavorito(pelicula.id) }"
                      class="btn btn-favorite"
                    >
                      <span class="btn-icon">{{ esFavorito(pelicula.id) ? '❤️' : '🤍' }}</span>
                      {{ esFavorito(pelicula.id) ? 'En favoritos' : 'Agregar a favoritos' }}
                    </button>
                    
                    <button @click="compartirPelicula" class="btn btn-secondary">
                      <span class="btn-icon">🔗</span>
                      Compartir
                    </button>
                    
                    <button @click="volverAtras" class="btn btn-outline">
                      <span class="btn-icon">◀️</span>
                      Volver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Información detallada -->
      <section class="details-section">
        <div class="container">
          <div class="details-grid">
            <!-- Información técnica -->
            <div class="info-card">
              <h3 class="card-title">📋 Información Técnica</h3>
              <div class="info-list">
                <div class="info-item" v-if="pelicula.release_date">
                  <span class="info-label">Fecha de estreno:</span>
                  <span class="info-value">{{ formatearFecha(pelicula.release_date) }}</span>
                </div>
                
                <div class="info-item" v-if="pelicula.original_language">
                  <span class="info-label">Idioma original:</span>
                  <span class="info-value">{{ traducirIdioma(pelicula.original_language) }}</span>
                </div>
                
                <div class="info-item" v-if="pelicula.budget && pelicula.budget > 0">
                  <span class="info-label">Presupuesto:</span>
                  <span class="info-value">${{ formatearMoney(pelicula.budget) }}</span>
                </div>
                
                <div class="info-item" v-if="pelicula.revenue && pelicula.revenue > 0">
                  <span class="info-label">Recaudación:</span>
                  <span class="info-value">${{ formatearMoney(pelicula.revenue) }}</span>
                </div>
                
                <div class="info-item" v-if="pelicula.production_countries && pelicula.production_countries.length > 0">
                  <span class="info-label">País{{ pelicula.production_countries.length > 1 ? 'es' : '' }}:</span>
                  <span class="info-value">
                    {{ pelicula.production_countries.map(p => p.name).join(', ') }}
                  </span>
                </div>
                
                <div class="info-item" v-if="pelicula.homepage">
                  <span class="info-label">Sitio web:</span>
                  <a :href="pelicula.homepage" target="_blank" class="info-link">
                    Sitio oficial ↗️
                  </a>
                </div>
              </div>
            </div>

            <!-- Estadísticas -->
            <div class="stats-card">
              <h3 class="card-title">📊 Estadísticas</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon">⭐</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ pelicula.vote_average.toFixed(1) }}</div>
                    <div class="stat-label">Puntuación</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon">👥</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ formatearNumero(pelicula.vote_count) }}</div>
                    <div class="stat-label">Votos</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon">🔥</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ formatearNumero(pelicula.popularity) }}</div>
                    <div class="stat-label">Popularidad</div>
                  </div>
                </div>
                
                <div class="stat-item" v-if="pelicula.revenue > 0">
                  <div class="stat-icon">💰</div>
                  <div class="stat-content">
                    <div class="stat-value">${{ formatearMoney(pelicula.revenue, true) }}</div>
                    <div class="stat-label">Recaudación</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Compañías productoras -->
            <div class="production-card" v-if="pelicula.production_companies && pelicula.production_companies.length > 0">
              <h3 class="card-title">🏢 Productoras</h3>
              <div class="companies-grid">
                <div 
                  v-for="company in pelicula.production_companies" 
                  :key="company.id"
                  class="company-item"
                >
                  <div class="company-logo" v-if="company.logo_path">
                    <img 
                      :src="obtenerLogoCompany(company.logo_path)" 
                      :alt="company.name"
                      class="logo-image"
                    />
                  </div>
                  <div class="company-info">
                    <div class="company-name">{{ company.name }}</div>
                    <div class="company-country" v-if="company.origin_country">
                      {{ company.origin_country }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de colección -->
          <div v-if="pelicula.belongs_to_collection" class="collection-section">
            <div class="collection-card">
              <div class="collection-content">
                <div class="collection-poster" v-if="pelicula.belongs_to_collection.poster_path">
                  <img 
                    :src="obtenerImagenCompleta(pelicula.belongs_to_collection.poster_path)"
                    :alt="pelicula.belongs_to_collection.name"
                    class="collection-image"
                  />
                </div>
                <div class="collection-info">
                  <h3 class="collection-title">🎬 Parte de la colección</h3>
                  <h4 class="collection-name">{{ pelicula.belongs_to_collection.name }}</h4>
                  <p class="collection-description">
                    Esta película forma parte de una colección más amplia. 
                    Explorá otras películas relacionadas de la misma saga o franquicia.
                  </p>
                  <button @click="buscarColeccion" class="btn btn-primary collection-btn">
                    <span class="btn-icon">🔍</span>
                    Ver colección completa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Recomendaciones -->
          <div v-if="recomendaciones.length > 0" class="recommendations-section">
            <h3 class="section-title">🎯 Películas Recomendadas</h3>
            <div class="recommendations-grid">
              <div
                v-for="recomendacion in recomendaciones.slice(0, 6)"
                :key="recomendacion.id"
                @click="navegarAPelicula(recomendacion.id)"
                class="recommendation-card"
              >
                <div class="recommendation-poster">
                  <img 
                    :src="obtenerImagenCompleta(recomendacion.poster_path)"
                    :alt="recomendacion.title"
                    class="recommendation-image"
                  />
                  <div class="recommendation-rating">
                    ⭐ {{ recomendacion.vote_average.toFixed(1) }}
                  </div>
                </div>
                <div class="recommendation-info">
                  <h4 class="recommendation-title">{{ recomendacion.title }}</h4>
                  <p class="recommendation-year">{{ obtenerAno(recomendacion.release_date) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="additional-info">
            <div class="info-grid">
              <div class="tagline-section" v-if="pelicula.tagline">
                <h3 class="section-subtitle">💭 Frase promocional</h3>
                <blockquote class="tagline-text">"{{ pelicula.tagline }}"</blockquote>
              </div>
              
              <div class="keywords-section" v-if="pelicula.genres && pelicula.genres.length > 0">
                <h3 class="section-subtitle">🏷️ Géneros</h3>
                <div class="keywords-list">
                  <span 
                    v-for="genero in pelicula.genres" 
                    :key="genero.id"
                    @click="buscarPorGenero(genero)"
                    class="keyword-tag"
                  >
                    {{ genero.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Estado de error -->
    <div v-else class="error-state">
      <div class="error-content">
        <div class="error-icon">🎭</div>
        <h3>Película no encontrada</h3>
        <p>No se pudo cargar la información de esta película</p>
        <div class="error-actions">
          <button @click="volverAtras" class="btn btn-primary">
            <span class="btn-icon">◀️</span>
            Volver atrás
          </button>
          <button @click="recargarPelicula" class="btn btn-secondary">
            <span class="btn-icon">🔄</span>
            Reintentar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { movieService } from '@/services/movieService'
import { useFavoritos } from '@/composables/useFavoritos'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'DetalleView',
  components: {
    LoadingSpinner
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const { esFavorito, toggleFavorito } = useFavoritos()
    
    // Estado reactivo
    const pelicula = ref(null)
    const recomendaciones = ref([])
    const cargando = ref(true)
    const error = ref(null)
    
    // Computed properties
    const posterUrl = computed(() => {
      if (!pelicula.value?.poster_path) {
        return 'https://via.placeholder.com/500x750/667eea/ffffff?text=Sin+Imagen'
      }
      return obtenerImagenCompleta(pelicula.value.poster_path)
    })
    
    const backdropUrl = computed(() => {
      if (!pelicula.value?.backdrop_path) {
        return 'https://images.unsplash.com/photo-1489599904379-7620a2c3d0c8?w=1920&h=1080&fit=crop'
      }
      return `https://image.tmdb.org/t/p/w1920${pelicula.value.backdrop_path}`
    })
    
    // Cargar detalles de la película
    const cargarDetalles = async (peliculaId) => {
      try {
        cargando.value = true
        error.value = null
        
        const response = await movieService.obtenerDetallesPelicula(peliculaId)
        pelicula.value = response
        
        // Cargar recomendaciones
        await cargarRecomendaciones(peliculaId)
        
        // Marcar como vista
        marcarComoVista(response)
        
      } catch (err) {
        console.error('Error cargando detalles:', err)
        error.value = err
        pelicula.value = null
      } finally {
        cargando.value = false
      }
    }
    
    // Cargar recomendaciones
    const cargarRecomendaciones = async (peliculaId) => {
      try {
        // Simular endpoint de recomendaciones usando películas populares
        const response = await movieService.obtenerPeliculasPopulares(1)
        recomendaciones.value = response.results.filter(r => r.id !== parseInt(peliculaId))
      } catch (err) {
        console.error('Error cargando recomendaciones:', err)
        recomendaciones.value = []
      }
    }
    
    // Marcar película como vista
    const marcarComoVista = (peliculaData) => {
      try {
        const vistas = JSON.parse(localStorage.getItem('peliculasVistas') || '[]')
        const yaVista = vistas.find(v => v.id === peliculaData.id)
        
        if (!yaVista) {
          vistas.push({
            id: peliculaData.id,
            title: peliculaData.title,
            fechaVista: new Date().toISOString()
          })
          localStorage.setItem('peliculasVistas', JSON.stringify(vistas))
        }
      } catch (error) {
        console.error('Error marcando como vista:', error)
      }
    }
    
    // Funciones de formateo
    const obtenerImagenCompleta = (path) => {
      if (!path) return 'https://via.placeholder.com/500x750/cccccc/666666?text=Sin+Imagen'
      return `https://image.tmdb.org/t/p/w500${path}`
    }
    
    const obtenerLogoCompany = (path) => {
      if (!path) return 'https://via.placeholder.com/100x50/f0f0f0/666666?text=Logo'
      return `https://image.tmdb.org/t/p/w200${path}`
    }
    
    const obtenerAno = (fecha) => {
      if (!fecha) return 'N/A'
      return new Date(fecha).getFullYear()
    }
    
    const formatearFecha = (fecha) => {
      if (!fecha) return 'Fecha desconocida'
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const formatearDuracion = (minutos) => {
      if (!minutos) return 'N/A'
      const horas = Math.floor(minutos / 60)
      const mins = minutos % 60
      return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`
    }
    
    const formatearMoney = (cantidad, abreviado = false) => {
      if (!cantidad) return 'N/A'
      
      if (abreviado) {
        if (cantidad >= 1000000000) {
          return (cantidad / 1000000000).toFixed(1) + 'B'
        } else if (cantidad >= 1000000) {
          return (cantidad / 1000000).toFixed(1) + 'M'
        }
      }
      
      return new Intl.NumberFormat('en-US').format(cantidad)
    }
    
    const formatearNumero = (numero) => {
      if (!numero) return '0'
      if (numero >= 1000000) {
        return (numero / 1000000).toFixed(1) + 'M'
      } else if (numero >= 1000) {
        return (numero / 1000).toFixed(1) + 'K'
      }
      return numero.toString()
    }
    
    const traducirEstado = (estado) => {
      const estados = {
        'Released': 'Estrenada',
        'Post Production': 'Post-producción',
        'In Production': 'En producción',
        'Planned': 'Planificada',
        'Rumored': 'Rumoreada',
        'Canceled': 'Cancelada'
      }
      return estados[estado] || estado
    }
    
    const traducirIdioma = (codigo) => {
      const idiomas = {
        'en': 'Inglés',
        'es': 'Español',
        'fr': 'Francés',
        'de': 'Alemán',
        'it': 'Italiano',
        'pt': 'Portugués',
        'ja': 'Japonés',
        'ko': 'Coreano',
        'zh': 'Chino',
        'ru': 'Ruso',
        'hi': 'Hindi',
        'ar': 'Árabe'
      }
      return idiomas[codigo] || codigo.toUpperCase()
    }
    
    // Acciones
    const volverAtras = () => {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/')
      }
    }
    
    const compartirPelicula = async () => {
      const url = window.location.href
      const texto = `¡Mirá esta película: "${pelicula.value.title}"!`
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: pelicula.value.title,
            text: texto,
            url: url
          })
        } catch (error) {
          if (error.name !== 'AbortError') {
            copiarAlPortapapeles(url)
          }
        }
      } else {
        copiarAlPortapapeles(url)
      }
    }
    
    const copiarAlPortapapeles = async (texto) => {
      try {
        await navigator.clipboard.writeText(texto)
        mostrarNotificacion('Enlace copiado al portapapeles', 'success')
      } catch (error) {
        console.error('Error copiando:', error)
        mostrarNotificacion('No se pudo copiar el enlace', 'error')
      }
    }
    
    const navegarAPelicula = (peliculaId) => {
      router.push(`/pelicula/${peliculaId}`)
    }
    
    const buscarColeccion = () => {
      if (pelicula.value.belongs_to_collection) {
        router.push({
          name: 'Buscar',
          query: { q: pelicula.value.belongs_to_collection.name }
        })
      }
    }
    
    const buscarPorGenero = (genero) => {
      router.push({
        name: 'Buscar',
        query: { genero: genero.id }
      })
    }
    
    const recargarPelicula = () => {
      cargarDetalles(props.id)
    }
    
    const manejarErrorImagen = (event) => {
      event.target.src = 'https://via.placeholder.com/500x750/cccccc/666666?text=Error+Imagen'
    }
    
    const mostrarNotificacion = (mensaje, tipo = 'info') => {
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
        borderRadius: '10px',
        zIndex: '9999',
        fontWeight: '600',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
      })
      
      document.body.appendChild(notificacion)
      setTimeout(() => notificacion.style.transform = 'translateX(0)', 100)
      setTimeout(() => {
        notificacion.style.transform = 'translateX(100%)'
        setTimeout(() => {
          if (document.body.contains(notificacion)) {
            document.body.removeChild(notificacion)
          }
        }, 300)
      }, 4000)
    }
    
    // Watchers
    watch(() => props.id, (nuevoId) => {
      if (nuevoId) {
        cargarDetalles(nuevoId)
      }
    })
    
    // Lifecycle
    onMounted(() => {
      if (props.id) {
        cargarDetalles(props.id)
      }
    })
    
    return {
      // Estado
      pelicula,
      recomendaciones,
      cargando,
      error,
      
      // Computed
      posterUrl,
      backdropUrl,
      
      // Métodos
      esFavorito,
      toggleFavorito,
      obtenerImagenCompleta,
      obtenerLogoCompany,
      obtenerAno,
      formatearFecha,
      formatearDuracion,
      formatearMoney,
      formatearNumero,
      traducirEstado,
      traducirIdioma,
      volverAtras,
      compartirPelicula,
      navegarAPelicula,
      buscarColeccion,
      buscarPorGenero,
      recargarPelicula,
      manejarErrorImagen
    }
  }
}
</script>

<style scoped>
/* Base styles */
.detalle-view {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hero Section */
.hero-section {
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0,0,0,0.8) 0%,
    rgba(102, 126, 234, 0.6) 50%,
    rgba(0,0,0,0.8) 100%
  );
  backdrop-filter: blur(2px);
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 2rem 0;
}

.movie-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  align-items: start;
}

.movie-poster-large {
  position: relative;
}

.poster-image {
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  transition: transform 0.3s ease;
}

.poster-image:hover {
  transform: scale(1.02);
}

.favorite-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ff4757;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(255,71,87,0.4);
}

.movie-info-main {
  color: white;
}

.movie-title {
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
  line-height: 1.2;
}

.original-title {
  font-size: 1.5rem;
  opacity: 0.8;
  font-weight: normal;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.movie-meta-primary {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.1);
  padding: 8px 16px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
}

.meta-icon {
  font-size: 1.2rem;
}

.meta-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.meta-label {
  opacity: 0.8;
  font-size: 0.9rem;
}

.genres-section {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.genre-chip {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.genre-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.overview-section {
  margin-bottom: 2rem;
}

.section-subtitle {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #FFD700;
}

.overview-text {
  font-size: 1.1rem;
  line-height: 1.8;
  opacity: 0.9;
  max-width: 800px;
}

.main-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-favorite {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-favorite.favorito {
  background: #ff4757;
  border-color: #ff4757;
}

.btn-favorite:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255,255,255,0.1);
  color: white;
  border: 2px solid rgba(255,255,255,0.2);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255,255,255,0.5);
}

.btn-outline:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Details Section */
.details-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 0;
  margin-top: -2rem;
  position: relative;
  z-index: 1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.info-card,
.stats-card,
.production-card {
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
}

.card-title {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.info-label {
  font-weight: 600;
  color: #555;
  flex: 1;
}

.info-value {
  color: #333;
  font-weight: 500;
  text-align: right;
}

.info-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.info-link:hover {
  color: #764ba2;
}

/* STATS GRID - SECCIÓN CORREGIDA */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 15px;
  transition: transform 0.3s ease;
  min-height: 80px;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 1.8rem;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
  word-break: break-word;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
  line-height: 1.2;
}

.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.company-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.company-item:hover {
  transform: translateY(-2px);
}

.company-logo {
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.logo-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.company-info {
  flex: 1;
}

.company-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.company-country {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Collection Section */
.collection-section {
  margin: 3rem 0;
}

.collection-card {
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.collection-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  align-items: center;
}

.collection-poster {
  padding: 1rem;
}

.collection-image {
  width: 100%;
  border-radius: 15px;
}

.collection-info {
  padding: 2rem;
}

.collection-title {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.collection-name {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #667eea;
  font-weight: bold;
}

.collection-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.collection-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

/* Recommendations */
.recommendations-section {
  margin: 3rem 0;
}

.section-title {
  color: white;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.recommendation-card {
  background: rgba(255,255,255,0.95);
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.recommendation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}

.recommendation-poster {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.recommendation-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recommendation-card:hover .recommendation-image {
  transform: scale(1.05);
}

.recommendation-rating {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.recommendation-info {
  padding: 1rem;
}

.recommendation-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.recommendation-year {
  font-size: 0.9rem;
  color: #666;
}

/* Additional Info */
.additional-info {
  margin: 3rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.tagline-section,
.keywords-section {
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.tagline-text {
  font-size: 1.2rem;
  font-style: italic;
  color: #555;
  border-left: 4px solid #667eea;
  padding-left: 1rem;
  margin: 0;
  line-height: 1.6;
}

.keywords-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.keyword-tag {
  background: #f0f2f5;
  color: #333;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.keyword-tag:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

/* Error State */
.error-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-content {
  text-align: center;
  color: white;
  max-width: 500px;
  padding: 3rem;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.error-content h3 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-content p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    background-attachment: scroll;
  }
  
  .movie-header {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .movie-poster-large {
    max-width: 300px;
    margin: 0 auto;
  }
  
  .movie-meta-primary {
    justify-content: center;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .stat-item {
    padding: 0.75rem;
    gap: 0.5rem;
    min-height: 70px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.1rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .companies-grid {
    grid-template-columns: 1fr;
  }
  
  .collection-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .recommendations-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .main-actions {
    justify-content: center;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 1rem 0;
  }
  
  .movie-title {
    font-size: 2rem;
  }
  
  .movie-meta-primary {
    flex-direction: column;
    align-items: center;
  }
  
  .genres-section {
    justify-content: center;
  }
  
  .details-section {
    padding: 2rem 0;
  }
  
  .info-card,
  .stats-card,
  .production-card {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .stat-item {
    padding: 1rem;
    gap: 1rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.4rem;
  }
  
  .main-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}

/* Animations */
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

.info-card,
.stats-card,
.production-card,
.recommendation-card {
  animation: fadeInUp 0.6s ease-out;
}

/* Print styles */
@media print {
  .main-actions,
  .recommendations-section {
    display: none;
  }
  
  .hero-section {
    background: white;
    color: black;
  }
  
  .movie-title,
  .section-title {
    color: black;
  }
}

/* Focus states for accessibility */
.btn:focus,
.recommendation-card:focus,
.keyword-tag:focus {
  outline: 3px solid rgba(102, 126, 234, 0.5);
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .poster-image,
  .recommendation-image,
  .btn,
  .recommendation-card,
  .company-item {
    transition: none;
  }
  
  .info-card,
  .stats-card,
  .production-card,
  .recommendation-card {
    animation: none;
  }
}
</style>