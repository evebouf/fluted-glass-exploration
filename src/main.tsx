import { StrictMode, useState, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const DragTest = lazy(() => import('./DragTest.tsx'))

function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return hash
}

function Root() {
  const hash = useHash()
  if (hash === '#/drag') {
    return (
      <Suspense fallback={<div style={{ background: '#F4F1DE', width: '100vw', height: '100vh' }} />}>
        <DragTest />
      </Suspense>
    )
  }
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
