import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ScanLine,
  FileText,
  MessageSquare,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  Activity,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const NAV_ITEMS = [
    { label: t('nav.dashboard', undefined, 'Dashboard'), path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: t('nav.analyzeReport', undefined, 'Analyze Report'), path: '/dashboard/upload', icon: ScanLine },
    { label: t('nav.myReports', undefined, 'My Reports'), path: '/dashboard/reports', icon: FileText },
    { label: t('nav.askMyReport', undefined, 'Ask My Report'), path: '/dashboard/ask', icon: MessageSquare },
    { label: t('nav.healthGlossary', undefined, 'Health Glossary'), path: '/dashboard/glossary', icon: BookOpen },
    { label: t('nav.settings', undefined, 'Settings'), path: '/dashboard/settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/25">
            <Activity className="size-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="font-headline font-bold text-base tracking-tight text-slate-900 leading-none">
              Meddibuddy
            </span>
            <span className="block text-[10px] uppercase font-semibold text-sky-600 tracking-wider mt-0.5">
              Health Portal
            </span>
          </div>
        </div>
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-50 to-indigo-50 text-sky-700 shadow-xs border border-sky-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center justify-center size-8 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                      }`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    {item.label}
                  </div>
                  {isActive && (
                    <ChevronRight className="size-3.5 text-sky-400" aria-hidden="true" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Privacy Badge */}
      <div className="px-3 pb-3">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <Shield className="size-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-emerald-800">Your data is private</p>
            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
              Reports visible only to you. Delete anytime.
            </p>
          </div>
        </div>
      </div>

      {/* User Card + Sign Out */}
      <div className="px-3 pb-5 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-400 to-sky-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
            {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.displayName ?? 'My Account'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-1 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
          aria-label="Sign out of Meddibuddy"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t('nav.signOut', undefined, 'Sign Out')}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar — always visible */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar — overlay drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
              onClick={onClose}
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
