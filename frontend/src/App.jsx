import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './components/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ReportFound from './pages/ReportFound'
import ReportLost from './pages/ReportLost'
import Matches from './pages/Matches'
import Search from './pages/Search'
import Claims from './pages/Claims'
import Admin from './pages/Admin'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* mesh-bg handles dynamic gradient background */}
        <div className="min-h-screen bg-background text-on-surface mesh-bg transition-colors duration-300">

        <Navbar />
        {/* pt-16 = clear fixed top navbar; pb-24 md:pb-0 = clear mobile bottom nav */}
        <main className="pt-16 pb-24 md:pb-0">
          <Routes>
            <Route path="/"             element={<Home />} />
            <Route path="/report-found" element={<ReportFound />} />
            <Route path="/report-lost"  element={<ReportLost />} />
            <Route path="/matches"      element={<Matches />} />
            <Route path="/search"       element={<Search />} />
            <Route path="/claims"       element={<Claims />} />
            <Route path="/admin"        element={<Admin />} />
          </Routes>
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
              backdropFilter: 'blur(16px)',
            },
            success: {
              iconTheme: { primary: 'var(--color-tertiary)', secondary: 'var(--color-surface)' },
            },
            error: {
              iconTheme: { primary: 'var(--color-error)', secondary: 'var(--color-surface)' },
            },
          }}
        />
      </div>
    </BrowserRouter>
    </ThemeProvider>
  )
}
