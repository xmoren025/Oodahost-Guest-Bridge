// src/utils/priorityLogic.js

/**
 * PRIORITY_DICTIONARY
 * Palabras clave mapeadas a peso de urgencia.
 */
const PRIORITY_DICTIONARY = {
  CRITICAL: {
    words: ['leak', 'flood', 'fire', 'smoke', 'blood', 'danger', 'broken glass', 'lock out', 'locked out', 'emergency', 'mold', 'gas'],
    weight: 20
  },
  HIGH: {
    words: ['wifi', 'internet', 'ac', 'air conditioning', 'heat', 'cold', 'freezing', 'power', 'electricity', 'toilet', 'clog', 'bug', 'insect', 'hot water'],
    weight: 10
  },
  MEDIUM: {
    words: ['towel', 'sheet', 'pillow', 'soap', 'clean', 'dirty', 'noise', 'noisy', 'parking', 'key', 'remote', 'tv'],
    weight: 5
  },
  LOW: {
    words: ['late checkout', 'question', 'info', 'recommendation', 'taxi', 'reservation', 'pool', 'gym'],
    weight: 1
  }
};

/**
 * CATEGORY_DICTIONARY
 * Palabras clave mapeadas a una Categoría específica.
 */
const CATEGORY_DICTIONARY = {
  Maintenance: ['leak', 'flood', 'fire', 'smoke', 'broken', 'wifi', 'internet', 'ac', 'air', 'heat', 'cold', 'power', 'electricity', 'toilet', 'clog', 'light', 'bulb', 'tv', 'remote', 'door', 'lock'],
  Housekeeping: ['towel', 'sheet', 'pillow', 'soap', 'shampoo', 'clean', 'dirty', 'mold', 'bug', 'insect', 'trash', 'paper', 'room service'],
  Security: ['danger', 'blood', 'glass', 'locked out', 'lost key', 'suspicious', 'noise', 'party'],
  General: ['late checkout', 'question', 'info', 'taxi', 'reservation', 'password', 'pool']
};

/**
 * Función interna para detectar MÚLTIPLES categorías
 * Devuelve un string unido por " & " si hay varias.
 */
const detectCategories = (text) => {
  const detected = [];

  // Recorremos todas las categorías posibles
  for (const [category, words] of Object.entries(CATEGORY_DICTIONARY)) {
    // Si alguna palabra de esta categoría está en el texto, la agregamos
    if (words.some(word => text.includes(word))) {
      detected.push(category);
    }
  }

  // Si encontramos categorías, las unimos. Si no, devolvemos General.
  if (detected.length > 0) {
    return detected.join(' & '); // Ej: "Maintenance & Housekeeping"
  }
  
  return 'General';
};

/**
 * analyzeRequest
 * Devuelve un objeto con toda la info: { priority, category, label, color }
 */
export const analyzeRequest = (description) => {
  const text = description.toLowerCase();
  
  // 1. Detectar Categoría(s) Automática(s)
  // Ahora devuelve un string combinado si hay múltiples temas
  const categoryString = detectCategories(text);

  // 2. Calcular Puntaje de Prioridad
  let totalScore = 0;
  
  // Regex para dividir por conectores
  const connectorsRegex = / and | also | plus | & |,| \+ | moreover | as well as /g;
  const segments = text.split(connectorsRegex);

  segments.forEach(segment => {
    let segmentScore = 0;
    const cleanSegment = segment.trim();

    for (const level in PRIORITY_DICTIONARY) {
      const { words, weight } = PRIORITY_DICTIONARY[level];
      if (words.some(word => cleanSegment.includes(word))) {
        segmentScore = Math.max(segmentScore, weight);
      }
    }
    totalScore += segmentScore;
  });

  // 3. Mapear Puntaje a Nivel (1-4)
  let result = { priority: 4, label: 'Low', color: 'grey', category: categoryString };

  if (totalScore >= 20) {
    result = { ...result, priority: 1, label: 'Urgent', color: 'red' };
  } else if (totalScore >= 10) {
    result = { ...result, priority: 2, label: 'High', color: 'orange' };
  } else if (totalScore >= 5) {
    result = { ...result, priority: 3, label: 'Normal', color: 'blue' };
  }

  return result; 
};