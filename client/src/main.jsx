import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found. Check index.html</div>'
} else {
  try {
    const root = createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    )
  } catch (error) {
    rootElement.innerHTML = `<div style="color: red; padding: 20px;">
      <h1>Application Failed to Load</h1>
      <pre>${error.message}</pre>
      <p>Check the browser console for more details.</p>
    </div>`
  }
}
