export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const

export const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'] as const

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export function getFileExtension(filename: string): string {
  if (!filename) return ''
  const parts = filename.split('.')
  if (parts.length <= 1) return ''
  return parts.pop()?.toLowerCase() || ''
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function validateMedicalReportFile(file: File | Blob): FileValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided. Please select a medical report.',
    }
  }

  // Check file size
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'The selected file is empty (0 bytes). Please select a valid document.',
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const readableSize = formatFileSize(file.size)
    const maxSize = formatFileSize(MAX_FILE_SIZE_BYTES)
    return {
      isValid: false,
      error: `File size (${readableSize}) exceeds the 10MB limit (max ${maxSize}). Please select a smaller file or compressed image.`,
    }
  }

  // Check MIME type or extension
  const fileName = (file as File).name || ''
  const ext = getFileExtension(fileName)
  const mimeType = file.type?.toLowerCase() || ''

  const isMimeAllowed = ALLOWED_MIME_TYPES.some((allowed) => mimeType === allowed)
  const isExtAllowed = ALLOWED_EXTENSIONS.some((allowed) => ext === allowed)

  // Some browsers or systems may leave file.type blank for PDFs or JPGs
  if (!isMimeAllowed && !isExtAllowed) {
    return {
      isValid: false,
      error: `Unsupported file format. Please upload a PDF, JPG, JPEG, or PNG document.`,
    }
  }

  return { isValid: true }
}

export function detectReportType(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.includes('metabolic') || lower.includes('cmp') || lower.includes('bmp')) {
    return 'Metabolic Panel'
  }
  if (lower.includes('blood') || lower.includes('cbc') || lower.includes('hemogram')) {
    return 'Complete Blood Count (CBC)'
  }
  if (lower.includes('lipid') || lower.includes('cholesterol')) {
    return 'Lipid Profile'
  }
  if (lower.includes('thyroid') || lower.includes('tsh') || lower.includes('t3') || lower.includes('t4')) {
    return 'Thyroid Function Test'
  }
  if (lower.includes('liver') || lower.includes('lft')) {
    return 'Liver Function Test'
  }
  if (lower.includes('kidney') || lower.includes('kft') || lower.includes('renal')) {
    return 'Kidney Function Test'
  }
  if (lower.includes('urine') || lower.includes('urinalysis')) {
    return 'Urinalysis'
  }
  if (lower.includes('vitamin') || lower.includes('vit')) {
    return 'Vitamin & Nutrient Panel'
  }
  return 'Clinical Laboratory Report'
}
