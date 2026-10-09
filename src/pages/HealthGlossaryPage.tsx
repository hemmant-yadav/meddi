import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  BookOpen,
  HelpCircle,
  Stethoscope,
  Activity,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  X,
  Info,
} from 'lucide-react'
import { HEALTH_GLOSSARY_TERMS, type GlossaryTerm } from '@/data/healthGlossaryData'
import { useLanguage } from '@/contexts/LanguageContext'

const CATEGORIES = [
  'All',
  'Blood & Cells',
  'Metabolism & Sugar',
  'Kidney & Liver',
  'Hormones & Vitamins',
  'Cardiovascular',
] as const

type CategoryType = (typeof CATEGORIES)[number]

export const HealthGlossaryPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All')
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  // Filter glossary terms by search and category
  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return HEALTH_GLOSSARY_TERMS.filter((term) => {
      const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory
      if (!matchesCategory) return false

      if (!q) return true
      const inName = term.name.toLowerCase().includes(q)
      const inAka = term.aka.some((a) => a.toLowerCase().includes(q))
      const inDef = term.simpleDefinition.toLowerCase().includes(q)
      const inWhy = term.whyMeasured.toLowerCase().includes(q)
      const inEdu = term.educationalContext.toLowerCase().includes(q)

      return inName || inAka || inDef || inWhy || inEdu
    })
  }, [searchQuery, selectedCategory])

  const handleAskInChat = (term: GlossaryTerm) => {
    const question = `What does ${term.name} (${term.aka[0] || ''}) mean in my report?`
    navigate(`/dashboard/ask?q=${encodeURIComponent(question)}`)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* ─── Hero / Header ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
          <BookOpen className="size-4 text-indigo-600" aria-hidden="true" />
          <span>Clinical Biomarker Encyclopedia</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 tracking-tight">
          Health Glossary
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Demystifying complex laboratory measurements. Search any common diagnostic marker to
          understand what it does, why your doctor ordered it, and what questions to bring to your next
          visit.
        </p>

        {/* ─── Search Bar ─────────────────────────────────────────────── */}
        <div className="pt-2 max-w-2xl relative">
          <label htmlFor="glossary-search-input" className="sr-only">
            Search biomarkers, abbreviations, or definitions
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="glossary-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by biomarker name, abbreviation (Hb, WBC, TSH, ALT)…"
              className="w-full pl-11 pr-10 py-3 bg-white text-sm text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:border-sky-500 rounded-2xl outline-none shadow-xs focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Category Filter Pills ─────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap pt-2" role="tablist">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            const count =
              cat === 'All'
                ? HEALTH_GLOSSARY_TERMS.length
                : HEALTH_GLOSSARY_TERMS.filter((t) => t.category === cat).length

            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/90'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Results Counter ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredTerms.length}</span>{' '}
          biomarkers
          {searchQuery && <span> matching “{searchQuery}”</span>}
        </p>
        <span className="text-2xs text-slate-400">Strictly educational · Not diagnostic</span>
      </div>

      {/* ─── Terms List Grid ────────────────────────────────────────── */}
      {filteredTerms.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <HelpCircle className="size-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-semibold text-slate-800">No matching biomarkers found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any parameters matching your search. Try searching by abbreviation like
            Hb, WBC, RBC, or TSH.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredTerms.map((term, index) => {
            const isExpanded = expandedCardId === term.id

            return (
              <motion.article
                key={term.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 sm:p-6 pb-4 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-lg font-bold font-headline text-slate-900 tracking-tight">
                          {term.name}
                        </h2>
                        {term.aka.map((alias) => (
                          <span
                            key={alias}
                            className="px-2 py-0.5 rounded-md text-2xs font-semibold bg-slate-100 text-slate-600"
                          >
                            {alias}
                          </span>
                        ))}
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-2xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {term.category}
                      </span>
                    </div>

                    {/* Reference interval pill */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-right">
                      <p className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
                        Typical Reference Range
                      </p>
                      <p className="text-xs font-semibold text-slate-700">{term.referenceRange}</p>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Simple Definition */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Simple Definition
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{term.simpleDefinition}</p>
                  </div>

                  {/* Why it's measured */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Why It’s Measured
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{term.whyMeasured}</p>
                  </div>

                  {/* Expandable Educational Context */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedCardId(isExpanded ? null : term.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors focus:outline-none"
                      aria-expanded={isExpanded}
                    >
                      <Activity className="size-3.5" aria-hidden="true" />
                      <span>{isExpanded ? 'Hide Biological Role' : 'Read Deep Biological Role'}</span>
                      {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
                            {term.educationalContext}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Ask your doctor note callout */}
                  <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3.5 flex items-start gap-3">
                    <Stethoscope className="size-4.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-emerald-900">Ask Your Doctor Note</p>
                      <p className="text-xs text-emerald-800/90 leading-relaxed">{term.askDoctorNote}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 sm:px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-2xs text-slate-400">
                    Questions vary by your specific lab reference interval
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAskInChat(term)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                  >
                    <MessageSquare className="size-3.5" />
                    <span>Ask AI About This</span>
                  </button>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </div>
  )
}
export default HealthGlossaryPage
