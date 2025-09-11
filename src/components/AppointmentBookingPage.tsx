import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Phone, FileText, MessageCircle, Send, Bot, User, ArrowLeft } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { analyzeSymptoms } from '../services/geminiService'
import { generateChatResponse, getQuickSuggestions } from '../services/chatService'
import HealthChatbot from './HealthChatbot'

interface AppointmentBookingPageProps {
  onBack: () => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  message: string
  timestamp: Date
}

interface AppointmentSlot {
  time: string
  available: boolean
  department: string
  doctor: string
}

const AppointmentBookingPage: React.FC<AppointmentBookingPageProps> = ({ onBack }) => {
  const { state, dispatch } = useAppContext()
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const [bookingStage, setBookingStage] = useState<'selection' | 'confirmation' | 'completed'>('selection')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reports, setReports] = useState<any[]>([])

  // Mock appointment slots
  const appointmentSlots: AppointmentSlot[] = [
    { time: 'Today 2:30 PM', available: true, department: 'General Medicine', doctor: 'Dr. Sharma' },
    { time: 'Today 4:00 PM', available: true, department: 'General Medicine', doctor: 'Dr. Patel' },
    { time: 'Tomorrow 10:00 AM', available: true, department: 'Internal Medicine', doctor: 'Dr. Kumar' },
    { time: 'Tomorrow 2:00 PM', available: false, department: 'General Medicine', doctor: 'Dr. Singh' },
    { time: 'Tomorrow 4:30 PM', available: true, department: 'General Medicine', doctor: 'Dr. Reddy' },
  ]

  // Initialize chat with welcome message
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      message: `Hello! I'm here to help with your appointment at ${state.selectedHospital?.name}. I can answer questions about your symptoms, provide health tips, or help you prepare for your visit. What would you like to know?`,
      timestamp: new Date()
    }
    setChatMessages([initialMessage])

    // Generate initial analysis report
    generateReport()
  }, [state.selectedHospital?.name])

  const generateReport = async () => {
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeSymptoms(state.userInput)
      const mockReports = [
        {
          type: 'Initial Assessment',
          content: `Based on your symptoms: "${state.userInput}", severity level is ${analysis.severity}/10`,
          recommendations: analysis.recommendations,
          timestamp: new Date().toLocaleString()
        },
        {
          type: 'Suggested Tests',
          content: 'Recommended diagnostic tests based on your condition',
          recommendations: [
            'Complete Blood Count (CBC)',
            'Basic Metabolic Panel',
            'Vital signs monitoring'
          ],
          timestamp: new Date().toLocaleString()
        }
      ]
      setReports(mockReports)
    } catch (error) {
      console.error('Report generation error:', error)
    }
    setIsAnalyzing(false)
  }

  const handleSlotSelect = (slot: AppointmentSlot) => {
    if (slot.available) {
      setSelectedSlot(slot)
      setBookingStage('confirmation')
    }
  }

  const confirmBooking = async () => {
    setBookingStage('completed')
    dispatch({ type: 'SET_BOOKING_STATUS', payload: 'success' })
    
    // Add confirmation message to chat
    const confirmMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      message: `Great! Your appointment has been confirmed for ${selectedSlot?.time} with ${selectedSlot?.doctor} in ${selectedSlot?.department}. Appointment ID: APT-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, confirmMessage])
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: chatInput,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, userMessage])

    // Generate bot response
    try {
      const analysis = await analyzeSymptoms(chatInput)
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: `Based on your question: ${analysis.recommendations[0]}. ${analysis.severity > 6 ? 'Please mention this to your doctor during your appointment.' : 'This seems manageable, but discuss with your healthcare provider for personalized advice.'}`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: 'I understand your concern. Please discuss this with your doctor during your appointment for professional medical advice.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    }

    setChatInput('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slide-down">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Hospitals</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>

        {/* Hospital Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{state.selectedHospital?.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>{state.selectedHospital?.distance}km away</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone size={14} />
                  <span>{state.selectedHospital?.phone}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">₹{state.selectedHospital?.cost}</div>
              <div className="text-sm text-gray-500">Consultation Fee</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Booking and Reports */}
          <div className="space-y-6">
            {/* Appointment Booking */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Calendar className="text-blue-500" size={20} />
                <span>Available Appointments</span>
              </h3>

              {bookingStage === 'selection' && (
                <div className="space-y-3">
                  {appointmentSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.available}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                        slot.available 
                          ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover-lift cursor-pointer' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">{slot.time}</div>
                          <div className="text-sm text-gray-600">{slot.doctor} • {slot.department}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          slot.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {slot.available ? 'Available' : 'Booked'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {bookingStage === 'confirmation' && selectedSlot && (
                <div className="space-y-4 animate-scale-in">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Confirm Your Appointment</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="font-medium">{selectedSlot.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Doctor:</span>
                        <span className="font-medium">{selectedSlot.doctor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span className="font-medium">{selectedSlot.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee:</span>
                        <span className="font-medium text-green-600">₹{state.selectedHospital?.cost}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setBookingStage('selection')}
                      className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={confirmBooking}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all button-press"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}

              {bookingStage === 'completed' && (
                <div className="text-center space-y-4 animate-scale-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="text-green-600" size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-2">Appointment Confirmed!</h4>
                    <p className="text-gray-600">You'll receive a confirmation SMS shortly.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reports & Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <FileText className="text-green-500" size={20} />
                <span>Reports & Analysis</span>
              </h3>

              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"></div>
                  <p className="text-gray-600">Generating your health analysis...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800">{report.type}</h4>
                        <span className="text-xs text-gray-500">{report.timestamp}</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{report.content}</p>
                      <div className="space-y-1">
                        {report.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="text-sm text-blue-600 flex items-center space-x-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Health Assistant */}
          <div className="animate-fade-in">
            <HealthChatbot
              variant="full"
              welcomeMessage={`Hello! I'm your Health Assistant for your appointment at ${state.selectedHospital?.name}. I can help answer questions about your symptoms, provide health guidance, and help you prepare for your visit. What would you like to know?`}
              placeholder="Ask about your symptoms, treatment, preparation, or any health concerns..."
              context={{
                userSymptoms: state.userInput,
                selectedHospital: state.selectedHospital,
                appointmentStatus: selectedSlot ? `Scheduled for ${selectedSlot.time} with ${selectedSlot.doctor}` : 'Selecting appointment time'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentBookingPage
