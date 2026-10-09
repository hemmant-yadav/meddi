import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  FileText,
  ChevronRight,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Activity,
} from 'lucide-react'
import { UploadZone } from '@/components/app/UploadZone'
import { EmptyState } from '@/components/app/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useMedicalReport } from '@/hooks/useMedicalReport'
import type { MedicalReport } from '@/types'

const QUICK_ACTIONS = [
  {
    icon: TrendingUp,
    label: 'My Reports',
    description: 'View all analyzed reports',
    href: '/dashboard/reports',
    color: 'bg-sky-50 text-sky-700 border-sky-100',
    iconColor: 'text-sky-500',
  },
  {
    icon: MessageSquare,
    label: 'Ask My Report',
    description: 'Chat with your health data',
    href: '/dashboard/ask',
    color: 'bg-violet-50 text-violet-700 border-violet-100',
    iconColor: 'text-violet-500',
  },
  {
    icon: BookOpen,
    label: 'Health Glossary',
    description: 'Learn medical terms simply',
    href: '/dashboard/glossary',
    color: 'bg-teal-50 text-teal-700 border-teal-100',
    iconColor: 'text-teal-500',
  },
  {
    icon: HelpCircle,
    label: 'How It Works',
    description: 'Educational guide & FAQ',
    href: '/dashboard/faq',
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    iconColor: 'text-amber-500',
  },
]

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { reports, fetchReports, loading } = useMedicalReport()
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null)

  useEffect(() => {
    fetchReports('current_user')
  }, [fetchReports])

  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      setSelectedReport(reports[0])
    }
  }, [reports, selectedReport])

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload a report to get an AI-powered educational breakdown.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <Activity className="size-4 text-emerald-500" aria-hidden="true" />
            <span className="text-xs font-medium text-emerald-700">
              {reports.length} report{reports.length !== 1 ? 's' : ''} analyzed
            </span>
          </div>
        </div>
      </motion.div>

      {/* Upload Card */}
      <motion.div variants={itemVariants}>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-sky-500/25">
              <Sparkles className="size-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Analyze a Medical Report</h2>
              <p className="text-xs text-slate-500">PDF, JPG, JPEG or PNG</p>
            </div>
          </div>
          <UploadZone onFileSelect={(_file) => {
            // In a real flow, this navigates to the upload page with the file
            navigate('/dashboard/upload')
          }} />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                to={action.href}
                className={`group flex flex-col gap-3 p-4 rounded-2xl border bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-500`}
              >
                <div className={`size-10 rounded-xl flex items-center justify-center border ${action.color}`}>
                  <Icon className={`size-5 ${action.iconColor}`} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-700 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Reports */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Recent Reports
          </h2>
          {reports.length > 0 && (
            <Link
              to="/dashboard/reports"
              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-200 rounded-xl animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="Upload your first medical report to see an AI-powered plain-language explanation."
            action={
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition-colors"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                Analyze Your First Report
              </Link>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <ul role="list" aria-label="Recent medical reports">
            {reports.slice(0, 5).map((rep, idx) => {
                const isSelected = selectedReport?.id === rep.id
                return (
                  <li key={rep.id} className={idx !== 0 ? 'border-t border-slate-100' : ''}>
                    <div className="w-full text-left px-5 py-4 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className={`flex items-center gap-4 min-w-0 flex-1 text-left transition-all ${
                          isSelected ? 'opacity-100' : 'hover:opacity-80'
                        }`}
                        aria-selected={isSelected}
                      >
                        <div
                          className={`shrink-0 p-2.5 rounded-xl ${
                            isSelected ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <FileCheck className="size-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{rep.fileName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="size-3 text-slate-400" aria-hidden="true" />
                            <span className="text-xs text-slate-500">
                              {new Date(rep.uploadedAt || rep.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              Explained
                            </span>
                          </div>
                        </div>
                      </button>
                      <Link
                        to={`/dashboard/reports/${rep.id}`}
                        className="shrink-0 ml-3 p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        aria-label={`View full analysis for ${rep.fileName}`}
                      >
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>

            {/* Selected report explanation inline preview */}
            {selectedReport?.explanation && (
              <motion.div
                key={selectedReport.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="border-t border-sky-100 bg-sky-50/40 px-5 py-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="size-3.5 text-sky-600" aria-hidden="true" />
                  <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                    AI Educational Summary
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                  {selectedReport.explanation.summary}
                </p>
                <Link
                  to={`/dashboard/reports/${selectedReport?.id}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
                >
                  Full analysis breakdown <ChevronRight className="size-3" aria-hidden="true" />
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
