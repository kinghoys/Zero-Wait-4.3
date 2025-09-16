import React, { useState, useEffect } from 'react'
import { UserCheck, Clock, CheckCircle, AlertCircle, Pill, Heart, FileText, Users, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDoctorPatients } from '../services/doctorService'
import { createDischargeRequest, DischargeRequest } from '../services/notificationService'

interface DischargeApprovalWidgetProps {
  onClose?: () => void
}

const DischargeApprovalWidget: React.FC<DischargeApprovalWidgetProps> = ({ onClose }) => {
  const { state: authState } = useAuth()
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [dischargeForm, setDischargeForm] = useState({
    dischargeDate: new Date().toISOString().split('T')[0],
    estimatedDischargeTime: '',
    diagnosis: '',
    prescriptions: [''],
    specialInstructions: '',
    requiredPreparations: {
      pharmacy: {
        required: false,
        medications: ['']
      },
      nursing: {
        required: false,
        tasks: ['']
      },
      administration: {
        required: false,
        tasks: ['']
      },
      family: {
        required: false,
        tasks: ['']
      }
    }
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
      // Filter patients who might be ready for discharge (completed appointments)
      setPatients(result.patients)
    }
    setIsLoading(false)
  }

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
    // Reset form when selecting new patient
    setDischargeForm(prev => ({
      ...prev,
      diagnosis: '',
      prescriptions: [''],
      specialInstructions: '',
      requiredPreparations: {
        pharmacy: { required: false, medications: [''] },
        nursing: { required: false, tasks: [''] },
        administration: { required: false, tasks: [''] },
        family: { required: false, tasks: [''] }
      }
    }))
  }

  const handleFormChange = (field: string, value: any) => {
    setDischargeForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePreparationToggle = (department: 'pharmacy' | 'nursing' | 'administration' | 'family') => {
    setDischargeForm(prev => ({
      ...prev,
      requiredPreparations: {
        ...prev.requiredPreparations,
        [department]: {
          ...prev.requiredPreparations[department],
          required: !prev.requiredPreparations[department].required
        }
      }
    }))
  }

  const handleArrayFieldChange = (
    field: 'prescriptions' | 'medications' | 'tasks',
    index: number,
    value: string,
    department?: 'pharmacy' | 'nursing' | 'administration' | 'family'
  ) => {
    if (field === 'prescriptions') {
      setDischargeForm(prev => ({
        ...prev,
        prescriptions: prev.prescriptions.map((item, i) => i === index ? value : item)
      }))
    } else if (department) {
      setDischargeForm(prev => ({
        ...prev,
        requiredPreparations: {
          ...prev.requiredPreparations,
          [department]: {
            ...prev.requiredPreparations[department],
            [field]: prev.requiredPreparations[department][field].map((item, i) => i === index ? value : item)
          }
        }
      }))
    }
  }

  const addArrayField = (
    field: 'prescriptions' | 'medications' | 'tasks',
    department?: 'pharmacy' | 'nursing' | 'administration' | 'family'
  ) => {
    if (field === 'prescriptions') {
      setDischargeForm(prev => ({
        ...prev,
        prescriptions: [...prev.prescriptions, '']
      }))
    } else if (department) {
      setDischargeForm(prev => ({
        ...prev,
        requiredPreparations: {
          ...prev.requiredPreparations,
          [department]: {
            ...prev.requiredPreparations[department],
            [field]: [...prev.requiredPreparations[department][field], '']
          }
        }
      }))
    }
  }

  const removeArrayField = (
    field: 'prescriptions' | 'medications' | 'tasks',
    index: number,
    department?: 'pharmacy' | 'nursing' | 'administration' | 'family'
  ) => {
    if (field === 'prescriptions') {
      setDischargeForm(prev => ({
        ...prev,
        prescriptions: prev.prescriptions.filter((_, i) => i !== index)
      }))
    } else if (department) {
      setDischargeForm(prev => ({
        ...prev,
        requiredPreparations: {
          ...prev.requiredPreparations,
          [department]: {
            ...prev.requiredPreparations[department],
            [field]: prev.requiredPreparations[department][field].filter((_, i) => i !== index)
          }
        }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authState.user || !selectedPatient) return

    setIsSaving(true)
    
    const dischargeData: Omit<DischargeRequest, 'id' | 'createdAt' | 'updatedAt'> = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: authState.user.id,
      doctorName: `Dr. ${authState.user.firstName} ${authState.user.lastName}`,
      dischargeDate: new Date(dischargeForm.dischargeDate),
      estimatedDischargeTime: dischargeForm.estimatedDischargeTime,
      diagnosis: dischargeForm.diagnosis,
      prescriptions: dischargeForm.prescriptions.filter(p => p.trim() !== ''),
      specialInstructions: dischargeForm.specialInstructions,
      requiredPreparations: {
        pharmacy: {
          required: dischargeForm.requiredPreparations.pharmacy.required,
          medications: dischargeForm.requiredPreparations.pharmacy.medications.filter(m => m.trim() !== ''),
          status: 'pending'
        },
        nursing: {
          required: dischargeForm.requiredPreparations.nursing.required,
          tasks: dischargeForm.requiredPreparations.nursing.tasks.filter(t => t.trim() !== ''),
          status: 'pending'
        },
        administration: {
          required: dischargeForm.requiredPreparations.administration.required,
          tasks: dischargeForm.requiredPreparations.administration.tasks.filter(t => t.trim() !== ''),
          status: 'pending'
        },
        family: {
          required: dischargeForm.requiredPreparations.family.required,
          tasks: dischargeForm.requiredPreparations.family.tasks.filter(t => t.trim() !== ''),
          status: 'pending'
        }
      },
      overallStatus: 'pending'
    }

    const result = await createDischargeRequest(dischargeData)
    
    if (result.success) {
      // Reset form and close
      setSelectedPatient(null)
      if (onClose) onClose()
    }
    
    setIsSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserCheck size={24} />
              <div>
                <h2 className="text-xl font-bold">Patient Discharge Approval</h2>
                <p className="text-emerald-100">Approve discharge and coordinate preparation tasks</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="text-white hover:text-gray-200">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Selection */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Select Patient for Discharge</h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading patients...</p>
                  </div>
                ) : patients.length > 0 ? (
                  patients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{patient.name}</div>
                      <div className="text-sm text-gray-500">
                        Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">
                        {patient.totalAppointments} appointments completed
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

            {/* Discharge Form */}
            <div className="lg:col-span-2">
              {selectedPatient ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Discharge Approval for {selectedPatient.name}
                    </h3>
                  </div>

                  {/* Basic Discharge Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discharge Date *
                      </label>
                      <input
                        type="date"
                        value={dischargeForm.dischargeDate}
                        onChange={(e) => handleFormChange('dischargeDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Discharge Time *
                      </label>
                      <input
                        type="time"
                        value={dischargeForm.estimatedDischargeTime}
                        onChange={(e) => handleFormChange('estimatedDischargeTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Final Diagnosis *
                    </label>
                    <input
                      type="text"
                      value={dischargeForm.diagnosis}
                      onChange={(e) => handleFormChange('diagnosis', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      placeholder="Enter final diagnosis"
                      required
                    />
                  </div>

                  {/* Prescriptions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discharge Prescriptions
                    </label>
                    <div className="space-y-2">
                      {dischargeForm.prescriptions.map((prescription, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={prescription}
                            onChange={(e) => handleArrayFieldChange('prescriptions', index, e.target.value)}
                            placeholder="Enter prescription"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                          {dischargeForm.prescriptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField('prescriptions', index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayField('prescriptions')}
                        className="flex items-center space-x-2 px-3 py-2 text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50"
                      >
                        <Pill size={16} />
                        <span>Add Prescription</span>
                      </button>
                    </div>
                  </div>

                  {/* Department Preparations */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">Required Department Preparations</h4>
                    
                    {/* Pharmacy */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Pill className="text-orange-500" size={20} />
                          <span className="font-medium text-gray-700">Pharmacy</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={dischargeForm.requiredPreparations.pharmacy.required}
                          onChange={() => handlePreparationToggle('pharmacy')}
                          className="w-4 h-4 text-emerald-600"
                        />
                      </div>
                      {dischargeForm.requiredPreparations.pharmacy.required && (
                        <div className="space-y-2">
                          {dischargeForm.requiredPreparations.pharmacy.medications.map((medication, index) => (
                            <div key={index} className="flex space-x-2">
                              <input
                                type="text"
                                value={medication}
                                onChange={(e) => handleArrayFieldChange('medications', index, e.target.value, 'pharmacy')}
                                placeholder="Medication to prepare"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                              />
                              {dischargeForm.requiredPreparations.pharmacy.medications.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayField('medications', index, 'pharmacy')}
                                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addArrayField('medications', 'pharmacy')}
                            className="text-sm text-emerald-600 hover:text-emerald-700"
                          >
                            + Add Medication
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nursing */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Heart className="text-pink-500" size={20} />
                          <span className="font-medium text-gray-700">Nursing</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={dischargeForm.requiredPreparations.nursing.required}
                          onChange={() => handlePreparationToggle('nursing')}
                          className="w-4 h-4 text-emerald-600"
                        />
                      </div>
                      {dischargeForm.requiredPreparations.nursing.required && (
                        <div className="space-y-2">
                          {dischargeForm.requiredPreparations.nursing.tasks.map((task, index) => (
                            <div key={index} className="flex space-x-2">
                              <input
                                type="text"
                                value={task}
                                onChange={(e) => handleArrayFieldChange('tasks', index, e.target.value, 'nursing')}
                                placeholder="Nursing task (e.g., remove IV, wound care)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                              />
                              {dischargeForm.requiredPreparations.nursing.tasks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayField('tasks', index, 'nursing')}
                                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addArrayField('tasks', 'nursing')}
                            className="text-sm text-emerald-600 hover:text-emerald-700"
                          >
                            + Add Task
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Administration */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="text-blue-500" size={20} />
                          <span className="font-medium text-gray-700">Administration</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={dischargeForm.requiredPreparations.administration.required}
                          onChange={() => handlePreparationToggle('administration')}
                          className="w-4 h-4 text-emerald-600"
                        />
                      </div>
                      {dischargeForm.requiredPreparations.administration.required && (
                        <div className="space-y-2">
                          {dischargeForm.requiredPreparations.administration.tasks.map((task, index) => (
                            <div key={index} className="flex space-x-2">
                              <input
                                type="text"
                                value={task}
                                onChange={(e) => handleArrayFieldChange('tasks', index, e.target.value, 'administration')}
                                placeholder="Admin task (e.g., billing, insurance, documents)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                              />
                              {dischargeForm.requiredPreparations.administration.tasks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayField('tasks', index, 'administration')}
                                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addArrayField('tasks', 'administration')}
                            className="text-sm text-emerald-600 hover:text-emerald-700"
                          >
                            + Add Task
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Family */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Users className="text-purple-500" size={20} />
                          <span className="font-medium text-gray-700">Family Notification</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={dischargeForm.requiredPreparations.family.required}
                          onChange={() => handlePreparationToggle('family')}
                          className="w-4 h-4 text-emerald-600"
                        />
                      </div>
                      {dischargeForm.requiredPreparations.family.required && (
                        <div className="space-y-2">
                          {dischargeForm.requiredPreparations.family.tasks.map((task, index) => (
                            <div key={index} className="flex space-x-2">
                              <input
                                type="text"
                                value={task}
                                onChange={(e) => handleArrayFieldChange('tasks', index, e.target.value, 'family')}
                                placeholder="Family preparation (e.g., arrange transport, pickup time)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                              />
                              {dischargeForm.requiredPreparations.family.tasks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayField('tasks', index, 'family')}
                                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addArrayField('tasks', 'family')}
                            className="text-sm text-emerald-600 hover:text-emerald-700"
                          >
                            + Add Task
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Discharge Instructions
                    </label>
                    <textarea
                      value={dischargeForm.specialInstructions}
                      onChange={(e) => handleFormChange('specialInstructions', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      placeholder="Any special instructions for discharge preparation"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Send size={20} />
                    <span>{isSaving ? 'Sending Discharge Notifications...' : 'Approve Discharge & Send Notifications'}</span>
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <UserCheck size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>Select a patient to approve for discharge</p>
                    <p className="text-sm">Choose from the patient list on the left</p>
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

export default DischargeApprovalWidget
