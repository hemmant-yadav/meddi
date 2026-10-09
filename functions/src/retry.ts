export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  factor?: number
  shouldRetry?: (error: unknown) => boolean
}

/**
 * Executes an async operation with exponential backoff and jitter.
 */
export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 8000,
    factor = 2,
    shouldRetry = defaultShouldRetry,
  } = options

  let delay = initialDelayMs

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation(attempt)
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries
      if (isLastAttempt || !shouldRetry(error)) {
        throw error
      }

      // Add full jitter (0 to 1 * delay) to avoid thundering herd problem
      const jitter = Math.random() * delay * 0.3
      const sleepTime = Math.min(delay + jitter, maxDelayMs)

      console.warn(
        `[Retry] Attempt ${attempt}/${maxRetries} failed: ${
          error instanceof Error ? error.message : String(error)
        }. Retrying in ${Math.round(sleepTime)}ms...`
      )

      await new Promise((resolve) => setTimeout(resolve, sleepTime))
      delay = Math.min(delay * factor, maxDelayMs)
    }
  }

  throw new Error('Unreachable retry loop exit')
}

function defaultShouldRetry(error: unknown): boolean {
  if (!error) return false

  const errorString = String(error).toLowerCase()
  const status = (error as { status?: number; code?: number | string })?.status ||
                 (error as { code?: number | string })?.code

  // Retry on rate limits, service unavailable, gateway timeouts, network drops
  if (status === 429 || status === 503 || status === 504 || status === 500) {
    return true
  }

  if (
    errorString.includes('resource_exhausted') ||
    errorString.includes('unavailable') ||
    errorString.includes('deadline_exceeded') ||
    errorString.includes('socket hang up') ||
    errorString.includes('econnreset') ||
    errorString.includes('etimedout') ||
    errorString.includes('fetch failed') ||
    errorString.includes('rate limit')
  ) {
    return true
  }

  // Client errors (400, 401, 403, 404) are NOT retryable
  return false
}
