import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { AppScreen } from '../App'

interface AuthenticatedAppProps {
  currentScreen: AppScreen
  onNavigate: (screen: AppScreen) => void
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ currentScreen, onNavigate }) => {
  const { state: authState } = useAuth()

  useEffect(() => {
    // Auto-navigate to user dashboard after successful login
    if (authState.user && !authState.isLoading) {
      const userDashboardMap: { [key: string]: AppScreen } = {
        'patient': 'patient-dashboard',
        'doctor': 'doctor-dashboard',
        'nurse': 'nurse-dashboard',
        'admin': 'admin-dashboard',
        'pharmacy': 'pharmacy-dashboard',
        'family': 'family-dashboard'
      }

      const targetDashboard = userDashboardMap[authState.user.userType]
      
      // Only navigate if we're not already on a dashboard or specific pages
      const isDashboardScreen = currentScreen.includes('-dashboard')
      const isSpecialScreen = ['test', 'ambulance', 'booking'].includes(currentScreen)
      
      if (targetDashboard && !isDashboardScreen && !isSpecialScreen) {
        onNavigate(targetDashboard)
      }
    }
  }, [authState.user, authState.isLoading, currentScreen, onNavigate])

  return null // This is a logic-only component
}

export default AuthenticatedApp
