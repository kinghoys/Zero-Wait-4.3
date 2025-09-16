import React, { useState, useEffect } from 'react'
import { Activity, Search, Plus, Calendar, FileText, Heart, Thermometer, Droplets, Scale, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDoctorPatients, getPatientMedicalHistory, addMedicalRecord } from '../services/doctorService'
import { HealthRecord } from '../services/patientService'

interface MedicalRecordsViewerProps {
  onClose?: () => void
}

const MedicalRecordsViewer: React.FC<MedicalRecordsViewerProps> = ({ onClose }) => {
  const { state: authState } = useAuth()
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view')
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [medicalHistory, setMedicalHistory] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [recordForm, setRecordForm] = useState({
    type: '',
    description: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      oxygenSaturation: ''
    },
    symptoms: [''],
    diagnosis: '',
    treatment: '',
    notes: ''
  })

  useEffect(() => {
    if (authState.user) {
      loadPatients()
    }
  }, [authState.user])

  const loadPatients = async () => {
    if (!authState.user) return
    
    setIsLoading(true)
    const result = await getDoctorPatients(authState.user.id)
    if (result.success) {
      setPatients(result.patients)
    }
    setIsLoading(false)
  }

  const loadMedicalHistory = async (patient: any) => {
    if (!authState.user) return
    
    setIsLoading(true)
    const historyResult = await getPatientMedicalHistory(patient.id, authState.user.id)
    if (historyResult.success) {
      setMedicalHistory(historyResult.medicalHistory)
    }
    setIsLoading(false)
  }

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
    setRecordForm(prev => ({ ...prev, patientId: patient.id }))
    loadMedicalHistory(patient)
  }

  const handleFormChange = (field: string, value: string) => {
    if (field.startsWith('vitals.')) {
      const vitalField = field.split('.')[1]
      setRecordForm(prev => ({
        ...prev,
        vitals: { ...prev.vitals, [vitalField]: value }
      }))
    } else {
      setRecordForm(prev => ({ ...prev, [field]: value }))
    }
  }

  const addSymptom = () => {
    setRecordForm(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, '']
    }))
  }

  const updateSymptom = (index: number, value: string) => {
    setRecordForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.map((symptom, i) => i === index ? value : symptom)
    }))
  }

  const removeSymptom = (index: number) => {
    setRecordForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authState.user || !selectedPatient) return

    setIsSaving(true)
    
    const recordData: Omit<HealthRecord, 'id' | 'createdAt'> = {
      patientId: selectedPatient.id,
      type: recordForm.type,
      description: recordForm.description,
      vitals: recordForm.vitals,
      symptoms: recordForm.symptoms.filter(s => s.trim() !== ''),
      diagnosis: recordForm.diagnosis,
      treatment: recordForm.treatment,
      notes: recordForm.notes,
      createdBy: authState.user.id,
      createdByName: `Dr. ${authState.user.firstName} ${authState.user.lastName}`
    }

    const result = await addMedicalRecord(recordData)
    
    if (result.success) {
      // Reset form
      setRecordForm({
        type: '',
        description: '',
        vitals: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: '',
          oxygenSaturation: ''
        },
        symptoms: [''],
        diagnosis: '',
        treatment: '',
        notes: ''
      })
      // Reload medical history
      loadMedicalHistory(selectedPatient)
      // Switch to view tab
      setActiveTab('view')
    }
    
    setIsSaving(false)
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: any) => {
    if (!date) return 'Unknown'
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity size={24} />
              <div>
                <h2 className="text-xl font-bold">Medical Records</h2>
                <p className="text-purple-100">View and manage patient medical records</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="text-white hover:text-gray-200">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'view'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              View Records
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'add'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Record
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Selection */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Select Patient</h3>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-purple-50 border-purple-200'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{patient.name}</div>
                    <div className="text-sm text-gray-500">
                      Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2">
              {selectedPatient ? (
                activeTab === 'view' ? (
                  // View Records
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Medical Records for {selectedPatient.name}
                    </h3>
                    
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading medical records...</p>
                      </div>
                    ) : medicalHistory ? (
                      <div className="space-y-6">
                        {/* Health Records */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                            <Scale className="text-blue-600" size={16} />
                            Health Records ({medicalHistory.healthRecords.length})
                          </h4>
                          {medicalHistory.healthRecords.length > 0 ? (
                            <div className="space-y-3">
                              {medicalHistory.healthRecords.map((record: HealthRecord) => (
                                <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-semibold text-gray-800">{record.type}</h5>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(record.createdAt)}
                                    </span>
                                  </div>
                                  
                                  {record.description && (
                                    <p className="text-gray-600 mb-2">{record.description}</p>
                                  )}
                                  
                                  {record.vitals && Object.values(record.vitals).some(v => v) && (
                                    <div className="bg-blue-50 p-3 rounded-lg mb-2">
                                      <h6 className="font-medium text-blue-800 mb-2">Vitals</h6>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                        {record.vitals.bloodPressure && (
                                          <div className="flex items-center">
                                            <Heart size={14} className="text-red-500 mr-1" />
                                            BP: {record.vitals.bloodPressure}
                                          </div>
                                        )}
                                        {record.vitals.heartRate && (
                                          <div className="flex items-center">
                                            <Heart size={14} className="text-pink-500 mr-1" />
                                            HR: {record.vitals.heartRate} bpm
                                          </div>
                                        )}
                                        {record.vitals.temperature && (
                                          <div className="flex items-center">
                                            <Thermometer size={14} className="text-orange-500 mr-1" />
                                            Temp: {record.vitals.temperature}°F
                                          </div>
                                        )}
                                        {record.vitals.weight && (
                                          <div className="flex items-center">
                                            <Scale size={14} className="text-green-500 mr-1" />
                                            Weight: {record.vitals.weight} lbs
                                          </div>
                                        )}
                                        {record.vitals.oxygenSaturation && (
                                          <div className="flex items-center">
                                            <Droplets size={14} className="text-blue-500 mr-1" />
                                            O2: {record.vitals.oxygenSaturation}%
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {record.symptoms && record.symptoms.length > 0 && (
                                    <div className="mb-2">
                                      <span className="text-sm font-medium text-gray-700">Symptoms: </span>
                                      <span className="text-sm text-gray-600">{record.symptoms.join(', ')}</span>
                                    </div>
                                  )}
                                  
                                  {record.diagnosis && (
                                    <div className="mb-2">
                                      <span className="text-sm font-medium text-gray-700">Diagnosis: </span>
                                      <span className="text-sm text-gray-600">{record.diagnosis}</span>
                                    </div>
                                  )}
                                  
                                  {record.treatment && (
                                    <div className="mb-2">
                                      <span className="text-sm font-medium text-gray-700">Treatment: </span>
                                      <span className="text-sm text-gray-600">{record.treatment}</span>
                                    </div>
                                  )}
                                  
                                  {record.notes && (
                                    <div className="bg-gray-50 p-2 rounded text-sm text-gray-600">
                                      <span className="font-medium">Notes: </span>{record.notes}
                                    </div>
                                  )}
                                  
                                  {record.createdByName && (
                                    <div className="text-xs text-gray-500 mt-2">
                                      Added by: {record.createdByName}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No health records found</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>Unable to load medical records</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Add Record Form
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Add Medical Record for {selectedPatient.name}
                      </h3>
                    </div>

                    {/* Record Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Record Type *
                      </label>
                      <select
                        value={recordForm.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        required
                      >
                        <option value="">Select record type</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Examination">Physical Examination</option>
                        <option value="Lab Results">Lab Results</option>
                        <option value="Diagnosis">Diagnosis</option>
                        <option value="Treatment">Treatment</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Emergency">Emergency Visit</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={recordForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        placeholder="Brief description of the visit or procedure"
                      />
                    </div>

                    {/* Vitals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Vitals</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Blood Pressure (e.g., 120/80)"
                          value={recordForm.vitals.bloodPressure}
                          onChange={(e) => handleFormChange('vitals.bloodPressure', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <input
                          type="number"
                          placeholder="Heart Rate (bpm)"
                          value={recordForm.vitals.heartRate}
                          onChange={(e) => handleFormChange('vitals.heartRate', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Temperature (°F)"
                          value={recordForm.vitals.temperature}
                          onChange={(e) => handleFormChange('vitals.temperature', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <input
                          type="number"
                          placeholder="Weight (lbs)"
                          value={recordForm.vitals.weight}
                          onChange={(e) => handleFormChange('vitals.weight', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <input
                          type="number"
                          placeholder="Height (inches)"
                          value={recordForm.vitals.height}
                          onChange={(e) => handleFormChange('vitals.height', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <input
                          type="number"
                          placeholder="Oxygen Saturation (%)"
                          value={recordForm.vitals.oxygenSaturation}
                          onChange={(e) => handleFormChange('vitals.oxygenSaturation', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">Symptoms</label>
                        <button
                          type="button"
                          onClick={addSymptom}
                          className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <Plus size={16} />
                          <span>Add Symptom</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recordForm.symptoms.map((symptom, index) => (
                          <div key={index} className="flex space-x-2">
                            <input
                              type="text"
                              value={symptom}
                              onChange={(e) => updateSymptom(index, e.target.value)}
                              placeholder="Enter symptom"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                            />
                            {recordForm.symptoms.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSymptom(index)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diagnosis
                      </label>
                      <input
                        type="text"
                        value={recordForm.diagnosis}
                        onChange={(e) => handleFormChange('diagnosis', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        placeholder="Primary diagnosis or assessment"
                      />
                    </div>

                    {/* Treatment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Treatment Plan
                      </label>
                      <textarea
                        value={recordForm.treatment}
                        onChange={(e) => handleFormChange('treatment', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        placeholder="Treatment plan, medications, recommendations"
                      />
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={recordForm.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        placeholder="Additional observations or notes"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Adding Record...' : 'Add Medical Record'}
                    </button>
                  </form>
                )
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <User size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>Select a patient to {activeTab === 'view' ? 'view their medical records' : 'add a medical record'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalRecordsViewer
