import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider, queryClient } from './hooks/queryClient'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)