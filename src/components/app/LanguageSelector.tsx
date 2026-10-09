import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { LanguageCode } from '@/i18n'

interface LanguageSelectorProps {
  compact?: boolean
  className?: string
  showBadge?: boolean
}

const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.1 } },
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = '',
  showBadge = false,
}) => {
  const { language, setLanguage, currentLanguageMeta, supportedLanguages, isTranslatingReport } =
    useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation: Escape closes menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-2xs"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentLanguageMeta.label} (${currentLanguageMeta.englishLabel})`}
      >
        <Globe className="size-4 text-sky-600 shrink-0" aria-hidden="true" />
        {compact ? (
          <span className="text-base leading-none">{currentLanguageMeta.flag}</span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="text-base leading-none">{currentLanguageMeta.flag}</span>
            <span className="font-medium text-slate-800">{currentLanguageMeta.label}</span>
          </span>
        )}
        <ChevronDown
          className={`size-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
        {isTranslatingReport && (
          <span
            className="size-2 rounded-full bg-sky-500 animate-ping absolute -top-0.5 -right-0.5"
            title="Translating report…"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            key="language-menu-list"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="listbox"
            aria-label="Choose language"
            className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 focus:outline-none text-sm divide-y divide-slate-100"
          >
            <li className="px-3.5 py-1.5 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Language
            </li>
            <div className="py-1">
              {supportedLanguages.map((lang) => {
                const isSelected = lang.code === language
                return (
                  <li
                    key={lang.code}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(lang.code)}
                    className={`flex items-center justify-between px-3.5 py-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50/80 text-sky-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-tight">{lang.label}</span>
                        <span className="text-2xs text-slate-400 leading-tight">
                          {lang.englishLabel}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="size-4 text-sky-600 shrink-0" aria-hidden="true" />}
                  </li>
                )
              })}
            </div>
            {showBadge && (
              <li className="px-3.5 py-2 text-2xs text-slate-400 bg-slate-50/50">
                Powered by Gemini Medical Explainer & Cloud Translation
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
