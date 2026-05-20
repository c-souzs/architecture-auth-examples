export interface ErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  errors?: Record<string, string>
}
