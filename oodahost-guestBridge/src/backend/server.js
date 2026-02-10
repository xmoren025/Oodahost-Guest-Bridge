// src/backend/server.js
import http from 'http'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// --- Configuración de Entorno ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN
const CLICKUP_API_BASE = process.env.CLICKUP_API_BASE || 'https://api.clickup.com/api/v2'
const PORT = process.env.PORT || 5174

if (!CLICKUP_TOKEN) {
    console.warn('ClickUp token is not set in src/backend/.env (CLICKUP_TOKEN)')
}

// --- Helpers ---

// Función para enviar respuestas JSON uniformes
const sendJSON = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
}

// Función para leer el cuerpo de la petición (reemplazo de express.json())
const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            try {
                // Si no hay body, retornamos objeto vacío
                resolve(body ? JSON.parse(body) : {})
            } catch (error) {
                reject(error)
            }
        })
        req.on('error', (err) => reject(err))
    })
}

// Helper para peticiones a ClickUp
const clickupRequest = (method, url, data) => {
    return axios({
        method,
        url: `${CLICKUP_API_BASE}${url}`,
        headers: { Authorization: CLICKUP_TOKEN },
        data,
    })
}

// --- Servidor ---

const server = http.createServer(async (req, res) => {
    // 1. Configuración de CORS (Indispensable para que tu React app pueda hablar con este server)
    res.setHeader('Access-Control-Allow-Origin', '*') // O cambia '*' por 'http://localhost:5173' para más seguridad
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // Manejo de preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
    }

    // 2. Parsear la URL
    // Usamos 'new URL' para separar el path de los query params
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
    const pathname = parsedUrl.pathname

    // Regex para detectar ruta: /api/clickup/lists/:listId/tasks
    // Captura el grupo (listId) en match[1]
    const routeRegex = /^\/api\/clickup\/lists\/([^\/]+)\/tasks$/
    const match = pathname.match(routeRegex)

    // --- Ruteo ---

    if (match) {
        const listId = match[1] // El ID extraído de la URL

        // -> GET: Obtener tareas
        if (req.method === 'GET') {
            const query = parsedUrl.search // Incluye el '?' ej: ?page=1
            try {
                const response = await clickupRequest('get', `/list/${listId}/task${query}`)
                sendJSON(res, 200, response.data)
            } catch (err) {
                const status = err.response?.status || 500
                const data = err.response?.data || { error: err.message }
                sendJSON(res, status, data)
            }
            return
        }

        // -> POST: Crear tarea
        if (req.method === 'POST') {
            try {
                // Leemos el body manualmente
                const payload = await getRequestBody(req)
                
                const response = await clickupRequest('post', `/list/${listId}/task`, payload)
                sendJSON(res, 200, response.data)
            } catch (err) {
                // Error de parsing JSON o de Axios
                const status = err.response?.status || 500
                const data = err.response?.data || { error: err.message }
                sendJSON(res, status, data)
            }
            return
        }
    }

    // -> 404 Not Found (Si la ruta no coincide)
    sendJSON(res, 404, { error: 'Route not found' })
})

// --- Iniciar ---
server.listen(PORT, () => {
    console.log(`ClickUp proxy server listening on port ${PORT}`)
})