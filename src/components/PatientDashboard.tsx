import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Calendar, MapPin, Clock, Activity, Phone, User, LogOut, History, AlertCircle, MessageCircle, FileText, Pill, Heart, Upload, Shield } from 'lucide-react'
import HealthChatbot from './HealthChatbot'
import HealthReportGenerator from './HealthReportGenerator'
import AppointmentBookingWidget from './AppointmentBookingWidget'
import MedicationTracker from './MedicationTracker'
import { getPatientAppointments, getPatientHealthRecords, getPatientMedications, Appointment, HealthRecord, MedicationReminder } from '../services/patientService'

const PatientDashboard: React.FC = () => {
  const { state: authState, logout } = useAuth()
  const [activeWidget, setActiveWidget] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<{
    appointments: Appointment[]
    healthRecords: HealthRecord[]
    medications: MedicationReminder[]
    isLoading: boolean
  }>({
    appointments: [],
    healthRecords: [],
    medications: [],
    isLoading: true
  })

  useEffect(() => {
    if (authState.user) {
      loadDashboardData()
    }
  }, [authState.user])

  const loadDashboardData = async () => {
    if (!authState.user) return

    try {
      const [appointmentsResult, healthRecordsResult, medicationsResult] = await Promise.all([
        getPatientAppointments(authState.user.id),
        getPatientHealthRecords(authState.user.id, undefined, 10),
        getPatientMedications(authState.user.id)
      ])

      setDashboardData({
        appointments: appointmentsResult.appointments || [],
        healthRecords: healthRecordsResult.records || [],
        medications: medicationsResult.medications || [],
        isLoading: false
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setDashboardData(prev => ({ ...prev, isLoading: false }))
    }
  }

  const upcomingAppointments = dashboardData.appointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
    .slice(0, 2)

  const recentActivity = [
    ...dashboardData.appointments.slice(0, 2).map(apt => ({
      id: `apt-${apt.id}`,
      action: `Appointment with ${apt.doctorName}`,
      date: apt.date,
      type: 'appointment' as const
    })),
    ...dashboardData.healthRecords.slice(0, 2).map(record => ({
      id: `health-${record.id}`,
      action: `Health record: ${record.type}`,
      date: record.createdAt.toISOString().split('T')[0],
      type: 'health' as const
    }))
  ].slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome back, {authState.user?.firstName}!
                </h1>
                <p className="text-gray-600">Patient Dashboard</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <User size={14} className="mr-1" />
                  Patient ID: {authState.user?.id?.substring(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = 'tel:108'}
                  className="w-full flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
                >
                  <AlertCircle className="text-red-600" size={20} />
                  <span className="text-red-700 font-medium">Emergency Services</span>
                </button>
                <button 
                  onClick={() => setActiveWidget('appointments')}
                  className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                >
                  <Calendar className="text-blue-600" size={20} />
                  <span className="text-blue-700 font-medium">Book Appointment</span>
                </button>
                <button 
                  onClick={() => setActiveWidget('chatbot')}
                  className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors"
                >
                  <MessageCircle className="text-green-600" size={20} />
                  <span className="text-green-700 font-medium">Health Assistant</span>
                </button>
                <button 
                  onClick={() => setActiveWidget('reports')}
                  className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
                >
                  <FileText className="text-purple-600" size={20} />
                  <span className="text-purple-700 font-medium">Health Reports</span>
                </button>
              </div>
            </div>

            {/* Health Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Medications</span>
                  <span className="font-medium text-blue-600">{dashboardData.medications.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Health Records</span>
                  <span className="font-medium text-green-600">{dashboardData.healthRecords.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Appointments</span>
                  <span className="font-medium text-purple-600">{dashboardData.appointments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Emergency Contact</span>
                  <span className="font-medium text-gray-800">{authState.user?.phone || 'Not set'}</span>
                </div>
              </div>

              {/* Health Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setActiveWidget('medications')}
                  className="p-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
                >
                  <Pill className="text-orange-600 mb-1" size={20} />
                  <div className="text-sm font-medium text-orange-700">Medications</div>
                </button>
                <button 
                  onClick={() => setActiveWidget('vitals')}
                  className="p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <Heart className="text-red-600 mb-1" size={20} />
                  <div className="text-sm font-medium text-red-700">Vitals</div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
                <span className="text-sm text-gray-500">{upcomingAppointments.length} scheduled</span>
              </div>
              
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{appointment.doctorName}</h3>
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
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-1" />
                              {appointment.hospitalName}
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Book Appointment
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                <History size={20} className="text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'appointment' ? 'bg-blue-500' :
                      activity.type === 'health' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm">{activity.action}</p>
                      <p className="text-gray-500 text-xs mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && !dashboardData.isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <History size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Widgets */}
        {activeWidget === 'chatbot' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl">
              <HealthChatbot 
                variant="full"
                welcomeMessage="Hi! I'm your personal health assistant. How can I help you today?"
                onSymptomsExtracted={(symptoms) => {
                  console.log('Symptoms extracted:', symptoms)
                }}
              />
              <button
                onClick={() => setActiveWidget(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {activeWidget === 'reports' && (
          <HealthReportGenerator onClose={() => setActiveWidget(null)} />
        )}

        {activeWidget === 'appointments' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-3xl">
              <AppointmentBookingWidget onClose={() => setActiveWidget(null)} />
            </div>
          </div>
        )}

        {activeWidget === 'medications' && (
          <MedicationTracker onClose={() => setActiveWidget(null)} />
        )}
      </div>
    </div>
  )
}

export default PatientDashboard
