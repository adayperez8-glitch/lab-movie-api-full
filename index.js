require('dotenv').config()
require('./src/config/prisma')

const express = require('express')
const rateLimit = require('express-rate-limit')
const app = express()

// Validación de variables de entorno críticas
const requiredEnv = ['JWT_SECRET', 'DATABASE_URL']
const missing = requiredEnv.filter(key => !process.env[key])
if (missing.length > 0) {
  console.error(`Error crítico: faltan variables de entorno: ${missing.join(', ')}`)
  process.exit(1)
}

// Rate limiting global: 100 peticiones cada 15 minutos
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' }
})
app.use(globalLimiter)

// Rate limiting estricto para auth: 5 peticiones cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.' }
})

app.use(express.json())

const favoritosRouter = require('./src/routes/favoritos')
const directoresRouter = require('./src/routes/directores')
const peliculasRouter = require('./src/routes/peliculas')
const auditoria = require('./src/middleware/auditoria')
const authRouter = require('./src/routes/auth')
const estadisticasRouter = require('./src/routes/estadisticas')
const iaRouter = require('./src/routes/ia')

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/directores', directoresRouter)
app.use('/api/peliculas', auditoria, peliculasRouter)
app.use('/api/estadisticas', estadisticasRouter)
app.use('/api/favoritos', favoritosRouter)
app.use('/api/ia', iaRouter)

app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500
  res.status(status).json({ error: err.message })
})

app.use((req, res) => {
  res.status(404).json({ error: `${req.method} ${req.url} no encontrada` })
})

const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`)
  })
}

module.exports = app
