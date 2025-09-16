import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Search, Filter, Plus, Edit3, Check, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDoctorAppointments, updateAppointmentByDoctor } from '../services/doctorService'
import { Appointment } from '../services/patientService'

interface AppointmentManagementWidgetProps {
  onClose?: () => void
}

const AppointmentManagementWidget: React.FC<AppointmentManagementWidgetProps> = ({ onClose }) => {
  const { state: authState } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (authState.user) {
      loadAppointments()
    }
  }, [authState.user, selectedDate])

  useEffect(() => {
    let filtered = appointments

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(apt =>
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchTerm, statusFilter])

  const loadAppointments = async () => {
    if (!authState.user) return
    
    setIsLoading(true)
    const result = await getDoctorAppointments(authState.user.id, selectedDate)
    if (result.success) {
      setAppointments(result.appointments)
    }
    setIsLoading(false)
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    setIsUpdating(true)
    const result = await updateAppointmentByDoctor(appointmentId, { status: newStatus })
    
    if (result.success) {
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      ))
      setSelectedAppointment(null)
    }
    setIsUpdating(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'no-show': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getAppointmentStats = () => {
    const total = appointments.length
    const completed = appointments.filter(apt => apt.status === 'completed').length
    const pending = appointments.filter(apt => apt.status === 'pending').length
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length
    
    return { total, completed, pending, cancelled }
  }

  const stats = getAppointmentStats()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar size={24} />
              <div>
                <h2 className="text-xl font-bold">Appointment Management</h2>
                <p className="text-green-100">Manage your daily appointments and schedule</p>
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
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Date Selector */}
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search patients or appointment type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-red-700">Cancelled</div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-y-auto max-h-96">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        selectedAppointment?.id === appointment.id ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users size={24} className="text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{appointment.patientName}</h4>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock size={12} className="mr-1" />
                              {formatTime(appointment.time)}
                              {appointment.notes && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                  Has Notes
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>

                          {appointment.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(appointment.id!, 'confirmed')}
                                disabled={isUpdating}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Confirm Appointment"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id!, 'cancelled')}
                                disabled={isUpdating}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Cancel Appointment"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}

                          {appointment.status === 'confirmed' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(appointment.id!, 'completed')}
                                disabled={isUpdating}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Mark as Completed"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment.id!, 'no-show')}
                                disabled={isUpdating}
                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                title="Mark as No Show"
                              >
                                <AlertCircle size={16} />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => setSelectedAppointment(
                              selectedAppointment?.id === appointment.id ? null : appointment
                            )}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      {selectedAppointment?.id === appointment.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-gray-800 mb-2">Patient Information</h5>
                              <p className="text-sm text-gray-600">Name: {appointment.patientName}</p>
                              <p className="text-sm text-gray-600">Phone: {appointment.patientPhone || 'Not provided'}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-800 mb-2">Appointment Details</h5>
                              <p className="text-sm text-gray-600">Type: {appointment.type}</p>
                              <p className="text-sm text-gray-600">Time: {formatTime(appointment.time)}</p>
                              <p className="text-sm text-gray-600">Status: {appointment.status}</p>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-3">
                              <h5 className="font-medium text-gray-800 mb-1">Notes</h5>
                              <p className="text-sm text-gray-600">{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No appointments found for the selected date</p>
                  <p className="text-sm">Try selecting a different date or adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentManagementWidget
