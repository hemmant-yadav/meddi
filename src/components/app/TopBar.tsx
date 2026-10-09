import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Activity,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSelector } from './LanguageSelector'

interface TopBarProps {
  onMenuClick: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -6 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.1 } },
  }

  const initials =
    user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
      role="banner"
    >
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        {/* Mobile: Hamburger + Logo */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center size-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-label="Open navigation menu"
          aria-expanded={false}
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <Link
          to="/dashboard"
          className="lg:hidden flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md"
          aria-label="Meddibuddy Dashboard"
        >
          <div className="size-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xs">
            <Activity className="size-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-headline font-bold text-slate-900 text-sm">Meddibuddy</span>
        </Link>

        {/* Search bar */}
        <div className="hidden sm:flex flex-1 max-w-md">
          <label htmlFor="topbar-search" className="sr-only">{t('common.search', undefined, 'Search reports, terms…')}</label>
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="topbar-search"
              type="search"
              placeholder={t('common.search', undefined, 'Search reports, terms…')}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-50 border border-transparent focus:border-sky-300 focus:bg-white rounded-xl outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Unified Language Selector */}
          <LanguageSelector showBadge />

          {/* Notifications */}
          <button
            className="relative flex items-center justify-center size-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Notifications"
          >
            <Bell className="size-4" aria-hidden="true" />
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen(v => !v) }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              aria-label="Account menu"
            >
              <div className="size-8 rounded-full bg-gradient-to-br from-indigo-400 to-sky-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="size-8 rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <ChevronDown
                className={`size-3.5 text-slate-400 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  key="user-menu"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  role="menu"
                  aria-label="Account options"
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user?.displayName ?? 'My Account'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard/settings"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="size-4 text-slate-400" aria-hidden="true" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="size-4 text-slate-400" aria-hidden="true" />
                      Settings
                    </Link>
                  </div>
                  <div className="py-1 border-t border-slate-100">
                    <button
                      role="menuitem"
                      onClick={() => { signOut(); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
