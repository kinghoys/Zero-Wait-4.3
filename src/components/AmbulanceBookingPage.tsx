import React, { useState, useEffect } from 'react'
import { Truck, MapPin, Clock, Phone, Navigation, AlertTriangle, CheckCircle, User, ExternalLink } from 'lucide-react'
import { useAppContext, AmbulanceBooking } from '../context/AppContext'
import { simulateAmbulanceProgress, getRealTimeETA, getPatientCareInstructions } from '../services/ambulanceService'

const AmbulanceBookingPage: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [patientInstructions, setPatientInstructions] = useState<string[]>([])
  const [realTimeETA, setRealTimeETA] = useState<string>('')
  const [isTracking, setIsTracking] = useState(false)

  // Initialize ambulance booking if not exists
  useEffect(() => {
    if (!state.ambulanceBooking) {
      const newBooking: AmbulanceBooking = {
        id: `AMB-${Date.now().toString().slice(-6)}`,
        status: 'dispatched',
        hospitalName: state.selectedHospital?.name || 'Apollo Hospitals',
        ambulanceId: 'AP-AMB-247',
        driverName: 'Ramesh Kumar',
        driverPhone: '+91-98765-43210',
        estimatedArrival: 8,
        pickupLocation: 'Current Location',
        destination: state.selectedHospital?.address || 'Jubilee Hills, Hyderabad',
        emergencyType: state.userInput || 'Emergency situation',
        patientCondition: 'Stable, conscious',
        cost: 800,
        bookingTime: new Date()
      }
      dispatch({ type: 'SET_AMBULANCE_BOOKING', payload: newBooking })
      
      // Get patient care instructions
      const instructions = getPatientCareInstructions(newBooking.emergencyType)
      setPatientInstructions(instructions)
    }
  }, [state.ambulanceBooking, state.selectedHospital, state.userInput, dispatch])

  // Update real-time ETA and time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      if (state.ambulanceBooking) {
        setRealTimeETA(getRealTimeETA(state.ambulanceBooking))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [state.ambulanceBooking])

  // Simulate ambulance progress
  useEffect(() => {
    if (state.ambulanceBooking && state.ambulanceBooking.status === 'dispatched') {
      const cleanup = simulateAmbulanceProgress(
        state.ambulanceBooking,
        (newStatus) => {
          dispatch({ type: 'UPDATE_AMBULANCE_STATUS', payload: newStatus })
        }
      )
      return cleanup
    }
  }, [state.ambulanceBooking, dispatch])

  // Handle call driver functionality
  const handleCallDriver = () => {
    if (state.ambulanceBooking) {
      // Try to make the call
      window.location.href = `tel:${state.ambulanceBooking.driverPhone}`
      
      // Show confirmation
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Calling Driver', {
          body: `Connecting to ${state.ambulanceBooking.driverName}...`,
          icon: '/favicon.ico'
        })
      }
    }
  }

  // Handle live tracking functionality
  const handleTrackLive = () => {
    if (!state.ambulanceBooking) return
    
    setIsTracking(true)
    
    // Generate mock coordinates for ambulance (simulate movement)
    const baseLocation = state.userLocation || { lat: 17.385044, lng: 78.486671 }
    const ambulanceLocation = {
      lat: baseLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: baseLocation.lng + (Math.random() - 0.5) * 0.01
    }
    
    // Open Google Maps with live tracking simulation
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${ambulanceLocation.lat},${ambulanceLocation.lng}&zoom=16`
    
    // Try to open in new window/tab
    const trackingWindow = window.open(mapsUrl, '_blank', 'width=800,height=600')
    
    if (trackingWindow) {
      // Show tracking confirmation
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚑 Live Tracking Active', {
          body: `Tracking ${state.ambulanceBooking.ambulanceId} in real-time`,
          icon: '/favicon.ico'
        })
      }
      
      // Simulate tracking updates
      const trackingInterval = setInterval(() => {
        if (trackingWindow.closed) {
          clearInterval(trackingInterval)
          setIsTracking(false)
          return
        }
        
        // Update location every 10 seconds (simulation)
        const newLat = ambulanceLocation.lat + (Math.random() - 0.5) * 0.001
        const newLng = ambulanceLocation.lng + (Math.random() - 0.5) * 0.001
        ambulanceLocation.lat = newLat
        ambulanceLocation.lng = newLng
        
        // Update the map URL (simulated)
        console.log(`Ambulance location updated: ${newLat}, ${newLng}`)
      }, 10000)
      
      // Auto-stop tracking after 5 minutes
      setTimeout(() => {
        clearInterval(trackingInterval)
        setIsTracking(false)
      }, 300000)
    } else {
      // Fallback: copy coordinates to clipboard
      const coordinates = `${ambulanceLocation.lat}, ${ambulanceLocation.lng}`
      navigator.clipboard.writeText(coordinates).then(() => {
        alert(`Live tracking coordinates copied to clipboard:\n${coordinates}\n\nPaste into Google Maps for tracking.`)
      }).catch(() => {
        alert(`Ambulance live location:\nLatitude: ${ambulanceLocation.lat}\nLongitude: ${ambulanceLocation.lng}\n\nCopy these coordinates into Google Maps.`)
      })
    }
    
    setTimeout(() => setIsTracking(false), 3000)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'dispatched':
        return {
          icon: Truck,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          message: 'Ambulance has been dispatched',
          description: 'Emergency team is preparing and will depart shortly'
        }
      case 'en_route':
        return {
          icon: Navigation,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          message: 'Ambulance is on the way',
          description: 'Emergency team is traveling to your location'
        }
      case 'arrived':
        return {
          icon: MapPin,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          message: 'Ambulance has arrived',
          description: 'Emergency team is at your location'
        }
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          message: 'Transport completed',
          description: 'Patient safely transported to hospital'
        }
      default:
        return {
          icon: Truck,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          message: 'Processing request',
          description: 'Please wait while we process your emergency request'
        }
    }
  }

  if (!state.ambulanceBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emergency booking details...</p>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(state.ambulanceBooking.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Emergency Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-700">Emergency Ambulance</h1>
                <p className="text-red-600">Booking ID: {state.ambulanceBooking.id}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">{currentTime.toLocaleTimeString()}</div>
              <div className="font-semibold text-gray-800">{currentTime.toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-scale-in">
          <div className={`${statusInfo.bgColor} rounded-xl p-6`}>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <StatusIcon className={statusInfo.color} size={32} />
              </div>
            </div>
            <div className="text-center">
              <h2 className={`text-xl font-bold ${statusInfo.color} mb-2`}>
                {statusInfo.message}
              </h2>
              <p className="text-gray-700 mb-4">{statusInfo.description}</p>
              
              {(state.ambulanceBooking.status === 'en_route' || state.ambulanceBooking.status === 'dispatched') && (
                <div className="bg-white rounded-lg p-4 inline-block">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-blue-600" size={20} />
                    <span className="text-lg font-bold text-blue-600">
                      ETA: {realTimeETA || `${state.ambulanceBooking.estimatedArrival} minutes`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ambulance Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Truck className="text-blue-600" size={20} />
              <span>Ambulance Details</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Ambulance ID</span>
                <span className="font-semibold text-blue-700">{state.ambulanceBooking.ambulanceId}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Driver Name</span>
                <span className="font-semibold">{state.ambulanceBooking.driverName}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Driver Contact</span>
                <a 
                  href={`tel:${state.ambulanceBooking.driverPhone}`}
                  className="font-semibold text-green-600 hover:text-green-700"
                >
                  {state.ambulanceBooking.driverPhone}
                </a>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Service Cost</span>
                <span className="font-semibold text-green-600">₹{state.ambulanceBooking.cost}</span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleCallDriver}
                className="flex items-center justify-center space-x-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors button-press"
              >
                <Phone size={18} />
                <span>Call Driver</span>
              </button>
              <button 
                onClick={handleTrackLive}
                disabled={isTracking}
                className={`flex items-center justify-center space-x-2 p-3 ${
                  isTracking 
                    ? 'bg-orange-500 cursor-wait' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-xl font-medium transition-colors button-press`}
              >
                {isTracking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <MapPin size={18} />
                    <span>Track Live</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Emergency Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up animation-delay-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <AlertTriangle className="text-red-600" size={20} />
              <span>Emergency Details</span>
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-700 block mb-1">Emergency Type</span>
                <span className="text-gray-800">{state.ambulanceBooking.emergencyType}</span>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-1">Patient Condition</span>
                <span className="text-gray-800">{state.ambulanceBooking.patientCondition}</span>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-1">Pickup Location</span>
                <span className="text-gray-800">{state.ambulanceBooking.pickupLocation}</span>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-1">Destination</span>
                <span className="text-gray-800">{state.ambulanceBooking.destination}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Emergency Timeline</h3>
          
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {[
              { step: 'Request Received', time: '2 mins ago', status: 'completed', icon: CheckCircle },
              { step: 'Ambulance Dispatched', time: '1 min ago', status: 'completed', icon: Truck },
              { step: 'En Route to Location', time: 'Now', status: 'active', icon: Navigation },
              { step: 'Arrival at Location', time: `In ${realTimeETA || `${state.ambulanceBooking.estimatedArrival} minutes`}`, status: 'pending', icon: MapPin },
              { step: 'Transport to Hospital', time: 'Pending', status: 'pending', icon: AlertTriangle }
            ].map((item, index) => (
              <div key={index} className="relative flex items-center mb-6 last:mb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.status === 'completed' ? 'bg-green-500 text-white' :
                  item.status === 'active' ? 'bg-blue-500 text-white animate-pulse' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  <item.icon size={16} />
                </div>
                <div className="ml-6">
                  <div className={`font-medium ${
                    item.status === 'active' ? 'text-blue-700' : 'text-gray-800'
                  }`}>
                    {item.step}
                  </div>
                  <div className="text-sm text-gray-600">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">While You Wait</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              {patientInstructions.slice(0, Math.ceil(patientInstructions.length / 2)).map((instruction, index) => (
                <p key={index} className="text-yellow-700">• {instruction}</p>
              ))}
            </div>
            <div className="space-y-2">
              {patientInstructions.slice(Math.ceil(patientInstructions.length / 2)).map((instruction, index) => (
                <p key={index} className="text-yellow-700">• {instruction}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AmbulanceBookingPage
