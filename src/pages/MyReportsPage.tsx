import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Calendar,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  Trash2,
  Plus,
  Sparkles,
  ShieldCheck,
  Search,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { firebaseService } from '@/services/firebase'
import { ConfirmationModal } from '@/components/app/ConfirmationModal'
import type { MedicalReport } from '@/types'

export const MyReportsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.uid || 'default_user'

  const [reports, setReports] = useState<MedicalReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [reportToDelete, setReportToDelete] = useState<MedicalReport | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load user reports
  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await firebaseService.getReports(userId)
      setReports(data)
    } catch (err) {
      console.error('[MyReportsPage] Failed to fetch reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [userId])

  // Confirm and perform permanent deletion
  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return
    setIsDeleting(true)
    try {
      await firebaseService.deleteReport(userId, reportToDelete.id)
      setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id))
      setReportToDelete(null)
    } catch (err) {
      console.error('[MyReportsPage] Deletion failed:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredReports = reports.filter((r) => {
    if (!searchFilter.trim()) return true
    const q = searchFilter.toLowerCase()
    return (
      r.fileName.toLowerCase().includes(q) ||
      (r.reportType || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="size-3" />
            Complete
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="size-3" />
            Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="size-3 animate-spin" />
            Processing
          </span>
        )
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* ─── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="size-4" aria-hidden="true" />
            <span>Encrypted Health Records</span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
            My Medical Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View, chat with, and manage all your uploaded laboratory documents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/upload?demo=1"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-all shadow-2xs"
          >
            <Sparkles className="size-3.5 text-indigo-600" />
            Try Demo Report
          </Link>
          <Link
            to="/dashboard/upload"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-all shadow-sm shadow-sky-600/20"
          >
            <Plus className="size-4" />
            Upload Report
          </Link>
        </div>
      </div>

      {/* ─── Search & Count ─────────────────────────────────────────── */}
      {reports.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="search"
              placeholder="Filter by report name or type…"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <span className="text-xs text-slate-500 px-2">
            Total records: <strong className="text-slate-800">{reports.length}</strong>
          </span>
        </div>
      )}

      {/* ─── Reports List ───────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="size-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your medical reports…</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="size-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <FileText className="size-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">No medical reports found</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchFilter
                ? 'No reports matched your search keyword. Try a different query.'
                : 'Upload your first diagnostic lab report (PDF, JPG, PNG) to receive AI explanations.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/dashboard/upload?demo=1"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              Try Demo Report
            </Link>
            <Link
              to="/dashboard/upload"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors"
            >
              Upload Report
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report, idx) => {
            const dateStr = report.createdAt
              ? new Date(report.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent'

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Header Information */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                        <FileText className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 truncate" title={report.fileName}>
                          {report.fileName}
                        </h2>
                        <p className="text-2xs text-slate-500 truncate">
                          {report.reportType || 'Clinical Laboratory Report'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-3 pt-2 text-2xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-slate-400" />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="size-3 text-indigo-500" />
                      {report.parameterCount || 12} parameters detected
                    </span>
                  </div>
                </div>

                {/* Action Buttons: View / Ask AI / Delete */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* View Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/reports/${report.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition-all shadow-2xs"
                      aria-label={`View analysis for ${report.fileName}`}
                    >
                      <Eye className="size-3.5 text-slate-500" />
                      <span>View</span>
                    </button>

                    {/* Ask AI Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/ask?reportId=${report.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 transition-all shadow-2xs"
                      aria-label={`Ask AI about ${report.fileName}`}
                    >
                      <MessageSquare className="size-3.5 text-indigo-600" />
                      <span>Ask AI</span>
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setReportToDelete(report)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title={`Delete ${report.fileName}`}
                    aria-label={`Delete ${report.fileName}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ─── Confirmation Modal for Permanent Delete ────────────────── */}
      <ConfirmationModal
        open={Boolean(reportToDelete)}
        title="Delete Medical Report?"
        description={`This will permanently delete "${reportToDelete?.fileName}" from your account, including its extracted laboratory data and the physical file stored in Firebase Storage. This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete Permanently'}
        cancelLabel="Keep Report"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setReportToDelete(null)}
      />
    </div>
  )
}
export default MyReportsPage
