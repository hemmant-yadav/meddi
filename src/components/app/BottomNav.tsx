import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, ScanLine, FileText, MessageSquare, BookOpen } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export const BottomNav: React.FC = () => {
  const { t } = useLanguage()

  const BOTTOM_NAV = [
    { label: t('nav.dashboard', undefined, 'Home'), path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: t('nav.myReports', undefined, 'Reports'), path: '/dashboard/reports', icon: FileText },
    { label: t('nav.analyzeReport', undefined, 'Scan'), path: '/dashboard/upload', icon: ScanLine, primary: true },
    { label: t('nav.askMyReport', undefined, 'Ask'), path: '/dashboard/ask', icon: MessageSquare },
    { label: t('nav.healthGlossary', undefined, 'Glossary'), path: '/dashboard/glossary', icon: BookOpen },
  ]
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg shadow-slate-900/5"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center justify-around h-16 px-2">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.path} className="flex-1">
              {item.primary ? (
                /* Center "Scan" CTA button */
                <NavLink
                  to={item.path}
                  end={item.end}
                  className="flex flex-col items-center justify-center -mt-6"
                  aria-label={item.label}
                >
                  {({ isActive }) => (
                    <motion.div
                      whileTap={{ scale: 0.92 }}
                      className={`flex flex-col items-center justify-center size-14 rounded-2xl shadow-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-sky-500 to-indigo-600 shadow-indigo-500/30'
                          : 'bg-gradient-to-br from-sky-600 to-indigo-700 shadow-indigo-600/25'
                      }`}
                    >
                      <Icon className="size-6 text-white" aria-hidden="true" />
                    </motion.div>
                  )}
                </NavLink>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.end}
                  className="flex flex-col items-center justify-center gap-1 h-full py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
                  aria-label={item.label}
                >
                  {({ isActive }) => (
                    <>
                      <motion.span
                        layout
                        className={`flex items-center justify-center size-6 ${
                          isActive ? 'text-sky-600' : 'text-slate-400'
                        }`}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </motion.span>
                      <span className={isActive ? 'text-sky-600' : 'text-slate-400'}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
