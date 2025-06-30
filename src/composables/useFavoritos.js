// src/composables/useFavoritos.js - Composable para manejar la lógica de favoritos
import { ref, computed } from 'vue'

// Estado global de favoritos (singleton pattern)
const favoritos = ref([])

// Composable principal para manejar favoritos
export function useFavoritos() {
  
  // Cargar favoritos desde localStorage al inicializar
  const cargarFavoritos = () => {
    try {
      const favoritosGuardados = localStorage.getItem('moviesFavoritos')
      if (favoritosGuardados) {
        favoritos.value = JSON.parse(favoritosGuardados)
        console.log('✅ Favoritos cargados:', favoritos.value.length)
      } else {
        favoritos.value = []
      }
    } catch (error) {
      console.error('❌ Error cargando favoritos desde localStorage:', error)
      favoritos.value = []
      // Limpiar localStorage corrupto
      localStorage.removeItem('moviesFavoritos')
    }
  }

  // Guardar favoritos en localStorage
  const guardarFavoritos = () => {
    try {
      localStorage.setItem('moviesFavoritos', JSON.stringify(favoritos.value))
      console.log('💾 Favoritos guardados:', favoritos.value.length)
    } catch (error) {
      console.error('❌ Error guardando favoritos en localStorage:', error)
      // Mostrar notificación de error
      mostrarNotificacion('Error al guardar favoritos', 'error')
    }
  }

  // Verificar si una película está en favoritos
  const esFavorito = (peliculaId) => {
    if (!peliculaId) return false
    return favoritos.value.some(pelicula => pelicula.id === peliculaId)
  }

  // Agregar película a favoritos
  const agregarAFavoritos = (pelicula) => {
    if (!pelicula || !pelicula.id) {
      console.error('❌ Película inválida para agregar a favoritos')
      return false
    }

    if (esFavorito(pelicula.id)) {
      console.log('⚠️ La película ya está en favoritos')
      return false
    }

    // Crear objeto optimizado para favoritos con timestamp
    const peliculaFavorita = {
      id: pelicula.id,
      title: pelicula.title || 'Título desconocido',
      poster_path: pelicula.poster_path || null,
      release_date: pelicula.release_date || null,
      vote_average: pelicula.vote_average || 0,
      overview: pelicula.overview || '',
      genre_ids: pelicula.genre_ids || [],
      original_language: pelicula.original_language || 'en',
      popularity: pelicula.popularity || 0,
      // Metadatos adicionales
      fechaAgregada: new Date().toISOString(),
      version: '1.0' // Para futuras migraciones
    }
    
    favoritos.value.push(peliculaFavorita)
    guardarFavoritos()
    
    // Mostrar notificación de éxito
    mostrarNotificacion(`"${pelicula.title}" agregada a favoritos`, 'success')
    
    return true
  }

  // Quitar película de favoritos
  const quitarDeFavoritos = (peliculaId) => {
    if (!peliculaId) return false

    const index = favoritos.value.findIndex(pelicula => pelicula.id === peliculaId)
    
    if (index === -1) {
      console.log('⚠️ La película no está en favoritos')
      return false
    }

    const peliculaEliminada = favoritos.value.splice(index, 1)[0]
    guardarFavoritos()
    
    // Mostrar notificación
    mostrarNotificacion(`"${peliculaEliminada.title}" quitada de favoritos`, 'info')
    
    return true
  }

  // Toggle favorito (agregar o quitar automáticamente)
  const toggleFavorito = (pelicula) => {
    if (!pelicula || !pelicula.id) {
      console.error('❌ Película inválida para toggle favorito')
      return false
    }

    if (esFavorito(pelicula.id)) {
      return quitarDeFavoritos(pelicula.id)
    } else {
      return agregarAFavoritos(pelicula)
    }
  }

  // Limpiar todos los favoritos
  const limpiarFavoritos = () => {
    if (favoritos.value.length === 0) {
      mostrarNotificacion('No hay favoritos para limpiar', 'info')
      return false
    }
    
    const cantidadEliminada = favoritos.value.length
    favoritos.value = []
    guardarFavoritos()
    
    mostrarNotificacion(`${cantidadEliminada} favoritos eliminados`, 'info')
    return true
  }

  // Exportar favoritos como archivo JSON
  const exportarFavoritos = () => {
    if (favoritos.value.length === 0) {
      mostrarNotificacion('No hay favoritos para exportar', 'warning')
      return false
    }

    try {
      // Crear datos para exportar
      const datosExportar = {
        metadata: {
          fechaExportacion: new Date().toISOString(),
          totalPeliculas: favoritos.value.length,
          version: '1.0',
          aplicacion: 'Movies App - Vue.js 3'
        },
        favoritos: favoritos.value.map(pelicula => ({
          id: pelicula.id,
          titulo: pelicula.title,
          fechaLanzamiento: pelicula.release_date,
          puntuacion: pelicula.vote_average,
          idioma: pelicula.original_language,
          fechaAgregada: pelicula.fechaAgregada,
          // Solo incluir campos esenciales para exportar
          overview: pelicula.overview ? pelicula.overview.substring(0, 200) + '...' : ''
        }))
      }

      // Crear y descargar archivo
      const dataStr = JSON.stringify(datosExportar, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `mis-peliculas-favoritas-${new Date().toISOString().split('T')[0]}.json`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpiar URL
      URL.revokeObjectURL(url)
      
      mostrarNotificacion('Favoritos exportados exitosamente', 'success')
      return true
      
    } catch (error) {
      console.error('❌ Error exportando favoritos:', error)
      mostrarNotificacion('Error al exportar favoritos', 'error')
      return false
    }
  }

  // Importar favoritos desde archivo JSON (función avanzada)
  const importarFavoritos = (archivo) => {
    return new Promise((resolve, reject) => {
      if (!archivo) {
        reject(new Error('No se proporcionó archivo'))
        return
      }

      const reader = new FileReader()
      
      reader.onload = (evento) => {
        try {
          const contenido = JSON.parse(evento.target.result)
          
          // Validar estructura del archivo
          if (!contenido.favoritos || !Array.isArray(contenido.favoritos)) {
            throw new Error('Formato de archivo inválido')
          }
          
          // Procesar e importar favoritos
          let importados = 0
          contenido.favoritos.forEach(favoritoImportado => {
            // Convertir formato de exportación a formato interno
            const peliculaParaAgregar = {
              id: favoritoImportado.id,
              title: favoritoImportado.titulo,
              release_date: favoritoImportado.fechaLanzamiento,
              vote_average: favoritoImportado.puntuacion || 0,
              original_language: favoritoImportado.idioma || 'en',
              overview: favoritoImportado.overview || '',
              poster_path: null, // Se cargará dinámicamente
              genre_ids: [],
              popularity: 0
            }
            
            // Solo agregar si no existe ya
            if (!esFavorito(peliculaParaAgregar.id)) {
              agregarAFavoritos(peliculaParaAgregar)
              importados++
            }
          })
          
          mostrarNotificacion(`${importados} favoritos importados exitosamente`, 'success')
          resolve(importados)
          
        } catch (error) {
          console.error('❌ Error procesando archivo de favoritos:', error)
          mostrarNotificacion('Error al procesar archivo de favoritos', 'error')
          reject(error)
        }
      }
      
      reader.onerror = () => {
        const error = new Error('Error leyendo el archivo')
        mostrarNotificacion('Error leyendo el archivo', 'error')
        reject(error)
      }
      
      reader.readAsText(archivo)
    })
  }

  // Computed para estadísticas de favoritos
  const estadisticas = computed(() => {
    const total = favoritos.value.length
    
    if (total === 0) {
      return {
        total: 0,
        promedioCalificacion: 0,
        mejorPelicula: null,
        generoMasComun: null,
        añoMasComun: null,
        ultimaAgregada: null
      }
    }

    // Promedio de calificación
    const promedioCalificacion = (
      favoritos.value.reduce((suma, pelicula) => suma + (pelicula.vote_average || 0), 0) / total
    ).toFixed(1)

    // Mejor película por puntuación
    const mejorPelicula = favoritos.value.reduce((mejor, actual) => {
      return (actual.vote_average || 0) > (mejor.vote_average || 0) ? actual : mejor
    })

    // Última película agregada
    const ultimaAgregada = favoritos.value.reduce((ultima, actual) => {
      const fechaActual = new Date(actual.fechaAgregada || 0)
      const fechaUltima = new Date(ultima.fechaAgregada || 0)
      return fechaActual > fechaUltima ? actual : ultima
    })

    // Año más común
    const años = favoritos.value
      .map(p => new Date(p.release_date).getFullYear())
      .filter(año => !isNaN(año))
    
    const añoMasComun = años.length > 0 ? 
      años.sort((a, b) => 
        años.filter(v => v === a).length - años.filter(v => v === b).length
      ).pop() : null

    return {
      total,
      promedioCalificacion: parseFloat(promedioCalificacion),
      mejorPelicula,
      añoMasComun,
      ultimaAgregada
    }
  })

  // Buscar en favoritos
  const buscarEnFavoritos = (termino) => {
    if (!termino || typeof termino !== 'string') return favoritos.value

    const terminoLimpio = termino.toLowerCase().trim()
    return favoritos.value.filter(pelicula => 
      pelicula.title.toLowerCase().includes(terminoLimpio) ||
      (pelicula.overview && pelicula.overview.toLowerCase().includes(terminoLimpio))
    )
  }

  // Ordenar favoritos
  const ordenarFavoritos = (criterio = 'fechaAgregada', direccion = 'desc') => {
    const factorDireccion = direccion === 'asc' ? 1 : -1
    
    return [...favoritos.value].sort((a, b) => {
      let valorA, valorB
      
      switch (criterio) {
        case 'title':
          return factorDireccion * a.title.localeCompare(b.title)
        case 'vote_average':
          valorA = a.vote_average || 0
          valorB = b.vote_average || 0
          return factorDireccion * (valorA - valorB)
        case 'release_date':
          valorA = new Date(a.release_date || 0)
          valorB = new Date(b.release_date || 0)
          return factorDireccion * (valorA - valorB)
        case 'fechaAgregada':
        default:
          valorA = new Date(a.fechaAgregada || 0)
          valorB = new Date(b.fechaAgregada || 0)
          return factorDireccion * (valorA - valorB)
      }
    })
  }

  // Función auxiliar para mostrar notificaciones
  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    // Mapeo de colores por tipo
    const colores = {
      success: '#4CAF50',
      error: '#f44336', 
      warning: '#ff9800',
      info: '#2196F3'
    }

    // Crear elemento de notificación
    const notificacion = document.createElement('div')
    notificacion.textContent = mensaje
    notificacion.className = `movies-notification ${tipo}`
    
    // Aplicar estilos
    Object.assign(notificacion.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      backgroundColor: colores[tipo] || colores.info,
      color: 'white',
      borderRadius: '8px',
      zIndex: '9999',
      fontWeight: '600',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      wordWrap: 'break-word'
    })
    
    // Agregar al DOM
    document.body.appendChild(notificacion)
    
    // Mostrar con animación
    setTimeout(() => {
      notificacion.style.transform = 'translateX(0)'
    }, 100)
    
    // Ocultar y remover después de 4 segundos
    setTimeout(() => {
      notificacion.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (document.body.contains(notificacion)) {
          document.body.removeChild(notificacion)
        }
      }, 300)
    }, 4000)
  }

  // Función para migrar datos de versiones anteriores (si fuera necesario)
  const migrarDatos = () => {
    // Verificar si hay datos en formato anterior y migrar
    const datosAntiguos = localStorage.getItem('peliculasFavoritas') // formato anterior
    if (datosAntiguos && favoritos.value.length === 0) {
      try {
        const favoritosAntiguos = JSON.parse(datosAntiguos)
        // Convertir al nuevo formato
        favoritosAntiguos.forEach(pelicula => {
          if (pelicula.id && pelicula.title) {
            agregarAFavoritos(pelicula)
          }
        })
        // Limpiar datos antiguos
        localStorage.removeItem('peliculasFavoritas')
        console.log('✅ Datos migrados al nuevo formato')
      } catch (error) {
        console.error('❌ Error migrando datos:', error)
      }
    }
  }

  // Retornar API pública del composable
  return {
    // Estado reactivo (solo lectura desde el exterior)
    favoritos: computed(() => favoritos.value),
    
    // Métodos principales
    cargarFavoritos,
    esFavorito,
    agregarAFavoritos,
    quitarDeFavoritos,
    toggleFavorito,
    
    // Métodos avanzados
    limpiarFavoritos,
    exportarFavoritos,
    importarFavoritos,
    
    // Utilidades
    buscarEnFavoritos,
    ordenarFavoritos,
    
    // Computed properties
    estadisticas,
    
    // Función interna (no recomendada para uso externo)
    _migrarDatos: migrarDatos,
    _mostrarNotificacion: mostrarNotificacion
  }
}

// Función de inicialización para usar en main.js o App.vue
export function inicializarFavoritos() {
  const { cargarFavoritos, _migrarDatos } = useFavoritos()
  
  // Migrar datos si es necesario
  _migrarDatos()
  
  // Cargar favoritos
  cargarFavoritos()
  
  console.log('🎬 Sistema de favoritos inicializado')
}

// Export por defecto para facilidad de uso
export default useFavoritos