import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/App.css' // Đảm bảo file CSS được import

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)