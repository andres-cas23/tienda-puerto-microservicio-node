const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TABLA_URL = `${SUPABASE_URL}/rest/v1/productos`;

const headersSupabase = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

// ---------- Configuración de Swagger ----------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Microservicio Tienda Puerto - Node.js",
      version: "1.0.0",
      description: "Microservicio CRUD de productos (Node.js + Express) conectado a Supabase",
    },
  },
  apis: ["./index.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------- Rutas ----------

/**
 * @openapi
 * /:
 *   get:
 *     summary: Mensaje de bienvenida
 *     responses:
 *       200:
 *         description: El microservicio está activo
 */
app.get("/", (req, res) => {
  res.json({ mensaje: "Microservicio de inventario - Node.js - Tienda Puerto" });
});

/**
 * @openapi
 * /productos:
 *   get:
 *     summary: Lista todos los productos
 *     responses:
 *       200:
 *         description: Lista de productos
 */
app.get("/productos", async (req, res) => {
  try {
    const resp = await fetch(TABLA_URL, { headers: headersSupabase });
    const datos = await resp.json();
    res.status(resp.status).json(datos);
  } catch (error) {
    res.status(500).json({ error: "No se pudo conectar con Supabase" });
  }
});

/**
 * @openapi
 * /productos/{id}:
 *   get:
 *     summary: Obtiene un producto por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
app.get("/productos/:id", async (req, res) => {
  try {
    const resp = await fetch(`${TABLA_URL}?id=eq.${req.params.id}`, {
      headers: headersSupabase,
    });
    const datos = await resp.json();
    if (!datos.length) {
      return res.status(404).json({ detail: "Producto no encontrado" });
    }
    res.json(datos[0]);
  } catch (error) {
    res.status(500).json({ error: "No se pudo conectar con Supabase" });
  }
});

/**
 * @openapi
 * /productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               categoria: { type: string }
 *               precio: { type: number }
 *               stock: { type: integer }
 *               descripcion: { type: string }
 *     responses:
 *       201:
 *         description: Producto creado
 */
app.post("/productos", async (req, res) => {
  try {
    const resp = await fetch(TABLA_URL, {
      method: "POST",
      headers: { ...headersSupabase, Prefer: "return=representation" },
      body: JSON.stringify(req.body),
    });
    const datos = await resp.json();
    res.status(resp.status).json(datos[0] || datos);
  } catch (error) {
    res.status(500).json({ error: "No se pudo conectar con Supabase" });
  }
});

/**
 * @openapi
 * /productos/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               categoria: { type: string }
 *               precio: { type: number }
 *               stock: { type: integer }
 *               descripcion: { type: string }
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
app.put("/productos/:id", async (req, res) => {
  try {
    const resp = await fetch(`${TABLA_URL}?id=eq.${req.params.id}`, {
      method: "PATCH",
      headers: { ...headersSupabase, Prefer: "return=representation" },
      body: JSON.stringify(req.body),
    });
    const datos = await resp.json();
    if (!datos.length) {
      return res.status(404).json({ detail: "Producto no encontrado" });
    }
    res.json(datos[0]);
  } catch (error) {
    res.status(500).json({ error: "No se pudo conectar con Supabase" });
  }
});

/**
 * @openapi
 * /productos/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 */
app.delete("/productos/:id", async (req, res) => {
  try {
    const resp = await fetch(`${TABLA_URL}?id=eq.${req.params.id}`, {
      method: "DELETE",
      headers: headersSupabase,
    });
    if (resp.status === 204 || resp.ok) {
      return res.json({ mensaje: "Producto eliminado correctamente" });
    }
    res.status(resp.status).json({ error: "No se pudo eliminar" });
  } catch (error) {
    res.status(500).json({ error: "No se pudo conectar con Supabase" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Microservicio Node.js corriendo en el puerto ${PORT}`);
  console.log(`Documentación Swagger en http://localhost:${PORT}/docs`);
});