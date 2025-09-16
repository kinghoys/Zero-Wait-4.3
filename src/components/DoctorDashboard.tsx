import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Stethoscope, Calendar, Users, FileText, User, Clock, MessageSquare, Search, Plus, Activity, LogOut, UserCheck } from 'lucide-react'
import { getDoctorAppointments, getDoctorPatients, getDoctorConsultations, Consultation } from '../services/doctorService'
import { Appointment } from '../services/patientService'
import PatientListWidget from './PatientListWidget'
import AppointmentManagementWidget from './AppointmentManagementWidget'
import PrescriptionManagerWidget from './PrescriptionManagerWidget'
import MedicalRecordsViewer from './MedicalRecordsViewer'
import DischargeApprovalWidget from './DischargeApprovalWidget'

const DoctorDashboard: React.FC = () => {
  const { state: authState, logout } = useAuth()
  const [activeWidget, setActiveWidget] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<{
    appointments: Appointment[]
    patients: any[]
    consultations: Consultation[]
    todayAppointments: Appointment[]
    isLoading: boolean
  }>({
    appointments: [],
    patients: [],
    consultations: [],
    todayAppointments: [],
    isLoading: true
  })

  useEffect(() => {
    if (authState.user) {
      loadDashboardData()
    }
  }, [authState.user])

  const loadDashboardData = async () => {
    if (!authState.user) return
    
    setDashboardData(prev => ({ ...prev, isLoading: true }))
    
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const [appointmentsResult, patientsResult, consultationsResult, todayAppointmentsResult] = await Promise.all([
        getDoctorAppointments(authState.user.id),
        getDoctorPatients(authState.user.id),
        getDoctorConsultations(authState.user.id),
        getDoctorAppointments(authState.user.id, today)
      ])
      
      setDashboardData({
        appointments: appointmentsResult.success ? appointmentsResult.appointments : [],
        patients: patientsResult.success ? patientsResult.patients : [],
        consultations: consultationsResult.success ? consultationsResult.consultations : [],
        todayAppointments: todayAppointmentsResult.success ? todayAppointmentsResult.appointments : [],
        isLoading: false
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setDashboardData(prev => ({ ...prev, isLoading: false }))
    }
  }

  const patientStats = {
    totalPatients: dashboardData.patients.length,
    todayAppointments: dashboardData.todayAppointments.length,
    pendingReports: dashboardData.consultations.filter(c => c.status === 'in-progress').length,
    emergencyConsults: dashboardData.todayAppointments.filter(apt => apt.appointmentType === 'Emergency').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Stethoscope size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Dr. {authState.user?.firstName} {authState.user?.lastName}
                </h1>
                <p className="text-gray-600">{authState.user?.specialization || 'General Medicine'}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <User size={14} className="mr-1" />
                  License: {authState.user?.licenseNumber || 'Not provided'}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Patients</p>
                <p className="text-2xl font-bold text-gray-800">{patientStats.totalPatients}</p>
              </div>
              <Users className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-800">{patientStats.todayAppointments}</p>
              </div>
              <Calendar className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Reports</p>
                <p className="text-2xl font-bold text-gray-800">{patientStats.pendingReports}</p>
              </div>
              <FileText className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Emergency Consults</p>
                <p className="text-2xl font-bold text-gray-800">{patientStats.emergencyConsults}</p>
              </div>
              <MessageSquare className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Today's Appointments</h2>
              <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
            </div>

            <div className="space-y-4">
              {dashboardData.isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading appointments...</p>
                </div>
              ) : dashboardData.todayAppointments.length > 0 ? (
                dashboardData.todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => setActiveWidget('appointment-details')}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{appointment.patientName}</h3>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Clock size={14} className="mr-1" />
                          {appointment.time}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'urgent' ? 'bg-red-100 text-red-700' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setActiveWidget('appointments')}
                className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors"
              >
                <Calendar className="text-green-600" size={20} />
                <span className="text-green-700 font-medium">Manage Appointments</span>
              </button>
              <button 
                onClick={() => setActiveWidget('patients')}
                className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
              >
                <Users className="text-blue-600" size={20} />
                <span className="text-blue-700 font-medium">Patient Records</span>
              </button>
              <button 
                onClick={() => setActiveWidget('prescriptions')}
                className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors"
              >
                <FileText className="text-orange-600" size={20} />
                <span className="text-orange-700 font-medium">Write Prescription</span>
              </button>
              <button 
                onClick={() => setActiveWidget('records')}
                className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
              >
                <Activity className="text-purple-600" size={20} />
                <span className="text-purple-700 font-medium">Medical Records</span>
              </button>
              <button 
                onClick={() => setActiveWidget('discharge')}
                className="w-full flex items-center space-x-3 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              >
                <UserCheck className="text-emerald-600" size={20} />
                <span className="text-emerald-700 font-medium">Discharge Approval</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Widgets */}
        {activeWidget === 'patients' && (
          <PatientListWidget onClose={() => setActiveWidget(null)} />
        )}
        
        {activeWidget === 'appointments' && (
          <AppointmentManagementWidget onClose={() => setActiveWidget(null)} />
        )}
        
        {activeWidget === 'prescriptions' && (
          <PrescriptionManagerWidget onClose={() => setActiveWidget(null)} />
        )}
        
        {activeWidget === 'records' && (
          <MedicalRecordsViewer onClose={() => setActiveWidget(null)} />
        )}
        
        {activeWidget === 'discharge' && (
          <DischargeApprovalWidget onClose={() => setActiveWidget(null)} />
        )}
      </div>
    </div>
  )
}

export default DoctorDashboard
