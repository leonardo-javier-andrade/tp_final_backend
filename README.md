# API REST de Gestión de Productos con Autenticación y Roles

API REST construida con **Node.js + Express 5** y **MongoDB Atlas (Mongoose)**, desarrollada como Trabajo Práctico Final del backend de UTN. Implementa registro/login con **JWT**, contraseñas encriptadas con **bcrypt**, control de acceso por roles (**user** / **admin**), validación de datos con **Zod**, rate limiting en el login y una regla de negocio que evita que un mismo usuario registre productos duplicados.

## 📑 Tabla de contenidos

- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Cómo correr el proyecto](#-cómo-correr-el-proyecto)
- [Autenticación y encriptación](#-autenticación-y-encriptación)
- [Roles y permisos](#-roles-y-permisos)
- [Validación de datos con Zod](#-validación-de-datos-con-zod)
- [Control de productos duplicados](#-control-de-productos-duplicados)
- [Rate limiting](#-rate-limiting)
- [Formato de respuestas y errores](#-formato-de-respuestas-y-errores)
- [Documentación de endpoints](#-documentación-de-endpoints)
- [Ejemplos de uso (Postman / Bruno)](#-ejemplos-de-uso-postman--bruno)

## 🧰 Stack tecnológico

| Tecnología | Uso |
|---|---|
| [Express](https://expressjs.com/) `^5.2.1` | Framework HTTP / enrutamiento |
| [Mongoose](https://mongoosejs.com/) `^9.6.3` | ODM para MongoDB Atlas |
| [Zod](https://zod.dev/) `^4.4.3` | Validación de esquemas de entrada |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) `^9.0.3` | Generación y verificación de tokens JWT |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) `^3.0.3` | Hasheo de contraseñas |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) `^8.5.2` | Límite de intentos de login |
| [cors](https://github.com/expressjs/cors) `^2.8.6` | Habilitación de CORS |
| [dotenv](https://github.com/motdotla/dotenv) `^17.4.2` | Carga de variables de entorno |

El proyecto usa módulos **ES Modules** (`"type": "module"` en `package.json`), no CommonJS.

## 📂 Estructura del proyecto

```
tp_final_backend/
├── src/
│   ├── app.js                       # Punto de entrada: configura Express y levanta el servidor
│   ├── config/
│   │   └── mongoDbConnection.js     # Conexión a MongoDB Atlas
│   ├── controllers/
│   │   ├── authControllers.js       # Lógica de registro y login
│   │   └── productControllers.js    # CRUD de productos con lógica de roles
│   ├── middlewares/
│   │   ├── authMiddleware.js        # Verificación de JWT
│   │   ├── validateMiddleware.js    # Validación genérica de req.body con Zod
│   │   └── limiterMiddleware.js     # Rate limiting para /auth/login
│   ├── models/
│   │   ├── UserModel.js             # Schema de usuario
│   │   └── ProductModel.js          # Schema de producto
│   ├── routes/
│   │   ├── authRouter.js            # Rutas /auth
│   │   └── productRouter.js         # Rutas /products
│   └── validation/
│       ├── authValidation.js        # Schemas Zod de registro/login
│       └── productValidation.js     # Schemas Zod de creación/actualización de productos
├── .env.example
├── package.json
└── README.md
```

No hay carpeta de tests ni configuración de linter/CI en el proyecto.

## 🛠️ Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd tp_final_backend
npm install
```

## 🔑 Variables de entorno

Crear un archivo `.env` en la raíz (usar `.env.example` como base):

| Variable | Descripción |
|---|---|
| `PORT` | Puerto donde escucha el servidor (ej. `3001`) |
| `URI_DB` | Cadena de conexión a tu cluster de MongoDB Atlas |
| `JWT_SECRET` | Clave secreta usada para firmar y verificar los tokens JWT |
| `EMAIL_ADMIN` | Email exacto que recibirá el rol `admin` al registrarse |

```env
PORT=3001
URI_DB=mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/nombreDeLaBase
JWT_SECRET=ClaveSecretaSuperSegura123!
EMAIL_ADMIN=admin@admin.com
```

> **Nota:** `EMAIL_ADMIN` se compara por igualdad exacta (`email === process.env.EMAIL_ADMIN`) contra el email ingresado en el registro. Solo admite **un único correo**, no una lista separada por comas. Cualquier otro email que se registre recibe el rol `user` por defecto.

## ▶️ Cómo correr el proyecto

```bash
npm run dev
```

Levanta el servidor con `node --watch` (recarga automática ante cambios) en `http://localhost:<PORT>`. No hay script `start` ni `test` definidos en `package.json`.

## 🔐 Autenticación y encriptación

- **Registro** (`POST /auth/register`): valida el body con Zod, verifica que el email no esté registrado (`409` si existe), hashea la contraseña con **bcrypt** (`bcrypt.hash(password, 10)`) y crea el usuario con rol `user` o `admin` según coincida con `EMAIL_ADMIN`.
- **Login** (`POST /auth/login`): busca el usuario por email, compara la contraseña con `bcrypt.compare` y, si es válida, firma un **JWT** con `jsonwebtoken` que expira en **1 hora**:
  ```js
  jwt.sign({ id, username, email, role }, JWT_SECRET, { expiresIn: "1h" })
  ```
- **Rutas protegidas**: todas las rutas bajo `/products` pasan por `authMiddleware`, que exige el header `Authorization: Bearer <token>`, verifica el JWT y adjunta el usuario decodificado en `req.userLogged` (`{ id, username, email, role }`). Si el token falta, es inválido o expiró, responde `401 Unauthorized`.
- No existe un middleware separado de autorización por rol: la comprobación `role === "admin"` se hace directamente dentro de cada controlador de productos.

## 👥 Roles y permisos

Todo usuario nuevo recibe el rol `user` salvo que su email coincida con `EMAIL_ADMIN`, en cuyo caso recibe `admin`.

### 👤 Rol `user`

- **`GET /products`**: solo recibe los productos donde `userId` coincide con su propio id. La respuesta excluye el campo `userId`.
- **`GET /products/:id`**, **`PUT /products/:id`**, **`DELETE /products/:id`**: solo puede operar sobre productos de su propiedad. Si el producto no existe o pertenece a otro usuario, la API responde `404 Not Found` (no revela si el producto existe pero es ajeno).

### 👑 Rol `admin`

- **`GET /products`**: recibe **todos** los productos de la base de datos sin filtrar por creador, y sin proyección: cada documento incluye tanto `userId` (el ObjectId del creador) como `email` (el email del creador, guardado en el propio producto). Es la única vista donde se puede identificar quién creó cada producto.
- **`GET /products/:id`**, **`PUT /products/:id`**, **`DELETE /products/:id`**: puede operar sobre cualquier producto, sin importar quién lo creó. En estos endpoints el campo `userId` se excluye de la respuesta (tanto para admin como para user), aunque el campo `email` del creador sí queda visible.



Ejemplo de respuesta de `GET /products` para un **user**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a557cf0edf434437d5a11b1",
      "name": "oso polar",
      "price": 0,
      "category": "Sin categoria",
      "stock": 0,
      "available": false,
      "email": "bruno@mail.com",
      "createdAt": "2026-07-14T00:04:00.009Z",
      "updatedAt": "2026-07-14T00:04:00.009Z"
    }
  ],
  "message": "Products fetched successfully"
}
```

Ejemplo de respuesta de `GET /products` para un **admin** (incluye `userId` del creador):

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a557cf0edf434437d5a11b1",
      "name": "oso polar",
      "price": 0,
      "category": "Sin categoria",
      "stock": 0,
      "available": false,
      "userId": "6a55789ed035a03c627f9a76",
      "email": "bruno@mail.com",
      "createdAt": "2026-07-14T00:04:00.009Z",
      "updatedAt": "2026-07-14T00:04:00.009Z"
    }
  ],
  "message": "Products fetched successfully"
}
```

## 🛡️ Validación de datos con Zod

Todas las rutas de creación/actualización pasan por el middleware `validateBody(schema)` (`src/middlewares/validateMiddleware.js`), que ejecuta `schema.parse(req.body)` antes de llegar al controlador. Si Zod detecta errores, se concatenan **todos** los mensajes de fallo en un único string (separados por `"./ "`) y se responde `400`:

```json
{
  "success": false,
  "message": "El usuario debe tener al menos 3 caracteres./ El formato del email no es válido"
}
```

**Reglas de `registerSchema`** (`src/validation/authValidation.js`):
- `username`: string, mínimo 3 caracteres.
- `email`: string con formato de email válido.
- `password`: string, mínimo 8 caracteres, debe incluir al menos una mayúscula, un número y un carácter especial.

**Reglas de `createProductSchema`** (`src/validation/productValidation.js`):
- `name`: string, mínimo 3 caracteres.
- `price`: number, no negativo, `default: 0`.
- `category`: string opcional, `default: "Sin categoria"`.
- `stock`: number entero no negativo, `default: 0`.

`updateProductSchema` es el mismo schema con todos los campos opcionales (`.partial()`), para permitir actualizaciones parciales.

## 🚫 Control de productos duplicados

Al crear un producto (`POST /products`), la API busca si el usuario logueado ya tiene un producto con el mismo nombre antes de guardarlo:

```js
const existingProduct = await Product.findOne({
  name: { $regex: new RegExp(`^${body.name.trim()}$`, "i") },
  userId: userLogged.id
})
```

- El nombre se normaliza con `.trim()` y la comparación es **insensible a mayúsculas/minúsculas**: `"Oso Polar"` y `"oso polar "` se consideran el mismo producto.
- La unicidad es **por usuario**: dos usuarios distintos pueden tener cada uno un producto llamado `"Martillo"` sin conflicto.
- Si se detecta un duplicado, se responde `409 Conflict` y no se crea el producto:

```json
{
  "success": false,
  "data": null,
  "message": "Error al guardar el producto: ya existe un producto con ese nombre para este usuario"
}
```

Esta validación ocurre a nivel de aplicación (no hay índice único compuesto en MongoDB para `{ name, userId }`).

## ⏱️ Rate limiting

`POST /auth/login` está protegido con `express-rate-limit`: máximo **5 intentos cada 15 minutos** por IP. Al superar el límite responde `429 Too Many Requests`:

```json
{ "error": "Too many requests, please try again later." }
```

## 📦 Formato de respuestas y errores

Las respuestas exitosas siguen el formato:

```json
{ "success": true, "data": { }, "message": "..." }
```

Las respuestas de error varían levemente según el módulo: algunas usan la clave `error` (auth, y la mayoría de errores en products) y otras `message` (validaciones con Zod, duplicados de producto). No hay un middleware centralizado de manejo de errores; cada controlador maneja sus propios `try/catch`.

| Código | Cuándo ocurre |
|---|---|
| `400` | Body inválido (Zod) o ID de Mongo con formato incorrecto |
| `401` | Token ausente, inválido o expirado; credenciales de login incompletas |
| `403` | Credenciales de login incorrectas |
| `404` | Producto inexistente o perteneciente a otro usuario |
| `409` | Email ya registrado, o producto duplicado para el mismo usuario |
| `429` | Demasiados intentos de login |
| `500` | Error inesperado del servidor / base de datos |

## 📖 Documentación de endpoints

### Auth (`/auth`)

| Método | Endpoint | Body | Auth requerida | Descripción |
|---|---|---|---|---|
| `POST` | `/auth/register` | `{ username, email, password }` | No | Registra un usuario nuevo (rol `user` o `admin` según `EMAIL_ADMIN`) |
| `POST` | `/auth/login` | `{ email, password }` | No | Autentica y devuelve un JWT (`{ token }`). Limitado a 5 intentos / 15 min |

### Products (`/products`)

> Todas las rutas requieren el header `Authorization: Bearer <token>`.

| Método | Endpoint | Body | Descripción |
|---|---|---|---|
| `GET` | `/products` | — | Lista productos (propios si `user`, todos si `admin`) |
| `GET` | `/products/:id` | — | Detalle de un producto (propio si `user`, cualquiera si `admin`) |
| `POST` | `/products` | `{ name, price?, category?, stock? }` | Crea un producto, valida duplicado por nombre+usuario |
| `PUT` | `/products/:id` | Cualquier subconjunto de `{ name, price, category, stock }` | Actualiza un producto propio (o cualquiera si `admin`) |
| `DELETE` | `/products/:id` | — | Elimina un producto propio (o cualquiera si `admin`) |

## 🧪 Ejemplos de uso (Postman / Bruno)

### 1. Registrar usuario estándar

```
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "username": "BrunoUser",
  "email": "bruno@mail.com",
  "password": "Password123!"
}
```

### 2. Registrar usuario admin

Usar el email configurado en `EMAIL_ADMIN`:

```
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "username": "LeonardoAdmin",
  "email": "admin@admin.com",
  "password": "Password123!"
}
```

### 3. Login

```
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "bruno@mail.com",
  "password": "Password123!"
}
```

Respuesta:

```json
{ "success": true, "data": { "token": "<jwt>" }, "message": "Login successful" }
```

### 4. Crear producto (usar el token del login en el header `Authorization: Bearer <token>`)

```
POST http://localhost:3001/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Teclado Mecanico",
  "price": 85,
  "category": "tecnologia",
  "stock": 10
}
```

### 5. Forzar un error de validación Zod

```json
{
  "name": "Teclado Mecanico",
  "price": "85",
  "stock": "10"
}
```

Respuesta:

```json
{
  "success": false,
  "message": "El precio es requerido./ El stock es requerido"
}
```

---

**Autor:** Leonardo Andrade — Trabajo Práctico Final, UTN Backend
