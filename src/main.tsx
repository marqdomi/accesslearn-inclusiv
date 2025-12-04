// Import polyfills first to set up environment
import './polyfills/kv-polyfill'

// Initialize i18n before anything else
import './i18n/config'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"
import "./styles/personas.css"
import "./styles/glassmorphism.css"
import "./styles/tech-hud.css"
import "./styles/animations.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
