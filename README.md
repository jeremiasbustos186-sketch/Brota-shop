# 🌿 Brota Shop

E-commerce de plantas desarrollado como Proyecto Final del Módulo 5 — Henry Bootcamp.

**Deploy:** [brota-shop-cawz-theta.vercel.app](https://brota-shop-cawz-theta.vercel.app)

---

## Stack tecnológico

- **React 19** + TypeScript + Vite
- **Firebase Auth** — autenticación con email/contraseña y Google
- **Cloud Firestore** — base de datos en tiempo real
- **AWS S3** — almacenamiento de imágenes con presigned URLs
- **Vercel** — deploy y serverless functions
- **TailwindCSS v4** — estilos

---

## Funcionalidades

### Cliente
- Catálogo con búsqueda por nombre (debounce 400ms) y filtro por categoría
- Carrito con manejo de cantidades
- Checkout con creación de orden
- Historial de órdenes propias

### Admin
- CRUD completo de productos con subida de imágenes a S3
- Gestión de órdenes con cambio de estado (pending → processing → completed / cancelled)

---

## Arquitectura

El proyecto está organizado en 3 capas:

1. **Servicios** (`productService`, `orderService`) — único punto de contacto con Firestore
2. **Contextos** (`AuthContext`, `ProductsContext`, `CartContext`) — estado global por dominio
3. **UI** (componentes y páginas) — solo consume contextos, nunca habla con Firestore directamente

### Flujo de subida de imágenes a S3

```
Frontend → POST /api/presign → Vercel Function (genera presigned URL con claves AWS)
         → PUT directo a S3 (con la presigned URL)
         → Guarda publicUrl en Firestore
```

Las credenciales de AWS viven solo en la Vercel Serverless Function, nunca en el bundle del navegador.

---

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

Las variables con prefijo `VITE_` llegan al navegador (credenciales de Firebase — OK por diseño).
Las variables sin prefijo solo las lee el servidor (credenciales AWS — nunca al cliente).

---

## Correr el proyecto localmente

```bash
npm install
npm run dev
```

---

## Tests

```bash
npm run test
```

Los tests cubren el `cartReducer` — la lógica más crítica del negocio (agregar, actualizar cantidad, remover, limpiar carrito).

---

## Uso de IA en el desarrollo

Durante el desarrollo se usó IA como herramienta de apoyo para tomar decisiones de arquitectura y resolver problemas técnicos. Algunos ejemplos:

**Arquitectura de contextos**
> "¿Cómo estructuro los contextos de React para un e-commerce con auth, productos y carrito sin que se re-rendericen innecesariamente?"

Resultado: 3 contextos separados por dominio con `useMemo` en el value, para que cada componente solo se suscriba al contexto que necesita.

**Seguridad en subida de imágenes a S3**
> "¿Cómo subo imágenes a S3 desde React sin exponer las claves AWS en el frontend?"

Resultado: Vercel Serverless Function `/api/presign.ts` que genera presigned URLs. Las claves AWS solo viven en el servidor como variables de entorno sin prefijo `VITE_`.

**Búsqueda en Firestore sin extensiones**
> "¿Cómo implemento búsqueda por texto en Firestore sin usar Firebase Extensions ni Algolia?"

Resultado: campo `nameLower` guardado al crear/editar productos, con query `where >= + where <` para búsqueda por prefijo.

**Casos de test para el reducer**
> "¿Cuáles son los casos edge que tengo que testear en un cartReducer de e-commerce?"

Resultado: agregar item existente (suma cantidad, no duplica), actualizar cantidad a 0 (elimina el item), limpiar carrito completo.

**Decisión rechazada**
> La IA sugirió usar `VITE_AWS_SECRET_KEY` para simplificar el setup local.

Rechazado: `VITE_` expone la variable en el bundle del navegador. Las claves AWS deben estar solo en el servidor.
