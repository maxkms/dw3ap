<template>
  <div class="loading-container" :class="{ 'fullscreen': fullscreen }">
    <!-- Spinner principal -->
    <div class="spinner-wrapper">
      <div class="spinner" :class="sizeClass">
        <div class="spinner-inner"></div>
        <div class="spinner-outer"></div>
      </div>
      
      <!-- Icono de película animado -->
      <div class="movie-icon" v-if="showIcon">
        🎬
      </div>
    </div>
    
    <!-- Mensaje de carga -->
    <div class="loading-message" v-if="mensaje">
      <p class="message-text">{{ mensaje }}</p>
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
    
    <!-- Barra de progreso (opcional) -->
    <div class="progress-bar" v-if="showProgress">
      <div class="progress-fill" :style="{ width: progreso + '%' }"></div>
    </div>
    
    <!-- Mensajes adicionales -->
    <div class="loading-tips" v-if="showTips && fullscreen">
      <p class="tip-text">{{ tipActual }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'LoadingSpinner',
  props: {
    // Mensaje a mostrar
    mensaje: {
      type: String,
      default: 'Cargando...'
    },
    
    // Tamaño del spinner
    size: {
      type: String,
      default: 'medium', // 'small', 'medium', 'large'
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    // Mostrar en pantalla completa
    fullscreen: {
      type: Boolean,
      default: false
    },
    
    // Mostrar icono de película
    showIcon: {
      type: Boolean,
      default: true
    },
    
    // Mostrar barra de progreso
    showProgress: {
      type: Boolean,
      default: false
    },
    
    // Progreso (0-100)
    progreso: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100
    },
    
    // Mostrar consejos
    showTips: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    // Estado reactivo
    const tipActual = ref('')
    let intervalTips = null
    
    // Clase de tamaño del spinner
    const sizeClass = computed(() => `spinner-${props.size}`)
    
    // Consejos aleatorios sobre películas
    const tips = [
      '¿Sabías que puedes agregar películas a favoritos? 💝',
      'Usa los filtros para encontrar películas por género 🎭',
      'Las películas se ordenan por popularidad por defecto ⭐',
      'Explorá las películas más recientes cambiando el filtro 📅',
      'Cada película tiene una puntuación de IMDb 🏆',
      'Clickeá en cualquier película para ver más detalles 📋',
      '¡Hay miles de películas esperándote! 🍿'
    ]
    
    // Cambiar tip cada 3 segundos
    const iniciarTips = () => {
      if (!props.showTips || !props.fullscreen) return
      
      // Mostrar tip inicial aleatorio
      tipActual.value = tips[Math.floor(Math.random() * tips.length)]
      
      // Cambiar tip cada 3 segundos
      intervalTips = setInterval(() => {
        const nuevoTip = tips[Math.floor(Math.random() * tips.length)]
        if (nuevoTip !== tipActual.value) {
          tipActual.value = nuevoTip
        }
      }, 3000)
    }
    
    // Limpiar intervalo
    const limpiarTips = () => {
      if (intervalTips) {
        clearInterval(intervalTips)
        intervalTips = null
      }
    }
    
    // Ciclo de vida
    onMounted(() => {
      iniciarTips()
      
      // Prevenir scroll en fullscreen
      if (props.fullscreen) {
        document.body.style.overflow = 'hidden'
      }
    })
    
    onUnmounted(() => {
      limpiarTips()
      
      // Restaurar scroll
      if (props.fullscreen) {
        document.body.style.overflow = 'auto'
      }
    })
    
    return {
      tipActual,
      sizeClass
    }
  }
}
</script>

<style scoped>
/* Contenedor principal */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  color: white;
  text-align: center;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(10px);
  z-index: 9999;
  min-height: 100vh;
}

/* Wrapper del spinner */
.spinner-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Spinner principal */
.spinner {
  position: relative;
  display: inline-block;
}

.spinner-inner,
.spinner-outer {
  border-radius: 50%;
  border: 4px solid transparent;
  animation: spin 2s linear infinite;
}

.spinner-inner {
  border-top-color: #ffffff;
  border-right-color: #ffffff;
}

.spinner-outer {
  position: absolute;
  top: -4px;
  left: -4px;
  border-top-color: rgba(255, 255, 255, 0.3);
  border-right-color: rgba(255, 255, 255, 0.3);
  animation-direction: reverse;
  animation-duration: 3s;
}

/* Tamaños del spinner */
.spinner-small .spinner-inner,
.spinner-small .spinner-outer {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

.spinner-small .spinner-outer {
  top: -3px;
  left: -3px;
}

.spinner-medium .spinner-inner,
.spinner-medium .spinner-outer {
  width: 50px;
  height: 50px;
  border-width: 4px;
}

.spinner-medium .spinner-outer {
  top: -4px;
  left: -4px;
}

.spinner-large .spinner-inner,
.spinner-large .spinner-outer {
  width: 80px;
  height: 80px;
  border-width: 6px;
}

.spinner-large .spinner-outer {
  top: -6px;
  left: -6px;
}

/* Icono de película */
.movie-icon {
  position: absolute;
  font-size: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

.spinner-small + .movie-icon {
  font-size: 1rem;
}

.spinner-large + .movie-icon {
  font-size: 2rem;
}

/* Mensaje de carga */
.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.message-text {
  font-size: 1.2rem;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  margin: 0;
}

/* Puntos animados */
.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

/* Barra de progreso */
.progress-bar {
  width: 200px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.8));
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Consejos */
.loading-tips {
  max-width: 400px;
  margin-top: 1rem;
}

.tip-text {
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
  animation: fadeInOut 3s ease-in-out infinite;
}

/* Animaciones */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Variante con gradiente */
.loading-container.fullscreen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(102, 126, 234, 0.9),
    rgba(118, 75, 162, 0.9),
    rgba(102, 126, 234, 0.9)
  );
  background-size: 400% 400%;
  animation: gradientMove 8s ease infinite;
  z-index: -1;
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Responsive */
@media (max-width: 768px) {
  .loading-container {
    padding: 1rem;
    gap: 1.5rem;
  }
  
  .message-text {
    font-size: 1.1rem;
  }
  
  .progress-bar {
    width: 150px;
  }
  
  .loading-tips {
    max-width: 300px;
  }
  
  .tip-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .spinner-large .spinner-inner,
  .spinner-large .spinner-outer {
    width: 60px;
    height: 60px;
    border-width: 4px;
  }
  
  .spinner-large .spinner-outer {
    top: -4px;
    left: -4px;
  }
  
  .movie-icon {
    font-size: 1.2rem;
  }
  
  .message-text {
    font-size: 1rem;
  }
  
  .progress-bar {
    width: 120px;
    height: 4px;
  }
}

/* Estados especiales para mejor UX */
.loading-container.error {
  color: #ff6b6b;
}

.loading-container.success {
  color: #51cf66;
}

/* Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .spinner-inner,
  .spinner-outer,
  .movie-icon,
  .dot,
  .tip-text {
    animation: none;
  }
  
  .loading-container.fullscreen::before {
    animation: none;
    background: rgba(102, 126, 234, 0.95);
  }
}

/* Focus para accesibilidad */
.loading-container:focus {
  outline: 3px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}
</style>