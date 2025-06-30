<template>
  <div class="movie-card" @click="$emit('click', pelicula)">
    <!-- Poster de la película -->
    <div class="movie-poster">
      <img 
        :src="posterUrl" 
        :alt="pelicula.title"
        @error="manejarErrorImagen"
        class="poster-image"
      />
      
      <!-- Rating de la película -->
      <div class="movie-rating">
        <span class="rating-star">⭐</span>
        <span class="rating-value">{{ pelicula.vote_average.toFixed(1) }}</span>
      </div>
      
      <!-- Botón de favoritos -->
      <button 
        @click.stop="toggleFavorito(pelicula)"
        :class="{ 'is-favorite': esFavorito(pelicula.id) }"
        class="favorite-btn"
        :title="esFavorito(pelicula.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
      >
        {{ esFavorito(pelicula.id) ? '❤️' : '🤍' }}
      </button>
      
      <!-- Overlay con información adicional -->
      <div class="poster-overlay">
        <div class="overlay-content">
          <span class="play-icon">▶️</span>
          <p>Ver detalles</p>
        </div>
      </div>
    </div>
    
    <!-- Información de la película -->
    <div class="movie-info">
      <h3 class="movie-title">{{ pelicula.title }}</h3>
      
      <div class="movie-meta">
        <span class="movie-year">📅 {{ obtenerAno(pelicula.release_date) }}</span>
        <span class="movie-language">🗣️ {{ pelicula.original_language.toUpperCase() }}</span>
      </div>
      
      <p class="movie-overview">
        {{ pelicula.overview ? pelicula.overview.substring(0, 100) + '...' : 'Sin descripción disponible' }}
      </p>
      
      <!-- Géneros si están disponibles -->
      <div v-if="pelicula.genre_ids && pelicula.genre_ids.length > 0" class="movie-genres">
        <span 
          v-for="generoId in pelicula.genre_ids.slice(0, 2)" 
          :key="generoId"
          class="genre-tag"
        >
          {{ obtenerNombreGenero(generoId) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { movieService } from '@/services/movieService'
import { useFavoritos } from '@/composables/useFavoritos'

export default {
  name: 'MovieCard',
  props: {
    pelicula: {
      type: Object,
      required: true,
      validator: (pelicula) => {
        return pelicula && typeof pelicula.id === 'number' && pelicula.title
      }
    },
    generos: {
      type: Array,
      default: () => []
    }
  },
  emits: ['click'],
  setup(props) {
    // Usar el composable de favoritos
    const { esFavorito, toggleFavorito } = useFavoritos()
    
    // URL del poster con manejo de errores
    const posterUrl = computed(() => {
      if (!props.pelicula.poster_path) {
        return 'https://via.placeholder.com/500x750/667eea/ffffff?text=Sin+Imagen'
      }
      return movieService.obtenerURLImagen(props.pelicula.poster_path)
    })
    
    // Manejar error de imagen
    const manejarErrorImagen = (event) => {
      event.target.src = 'https://via.placeholder.com/500x750/cccccc/666666?text=Error+Imagen'
      event.target.classList.add('image-error')
    }
    
    // Obtener año de la fecha de lanzamiento
    const obtenerAno = (fecha) => {
      if (!fecha) return 'N/A'
      const ano = new Date(fecha).getFullYear()
      return isNaN(ano) ? 'N/A' : ano
    }
    
    // Obtener nombre del género por ID
    const obtenerNombreGenero = (generoId) => {
      if (!props.generos || props.generos.length === 0) {
        // Géneros más comunes para fallback
        const generosComunes = {
          28: 'Acción',
          12: 'Aventura',
          16: 'Animación',
          35: 'Comedia',
          80: 'Crimen',
          99: 'Documental',
          18: 'Drama',
          10751: 'Familia',
          14: 'Fantasía',
          36: 'Historia',
          27: 'Terror',
          10402: 'Música',
          9648: 'Misterio',
          10749: 'Romance',
          878: 'Ciencia ficción',
          10770: 'Película de TV',
          53: 'Suspenso',
          10752: 'Guerra',
          37: 'Western'
        }
        return generosComunes[generoId] || 'Género'
      }
      
      const genero = props.generos.find(g => g.id === generoId)
      return genero ? genero.name : 'Desconocido'
    }
    
    return {
      posterUrl,
      esFavorito,
      toggleFavorito,
      manejarErrorImagen,
      obtenerAno,
      obtenerNombreGenero
    }
  }
}
</script>

<style scoped>
/* Contenedor principal de la tarjeta */
.movie-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

/* Contenedor del poster */
.movie-poster {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .poster-image {
  transform: scale(1.05);
}

.poster-image.image-error {
  opacity: 0.7;
}

/* Rating de la película */
.movie-rating {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-star {
  font-size: 12px;
}

.rating-value {
  font-weight: bold;
}

/* Botón de favoritos */
.favorite-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.favorite-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.favorite-btn.is-favorite {
  background: rgba(255, 71, 87, 0.9);
  color: white;
}

.favorite-btn.is-favorite:hover {
  background: #ff4757;
}

/* Overlay que aparece al hover */
.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
}

.movie-card:hover .poster-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: white;
}

.play-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.overlay-content p {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Información de la película */
.movie-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.movie-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  line-height: 1.3;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.movie-year,
.movie-language {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.movie-overview {
  color: #555;
  font-size: 0.9rem;
  line-height: 1.5;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Géneros */
.movie-genres {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: auto;
}

.genre-tag {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Estados especiales */
.movie-card.loading {
  pointer-events: none;
  opacity: 0.7;
}

.movie-card.error {
  border-color: #f44336;
}

/* Responsive design */
@media (max-width: 768px) {
  .movie-poster {
    height: 300px;
  }
  
  .movie-info {
    padding: 1rem;
  }
  
  .movie-title {
    font-size: 1.1rem;
  }
  
  .favorite-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .movie-rating {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .play-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .movie-poster {
    height: 250px;
  }
  
  .movie-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .movie-overview {
    font-size: 0.85rem;
  }
}

/* Animación de entrada */
.movie-card {
  animation: fadeInUp 0.5s ease-out;
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

/* Estados de accesibilidad */
.movie-card:focus {
  outline: 3px solid rgba(102, 126, 234, 0.5);
  outline-offset: 2px;
}

.favorite-btn:focus {
  outline: 2px solid rgba(102, 126, 234, 0.8);
  outline-offset: 2px;
}
</style>