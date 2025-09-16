import React, { useState } from 'react'
import { Home, Activity, MapPin, Calendar, Truck, LogIn, User, Settings, Search, AlertTriangle, MessageCircle } from 'lucide-react'
import type { AppScreen } from '../App'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import AuthModal, { UserType } from './AuthModal'
import UserProfileDropdown from './UserProfileDropdown'

interface NavigationBarProps {
  currentScreen: AppScreen
  onNavigate: (screen: AppScreen) => void
}

const NavigationBar: React.FC<NavigationBarProps> = ({ currentScreen, onNavigate }) => {
  const { state } = useAppContext()
  const { state: authState } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      screen: 'welcome' as AppScreen,
      color: 'text-blue-600',
      alwaysEnabled: true
    },
    {
      id: 'dashboard',
      label: 'My Bookings',
      icon: Calendar,
      screen: 'dashboard' as AppScreen,
      color: 'text-purple-600',
      showIf: ['welcome', 'dashboard', 'appointment', 'ambulance']
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: Search,
      screen: 'analysis' as AppScreen,
      color: 'text-indigo-600',
      requiresInput: false
    },
    {
      id: 'hospitals',
      label: 'Hospitals',
      icon: MapPin,
      screen: 'hospitals' as AppScreen,
      color: 'text-green-600',
      showIf: ['hospitals', 'booking', 'appointment', 'ambulance']
    },
    {
      id: 'appointment',
      label: 'Book',
      icon: Calendar,
      screen: 'appointment' as AppScreen,
      color: 'text-purple-600',
      alwaysEnabled: true
    },
    {
      id: 'ambulance',
      label: 'Ambulance',
      icon: Truck,
      screen: 'ambulance' as AppScreen,
      color: 'text-red-600',
      requiresEmergency: true
    },
    {
      id: 'test',
      label: 'Firebase Test',
      icon: Settings,
      screen: 'test' as AppScreen,
      requiresAuth: false
    }
  ]

  const isItemEnabled = (item: any) => {
    if (item.alwaysEnabled) return true
    if (item.requiresInput && !state.userInput) return false
    if (item.requiresAnalysis && (!state.userInput || state.hospitals.length === 0)) return false
    if (item.requiresEmergency && state.situation !== 'emergency') return false
    return true
  }

  const shouldShowItem = (item: any) => {
    if (item.alwaysEnabled) return true
    return item.showIf?.includes(currentScreen) || isItemEnabled(item)
  }

  const handleNavigation = (item: any) => {
    if (!isItemEnabled(item)) return
    onNavigate(item.screen)
  }

  const handleUserTypeSelect = (userType: UserType, action: 'login' | 'signup') => {
    setShowAuthModal(false)
    console.log(`${action} selected for ${userType}`)
  }

  const isActive = (item: any) => {
    if (item.id === 'current_booking') {
      return currentScreen === 'booking' || currentScreen === 'appointment' || currentScreen === 'ambulance'
    }
    return currentScreen === item.screen
  }

  const getProgressPercentage = (screen: AppScreen) => {
    switch (screen) {
      case 'welcome': return 0
      case 'analysis': return 20
      case 'hospitals': return 50
      case 'booking': return 80
      case 'appointment': return 90
      case 'ambulance': return 90
      case 'dashboard': return 100
      default: return 0
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ZW</span>
            </div>
            <span className="font-bold text-gray-800 hidden sm:block">ZeroWait</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navigationItems.filter(shouldShowItem).map((item) => {
              const IconComponent = item.icon
              const active = isActive(item)
              const enabled = isItemEnabled(item)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  disabled={!enabled}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 button-press ${
                    active
                      ? `${item.color} bg-blue-50 shadow-md`
                      : enabled 
                        ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="hidden sm:block">{item.label}</span>
                  {!enabled && (
                    <div className="w-1 h-1 bg-gray-400 rounded-full ml-1" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            {state.situation && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                state.situation === 'emergency' 
                  ? 'bg-red-100 text-red-700 animate-pulse' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {state.situation === 'emergency' ? '🚨 Emergency' : '📋 Normal'}
              </div>
            )}

            {state.selectedHospital && (
              <div className="hidden md:flex items-center space-x-1 text-xs text-gray-600">
                <MapPin size={12} />
                <span>{state.selectedHospital.name}</span>
              </div>
            )}

            {/* Login Button or Profile Dropdown */}
            {authState.user ? (
              <UserProfileDropdown onNavigate={onNavigate} />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                <LogIn size={16} />
                <span className="hidden sm:block">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {(currentScreen as AppScreen) !== 'welcome' && (
        <div className="h-1 bg-gray-100">
          <div 
            className={`h-full transition-all duration-500 ${
              state.situation === 'emergency' 
                ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                : 'bg-gradient-to-r from-blue-500 to-green-500'
            }`}
            style={{ 
              width: `${getProgressPercentage(currentScreen)}%`
            }}
          />
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onUserTypeSelect={handleUserTypeSelect}
      />
    </nav>
  )
}

export default NavigationBar
