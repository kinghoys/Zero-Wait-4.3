import React, { useState, useEffect } from 'react'
import { Pill, Plus, Clock, Calendar, Trash2, Edit3, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getPatientMedications, createMedicationReminder, MedicationReminder } from '../services/patientService'

interface MedicationTrackerProps {
  onClose?: () => void
}

const MedicationTracker: React.FC<MedicationTrackerProps> = ({ onClose }) => {
  const { state: authState } = useAuth()
  const [medications, setMedications] = useState<MedicationReminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    times: [''],
    instructions: ''
  })

  useEffect(() => {
    if (authState.user) {
      loadMedications()
    }
  }, [authState.user])

  const loadMedications = async () => {
    if (!authState.user) return
    
    setIsLoading(true)
    const result = await getPatientMedications(authState.user.id)
    if (result.success) {
      setMedications(result.medications)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authState.user) return

    const reminderData = {
      patientId: authState.user.id,
      medicationName: formData.medicationName,
      dosage: formData.dosage,
      frequency: formData.frequency,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      times: formData.times.filter(time => time.trim() !== ''),
      instructions: formData.instructions,
      isActive: true
    }

    const result = await createMedicationReminder(reminderData)
    if (result.success) {
      setShowAddForm(false)
      setFormData({
        medicationName: '',
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        times: [''],
        instructions: ''
      })
      loadMedications()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '']
    }))
  }

  const updateTimeSlot = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((time, i) => i === index ? value : time)
    }))
  }

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }))
  }

  const getNextDose = (medication: MedicationReminder) => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    for (const time of medication.times) {
      const doseTime = new Date(`${today}T${time}:00`)
      if (doseTime > now) {
        return doseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }
    
    // If no more doses today, show first dose tomorrow
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDate = tomorrow.toISOString().split('T')[0]
    const firstDose = new Date(`${tomorrowDate}T${medication.times[0]}:00`)
    return `Tomorrow at ${firstDose.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Pill size={24} />
              <div>
                <h2 className="text-xl font-bold">Medication Tracker</h2>
                <p className="text-orange-100">Manage your medications and reminders</p>
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
          {!showAddForm ? (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{medications.length}</div>
                  <div className="text-sm text-orange-700">Active Medications</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {medications.reduce((total, med) => total + med.times.length, 0)}
                  </div>
                  <div className="text-sm text-green-700">Daily Doses</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {medications.filter(med => new Date(med.endDate || '9999-12-31') > new Date()).length}
                  </div>
                  <div className="text-sm text-blue-700">Ongoing</div>
                </div>
              </div>

              {/* Medications List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Your Medications</h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Medication</span>
                  </button>
                </div>

                {medications.length > 0 ? (
                  <div className="space-y-4">
                    {medications.map((medication) => (
                      <div key={medication.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{medication.medicationName}</h4>
                            <p className="text-orange-600 text-sm font-medium">{medication.dosage}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {medication.frequency}
                              </div>
                              <div className="flex items-center">
                                <Calendar size={14} className="mr-1" />
                                Started: {new Date(medication.startDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="text-xs text-gray-500 mb-1">Daily Schedule:</div>
                              <div className="flex flex-wrap gap-2">
                                {medication.times.map((time, index) => (
                                  <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs">
                                    {time}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {medication.instructions && (
                              <p className="text-sm text-gray-600 mt-2">{medication.instructions}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Next Dose:</div>
                            <div className="text-sm font-medium text-blue-600">{getNextDose(medication)}</div>
                            <div className="mt-2 space-x-2">
                              <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200">
                                <CheckCircle2 size={12} className="inline mr-1" />
                                Taken
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Pill size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No medications added yet</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Add Your First Medication
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                  <input
                    type="text"
                    name="medicationName"
                    value={formData.medicationName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g., Aspirin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g., 100mg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Times</label>
                  <div className="space-y-2">
                    {formData.times.map((time, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot(index, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                          required
                        />
                        {formData.times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="flex items-center space-x-2 px-3 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50"
                    >
                      <Plus size={16} />
                      <span>Add Time</span>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Special instructions, side effects to watch for, etc."
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                >
                  Add Medication
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicationTracker
