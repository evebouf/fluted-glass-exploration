import { StrictMode, useState, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const BrandKit = lazy(() => import('./brand/BrandKit.tsx'))

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
  if (hash === '#/brand') {
    return (
      <Suspense fallback={<div style={{ background: '#F4F2DD', width: '100vw', height: '100vh' }} />}>
        <BrandKit />
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
