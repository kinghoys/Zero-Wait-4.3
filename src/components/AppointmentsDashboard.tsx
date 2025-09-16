import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Phone, FileText, Eye, MessageCircle, Filter, Search } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

interface Appointment {
  id: string
  hospitalName: string
  doctorName: string
  department: string
  date: string
  time: string
  status: 'upcoming' | 'completed' | 'cancelled'
  type: 'emergency' | 'normal'
  symptoms: string
  cost: number
  address: string
  phone: string
}

const AppointmentsDashboard: React.FC = () => {
  const { state } = useAppContext()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock appointments data
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: 'APT-001',
        hospitalName: 'Apollo Hospitals',
        doctorName: 'Dr. Sharma',
        department: 'General Medicine',
        date: 'Today',
        time: '2:30 PM',
        status: 'upcoming',
        type: 'normal',
        symptoms: 'Headache and fever',
        cost: 500,
        address: 'Jubilee Hills, Hyderabad',
        phone: '+91-40-2345-6789'
      },
      {
        id: 'APT-002',
        hospitalName: 'KIMS Hospital',
        doctorName: 'Dr. Patel',
        department: 'Cardiology',
        date: 'Yesterday',
        time: '10:00 AM',
        status: 'completed',
        type: 'emergency',
        symptoms: 'Chest pain',
        cost: 1200,
        address: 'Kondapur, Hyderabad',
        phone: '+91-40-3456-7890'
      },
      {
        id: 'APT-003',
        hospitalName: 'Care Hospitals',
        doctorName: 'Dr. Kumar',
        department: 'Orthopedics',
        date: 'Tomorrow',
        time: '11:30 AM',
        status: 'upcoming',
        type: 'normal',
        symptoms: 'Knee pain',
        cost: 800,
        address: 'Banjara Hills, Hyderabad',
        phone: '+91-40-4567-8901'
      }
    ]
    setAppointments(mockAppointments)
  }, [])

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus
    const matchesSearch = appointment.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.department.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h1>
              <p className="text-gray-600">Manage and view all your healthcare appointments</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-xl">
                <span className="text-blue-700 font-semibold">{appointments.length} Total</span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-xl">
                <span className="text-green-700 font-semibold">
                  {appointments.filter(a => a.status === 'upcoming').length} Upcoming
                </span>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search hospitals, doctors, or departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
              >
                <option value="all">All Appointments</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-fade-in">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No appointments found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You haven\'t booked any appointments yet'
                }
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment, index) => (
              <div
                key={appointment.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 animate-slide-up hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Appointment Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{appointment.hospitalName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                        {appointment.type === 'emergency' ? '🚨 Emergency' : '📅 Normal'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar size={16} />
                        <span>{appointment.date} at {appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <FileText size={16} />
                        <span>{appointment.doctorName} • {appointment.department}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin size={16} />
                        <span>{appointment.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-600 font-semibold">
                        <span>₹{appointment.cost}</span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Symptoms: </span>
                      <span className="text-sm text-gray-600">{appointment.symptoms}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 lg:ml-6">
                    {appointment.status === 'upcoming' && (
                      <>
                        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors button-press">
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>
                        <a
                          href={`tel:${appointment.phone}`}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors button-press"
                        >
                          <Phone size={16} />
                          <span>Call Hospital</span>
                        </a>
                        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors button-press">
                          <MessageCircle size={16} />
                          <span>Chat Support</span>
                        </button>
                      </>
                    )}
                    
                    {appointment.status === 'completed' && (
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors button-press">
                        <FileText size={16} />
                        <span>View Report</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Appointment ID */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Appointment ID: {appointment.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors button-press">
              <Calendar size={24} />
              <span className="font-medium">Book New Appointment</span>
            </button>
            <button className="flex items-center justify-center space-x-3 p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors button-press">
              <Phone size={24} />
              <span className="font-medium">Emergency Booking</span>
            </button>
            <button className="flex items-center justify-center space-x-3 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors button-press">
              <MessageCircle size={24} />
              <span className="font-medium">Health Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentsDashboard
