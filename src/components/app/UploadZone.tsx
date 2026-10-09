import React, { useCallback, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  Camera,
  FileText,
  X,
  FileImage,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { validateMedicalReportFile } from '@/utils/fileValidation'

const ACCEPTED_EXTS = '.pdf,.jpg,.jpeg,.png'

function getFileIcon(file: File) {
  if (file.type === 'application/pdf') return FileText
  return FileImage
}

interface UploadZoneProps {
  onFileSelect?: (file: File) => void
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect }) => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [stagedFile, setStagedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      const validation = validateMedicalReportFile(file)
      if (!validation.isValid) {
        setErrorMessage(validation.error || 'Invalid file format or size exceeds 10MB.')
        setStagedFile(null)
        return
      }

      setErrorMessage(null)
      setStagedFile(file)
      onFileSelect?.(file)
    },
    [onFileSelect],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }
  const handleDragLeave = () => setDragActive(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const clearFile = () => {
    setStagedFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        role="region"
        aria-label="File upload area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !stagedFile && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 transition-all duration-200 cursor-pointer group overflow-hidden ${
          dragActive
            ? 'border-sky-400 bg-sky-50/80 scale-[1.01]'
            : stagedFile
            ? 'border-emerald-300 bg-emerald-50/60 cursor-default'
            : 'border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50/40 bg-white'
        }`}
      >
        {/* Subtle radial gradient on hover */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
            dragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(56,189,248,0.08) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <AnimatePresence mode="wait">
          {stagedFile ? (
            <motion.div
              key="staged"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-4 px-6 py-8"
            >
              {React.createElement(getFileIcon(stagedFile), {
                className: 'size-10 text-emerald-500 shrink-0',
                'aria-hidden': true,
              })}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{stagedFile.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(stagedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden="true" />
                  <span className="text-xs text-emerald-700 font-medium">Ready to analyze</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile() }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Remove selected file"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center px-6 py-12 text-center"
            >
              <motion.div
                animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="size-16 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center mb-4 shadow-sm"
              >
                <UploadCloud
                  className={`size-8 transition-colors ${dragActive ? 'text-sky-600' : 'text-sky-500'}`}
                  aria-hidden="true"
                />
              </motion.div>
              <p className="text-base font-semibold text-slate-800 mb-1">
                {dragActive ? 'Drop it here!' : 'Drag & Drop your medical report'}
              </p>
              <p className="text-sm text-slate-500 mb-1">
                or <span className="text-sky-600 font-medium underline underline-offset-2">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, JPG, JPEG or PNG · Max 10 MB</p>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTS}
          className="sr-only"
          aria-label="Select medical report file"
          onChange={handleInputChange}
          tabIndex={-1}
        />
      </div>

      {/* Validation Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="size-4 shrink-0 text-red-500 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-sky-500/25 transition-all hover:shadow-sky-500/35 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          aria-label="Upload a report file from your device"
        >
          <UploadCloud className="size-4" aria-hidden="true" />
          Upload Report
        </button>

        <button
          onClick={() => navigate('/dashboard/upload?camera=1')}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 hover:border-slate-300 shadow-xs transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Scan report with your camera"
        >
          <Camera className="size-4 text-slate-500" aria-hidden="true" />
          Scan with Camera
        </button>

        <button
          onClick={() => navigate('/dashboard/upload?demo=1')}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 text-indigo-700 text-sm font-semibold border border-indigo-100 shadow-xs transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Try a demo report"
        >
          <Sparkles className="size-4 text-indigo-500" aria-hidden="true" />
          Try Demo Report
        </button>
      </div>

      {/* Privacy assurance */}
      <p className="text-center text-xs text-slate-500 pt-1">
        🔒 Your reports are securely stored and accessible only to you.
      </p>
    </div>
  )
}
