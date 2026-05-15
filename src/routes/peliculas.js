const { Router } = require('express')
const router = Router()
const verificarToken = require('../middleware/verificarToken')
const verificarRol = require('../middleware/verificarRol')
const {
  listarPeliculas,
  obtenerPelicula,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
  obtenerResenas,
  crearResena
} = require('../controllers/peliculaController')

// Públicas
router.get('/', listarPeliculas)
router.get('/:id', obtenerPelicula)

// Protegidas: usuario autenticado
router.post('/', verificarToken, crearPelicula)

// Reseñas
router.get('/:id/resenas', verificarToken, obtenerResenas)
router.post('/:id/resenas', verificarToken, crearResena)

// Protegidas: solo admin
router.put('/:id', verificarToken, verificarRol('admin'), actualizarPelicula)
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarPelicula)

module.exports = router
