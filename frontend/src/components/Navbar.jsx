import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from './ThemeContext'

const navItems = [
  { path: '/',             label: 'Dashboard',    icon: 'dashboard' },
  { path: '/report-found', label: 'Found',        icon: 'add_circle' },
  { path: '/report-lost',  label: 'Lost',         icon: 'search' },
  { path: '/matches',      label: 'Matches',      icon: 'auto_awesome' },
  { path: '/search',       label: 'Search',       icon: 'manage_search' },
  { path: '/claims',       label: 'Claims',       icon: 'task_alt' },
  { path: '/admin',        label: 'Admin',        icon: 'admin_panel_settings' },
]

// Bottom nav shows the 5 core paths for mobile screen layouts
const bottomNavItems = [
  { path: '/',             label: 'Home',     icon: 'dashboard' },
  { path: '/report-lost',  label: 'Lost',     icon: 'search' },
  { path: '/report-found', label: 'Found',    icon: 'add_circle',   fab: true },
  { path: '/matches',      label: 'Matches',  icon: 'auto_awesome' },
  { path: '/search',       label: 'Search',   icon: 'manage_search' },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* ── Desktop/Tablet Top Header (Floating Panel) ──────────────────────── */}
      <header
        className="fixed top-4 left-4 right-4 max-w-7xl mx-auto z-50 rounded-2xl border border-border shadow-lg transition-all duration-300"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <nav
          className="px-6 flex items-center justify-between h-16"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="LostLink AI Home"
          >
            <span
              className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform duration-300"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="font-sora font-bold text-lg text-primary tracking-tight">
              LostLink<span className="text-tertiary">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
            {navItems.map(({ path, label, icon }) => {
              const active = isActive(path)
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className="material-symbols-outlined text-lg leading-none"
                      style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {icon}
                    </span>
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Action Badge + Theme Button + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Gemini Active Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-container/30 border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-tertiary">Gemini Active</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors duration-200"
              aria-label="Toggle dark or light theme"
            >
              <span className="material-symbols-outlined text-xl block">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Mobile Hamburguer Toggle */}
            <button
              id="mobile-menu-btn"
              className="lg:hidden p-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu options"
            >
              <span className="material-symbols-outlined text-2xl block">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile secondary dropdown navigation */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t border-border rounded-b-2xl px-6 py-4"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <ul className="flex flex-col gap-1.5" role="list">
              {navItems.map(({ path, label, icon }) => {
                const active = isActive(path)
                return (
                  <li key={path}>
                    <Link
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                        style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        {icon}
                      </span>
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </header>

      {/* ── Mobile Bottom Floating Capsule Bar (Under 768px) ─────────────────── */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-around items-center py-2.5 px-2 rounded-2xl border border-border shadow-2xl transition-all duration-300"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        aria-label="Mobile bottom navigation"
      >
        {bottomNavItems.map(({ path, label, icon, fab }) => {
          const active = isActive(path)
          if (fab) {
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center justify-center -mt-6 bg-primary p-3.5 rounded-full text-white shadow-glow-primary border-4 border-background transition-transform duration-200 active:scale-95"
                aria-label={label}
              >
                <span
                  className="material-symbols-outlined text-2xl text-white block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {icon}
                </span>
              </Link>
            )
          }
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-primary bg-primary/10 font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined text-xl block"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
