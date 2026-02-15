import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Dashboard from './components/Dashboard'
import InspectionForm from './components/InspectionForm'
import { useInspectionStore } from './hooks/useInspectionStore'
import './styles/index.css'

/**
 * Composant principal de l'application RiskInspect PWA
 * Gère la navigation et l'état global de l'inspection
 */
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { inspectionData } = useInspectionStore()

  useEffect(() => {
    // Mettre à jour le titre du document
    document.title = 'RiskInspect - Inspection de Sécurité'
  }, [])

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <div className="min-h-screen bg-gradient-to-br from-light to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">RI</span>
              </div>
              <h1 className="text-2xl font-bold text-primary hidden sm:block">
                RiskInspect
              </h1>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex space-x-1">
              <NavButton
                label="📊 Tableau de Bord"
                active={currentPage === 'dashboard'}
                onClick={() => setCurrentPage('dashboard')}
              />
              <NavButton
                label="✅ Nouvelle Inspection"
                active={currentPage === 'form'}
                onClick={() => setCurrentPage('form')}
              />
            </nav>

            {/* Hamburger Menu Mobile */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 animate-in slide-in-from-top">
              <button
                onClick={() => {
                  setCurrentPage('dashboard')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  currentPage === 'dashboard'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                📊 Tableau de Bord
              </button>
              <button
                onClick={() => {
                  setCurrentPage('form')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  currentPage === 'form'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                ✅ Nouvelle Inspection
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' ? (
          <Dashboard />
        ) : (
          <InspectionForm onComplete={() => setCurrentPage('dashboard')} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-secondary text-white py-6 text-center">
        <p className="text-sm">
          RiskInspect © 2026 - Inspection de Sécurité sur le Terrain
        </p>
        <p className="text-xs mt-2 opacity-75">
          {navigator.onLine ? '🟢 Connecté' : '🔴 Mode hors-ligne'}
        </p>
      </footer>
    </div>
  )
}

/**
 * Composant bouton de navigation réutilisable
 */
function NavButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition ${
        active
          ? 'bg-primary text-white shadow-lg'
          : 'text-secondary hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}

export default App
