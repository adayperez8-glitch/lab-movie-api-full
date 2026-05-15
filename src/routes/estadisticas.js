const { Router } = require('express')
const router = Router()
const verificarToken = require('../middleware/verificarToken')
const prisma = require('../config/prisma')

// GET /api/estadisticas/directores
router.get('/directores', verificarToken, async (req, res, next) => {
  try {
    const directores = await prisma.director.findMany({
      select: {
        nombre: true,
        _count: { select: { peliculas: true } }
      },
      orderBy: { peliculas: { _count: 'desc' } }
    })

    res.json(directores.map(d => ({
      director: d.nombre,
      cantidad: d._count.peliculas
    })))
  } catch (err) {
    next(err)
  }
})

// GET /api/estadisticas/generos
router.get('/generos', verificarToken, async (req, res, next) => {
  try {
    const generos = await prisma.genero.findMany({
      select: {
        nombre: true,
        _count: { select: { peliculas: true } }
      },
      orderBy: { peliculas: { _count: 'desc' } }
    })

    res.json(generos.map(g => ({
      genero: g.nombre,
      cantidad: g._count.peliculas
    })))
  } catch (err) {
    next(err)
  }
})

module.exports = router
