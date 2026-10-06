import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

document.documentElement.dataset.theme =
  localStorage.getItem('sentinel.theme') === 'light' ? 'light' : 'dark';
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
