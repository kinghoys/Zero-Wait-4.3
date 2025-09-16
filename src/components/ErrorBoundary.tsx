import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Please try refreshing the page or go back to the home screen.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.resetError}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <RefreshCw size={18} />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Home size={18} />
                  <span>Go Home</span>
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
                  <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
