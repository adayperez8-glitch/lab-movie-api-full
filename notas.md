# Notas del Lab — API de Películas Completa

## Reflexión final

### 1. ¿Qué parte del proyecto te resultó más difícil y por qué?

La integración de favoritos como un recurso independiente fue lo más desafiante. Al principio, los favoritos estaban implementados como rutas anidadas dentro de películas (`/:peliculaId/favoritos`) y también como ruta independiente, pero con los métodos HTTP y parámetros incorrectos. Separarlos correctamente en su propio router con `/:id` (donde `id` es el ID de la película) requirió coordinar cambios en el controlador, las rutas y el archivo `index.js` simultáneamente. También hubo conflicto entre dos archivos de rutas de películas (`peliculas.js` y `peliculaRoutes.js`) que hacían lo mismo de formas diferentes, lo que añadió confusión.

Además, manejar Express 5 (que tiene cambios sutiles respecto a Express 4) y asegurar que el error handler usara `statusCode` en lugar de `status` fue un detalle fácil de pasar por alto.

### 2. ¿Qué cambiarías si tuvieras que hacer este proyecto de nuevo desde cero?

- Usaría una estructura de carpetas más plana desde el principio, evitando la duplicación de archivos (como tener `peliculas.js` y `peliculaRoutes.js` simultáneamente).
- Definiría primero todas las rutas y contratos de API antes de escribir los controladores, para tener una visión global y evitar inconsistencias en los nombres de parámetros.
- Implementaría los tests antes de los controladores (TDD real), en lugar de escribirlos al final.
- Usaría un solo archivo `prisma.js` compartido en lugar de que cada test creara su propia instancia de `PrismaClient`.
- Añadiría tipos básicos con JSDoc para mejorar la experiencia de desarrollo.

### 3. ¿Cómo escalarías esta API si necesitase soportar 10.000 usuarios concurrentes?

Para soportar 10.000 usuarios concurrentes, aplicaría las siguientes estrategias:

- **Caché**: Implementaría Redis para cachear las respuestas de endpoints populares como `GET /api/peliculas` y `GET /api/peliculas/:id`, reduciendo la carga en PostgreSQL.
- **Índices de base de datos**: Aseguraría que todos los campos usados en filtros (`genero.slug`, `pelicula.nota`, `pelicula.anio`) tengan índices en Prisma. El schema actual ya tiene índices en `directorId` y `generoId`.
- **Pool de conexiones**: Ajustaría el pool de Prisma para manejar más conexiones concurrentes, y consideraría usar PgBouncer como proxy de conexiones.
- **Horizontal scaling**: Desplegaría la API en múltiples instancias detrás de un balanceador de carga (NGINX o AWS ALB). Como la API no tiene estado (usa JWT), cualquier instancia puede manejar cualquier petición.
- **Rate limiting**: Implementaría rate limiting global (express-rate-limit) para evitar abusos.
- **Lectura vs escritura**: Separaría las réplicas de lectura de PostgreSQL para que las consultas GET no compitan con las escrituras.
- **Compresión**: Habilitaría gzip/brotli en las respuestas JSON.

### 4. ¿Qué ventaja real te ha dado TDD en este proyecto? ¿Hubo algún caso donde el test te hizo detectar un bug antes de probarlo manualmente?

TDD (o en este caso, la escritura de tests) me permitió verificar inmediatamente que los cambios en las rutas no rompieran la funcionalidad existente. Por ejemplo:

- Cuando cambié los endpoints GET de películas de protegidos a públicos, los tests existentes dejaron de necesitar token, y los tests pasaron sin cambios en la lógica de autenticación.
- El test de paginación verificó que `totalPaginas` se calculara correctamente después de refactorizar los controladores.
- El test del endpoint IA detectó que la estructura de respuesta debía incluir `contexto`, `peliculas` y `metadata` con los campos exactos, lo que me obligó a formatear correctamente los datos en el controlador.

Sin los tests, habría tenido que probar cada endpoint manualmente con curl cada vez que hacía un cambio, lo que habría sido mucho más lento y propenso a errores.
