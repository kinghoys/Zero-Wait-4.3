import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, MapPin, Phone, Calendar, Truck, ArrowLeft } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

interface BookingScreenProps {
  onComplete: () => void
}

const BookingScreen: React.FC<BookingScreenProps> = ({ onComplete }) => {
  const { state, dispatch } = useAppContext()
  const [bookingStage, setBookingStage] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState('')

  const isEmergency = state.situation === 'emergency'
  
  const bookingStages = isEmergency ? [
    { icon: Truck, text: "Contacting ambulance service...", color: "text-red-500" },
    { icon: MapPin, text: "Confirming your location...", color: "text-orange-500" },
    { icon: Phone, text: "Notifying hospital...", color: "text-blue-500" },
    { icon: CheckCircle, text: "Ambulance dispatched!", color: "text-green-500" }
  ] : [
    { icon: Calendar, text: "Checking available slots...", color: "text-blue-500" },
    { icon: Phone, text: "Contacting hospital...", color: "text-orange-500" },
    { icon: CheckCircle, text: "Appointment confirmed!", color: "text-green-500" }
  ]

  useEffect(() => {
    const processBooking = async () => {
      dispatch({ type: 'SET_BOOKING_STATUS', payload: 'loading' })

      for (let i = 0; i < bookingStages.length; i++) {
        setBookingStage(i)
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      // Generate estimated time
      if (isEmergency) {
        const eta = Math.round(state.selectedHospital?.distance || 5) * 2 + 8
        setEstimatedTime(`${eta} minutes`)
      } else {
        const appointmentTime = new Date()
        appointmentTime.setHours(appointmentTime.getHours() + 2)
        setEstimatedTime(appointmentTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }))
      }

      dispatch({ type: 'SET_BOOKING_STATUS', payload: 'success' })
    }

    processBooking()
  }, [dispatch, isEmergency, state.selectedHospital, bookingStages.length])

  const currentStage = bookingStages[bookingStage]
  const IconComponent = currentStage?.icon || CheckCircle
  const isComplete = bookingStage >= bookingStages.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4 pt-20">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 ${
          isEmergency ? 'bg-red-100' : 'bg-green-100'
        } rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`}></div>
        <div className={`absolute top-3/4 right-1/4 w-64 h-64 ${
          isEmergency ? 'bg-orange-100' : 'bg-blue-100'
        } rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000`}></div>
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* Hospital Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg animate-slide-down">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {state.selectedHospital?.name}
          </h2>
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
            <MapPin size={16} />
            <span className="text-sm">{state.selectedHospital?.distance}km away</span>
          </div>
          <div className="text-sm text-gray-500">
            {isEmergency ? 'Emergency booking in progress...' : 'Appointment booking in progress...'}
          </div>
        </div>

        {/* Booking Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className={`w-24 h-24 ${
              isEmergency 
                ? 'bg-gradient-to-br from-red-400 to-red-600' 
                : 'bg-gradient-to-br from-green-400 to-green-600'
            } rounded-full flex items-center justify-center shadow-lg ${
              isComplete ? 'animate-bounce-gentle' : 'animate-pulse-slow'
            }`}>
              <IconComponent size={40} className="text-white" />
            </div>
            
            {/* Rotating circles */}
            {!isComplete && (
              <>
                <div className={`absolute inset-0 border-4 ${
                  isEmergency ? 'border-red-200' : 'border-green-200'
                } rounded-full animate-spin opacity-30`}></div>
                <div className={`absolute inset-2 border-2 ${
                  isEmergency ? 'border-orange-200' : 'border-blue-200'
                } rounded-full animate-spin animation-delay-1000 opacity-50`} 
                style={{ animationDirection: 'reverse' }}></div>
              </>
            )}

            {/* Success checkmark animation */}
            {isComplete && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                <CheckCircle size={20} className="text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Booking Progress */}
        <div className="space-y-6">
          <div className={`text-xl font-semibold ${currentStage?.color || 'text-green-600'} animate-fade-in`}>
            {currentStage?.text || 'Booking complete!'}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full ${
                isEmergency 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                  : 'bg-gradient-to-r from-green-500 to-blue-500'
              } rounded-full transition-all duration-1000 ease-out ${
                isComplete ? 'animate-pulse' : ''
              }`}
              style={{ width: `${((bookingStage + 1) / bookingStages.length) * 100}%` }}
            ></div>
          </div>

          {/* Stage indicators */}
          <div className="flex justify-between items-center">
            {bookingStages.map((stage, index) => {
              const StageIcon = stage.icon
              const isActive = index === bookingStage
              const isCompleted = index < bookingStage
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col items-center transition-all duration-500 ${
                    isActive ? 'scale-110' : isCompleted ? 'scale-105' : 'scale-95'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? isEmergency ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      : isActive 
                        ? `${stage.color} bg-white border-2 ${
                            isEmergency ? 'border-red-300' : 'border-green-300'
                          } animate-pulse` 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    <StageIcon size={16} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div className={`animate-scale-in p-6 rounded-xl ${
            isEmergency 
              ? 'bg-red-50 border-2 border-red-200' 
              : 'bg-green-50 border-2 border-green-200'
          }`}>
            <div className="space-y-4">
              <div className={`font-bold text-lg ${
                isEmergency ? 'text-red-700' : 'text-green-700'
              }`}>
                {isEmergency ? '🚑 Ambulance Dispatched!' : '📅 Appointment Confirmed!'}
              </div>
              
              <div className="space-y-2 text-sm">
                {isEmergency ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Arrival:</span>
                      <span className="font-semibold text-red-600">{estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ambulance ID:</span>
                      <span className="font-mono">AMB-{Math.floor(Math.random() * 1000)}</span>
                    </div>
                    <div className="text-red-600 font-medium mt-3">
                      🏥 Stay calm. Help is on the way.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Appointment Time:</span>
                      <span className="font-semibold text-green-600">Today {estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">General Medicine</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Number:</span>
                      <span className="font-mono">RM-{Math.floor(Math.random() * 100)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={onComplete}
                  className={`w-full py-3 px-4 ${
                    isEmergency 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg button-press`}
                >
                  {isEmergency ? 'Track Ambulance' : 'View Appointment Details'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency instructions */}
        {isEmergency && !isComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-fade-in">
            <div className="text-yellow-800 text-sm">
              <strong>While you wait:</strong><br/>
              • Stay calm and keep the patient comfortable<br/>
              • Have ID and insurance ready<br/>
              • Clear path for ambulance access
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingScreen
