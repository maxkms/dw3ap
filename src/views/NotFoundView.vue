<template>
  <div class="not-found">
    <div class="error-container">
      <div class="movie-reel">🎬</div>
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Película no encontrada</h2>
      <p class="error-description">
        Lo sentimos, la página que buscas no está en nuestro catálogo.
      </p>
      <div class="action-buttons">
        <router-link to="/" class="home-button">
          🏠 Ir al inicio
        </router-link>
        <router-link to="/buscar" class="search-button">
          🔍 Buscar películas
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  text-align: center;
  max-width: 500px;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.movie-reel {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-code {
  font-size: 6rem;
  font-weight: bold;
  color: #e74c3c;
  margin: 0;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.error-title {
  font-size: 2rem;
  color: #2c3e50;
  margin: 20px 0 10px;
  font-weight: 600;
}

.error-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.home-button, .search-button {
  display: inline-block;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.home-button {
  background-color: #3498db;
  color: white;
}

.home-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.search-button {
  background-color: #e67e22;
  color: white;
}

.search-button:hover {
  background-color: #d35400;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 126, 34, 0.3);
}

@media (max-width: 480px) {
  .error-container {
    padding: 30px 20px;
  }
  
  .error-code {
    font-size: 4rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .home-button, .search-button {
    width: 100%;
  }
}
</style>