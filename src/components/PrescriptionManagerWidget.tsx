import React, { useState, useEffect } from 'react'
import { FileText, Plus, Search, Calendar, User, Trash2, Edit3, Check, Pill } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { createPrescription, getPatientPrescriptions, getDoctorPatients, Prescription } from '../services/doctorService'

interface PrescriptionManagerWidgetProps {
  onClose?: () => void
}

const PrescriptionManagerWidget: React.FC<PrescriptionManagerWidgetProps> = ({ onClose }) => {
  const { state: authState } = useAuth()
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create')
  const [patients, setPatients] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    patientName: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  })

  useEffect(() => {
    if (authState.user) {
      loadPatients()
      if (activeTab === 'view') {
        loadPrescriptions()
      }
    }
  }, [authState.user, activeTab])

  const loadPatients = async () => {
    if (!authState.user) return
    
    setIsLoading(true)
    const result = await getDoctorPatients(authState.user.id)
    if (result.success) {
      setPatients(result.patients)
    }
    setIsLoading(false)
  }

  const loadPrescriptions = async () => {
    if (!authState.user || !selectedPatient) return
    
    setIsLoading(true)
    const result = await getPatientPrescriptions(selectedPatient.id, authState.user.id)
    if (result.success) {
      setPrescriptions(result.prescriptions)
    }
    setIsLoading(false)
  }

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
    setPrescriptionForm(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name
    }))
    if (activeTab === 'view') {
      loadPrescriptions()
    }
  }

  const addMedication = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }))
  }

  const removeMedication = (index: number) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const updateMedication = (index: number, field: string, value: string) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authState.user || !prescriptionForm.patientId) return

    setIsSaving(true)
    
    const prescriptionData = {
      patientId: prescriptionForm.patientId,
      patientName: prescriptionForm.patientName,
      doctorId: authState.user.id,
      doctorName: `${authState.user.firstName} ${authState.user.lastName}`,
      diagnosis: prescriptionForm.diagnosis,
      medications: prescriptionForm.medications.filter(med => med.name.trim() !== ''),
      notes: prescriptionForm.notes,
      isActive: true
    }

    const result = await createPrescription(prescriptionData)
    
    if (result.success) {
      // Reset form
      setPrescriptionForm({
        patientId: '',
        patientName: '',
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        notes: ''
      })
      setSelectedPatient(null)
      // Switch to view tab to see the created prescription
      setActiveTab('view')
    }
    
    setIsSaving(false)
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText size={24} />
              <div>
                <h2 className="text-xl font-bold">Prescription Manager</h2>
                <p className="text-orange-100">Create and manage patient prescriptions</p>
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
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'create'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Prescription
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'view'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              View Prescriptions
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'create' ? (
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-orange-50 border-orange-200'
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

              {/* Prescription Form */}
              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Prescription for {selectedPatient.name}
                      </h3>
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Diagnosis *
                      </label>
                      <input
                        type="text"
                        value={prescriptionForm.diagnosis}
                        onChange={(e) => setPrescriptionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        placeholder="Enter primary diagnosis"
                        required
                      />
                    </div>

                    {/* Medications */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Medications *
                        </label>
                        <button
                          type="button"
                          onClick={addMedication}
                          className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          <Plus size={16} />
                          <span>Add Medication</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {prescriptionForm.medications.map((medication, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-800">Medication {index + 1}</h4>
                              {prescriptionForm.medications.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeMedication(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Medication name *"
                                value={medication.name}
                                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Dosage (e.g., 100mg)"
                                value={medication.dosage}
                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                              />
                              <select
                                value={medication.frequency}
                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                              >
                                <option value="">Select frequency</option>
                                <option value="Once daily">Once daily</option>
                                <option value="Twice daily">Twice daily</option>
                                <option value="Three times daily">Three times daily</option>
                                <option value="Four times daily">Four times daily</option>
                                <option value="Every 4 hours">Every 4 hours</option>
                                <option value="Every 6 hours">Every 6 hours</option>
                                <option value="Every 8 hours">Every 8 hours</option>
                                <option value="As needed">As needed</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Duration (e.g., 7 days)"
                                value={medication.duration}
                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                              />
                            </div>
                            <textarea
                              placeholder="Special instructions"
                              value={medication.instructions}
                              onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                              rows={2}
                              className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={prescriptionForm.notes}
                        onChange={(e) => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        placeholder="Additional notes, warnings, or instructions"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Creating Prescription...' : 'Create Prescription'}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <User size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>Select a patient to create a prescription</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // View Prescriptions Tab
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Selection for Viewing */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Select Patient</h3>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-orange-50 border-orange-200'
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

              {/* Prescriptions List */}
              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Prescriptions for {selectedPatient.name}
                    </h3>
                    
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading prescriptions...</p>
                      </div>
                    ) : prescriptions.length > 0 ? (
                      <div className="space-y-4">
                        {prescriptions.map((prescription) => (
                          <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-800">{prescription.diagnosis}</h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(prescription.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                Active
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-700">Medications:</h5>
                              {prescription.medications.map((med, index) => (
                                <div key={index} className="pl-4 border-l-2 border-orange-200">
                                  <div className="font-medium">{med.name}</div>
                                  <div className="text-sm text-gray-600">
                                    {med.dosage} - {med.frequency} - {med.duration}
                                  </div>
                                  {med.instructions && (
                                    <div className="text-sm text-gray-500 italic">{med.instructions}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {prescription.notes && (
                              <div className="mt-3 p-2 bg-gray-50 rounded">
                                <div className="text-sm text-gray-600">{prescription.notes}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Pill size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>No prescriptions found for this patient</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <User size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>Select a patient to view their prescriptions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrescriptionManagerWidget
