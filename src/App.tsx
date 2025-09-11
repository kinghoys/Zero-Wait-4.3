import React, { useState, useEffect } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import AnalysisScreen from './components/AnalysisScreen'
import HospitalListScreen from './components/HospitalListScreen'
import BookingScreen from './components/BookingScreen'
import AppointmentBookingPage from './components/AppointmentBookingPage'
import AppointmentsDashboard from './components/AppointmentsDashboard'
import AmbulanceBookingPage from './components/AmbulanceBookingPage'
import NavigationBar from './components/NavigationBar'
import { AppProvider } from './context/AppContext'

export type AppScreen = 'welcome' | 'analysis' | 'hospitals' | 'booking' | 'appointment' | 'dashboard' | 'ambulance'

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const navigateToScreen = (screen: AppScreen) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentScreen(screen)
      setIsTransitioning(false)
    }, 200)
  }

  const handleWelcomeNext = (targetScreen?: AppScreen) => {
    if (targetScreen) {
      navigateToScreen(targetScreen)
    } else {
      navigateToScreen('analysis')
    }
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNext={handleWelcomeNext} />
      case 'analysis':
        return <AnalysisScreen onNext={() => navigateToScreen('hospitals')} />
      case 'hospitals':
        return <HospitalListScreen 
          onSelect={() => navigateToScreen('booking')}
          onAppointment={() => navigateToScreen('appointment')}
        />
      case 'booking':
        return <BookingScreen onComplete={() => navigateToScreen('ambulance')} />
      case 'appointment':
        return <AppointmentBookingPage onBack={() => navigateToScreen('hospitals')} />
      case 'dashboard':
        return <AppointmentsDashboard />
      case 'ambulance':
        return <AmbulanceBookingPage />
      default:
        return <WelcomeScreen onNext={handleWelcomeNext} />
    }
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Navigation Bar */}
        <NavigationBar 
          currentScreen={currentScreen} 
          onNavigate={navigateToScreen} 
        />
        
        {/* Main Content with padding for navigation */}
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {renderScreen()}
        </div>
        
        {/* Floating particles background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-200 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-green-200 rounded-full animate-bounce opacity-40"></div>
          <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-primary rounded-full animate-ping opacity-30"></div>
        </div>
      </div>
    </AppProvider>
  )
}

export default App
