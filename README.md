# 🌿 Brota Shop

E-commerce de plantas con panel de administración completo, subida de imágenes a AWS S3 y arquitectura serverless segura. Proyecto individual desarrollado durante el bootcamp Henry Full Stack 3.0.

**[→ Ver demo en producción](https://brota-shop-cawz-theta.vercel.app)**

---

## Stack

![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=flat&logo=amazonaws&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

| Área | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Auth & DB | Firebase Auth + Firestore |
| Storage | AWS S3 con presigned URLs |
| Backend | Vercel Serverless Functions |
| CI/CD | GitHub Actions |
| Deploy | Vercel |

---

## Features

- **Catálogo** con búsqueda, filtros por categoría y paginación
- **Carrito** persistente con Context API + useReducer
- **Checkout** con resumen de orden y confirmación
- **Panel de administración** para gestionar productos y órdenes
- **Subida de imágenes** a AWS S3 vía presigned URLs (credenciales nunca expuestas al cliente)
- **Roles de usuario**: cliente y admin con rutas protegidas

---

## Decisiones de arquitectura

### Subida segura a S3

Las credenciales de AWS nunca llegan al navegador. El flujo es:

```
Cliente → solicita presigned URL → Vercel Serverless Function
Serverless Function → firma con AWS SDK (credenciales en env server-side)
Cliente → sube directamente a S3 usando la URL firmada
```

Esto evita exponer `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` en el frontend.

### Firestore Security Rules

Las reglas de Firestore garantizan que solo admins puedan crear/editar productos y que cada usuario solo acceda a sus propias órdenes. Las reglas están testeadas y documentadas en `/firestore.rules`.

---

## Setup local

```bash
git clone https://github.com/jeremiasbustos186-sketch/brota-shop
cd brota-shop
npm install
cp .env.example .env.local
# Completar variables de Firebase y AWS en .env.local
npm run dev
```

### Variables de entorno requeridas

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
AWS_ACCESS_KEY_ID=          # solo en servidor (Vercel env)
AWS_SECRET_ACCESS_KEY=      # solo en servidor (Vercel env)
AWS_REGION=
AWS_BUCKET_NAME=
```

> ⚠️ Las variables `AWS_*` van en Vercel como variables de entorno del servidor, nunca con prefijo `VITE_`.

---

## Scripts

```bash
npm run dev        # servidor de desarrollo
npm run build      # build de producción
npm run test       # tests con Vitest
npm run lint       # ESLint
```

---

## Autor

**Jeremias Bustos** — [LinkedIn](https://www.linkedin.com/in/jeremias-bustos-84325b363) · [jeremiasbustos186@gmail.com](mailto:jeremiasbustos186@gmail.com)
