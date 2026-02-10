// src/components/GuestForm.jsx
import { useState, useEffect } from 'react';
import { propertyThemes } from '../utils/themes';
// Asegúrate de que la ruta sea correcta para tu lógica de prioridad
import { analyzePriority } from '../utils/priorityLogic'; 
import { createTask } from '../services/clickUpClient'; 
import { supabase } from '../services/supabaseClient'; // Asegúrate de tener este cliente configurado

export default function GuestForm() {
  // 1. Estado de la Propiedad (Controla el Tema)
  const [propertyKey, setPropertyKey] = useState('LuxuryPenthouse');
  
  // 2. Estado del Formulario
  const [formData, setFormData] = useState({
    guestName: '',
    category: 'General',
    description: ''
  });

  // 3. Estado de Lógica (Urgencia Calculada)
  const [urgencyInfo, setUrgencyInfo] = useState({ label: 'Normal', color: 'blue', priority: 3 });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  // Validaciones de seguridad para el tema
  const theme = propertyThemes?.[propertyKey];

  // Si no carga el tema, mostramos error visual
  if (!theme) {
    return <div style={{ color: 'red', padding: 20 }}>Error: Theme '{propertyKey}' not found.</div>;
  }

  const styles = theme.styles || {};

  // EFFECT: Recalcular urgencia cuando cambia la descripción o categoría
  useEffect(() => {
    // Si tienes la función analyzePriority, úsala. Si no, usa un fallback simple.
    if (typeof analyzePriority === 'function') {
      const priorityLevel = analyzePriority(formData.category, formData.description);
      // Mapeo simple para visualización (puedes ajustarlo según tu lógica)
      let label = 'Low';
      let color = 'white';
      if (priorityLevel === 1) { label = 'Urgent'; color = 'red'; }
      else if (priorityLevel === 2) { label = 'High'; color = 'orange'; }
      else if (priorityLevel === 3) { label = 'Normal'; color = 'blue'; }
      
      setUrgencyInfo({ priority: priorityLevel, label, color });
    }
  }, [formData.category, formData.description]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // 1. Guardar en Supabase (Opcional: Si falla, no detenemos el proceso de ClickUp)
      let supabaseId = 'N/A';
      if (supabase) {
        const { data, error } = await supabase
          .from('requests')
          .insert([{ 
            guest_name: formData.guestName,
            category: formData.category,
            description: `[${formData.category}] ${formData.description}`,
            urgency: urgencyInfo.label,
            property_type: theme.name
          }])
          .select()
          .single();
        
        if (!error && data) supabaseId = data.id;
        else console.warn("Supabase insert warning:", error);
      }

      // 2. Crear Tarea en ClickUp
      const payload = {
        name: `[${theme.name}] ${formData.category}: ${formData.guestName}`,
        description: `${formData.description}\n\n---\nUrgency Level: ${urgencyInfo.priority}\nRef ID: ${supabaseId}`,
        priority: urgencyInfo.priority
      };

      await createTask(payload); 
      
      setStatus('success');
      setFormData({ guestName: '', category: 'General', description: '' }); // Reset form
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

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: styles.borderRadius,
                backgroundColor: propertyKey === 'LuxuryPenthouse' ? '#333' : '#fff',
                color: propertyKey === 'LuxuryPenthouse' ? '#fff' : '#000',
                boxSizing: 'border-box'
              }}
            >
              <option value="General">General</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description 
              <span style={{ float: 'right', fontSize: '0.8rem', color: urgencyInfo.color, fontWeight: 'bold' }}>
                Priority: {urgencyInfo.label}
              </span>
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe request..."
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: styles.borderRadius,
                border: `2px solid ${urgencyInfo.priority === 1 ? 'red' : '#ccc'}`,
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