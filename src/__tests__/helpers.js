const prisma = require('../config/prisma')

const crearPelicula = async (datos = {}) => {
  return prisma.pelicula.create({
    data: {
      titulo: datos.titulo || 'Película Test',
      anio: datos.anio || 2020,
      nota: datos.nota ?? null,
      directorId: datos.directorId || null,
      generoId: datos.generoId || null
    }
  })
}

module.exports = { crearPelicula }
