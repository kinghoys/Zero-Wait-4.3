import React, { useState, useEffect } from 'react'
import { Users, Search, Eye, Calendar, FileText, Phone, Mail, MapPin, Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDoctorPatients, searchPatients, getPatientMedicalHistory } from '../services/doctorService'

interface PatientListWidgetProps {
  onClose?: () => void
}

interface Patient {
  id: string
  name: string
  lastVisit: string
  totalAppointments: number
  status: string
}

const PatientListWidget: React.FC<PatientListWidgetProps> = ({ onClose }) => {
  const { state: authState } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientHistory, setPatientHistory] = useState<any>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (authState.user) {
      loadPatients()
    }
  }, [authState.user])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  const loadPatients = async () => {
    if (!authState.user) return
    
    setIsLoading(true)
    const result = await getDoctorPatients(authState.user.id)
    if (result.success) {
      setPatients(result.patients)
      setFilteredPatients(result.patients)
    }
    setIsLoading(false)
  }

  const handlePatientSelect = async (patient: Patient) => {
    setSelectedPatient(patient)
    setIsLoadingHistory(true)
    
    const historyResult = await getPatientMedicalHistory(patient.id, authState.user?.id)
    if (historyResult.success) {
      setPatientHistory(historyResult.medicalHistory)
    }
    setIsLoadingHistory(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users size={24} />
              <div>
                <h2 className="text-xl font-bold">Patient Records</h2>
                <p className="text-blue-100">Manage and view your patient information</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="text-white hover:text-gray-200">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Patient List */}
          <div className="w-1/3 border-r border-gray-200 p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Patient Stats */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
                <div className="text-sm text-blue-700">Total Patients</div>
              </div>
            </div>

            {/* Patient List */}
            <div className="space-y-2 overflow-y-auto max-h-96">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading patients...</p>
                </div>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <h4 className="font-medium text-gray-800">{patient.name}</h4>
                    <div className="text-xs text-gray-500 mt-1">
                      <div>Last visit: {formatDate(patient.lastVisit)}</div>
                      <div>{patient.totalAppointments} appointments</div>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${
                        patient.status === 'completed' ? 'bg-green-100 text-green-700' :
                        patient.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No patients found</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedPatient ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedPatient.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Last visit: {formatDate(selectedPatient.lastVisit)}
                    </div>
                    <div className="flex items-center">
                      <Activity size={14} className="mr-1" />
                      {selectedPatient.totalAppointments} appointments
                    </div>
                  </div>
                </div>

                {isLoadingHistory ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading medical history...</p>
                  </div>
                ) : patientHistory ? (
                  <div className="space-y-6">
                    {/* Recent Appointments */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Calendar className="mr-2" size={18} />
                        Recent Appointments
                      </h4>
                      {patientHistory.appointments.length > 0 ? (
                        <div className="space-y-2">
                          {patientHistory.appointments.slice(0, 5).map((appointment: any) => (
                            <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{appointment.type}</div>
                                  <div className="text-sm text-gray-600">{formatDate(appointment.date)} at {appointment.time}</div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No appointments found</p>
                      )}
                    </div>

                    {/* Health Records */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <FileText className="mr-2" size={18} />
                        Recent Health Records
                      </h4>
                      {patientHistory.healthRecords.length > 0 ? (
                        <div className="space-y-2">
                          {patientHistory.healthRecords.slice(0, 3).map((record: any) => (
                            <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium">{record.type}</div>
                              <div className="text-sm text-gray-600 mt-1">{record.description || record.notes}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(record.createdAt?.toDate?.() || record.createdAt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No health records found</p>
                      )}
                    </div>

                    {/* Prescriptions */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <FileText className="mr-2" size={18} />
                        Recent Prescriptions
                      </h4>
                      {patientHistory.prescriptions.length > 0 ? (
                        <div className="space-y-2">
                          {patientHistory.prescriptions.slice(0, 3).map((prescription: any) => (
                            <div key={prescription.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium">{prescription.diagnosis}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {prescription.medications.map((med: any) => med.name).join(', ')}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(prescription.createdAt?.toDate?.() || prescription.createdAt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No prescriptions found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>Unable to load medical history</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Users size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a patient to view their details</p>
                  <p className="text-sm">Choose from the patient list on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientListWidget
