import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Menu, X, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import logoImg from '@/assets/logo.png'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name))
  }

  return (
    <header className="w-full relative z-30" role="banner">
      <div className="w-full py-5 px-6 sm:px-8 flex justify-between items-center">
        {/* Left: Meddibuddy Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg group"
          aria-label="Meddibuddy Home"
        >
          <img
            src={logoImg}
            alt="Meddibuddy Logo"
            className="h-[32px] w-auto object-contain rounded-md"
          />
          <span className="font-headline font-semibold text-xl tracking-tight text-foreground group-hover:text-white transition-colors">
            Meddibuddy
          </span>
        </Link>

        {/* Center: Desktop Nav Items */}
        <nav
          className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/90"
          aria-label="Main Navigation"
        >
          {/* How It Works with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('how-it-works')}
              onMouseEnter={() => setActiveDropdown('how-it-works')}
              className="flex items-center gap-1 hover:text-white transition-colors duration-200 py-1 focus:outline-none focus:text-white"
              aria-expanded={activeDropdown === 'how-it-works'}
            >
              <span>How it works</span>
              <ChevronDown className="size-4 opacity-75" aria-hidden="true" />
            </button>
            {activeDropdown === 'how-it-works' && (
              <div
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute top-full left-0 mt-2 w-56 rounded-xl liquid-glass border border-white/10 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <a
                  href="#scan-process"
                  className="block px-3 py-2 rounded-lg text-xs text-foreground/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  1. Scan Optical PDF / Image
                </a>
                <a
                  href="#gemini-synthesis"
                  className="block px-3 py-2 rounded-lg text-xs text-foreground/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  2. Gemini Clinical Synthesis
                </a>
                <a
                  href="#doctor-questions"
                  className="block px-3 py-2 rounded-lg text-xs text-foreground/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  3. Doctor Discussion Points
                </a>
              </div>
            )}
          </div>

          <a
            href="#features"
            className="hover:text-white transition-colors duration-200"
          >
            Features
          </a>

          <a
            href="#privacy"
            className="hover:text-white transition-colors duration-200"
          >
            Privacy
          </a>

          {/* Languages with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('languages')}
              onMouseEnter={() => setActiveDropdown('languages')}
              className="flex items-center gap-1 hover:text-white transition-colors duration-200 py-1 focus:outline-none focus:text-white"
              aria-expanded={activeDropdown === 'languages'}
            >
              <span>Languages</span>
              <ChevronDown className="size-4 opacity-75" aria-hidden="true" />
            </button>
            {activeDropdown === 'languages' && (
              <div
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute top-full left-0 mt-2 w-48 rounded-xl liquid-glass border border-white/10 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-hero-sub">
                  Cloud Translation
                </div>
                {['English', 'Spanish (Español)', 'Hindi (हिन्दी)', 'French (Français)', 'German (Deutsch)'].map(
                  (lang) => (
                    <Link
                      key={lang}
                      to="/dashboard/translate"
                      className="block px-3 py-1.5 rounded-lg text-xs text-foreground/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {lang}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Right: Sign Up Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/signup">
            <Button
              variant="heroSecondary"
              className="rounded-full px-4 py-2 text-sm font-medium"
            >
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* 1px divider, bg-gradient-to-r from-transparent via-foreground/20 to-transparent, mt-[3px] */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent mt-[3px]" />

      {/* Mobile Hamburger Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl z-50 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-3 text-base text-foreground/90 font-medium">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-white/5 hover:text-white transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-white/5 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-white/5 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <Link
              to="/dashboard/translate"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-white/5 hover:text-white transition-colors"
            >
              Languages (Translate)
            </Link>
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="heroSecondary" className="w-full rounded-full py-2.5">
                Sign Up
              </Button>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-hero-sub hover:text-white">
                Launch Dashboard Demo
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-hero-sub">
            <ShieldAlert className="size-3.5 text-blue-400 shrink-0" />
            <span>Educational use only — not a medical diagnosis.</span>
          </div>
        </div>
      )}
    </header>
  )
}
