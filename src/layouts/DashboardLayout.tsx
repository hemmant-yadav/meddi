import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/app/Sidebar'
import { TopBar } from '@/components/app/TopBar'
import { BottomNav } from '@/components/app/BottomNav'
import { SafetyNotice } from '@/components/app/SafetyNotice'

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [noticeDismissed, setNoticeDismissed] = useState(false)
  const location = useLocation()

  return (
    <div className="theme-healthcare min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Accessibility: Skip to main content */}
      <a
        href="#app-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 z-[100] px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right side: TopBar + main content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Sticky TopBar */}
          <TopBar onMenuClick={() => setSidebarOpen(true)} />

          {/* Safety Notice Banner */}
          <AnimatePresence>
            {!noticeDismissed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <SafetyNotice compact onDismiss={() => setNoticeDismissed(true)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Content */}
          <main
            id="app-main"
            className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto"
            tabIndex={-1}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* App Footer — hidden on mobile (bottom nav takes its place) */}
          <footer
            className="hidden lg:block border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400"
            aria-label="App footer"
          >
            <p>
              © {new Date().getFullYear()} Meddibuddy · Educational resource only ·
              Not medically certified or clinically validated
            </p>
          </footer>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
