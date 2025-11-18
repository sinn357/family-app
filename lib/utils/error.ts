/**
 * Convert error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true
  }

  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    )
  }

  return false
}

/**
 * Get user-friendly error message based on status code
 */
export function getStatusErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.'
    case 401:
      return 'Please login to continue.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 409:
      return 'A conflict occurred. The resource may have been modified.'
    case 422:
      return 'The provided data is invalid.'
    case 429:
      return 'Too many requests. Please try again later.'
    case 500:
      return 'Server error. Please try again later.'
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.'
    case 503:
      return 'Service unavailable. Please try again later.'
    case 504:
      return 'Gateway timeout. The server took too long to respond.'
    default:
      if (status >= 400 && status < 500) {
        return 'Client error. Please check your request.'
      }
      if (status >= 500) {
        return 'Server error. Please try again later.'
      }
      return 'An error occurred.'
  }
}

/**
 * Enhanced error handler for API calls
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage: string

  try {
    const data = await response.json()
    errorMessage = data.error || data.message || getStatusErrorMessage(response.status)
  } catch {
    errorMessage = getStatusErrorMessage(response.status)
  }

  const error = new Error(errorMessage) as Error & { status: number }
  error.status = response.status
  throw error
}

/**
 * Format validation errors from Zod
 */
export function formatValidationErrors(errors: Array<{ path: string[]; message: string }>): string {
  if (errors.length === 0) {
    return 'Validation failed'
  }

  if (errors.length === 1) {
    return errors[0].message
  }

  return errors.map((err) => err.message).join(', ')
}
