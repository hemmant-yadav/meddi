import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  FlipHorizontal,
  Maximize2,
  FileImage,
} from 'lucide-react'
import { validateMedicalReportFile } from '@/utils/fileValidation'

interface CameraCaptureProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (file: File) => void
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [isCapturing, setIsCapturing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Stop camera tracks cleanly
  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  // Start camera stream via getUserMedia
  const startCamera = useCallback(async () => {
    setCameraError(null)
    setValidationError(null)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access via getUserMedia is not supported in this browser. Please use the device camera button below.')
      return
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err: unknown) {
      console.warn('[CameraCapture] getUserMedia error:', err)
      const errorMsg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in browser permissions or use the capture button.'
          : 'Unable to access your camera. You can still take a picture using the native camera option below.'
      setCameraError(errorMsg)
    }
  }, [facingMode, stream])

  // Lifecycle when modal opens or closes
  useEffect(() => {
    if (isOpen && !previewUrl) {
      startCamera()
    } else if (!isOpen) {
      stopTracks()
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      setCapturedFile(null)
      setValidationError(null)
    }

    return () => {
      stopTracks()
    }
  }, [isOpen, previewUrl, startCamera, stopTracks])

  // Toggle front/back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  // Capture frame from video stream
  const takeSnapshot = () => {
    if (!videoRef.current) return
    setIsCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsCapturing(false)
      return
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        setIsCapturing(false)
        if (!blob) {
          setCameraError('Failed to capture frame. Please try again.')
          return
        }

        const fileName = `camera_scan_${Date.now()}.jpg`
        const file = new File([blob], fileName, { type: 'image/jpeg' })

        // Validate client side
        const val = validateMedicalReportFile(file)
        if (!val.isValid) {
          setValidationError(val.error || 'Invalid capture')
        }

        const url = URL.createObjectURL(blob)
        setCapturedFile(file)
        setPreviewUrl(url)

        // Stop stream while in preview
        stopTracks()
      },
      'image/jpeg',
      0.92
    )
  }

  // Handle native file input capture (<input capture="environment">)
  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const val = validateMedicalReportFile(file)
    if (!val.isValid) {
      setValidationError(val.error || 'Invalid image captured')
      return
    }

    const url = URL.createObjectURL(file)
    setCapturedFile(file)
    setPreviewUrl(url)
    setValidationError(null)
    stopTracks()
  }

  // Retake photo: clear preview and restart live camera
  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setCapturedFile(null)
    setValidationError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    startCamera()
  }

  // Confirm and use captured photo
  const handleConfirm = () => {
    if (!capturedFile) return

    const val = validateMedicalReportFile(capturedFile)
    if (!val.isValid) {
      setValidationError(val.error || 'File validation failed')
      return
    }

    onCapture(capturedFile)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Scan medical report with camera"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Camera className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Document Camera Scanner</h3>
                  <p className="text-xs text-slate-400">Position report within view with good lighting</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="Close camera scanner"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Viewfinder or Preview Area */}
            <div className="relative flex-1 min-h-[360px] sm:min-h-[440px] bg-black flex items-center justify-center overflow-hidden">
              {/* Flash effect overlay */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white z-30 animate-ping pointer-events-none" />
              )}

              {previewUrl ? (
                /* Captured Image Preview */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                  <img
                    src={previewUrl}
                    alt="Captured medical report preview"
                    className="max-h-[50vh] sm:max-h-[55vh] w-auto object-contain rounded-xl shadow-lg border border-slate-700"
                  />
                  <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5">
                    <Check className="size-3.5" />
                    <span>Photo captured</span>
                  </div>
                </div>
              ) : cameraError ? (
                /* Camera Error / Fallback State */
                <div className="p-8 text-center max-w-md mx-auto space-y-4">
                  <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="size-7" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-base">Direct Video Unavailable</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{cameraError}</p>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all"
                  >
                    <Camera className="size-4" />
                    Take Photo with Native Camera
                  </button>
                </div>
              ) : (
                /* Live Viewfinder */
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover sm:object-contain"
                  />

                  {/* Document Targeting Grid / Overlay */}
                  <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-sky-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                    <div className="flex justify-between items-start">
                      <div className="size-4 border-t-2 border-l-2 border-sky-400 -mt-1 -ml-1 rounded-tl-sm" />
                      <div className="size-4 border-t-2 border-r-2 border-sky-400 -mt-1 -mr-1 rounded-tr-sm" />
                    </div>

                    <div className="self-center px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-sky-300 text-[11px] font-medium tracking-wide flex items-center gap-1.5">
                      <Maximize2 className="size-3" />
                      Align document inside frame
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="size-4 border-b-2 border-l-2 border-sky-400 -mb-1 -ml-1 rounded-bl-sm" />
                      <div className="size-4 border-b-2 border-r-2 border-sky-400 -mb-1 -mr-1 rounded-br-sm" />
                    </div>
                  </div>

                  {/* Switch camera button */}
                  <button
                    onClick={toggleFacingMode}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors backdrop-blur-sm"
                    aria-label="Switch camera"
                  >
                    <FlipHorizontal className="size-4" />
                  </button>
                </div>
              )}

              {/* Hidden Canvas for snapshot extraction */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Native Mobile Camera Input with capture="environment" */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                capture="environment"
                className="hidden"
                onChange={handleNativeCapture}
                aria-label="Native camera input"
              />
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="px-5 py-2.5 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              {previewUrl ? (
                /* Preview Action Controls: Retake or Confirm */
                <div className="w-full flex items-center gap-3">
                  <button
                    onClick={handleRetake}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <RefreshCw className="size-4" />
                    Retake Photo
                  </button>

                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <Check className="size-4" />
                    Use This Scan
                  </button>
                </div>
              ) : (
                /* Viewfinder Action Controls: Native Option + Big Shutter */
                <div className="w-full flex items-center justify-between">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    aria-label="Open device camera"
                  >
                    <FileImage className="size-3.5" />
                    <span>Device Camera</span>
                  </button>

                  {/* Big Center Shutter Button */}
                  <button
                    onClick={takeSnapshot}
                    disabled={Boolean(cameraError)}
                    className="size-16 rounded-full border-4 border-white/40 hover:border-white flex items-center justify-center bg-white shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Capture medical report photo"
                  >
                    <div className="size-12 rounded-full bg-sky-500 hover:bg-sky-600 transition-colors" />
                  </button>

                  <div className="w-24 text-right">
                    <span className="text-[11px] text-slate-500 font-mono">Max 10MB</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
