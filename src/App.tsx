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
        return (
          <HospitalListScreen
            onSelect={() => navigateToScreen('booking')}
          />
        )
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
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <AuthenticatedApp 
              currentScreen={currentScreen} 
              onNavigate={navigateToScreen}
            />
            <NavigationBar 
              currentScreen={currentScreen} 
              onNavigate={navigateToScreen}
            />
            <main className="pt-16">
              {renderScreen()}
            </main>
          </div>
        </ErrorBoundary>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
