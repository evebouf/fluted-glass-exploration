import { StrictMode, useState, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Nav from './Nav.tsx'

const DragTest = lazy(() => import('./DragTest.tsx'))
const BrandKit = lazy(() => import('./brand/BrandKit.tsx'))
const GradientGlass = lazy(() => import('./GradientGlass.tsx'))
const ScanlineWave = lazy(() => import('./ScanlineWave.tsx'))
const StageGlass = lazy(() => import('./StageGlass.tsx'))
const BandsGlass = lazy(() => import('./BandsGlass.tsx'))
const ScanlineVariations = lazy(() => import('./ScanlineVariations.tsx'))

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
  if (hash === '#/gradient' || hash.startsWith('#/gradient/')) {
    return (
      <Suspense fallback={<div style={{ background: '#F4F1DE', width: '100vw', height: '100vh' }} />}>
        <GradientGlass initialHash={hash} />
      </Suspense>
    )
  }
  if (hash === '#/stage') {
    return (
      <Suspense fallback={<div style={{ background: '#F4F1DE', width: '100vw', height: '100vh' }} />}>
        <StageGlass />
      </Suspense>
    )
  }
  if (hash === '#/scanline') {
    return (
      <Suspense fallback={<div style={{ background: '#0a0500', width: '100vw', height: '100vh' }} />}>
        <ScanlineWave />
      </Suspense>
    )
  }
  if (hash === '#/scan-plasma') {
    return (
      <Suspense fallback={<div style={{ background: '#FEC59A', width: '100vw', height: '100vh' }} />}>
        <ScanlineVariations variant="plasma" />
      </Suspense>
    )
  }
  if (hash === '#/scan-lava') {
    return (
      <Suspense fallback={<div style={{ background: '#FEC59A', width: '100vw', height: '100vh' }} />}>
        <ScanlineVariations variant="lava" />
      </Suspense>
    )
  }
  if (hash === '#/scan-aurora') {
    return (
      <Suspense fallback={<div style={{ background: '#FEC59A', width: '100vw', height: '100vh' }} />}>
        <ScanlineVariations variant="aurora" />
      </Suspense>
    )
  }
  if (hash === '#/scan-nebula') {
    return (
      <Suspense fallback={<div style={{ background: '#FEC59A', width: '100vw', height: '100vh' }} />}>
        <ScanlineVariations variant="nebula" />
      </Suspense>
    )
  }
  if (hash === '#/brand') {
    return (
      <Suspense fallback={<div style={{ background: '#F4F1DE', width: '100vw', height: '100vh' }} />}>
        <BrandKit />
      </Suspense>
    )
  }
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Nav />
    <Root />
  </StrictMode>,
)
