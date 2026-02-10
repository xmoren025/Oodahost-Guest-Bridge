/* Frontend helper that talks to the local backend proxy for ClickUp.
   Usage:
       import { getTasks, createTask } from './services/clickUpClient';
       
       // El listId se toma automáticamente del .env
       const tasks = await getTasks(); 
       await createTask({ name: "Fix leak", priority: 1 });
*/

// IMPORTANTE: En tu archivo .env la variable debe llamarse VITE_CLICKUP_LIST_ID
const DEFAULT_LIST_ID = import.meta.env.VITE_CLICKUP_LIST_ID;

// Asegúrate de que apunte a tu servidor (puerto 5174 según configuramos antes)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5174/api/clickup';

/**
 * Obtiene las tareas. 
 * @param {string} query - Query params opcionales (ej: '&page=0')
 * @param {string} listId - Opcional. Si no se pasa, usa el del .env
 */
export async function getTasks(query = '', listId = DEFAULT_LIST_ID) {
    if (!listId) throw new Error("List ID is undefined. Check your .env file (VITE_CLICKUP_LIST_ID).");
    
    const res = await fetch(`${API_BASE}/lists/${listId}/tasks${query ? `?${query}` : ''}`);
    
    if (!res.ok) throw new Error(`ClickUp proxy error: ${res.status}`);
    return res.json();
}

/**
 * Crea una tarea.
 * @param {object} taskPayload - El objeto con los datos de la tarea (name, description, etc.)
 * @param {string} listId - Opcional. Si no se pasa, usa el del .env
 */
export async function createTask(taskPayload, listId = DEFAULT_LIST_ID) {
    if (!listId) throw new Error("List ID is undefined. Check your .env file (VITE_CLICKUP_LIST_ID).");

    const res = await fetch(`${API_BASE}/lists/${listId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`ClickUp create task error: ${res.status} ${txt}`);
    }
    return res.json();
}

export default { getTasks, createTask };
