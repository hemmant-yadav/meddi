import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Sparkles,
  Bot,
  User,
  ArrowLeft,
  Trash2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronDown,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { firebaseService } from '@/services/firebase'
import { LanguageSelector } from '@/components/app/LanguageSelector'
import type { ChatMessage, MedicalReport } from '@/types'

const EXACT_UNANSWERABLE = 'This information cannot be determined from the uploaded report.'

export const AskMyReportPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { language, t } = useLanguage()

  const initialReportId = searchParams.get('reportId') || 'rep_sample_01'
  const initialQuery = searchParams.get('q') || ''

  const [reportId, setReportId] = useState<string>(initialReportId)
  const [reportsList, setReportsList] = useState<MedicalReport[]>([])
  const [activeReport, setActiveReport] = useState<MedicalReport | null>(null)
  const [reportSelectorOpen, setReportSelectorOpen] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState(initialQuery)
  const [isTyping, setIsTyping] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasAutoSentRef = useRef(false)

  const userId = user?.uid || 'default_user'

  // Load available reports for report selector
  useEffect(() => {
    let isMounted = true
    firebaseService.getReports(userId).then((list) => {
      if (!isMounted) return
      setReportsList(list)
      const current = list.find((r) => r.id === reportId) || list[0] || null
      setActiveReport(current)
    })
    return () => {
      isMounted = false
    }
  }, [userId, reportId])

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToChatMessages(userId, reportId, (msgs) => {
      setMessages(msgs)
    })
    return () => unsubscribe()
  }, [userId, reportId])

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages, isTyping])

  // Handle prefilled question from query parameters (e.g. from TestResultCard "Explain Further")
  useEffect(() => {
    if (initialQuery && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true
      setInputValue('')
      handleSendMessage(initialQuery)
    }
  }, [initialQuery])

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputValue).trim()
    if (!question || isTyping) return

    setInputValue('')
    setErrorMsg(null)
    setIsTyping(true)

    try {
      await firebaseService.askReport(reportId, question, language, userId)
    } catch (err) {
      console.error('[AskMyReport] Send message error:', err)
      setErrorMsg('Failed to process question. Please try again.')
    } finally {
      setIsTyping(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear chat history for this report?')) {
      await firebaseService.clearChatHistory(userId, reportId)
    }
  }

  const handleSelectReport = (r: MedicalReport) => {
    setReportId(r.id)
    setActiveReport(r)
    setReportSelectorOpen(false)
    navigate(`/dashboard/ask?reportId=${r.id}`, { replace: true })
  }

  const suggestedQuestions = [
    { label: t('chat.chipHb', undefined, 'What does Hb mean?'), query: 'What does Hb mean in this report?' },
    {
      label: t('chat.chipOutside', undefined, 'Which values are outside the stated range?'),
      query: 'Which values are outside the stated range?',
    },
    {
      label: t('chat.chipPlatelets', undefined, 'What does my Platelet count indicate?'),
      query: 'What does my Platelet count indicate?',
    },
    {
      label: t('chat.chipDoctor', undefined, 'What questions should I ask my doctor?'),
      query: 'What questions should I ask my doctor about these results?',
    },
    {
      label: t('chat.chipRbc', undefined, 'Are my red blood cell counts normal?'),
      query: 'Are my red blood cell counts normal?',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-5.5rem)] pb-2">
      {/* ─── Messenger Header ─────────────────────────────────────────── */}
      <header className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-4 py-3 sm:px-6 mb-3 shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={reportId ? `/dashboard/reports/${reportId}` : '/dashboard'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Back to report analysis"
            title="Back to report analysis"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shadow-xs shrink-0 relative">
            <Bot className="size-5" aria-hidden="true" />
            <span
              className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 rounded-full border-2 border-white"
              title="Online"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-headline text-slate-900 tracking-tight leading-tight truncate">
                {t('chat.title', undefined, 'Ask My Report')}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <ShieldCheck className="size-3" />
                Zero Hallucination
              </span>
            </div>

            {/* Active report switcher */}
            <div className="relative inline-block mt-0.5">
              <button
                type="button"
                onClick={() => setReportSelectorOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors focus:outline-none"
                aria-expanded={reportSelectorOpen}
                aria-haspopup="listbox"
              >
                <FileText className="size-3.5 text-sky-600 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">
                  {activeReport?.reportType || activeReport?.fileName || 'Complete Blood Count (CBC)'}
                </span>
                <ChevronDown className="size-3 text-slate-400" />
              </button>

              <AnimatePresence>
                {reportSelectorOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    role="listbox"
                    className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 divide-y divide-slate-100 max-h-60 overflow-y-auto"
                  >
                    <li className="px-3 py-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                      Select Medical Report
                    </li>
                    {reportsList.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectReport(r)}
                          className={`w-full text-left px-3.5 py-2 text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition-colors ${
                            r.id === reportId ? 'bg-sky-50 text-sky-800 font-medium' : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{r.reportType || r.fileName}</span>
                          <span className="text-2xs text-slate-400">
                            {r.parameterCount ? `${r.parameterCount} parameters` : 'Laboratory report'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right actions: Language Selector & Clear history */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSelector compact showBadge />
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              title={t('chat.clearHistory', undefined, 'Clear History')}
              aria-label="Clear chat history"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* ─── Chat Body Container ──────────────────────────────────────── */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col min-h-0 overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Welcome Intro Card */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-sky-50/50 to-white border border-indigo-100 rounded-2xl p-4 sm:p-5 text-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
              <Sparkles className="size-4 text-indigo-600 shrink-0" aria-hidden="true" />
              <span>{t('chat.welcomeTitle', undefined, 'Ask anything about your report')}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t(
                'chat.welcomeDesc',
                undefined,
                'Meddibuddy uses Gemini to explain lab findings, reference ranges, and doctor questions based ONLY on your scanned document.'
              )}
            </p>
            <div className="pt-1 flex items-center gap-2 text-2xs text-indigo-700/80">
              <ShieldCheck className="size-3.5 text-indigo-600" />
              <span>All explanations adhere strictly to clinical safety guardrails.</span>
            </div>
          </div>

          {/* Render Chat Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'
              const isUnanswerable = msg.text.trim() === EXACT_UNANSWERABLE

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-2xs mt-1">
                      <Bot className="size-4" aria-hidden="true" />
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-xs shadow-sm shadow-indigo-500/10'
                          : isUnanswerable
                          ? 'bg-amber-50/80 border border-amber-200 text-amber-900 rounded-tl-xs shadow-xs'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {/* Markdown / whitespace formatted text */}
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Unanswerable Guardrail Callout */}
                      {isUnanswerable && (
                        <div className="mt-2.5 pt-2.5 border-t border-amber-200/80 flex items-start gap-2 text-xs text-amber-800">
                          <Info className="size-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>
                            {t(
                              'chat.unanswerableNotice',
                              undefined,
                              'Guardrail Notice: Meddibuddy strictly answers only what is present in your scanned report to prevent medical speculation.'
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Timestamp */}
                    <div
                      className={`flex items-center gap-2 px-1 text-2xs text-slate-400 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isUser && !isUnanswerable && (
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <CheckCircle2 className="size-3 text-emerald-500" />
                          {t('chat.groundedBadge', undefined, 'Verified against report data')}
                        </span>
                      )}
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="size-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs mt-1">
                      <User className="size-4" aria-hidden="true" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Typing Animation Bubble */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 justify-start"
            >
              <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-2xs mt-1">
                <Bot className="size-4 animate-pulse" aria-hidden="true" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-2 rounded-full bg-indigo-500 animate-bounce" />
                  </div>
                  <span>{t('chat.typing', undefined, 'Meddibuddy is reviewing your report…')}</span>
                </div>
              </div>
            </motion.div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Suggested Question Chips ───────────────────────────────── */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Suggested:
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q.query)}
                disabled={isTyping}
                className="px-3 py-1.5 rounded-full text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Input Bar ─────────────────────────────────────────────── */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <label htmlFor="chat-message-input" className="sr-only">
                Ask a question about your medical report
              </label>
              <textarea
                ref={inputRef}
                id="chat-message-input"
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t(
                  'chat.inputPlaceholder',
                  undefined,
                  'Ask a question about your report (e.g. What does Hb mean?)…'
                )}
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 p-3 max-h-32 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-sky-300 rounded-xl outline-none resize-none transition-all shadow-2xs"
                disabled={isTyping}
              />
            </div>

            <button
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              className="size-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/20 shrink-0"
              aria-label={t('chat.send', undefined, 'Send')}
            >
              {isTyping ? (
                <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
            </button>
          </form>

          {/* Educational Disclaimer */}
          <p className="mt-2 text-center text-2xs text-slate-400">
            {t(
              'common.disclaimer',
              undefined,
              'Educational overview. Not a medical diagnosis or treatment directive. Always consult your doctor.'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
export default AskMyReportPage
