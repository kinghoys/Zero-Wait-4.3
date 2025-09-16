import React, { useState, useEffect } from 'react'
import { MapPin, AlertTriangle, Mic, MessageSquare, Heart, Shield, Stethoscope, Zap, Activity, Plus } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { bookAmbulance } from '../services/ambulanceService'
import { requestNotificationPermission, showBookingConfirmation, requestEmergencyLocation, playEmergencyAlert } from '../services/notificationService'
import VoiceInput from './VoiceInput'
import TextInput from './TextInput'
import HealthChatbot from './HealthChatbot'

interface WelcomeScreenProps {
  onNext: (targetScreen?: 'analysis' | 'ambulance') => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { state, dispatch } = useAppContext()
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [animateTitle, setAnimateTitle] = useState(false)
  const [inputMode, setInputMode] = useState<'voice' | 'text' | 'chat'>('text')
  const [isBookingEmergency, setIsBookingEmergency] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)

  useEffect(() => {
    setAnimateTitle(true)
    // Request location permission with better error handling
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch({
            type: 'SET_LOCATION',
            payload: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          })
        },
        (error) => {
          console.log('Geolocation unavailable, using fallback')
          setShowLocationPrompt(true)
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000
        }
      )
    } else {
      setShowLocationPrompt(true)
    }
  }, [dispatch])

  const handleEmergencyClick = async () => {
    setIsBookingEmergency(true)
    
    try {
      // Play emergency alert sound
      playEmergencyAlert()
      
      // Request notification permission
      await requestNotificationPermission()
      
      // Set emergency situation
      dispatch({ 
        type: 'SET_SITUATION', 
        payload: { situation: 'emergency', severity: 9 } 
      })
      dispatch({ type: 'SET_USER_INPUT', payload: 'Emergency - need immediate help' })
      
      // Get user location with high accuracy for emergency
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            dispatch({ type: 'SET_LOCATION', payload: location })
            
            // Automatically book ambulance after location
            bookAmbulance(
              location,
              'Emergency',
              'Critical condition - immediate help needed',
              'Critical',
              '9'
            )
          },
          (error) => {
            console.error('Location error:', error)
            // Fallback - still book ambulance with approximate location
            const fallbackLocation = { lat: 28.7041, lng: 77.1025 } // Delhi
            dispatch({ type: 'SET_LOCATION', payload: fallbackLocation })
            bookAmbulance(
              fallbackLocation,
              'Emergency',
              'Critical condition - immediate help needed',
              'Critical', 
              '9'
            )
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
      } else {
        // Location not supported fallback
        const fallbackLocation = { lat: 28.7041, lng: 77.1025 }
        dispatch({ type: 'SET_LOCATION', payload: fallbackLocation })
        bookAmbulance(
          fallbackLocation,
          'Emergency',
          'Critical condition - immediate help needed',
          'Critical',
          '9'
        )
      }
      
      // Skip analysis/hospitals - go directly to ambulance tracking
      onNext('ambulance')
    } catch (error) {
      console.error('Emergency booking error:', error)
      onNext('ambulance') // Still proceed to ambulance page
    } finally {
      setIsBookingEmergency(false)
    }
  }

  const handleInputSubmit = (input: string) => {
    if (input.trim()) {
      dispatch({ type: 'SET_USER_INPUT', payload: input.trim() })
      
      // Check for emergency keywords to bypass analysis flow
      const emergencyKeywords = ['emergency', 'urgent', 'critical', 'severe', 'chest pain', 'heart attack', 'stroke', 'bleeding', 'accident', 'unconscious', 'breathing', 'can\'t breathe']
      const isEmergencyCase = emergencyKeywords.some(keyword => 
        input.toLowerCase().includes(keyword)
      )
      
      if (isEmergencyCase) {
        dispatch({ 
          type: 'SET_SITUATION', 
          payload: { situation: 'emergency', severity: 8 } 
        })
        onNext('ambulance') // Emergency: Skip analysis, no login required
      } else {
        // Regular appointment flow - will check for login when booking
        onNext() // Normal flow to analysis
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4 pt-20 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Medical cross pattern */}
        <div className="absolute top-20 right-20 text-blue-100 opacity-20">
          <Plus size={60} className="animate-pulse" />
        </div>
        <div className="absolute bottom-32 left-16 text-emerald-100 opacity-20">
          <Heart size={48} className="animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute top-32 left-32 text-purple-100 opacity-20">
          <Stethoscope size={52} className="animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute bottom-20 right-32 text-red-100 opacity-20">
          <Shield size={44} className="animate-bounce" style={{ animationDelay: '3s' }} />
        </div>
        
        {/* Floating particles */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
        
        {/* Medical grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M30 30h-6v-6h6v6zm0-12h-6v-6h6v6zm12 12h-6v-6h6v6zm0-12h-6v-6h6v6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Enhanced title with healthcare branding */}
        <div className="text-center space-y-6">
          <div className={`transition-all duration-1000 ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Logo and brand section */}
            <div className="relative mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl shadow-lg mb-4 animate-pulse">
                <div className="relative">
                  <Heart className="text-white" size={28} />
                  <div className="absolute -top-1 -right-1">
                    <Zap className="text-yellow-300" size={16} />
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent mb-2">
              ZeroWait
            </h1>
            
            <div className="flex items-center justify-center space-x-2 text-xl text-gray-700 font-semibold animate-typing">
              <Stethoscope className="text-emerald-500" size={24} />
              <span>Emergency Healthcare Assistant</span>
              <Activity className="text-blue-500 animate-pulse" size={24} />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 animate-fade-in animation-delay-1000">
            <p className="text-gray-700 font-medium leading-relaxed">
              <span className="text-emerald-600 font-bold">✨ AI-Powered Healthcare</span><br/>
              Tell me what's happening - I'll help you find the right care instantly
            </p>
          </div>
        </div>

        {/* Enhanced location status */}
        {state.userLocation ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 animate-slide-up shadow-lg">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <MapPin className="text-white" size={16} />
              </div>
              <div className="text-center">
                <span className="text-green-700 font-semibold">📍 Location Active</span>
                <p className="text-green-600 text-xs">Finding nearby hospitals...</p>
              </div>
            </div>
          </div>
        ) : showLocationPrompt ? (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 animate-slide-up shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-bounce">
                <MapPin className="text-white" size={16} />
              </div>
              <div>
                <span className="text-amber-700 font-semibold text-sm">🎯 Location Needed</span>
                <p className="text-amber-600 text-xs">Enable location for personalized care recommendations</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Enhanced emergency button */}
        <div className="relative">
          {/* Pulsing glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur-lg opacity-50 ${!isBookingEmergency ? 'animate-pulse' : ''}`}></div>
          
          <button
            onClick={handleEmergencyClick}
            disabled={isBookingEmergency}
            className={`relative w-full ${
              isBookingEmergency 
                ? 'bg-gradient-to-r from-orange-500 via-red-500 to-red-600' 
                : 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800'
            } text-white p-6 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform ${
              isBookingEmergency ? 'scale-105' : 'hover:scale-105'
            } button-press ${isBookingEmergency ? 'animate-pulse' : ''} disabled:cursor-wait border-2 border-white/20`}
          >
            <div className="flex items-center justify-center space-x-3 mb-2">
              {isBookingEmergency ? (
                <>
                  <div className="animate-spin rounded-full h-7 w-7 border-b-3 border-white"></div>
                  <span className="text-xl">🚨 BOOKING AMBULANCE...</span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <AlertTriangle size={28} className="animate-bounce" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-xl">🚨 EMERGENCY</span>
                  <Heart className="text-red-200 animate-pulse" size={24} />
                </>
              )}
            </div>
            <div className="text-sm font-medium opacity-95 bg-black/20 rounded-lg px-3 py-2">
              {isBookingEmergency 
                ? '⚡ Finding nearest ambulance and dispatching immediately...' 
                : '🏥 For life-threatening situations - immediate ambulance dispatch'
              }
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-2 right-2 opacity-30">
              <Plus size={16} className="text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute bottom-2 left-2 opacity-30">
              <Shield size={16} className="text-white animate-pulse" />
            </div>
          </button>
        </div>

        {/* Enhanced input methods */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/50">
              <Stethoscope className="text-emerald-500" size={20} />
              <span className="text-gray-700 font-semibold">Describe your situation:</span>
              <Heart className="text-red-500 animate-pulse" size={16} />
            </div>
          </div>

          {/* Enhanced Input Mode Selection */}
          <div className="mb-6">
            <div className="flex space-x-2 bg-gradient-to-r from-gray-50 to-white p-2 rounded-2xl shadow-lg border border-gray-200/50">
              <button
                onClick={() => {
                  setInputMode('text')
                  setShowChatbot(false)
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  inputMode === 'text'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <MessageSquare size={20} />
                <span className="font-semibold">💬 Text</span>
              </button>
              <button
                onClick={() => {
                  setInputMode('voice')
                  setShowChatbot(false)
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  inputMode === 'voice'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <Mic size={20} />
                <span className="font-semibold">🎤 Voice</span>
              </button>
              <button
                onClick={() => {
                  setInputMode('chat')
                  setShowChatbot(true)
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  inputMode === 'chat'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <div className="relative">
                  <MessageSquare size={20} />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <span className="font-semibold">🤖 AI Chat</span>
              </button>
            </div>
          </div>

          {/* Input Components */}
          <div className="animate-slide-up animation-delay-1000">
            {inputMode === 'voice' && <VoiceInput onSubmit={handleInputSubmit} />}
            {inputMode === 'text' && <TextInput onSubmit={handleInputSubmit} />}
            {inputMode === 'chat' && (
              <HealthChatbot
                variant="compact"
                welcomeMessage="Hi! I'm your ZeroWait Health Assistant. Describe your symptoms or ask me anything about your health!"
                placeholder="Describe your symptoms or health concerns..."
                context={{
                  userSymptoms: state.userInput,
                  selectedHospital: state.selectedHospital
                }}
                onSymptomsExtracted={handleInputSubmit}
                showProgressButton={true}
              />
            )}
          </div>
        </div>

        {/* Enhanced Quick examples */}
        <div className="space-y-4 animate-slide-up animation-delay-2000">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-4 py-2 shadow-md border border-blue-100">
              <Activity className="text-blue-500" size={16} />
              <span className="text-sm font-semibold text-gray-700">💡 Quick examples:</span>
              <Heart className="text-red-400 animate-pulse" size={14} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { text: "Chest pain", emoji: "💓", color: "from-red-400 to-red-500" },
              { text: "High fever", emoji: "🌡️", color: "from-orange-400 to-orange-500" },
              { text: "Need cardiologist", emoji: "🫀", color: "from-purple-400 to-purple-500" },
              { text: "Accident injury", emoji: "🚑", color: "from-blue-400 to-blue-500" }
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => handleInputSubmit(example.text)}
                className={`group relative px-4 py-3 bg-white hover:bg-gradient-to-r hover:${example.color} border border-gray-200 hover:border-transparent rounded-2xl text-sm font-medium text-gray-700 hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105 transform`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg group-hover:animate-bounce">{example.emoji}</span>
                  <span className="group-hover:font-semibold">{example.text}</span>
                </div>
                
                {/* Decorative sparkle effect */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600">Processing your request...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WelcomeScreen
