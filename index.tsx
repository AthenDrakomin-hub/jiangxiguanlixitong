import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { checkPWAStatus } from './src/pwa-test'

// Check PWA status
checkPWAStatus()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)