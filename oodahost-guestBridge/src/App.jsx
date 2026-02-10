// src/App.jsx
import GuestForm from './components/GuestForm'
import './App.css'

function App() {
  return (
    // Renderizamos directamente el GuestForm.
    // Este componente ya maneja su propio ancho, alto y color de fondo 
    // dinámicamente según el tema (Penthouse vs Cabin).
    <GuestForm />
  )
}

export default App