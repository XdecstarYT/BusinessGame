import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if (import.meta.env.DEV) {
  // Dev-only E2E test hook — dead-code-eliminated from production builds.
  // Lets test scripts drive store state directly instead of guessing
  // screen-to-grid pixel math against the isometric build camera.
  void import('./devTestHooks')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
