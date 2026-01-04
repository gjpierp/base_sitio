require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const dbConnection = require("./database/config");
const {
  sanitizarInputs,
  validarTamanoBody,
} = require("./middlewares/validar-inputs");
const {
  manejadorErrores,
  rutaNoEncontrada,
} = require("./middlewares/validar-errores");
const seleccionarBD = require("./middlewares/validar-bd");
const setupSwagger = require("./swagger");
const app = express();

// Habilitar trust proxy si está detrás de un proxy (cookies Secure)
if ((process.env.TRUST_PROXY || "").toLowerCase() === "true") {
  app.set("trust proxy", 1);
}

// Configurar CORS con credenciales (cookies) y orígenes permitidos
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests same-origin (origin undefined en Postman o curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin no permitido: " + origin), false);
    },
    credentials: true,
  })
);

// Protección contra payloads muy grandes
app.use(validarTamanoBody(2048)); // 2MB máximo

// Lectura y parseo del body con captura de raw para depuración
app.use(
  express.json({
    verify: (req, res, buf) => {
      try {
        req.rawBody = buf ? buf.toString() : undefined;
      } catch (_) {
        req.rawBody = undefined;
      }
    },
  })
);
// Soporte para application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Sanitizar inputs
app.use(sanitizarInputs);

// Base de datos
// La conexión ya se establece al importar el módulo

// Directorio público
app.use(express.static("public"));

// Rutas
// Selección de BD por petición (header/query/param). Alias por defecto: 'admin'
app.use(seleccionarBD({ defaultAlias: "admin" }));

app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/permisos", require("./routes/permisos"));
app.use("/api/menus", require("./routes/menus"));
app.use("/api/roles_permisos", require("./routes/roles_permisos"));
app.use("/api/tipos_usuario", require("./routes/tipos_usuario"));
// Alias con guion para compatibilidad con frontend que usa 'tipos-usuarios'
app.use("/api/tipos-usuarios", require("./routes/tipos_usuario"));
app.use("/api/estados", require("./routes/estados"));
app.use("/api/sitios", require("./routes/sitios"));
app.use("/api/aplicaciones_sitio", require("./routes/aplicaciones_sitio"));
app.use("/api/usuarios_jerarquias", require("./routes/usuarios_jerarquias"));
app.use("/api/usuarios_roles", require("./routes/usuarios_roles"));
app.use("/api/todo", require("./routes/busquedas"));
app.use("/api/login", require("./routes/auth"));
app.use("/api/renew", require("./routes/auth"));
app.use("/api/uploads", require("./routes/uploads"));
// Nuevos módulos admin
app.use("/api/jerarquias", require("./routes/jerarquias"));
app.use("/api/historial_accesos", require("./routes/historial_accesos"));
app.use("/api/historial_acciones", require("./routes/historial_acciones"));
app.use(
  "/api/historial_contrasenas",
  require("./routes/historial_contrasenas")
);
app.use("/api/auditoria", require("./routes/auditoria"));
// Configuraciones y temas
app.use("/api/configuraciones", require("./routes/configuraciones"));
app.use("/api/themes", require("./routes/themes"));
// Theme variables management
app.use("/api/temas_variables", require("./routes/temas_variables"));
app.use("/api/theme-vars", require("./routes/temas_variables"));
// Health check endpoint (público)
app.use("/api/health", require("./routes/health"));
// Alias para compatibilidad con frontend que usa /api/auth/profile
app.use("/api/auth", require("./routes/auth"));

// Swagger / OpenAPI (dev) - documentación interactiva
try {
  setupSwagger(app);
} catch (err) {
  console.warn("No se pudo inicializar Swagger:", err && err.message);
}

// Ruta catch-all para SPA: servir index.html para rutas cliente
// Debe ir después de las rutas API pero antes del manejador de "ruta no encontrada"
app.get("*", (req, res, next) => {
  // Si la ruta empieza por /api, dejar pasar para que los middlewares de API la manejen
  if (req.originalUrl && req.originalUrl.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Manejador de rutas no encontradas (debe ir después de todas las rutas)
app.use(rutaNoEncontrada);

// Manejador global de errores (debe ser el último middleware)
app.use(manejadorErrores);

// Inicio del servidor con manejo de puerto ocupado
const BASE_PORT = Number(process.env.PORT) || 3005;
function startServer(port, attempt = 0) {
  const server = app.listen(port, () => {
    console.log("Servidor corriendo en puerto " + port);
  });
  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE" && attempt < 2) {
      const nextPort = port + 1;
      console.warn(`Puerto ${port} en uso. Reintentando en ${nextPort}...`);
      startServer(nextPort, attempt + 1);
    } else {
      console.error("No se pudo iniciar el servidor:", err);
      process.exit(1);
    }
  });
}

startServer(BASE_PORT);
