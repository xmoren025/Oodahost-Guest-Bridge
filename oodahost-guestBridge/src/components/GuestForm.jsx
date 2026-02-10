// src/components/GuestForm.jsx
import { useState, useEffect } from 'react';
import { propertyThemes } from '../utils/themes';
// Importamos la nueva función que devuelve { priority, category, label, color }
import { analyzeRequest } from '../utils/priorityLogic'; 
import { createTask } from '../services/clickUpClient'; 
import { supabase } from '../services/supabaseClient'; 

export default function GuestForm() {
  // 1. Estado de la Propiedad (Controla el Tema)
  const [propertyKey, setPropertyKey] = useState('LuxuryPenthouse');
  
  // 2. Estado del Formulario (YA NO INCLUYE CATEGORY)
  const [formData, setFormData] = useState({
    guestName: '',
    description: ''
  });

  // 3. Estado del Análisis Automático (Categoría + Prioridad)
  const [analysis, setAnalysis] = useState({ 
    priority: 4, 
    label: 'Low', 
    color: 'gray', 
    category: 'General' 
  });
  
  const [status, setStatus] = useState('idle');

  // Validaciones de seguridad para el tema
  const theme = propertyThemes?.[propertyKey];

  if (!theme) {
    return <div style={{ color: 'red', padding: 20 }}>Error: Theme '{propertyKey}' not found.</div>;
  }

  const styles = theme.styles || {};

  // EFFECT: Analizar descripción en tiempo real
  useEffect(() => {
    // Si hay descripción, analizamos. Si no, valores por defecto.
    if (formData.description) {
      const result = analyzeRequest(formData.description);
      setAnalysis(result);
    } else {
      setAnalysis({ priority: 4, label: 'Low', color: 'gray', category: 'General' });
    }
  }, [formData.description]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      let supabaseId = 'N/A';
      
      // 1. Guardar en Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('requests')
          .insert([{ 
            guest_name: formData.guestName,
            property_type: theme.name, // Nombre correcto de columna
            // Guardamos la categoría automática dentro de la descripción
            description: formData.description,
            category: analysis.category, // Guardamos la categoría detectada
            urgency: analysis.label, // Guardamos el texto (ej. "Urgent")
            status: 'pending'
          }])
          .select() // Requiere política pública de SELECT
          .single();
        
        if (!error && data) supabaseId = data.id;
        else if (error) console.warn("Supabase insert warning:", error);
      }

      // 2. Crear Tarea en ClickUp
      const payload = {
        name: `[${theme.name}] ${analysis.category}: ${formData.guestName}`,
        description: `${formData.description}\n\n---\nAuto-Category: ${analysis.category}\nUrgency: ${analysis.label}\nRef ID: ${supabaseId}`,
        priority: analysis.priority // Enviamos el entero (1-4)
      };

      await createTask(payload); 
      
      setStatus('success');
      setFormData({ guestName: '', description: '' }); // Reset form
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  // --- RENDERIZADO ---
  return (
    <div style={{ 
      backgroundColor: styles.background || '#fff', 
      minHeight: '100vh', 
      padding: '40px',
      fontFamily: styles.fontFamily || 'sans-serif',
      transition: 'all 0.5s ease',
      boxSizing: 'border-box'
    }}>
      
      {/* Selector de Propiedad */}
      <div style={{ maxWidth: '600px', margin: '0 auto 30px', textAlign: 'center' }}>
        <label style={{ color: styles.text || '#000', marginRight: '10px' }}>Select Property:</label>
        <select 
          value={propertyKey} 
          onChange={(e) => setPropertyKey(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px' }}
        >
          {propertyThemes && Object.keys(propertyThemes).map(key => (
            <option key={key} value={key}>{propertyThemes[key].name}</option>
          ))}
        </select>
      </div>

      {/* Tarjeta del Formulario */}
      <div style={{ 
        backgroundColor: styles.cardBg || '#f9f9f9',
        color: styles.text || '#000',
        border: styles.border || '1px solid #ddd',
        borderRadius: styles.borderRadius || '8px',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        
        <h2 style={{ borderBottom: `2px solid ${styles.accent || 'blue'}`, paddingBottom: '10px', marginTop: 0 }}>
          {theme.name} Support
        </h2>
        
        {/* Features */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {theme.features && theme.features.map(feat => (
            <span key={feat} style={{ 
              fontSize: '0.75rem', 
              padding: '4px 8px', 
              border: `1px solid ${styles.accent || 'blue'}`,
              borderRadius: styles.borderRadius || '4px',
              color: styles.accent || 'blue'
            }}>
              {feat}
            </span>
          ))}
        </div>

        {/* Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Guest Name</label>
            <input
              name="guestName"
              value={formData.guestName}
              onChange={handleChange}
              required
              placeholder="John Doe"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: styles.borderRadius,
                border: '1px solid #ccc',
                backgroundColor: propertyKey === 'LuxuryPenthouse' ? '#333' : '#fff',
                color: propertyKey === 'LuxuryPenthouse' ? '#fff' : '#000',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* ELIMINADO EL SELECT MANUAL DE CATEGORÍA */}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description 
              {/* Indicadores visuales automáticos */}
              <div style={{ float: 'right', fontSize: '0.8rem', display:'flex', gap:'15px' }}>
                <span style={{ color: analysis.color }}>
                   Priority: <strong>{analysis.label}</strong>
                </span>
              </div>
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your request (e.g., 'The wifi is slow')"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: styles.borderRadius,
                // Borde cambia de color según urgencia
                border: `2px solid ${analysis.priority === 1 ? 'red' : '#ccc'}`,
                backgroundColor: propertyKey === 'LuxuryPenthouse' ? '#333' : '#fff',
                color: propertyKey === 'LuxuryPenthouse' ? '#fff' : '#000',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={status === 'submitting'}
            style={{
              padding: '15px',
              backgroundColor: styles.accent || 'blue',
              color: propertyKey === 'LuxuryPenthouse' ? '#000' : '#fff',
              border: 'none',
              borderRadius: styles.borderRadius,
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: styles.buttonShadow || 'none'
            }}
          >
            {status === 'submitting' ? 'Sending...' : 'Submit Request'}
          </button>

          {status === 'success' && <div style={{ color: 'green', textAlign: 'center' }}>Request Sent Successfully!</div>}
          {status === 'error' && <div style={{ color: 'red', textAlign: 'center' }}>Error sending request.</div>}

        </form>
      </div>
    </div>
  );
}