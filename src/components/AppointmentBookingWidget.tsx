import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, Phone, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { createAppointment, getPatientAppointments, Appointment } from '../services/patientService'

interface AppointmentBookingWidgetProps {
  onClose?: () => void
  initialSymptoms?: string
}

const AppointmentBookingWidget: React.FC<AppointmentBookingWidgetProps> = ({ onClose, initialSymptoms }) => {
  const { state: authState } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showBookingForm, setShowBookingForm] = useState(false)
  
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: 'General Medicine',
    hospitalName: '',
    date: '',
    time: '',
    symptoms: initialSymptoms || '',
    notes: ''
  })

  const specialties = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Emergency Medicine',
    'Internal Medicine',
    'Family Medicine'
  ]

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ]

  useEffect(() => {
    if (authState.user) {
      loadAppointments()
    }
  }, [authState.user])

  const loadAppointments = async () => {
    if (!authState.user) return
    
    const result = await getPatientAppointments(authState.user.id)
    if (result.success) {
      setAppointments(result.appointments)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authState.user) return

    setIsLoading(true)
    try {
      const appointmentData = {
        patientId: authState.user.id,
        doctorName: formData.doctorName,
        specialty: formData.specialty,
        hospitalName: formData.hospitalName,
        date: formData.date,
        time: formData.time,
        status: 'scheduled' as const,
        symptoms: formData.symptoms,
        notes: formData.notes
      }

      const result = await createAppointment(appointmentData)
      if (result.success) {
        setShowBookingForm(false)
        setFormData({
          doctorName: '',
          specialty: 'General Medicine',
          hospitalName: '',
          date: '',
          time: '',
          symptoms: '',
          notes: ''
        })
        loadAppointments()
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && new Date(apt.date) >= new Date()
  ).slice(0, 3)

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar size={24} />
            <div>
              <h3 className="text-lg font-bold">Appointments</h3>
              <p className="text-green-100 text-sm">Manage your healthcare appointments</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white hover:text-gray-200">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {!showBookingForm ? (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{upcomingAppointments.length}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{appointments.filter(a => a.status === 'completed').length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{appointments.filter(a => a.status === 'scheduled').length}</div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Upcoming Appointments</h4>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800">{appointment.doctorName}</h5>
                          <p className="text-blue-600 text-sm font-medium">{appointment.specialty}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {appointment.date}
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {appointment.time}
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin size={14} className="mr-1 text-gray-400" />
                            <span className="text-sm text-gray-600">{appointment.hospitalName}</span>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No upcoming appointments</p>
                </div>
              )}
            </div>

            {/* Book New Appointment Button */}
            <button
              onClick={() => setShowBookingForm(true)}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              <Calendar size={20} />
              <span>Book New Appointment</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter doctor's name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Describe your symptoms..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Any additional information..."
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={20} />
                    <span>Book Appointment</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AppointmentBookingWidget
