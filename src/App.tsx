import React, { useState, useEffect } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import AnalysisScreen from './components/AnalysisScreen'
import HospitalListScreen from './components/HospitalListScreen'
import BookingScreen from './components/BookingScreen'
import AppointmentBookingPage from './components/AppointmentBookingPage'
import AppointmentsDashboard from './components/AppointmentsDashboard'
import AmbulanceBookingPage from './components/AmbulanceBookingPage'
import FirebaseTestPage from './components/FirebaseTestPage'
import PatientDashboard from './components/PatientDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import NurseDashboard from './components/NurseDashboard'
import AdminDashboard from './components/AdminDashboard'
import PharmacyDashboard from './components/PharmacyDashboard'
import FamilyDashboard from './components/FamilyDashboard'
import AuthenticatedApp from './components/AuthenticatedApp'
import NavigationBar from './components/NavigationBar'
import ErrorBoundary from './components/ErrorBoundary'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'

export type AppScreen = 'welcome' | 'analysis' | 'hospitals' | 'booking' | 'appointment' | 'dashboard' | 'ambulance' | 'test' | 'patient-dashboard' | 'doctor-dashboard' | 'nurse-dashboard' | 'admin-dashboard' | 'pharmacy-dashboard' | 'family-dashboard'

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
        />
      case 'booking':
        return <BookingScreen onComplete={() => navigateToScreen('ambulance')} />
      case 'appointment':
        return <AppointmentBookingPage onBack={() => navigateToScreen('hospitals')} />
      case 'dashboard':
        return <AppointmentsDashboard />
      case 'ambulance':
        return <AmbulanceBookingPage />
      case 'test':
        return <FirebaseTestPage />
      case 'patient-dashboard':
        return <PatientDashboard />
      case 'doctor-dashboard':
        return <DoctorDashboard />
      case 'nurse-dashboard':
        return <NurseDashboard />
      case 'admin-dashboard':
        return <AdminDashboard />
      case 'pharmacy-dashboard':
        return <PharmacyDashboard />
      case 'family-dashboard':
        return <FamilyDashboard />
      default:
        return <WelcomeScreen onNext={handleWelcomeNext} />
    }
  }

  return (
    <AuthProvider>
      <AppProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <AuthenticatedApp 
              currentScreen={currentScreen} 
              onNavigate={navigateToScreen}
            />
            <NavigationBar 
              currentScreen={currentScreen} 
              onNavigate={navigateToScreen}
            />
            <main className={`pt-16 transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {renderScreen()}
            </main>
            
            {/* Floating particles background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-200 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-green-200 rounded-full animate-bounce opacity-40"></div>
              <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-primary rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
        </ErrorBoundary>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
