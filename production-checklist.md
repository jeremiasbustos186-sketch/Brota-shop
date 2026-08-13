# Checklist de Deploy en Producción — Brota Shop

## Build & Deploy

- [ ] `npm run build` pasa sin errores en local
- [ ] Deploy en Vercel sin errores de build
- [ ] Redeploy realizado luego de cambiar env vars (Vercel no aplica cambios en caliente)

## Variables de Entorno — Seguridad

- [ ] Variables `VITE_*` contienen **solo config pública** (Firebase config — no es un secreto)
- [ ] AWS keys (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) están en Vercel dashboard SIN prefijo `VITE_`
- [ ] Ninguna clave secreta está commiteada en el repo (`.env` y `.env.local` en `.gitignore`)
- [ ] Verificar: `git grep "AKIA"` no devuelve nada (prefijo de AWS access keys)

## Flujos Críticos (verificar en la URL de producción)

- [ ] **Login** con email/password funciona
- [ ] **Login con Google** funciona
- [ ] **Signup** crea usuario y redirige al catálogo
- [ ] **Catálogo** lista productos correctamente
- [ ] **Búsqueda** filtra por nombre (debounce 400ms)
- [ ] **Filtro por categoría** funciona
- [ ] **Paginación** (Cargar más) trae la página siguiente
- [ ] **Detalle de producto** se carga correctamente
- [ ] **Carrito**: agregar, modificar cantidad, eliminar, vaciar — totales correctos
- [ ] **Carrito persiste** al recargar la página (localStorage)
- [ ] **Checkout** crea UNA sola orden aunque se haga doble click
- [ ] **Página de éxito** muestra el orderId y links correctos
- [ ] **Historial de órdenes** muestra las órdenes del usuario logueado
- [ ] **Detalle de orden** muestra el snapshot (precios históricos)
- [ ] Usuario sin rol admin **no accede** a `/admin` (redirige a `/`)
- [ ] **Panel admin**: CRUD de productos funciona
- [ ] **Upload de imagen** genera presigned URL y sube a S3
- [ ] **Admin puede cambiar status** de órdenes (pending → processing → completed)

## Seguridad Firestore

- [ ] Rules publicadas: `firebase deploy --only firestore:rules`
- [ ] Un usuario sin permisos recibe `PERMISSION_DENIED` al intentar leer/editar órdenes ajenas
- [ ] El admin solo puede actualizar `status` y `updatedAt` (verificar en Firestore Rules Simulator)

## Índices Compuestos (Firestore)

- [ ] Índice creado: `orders` — `userId ASC + createdAt DESC` (para historial del customer)
- [ ] Índice creado: `orders` — `status ASC + createdAt DESC` (para filtro del admin)
- [ ] Verificar en la consola que no hay errores de índice faltante

## Calidad — Tests

- [ ] `npm run test` pasa localmente con todos los tests en verde
- [ ] Los tests pasan **con wifi desconectado** (no dependen de red real)
- [ ] Suite cubre: cartReducer (8 tests) + al menos 1 test de componente o hook

## Debugging (si algo falla)

- [ ] Revisar **Network tab** del browser: identificar el request que falla y su status
- [ ] Revisar **Vercel Functions logs**: el mensaje de error dice qué variable falta
- [ ] Revisar **consola del browser**: error de índice compuesto tiene link directo a Firebase Console
