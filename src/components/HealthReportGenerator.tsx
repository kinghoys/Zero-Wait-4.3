import React, { useState } from 'react'
import { FileText, Download, Calendar, Activity, Pill, User, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { generateHealthReportData, HealthRecord, Appointment, MedicationReminder } from '../services/patientService'

interface ReportData {
  healthRecords: HealthRecord[]
  appointments: Appointment[]
  medications: MedicationReminder[]
  generatedAt: Date
}

interface HealthReportGeneratorProps {
  onClose?: () => void
}

const HealthReportGenerator: React.FC<HealthReportGeneratorProps> = ({ onClose }) => {
  const { state: authState } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [selectedSections, setSelectedSections] = useState({
    personalInfo: true,
    healthRecords: true,
    appointments: true,
    medications: true,
    summary: true
  })

  const generateReport = async () => {
    if (!authState.user) return

    setIsGenerating(true)
    try {
      const result = await generateHealthReportData(authState.user.id)
      if (result.success) {
        setReportData(result.reportData)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = () => {
    if (!reportData || !authState.user) return

    // Create HTML content for PDF
    const htmlContent = generateHTMLReport()
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const generateHTMLReport = (): string => {
    if (!reportData || !authState.user) return ''

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Health Report - ${authState.user.firstName} ${authState.user.lastName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section-title { color: #3B82F6; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
        .record-item { background: #F9FAFB; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #3B82F6; }
        .appointment-item { background: #F0FDF4; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #10B981; }
        .medication-item { background: #FEF3C7; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #F59E0B; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px; }
        @media print { body { margin: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Health Report</h1>
        <h2>${authState.user.firstName} ${authState.user.lastName}</h2>
        <p>Patient ID: ${authState.user.id.substring(0, 8).toUpperCase()}</p>
        <p>Generated on: ${reportData.generatedAt.toLocaleDateString()}</p>
      </div>

      ${selectedSections.personalInfo ? `
      <div class="section">
        <h3 class="section-title">Personal Information</h3>
        <div class="info-grid">
          <div class="info-item"><strong>Name:</strong> <span>${authState.user.firstName} ${authState.user.lastName}</span></div>
          <div class="info-item"><strong>Email:</strong> <span>${authState.user.email}</span></div>
          <div class="info-item"><strong>Phone:</strong> <span>${authState.user.phone || 'Not provided'}</span></div>
          <div class="info-item"><strong>Patient ID:</strong> <span>${authState.user.id.substring(0, 8).toUpperCase()}</span></div>
        </div>
      </div>
      ` : ''}

      ${selectedSections.healthRecords ? `
      <div class="section">
        <h3 class="section-title">Health Records (${reportData.healthRecords.length})</h3>
        ${reportData.healthRecords.length > 0 ? reportData.healthRecords.map(record => `
          <div class="record-item">
            <strong>${record.type.toUpperCase()}</strong> - ${record.createdAt.toLocaleDateString()}
            ${record.data.symptoms ? `<br><strong>Symptoms:</strong> ${record.data.symptoms.join(', ')}` : ''}
            ${record.data.diagnosis ? `<br><strong>Diagnosis:</strong> ${record.data.diagnosis}` : ''}
            ${record.data.notes ? `<br><strong>Notes:</strong> ${record.data.notes}` : ''}
            ${record.data.doctorName ? `<br><strong>Doctor:</strong> ${record.data.doctorName}` : ''}
          </div>
        `).join('') : '<p>No health records found.</p>'}
      </div>
      ` : ''}

      ${selectedSections.appointments ? `
      <div class="section">
        <h3 class="section-title">Appointments (${reportData.appointments.length})</h3>
        ${reportData.appointments.length > 0 ? reportData.appointments.map(appointment => `
          <div class="appointment-item">
            <strong>${appointment.doctorName}</strong> - ${appointment.specialty}
            <br><strong>Date:</strong> ${appointment.date} at ${appointment.time}
            <br><strong>Hospital:</strong> ${appointment.hospitalName}
            <br><strong>Status:</strong> ${appointment.status.toUpperCase()}
            ${appointment.symptoms ? `<br><strong>Symptoms:</strong> ${appointment.symptoms}` : ''}
          </div>
        `).join('') : '<p>No appointments found.</p>'}
      </div>
      ` : ''}

      ${selectedSections.medications ? `
      <div class="section">
        <h3 class="section-title">Current Medications (${reportData.medications.length})</h3>
        ${reportData.medications.length > 0 ? reportData.medications.map(medication => `
          <div class="medication-item">
            <strong>${medication.medicationName}</strong> - ${medication.dosage}
            <br><strong>Frequency:</strong> ${medication.frequency}
            <br><strong>Times:</strong> ${medication.times.join(', ')}
            ${medication.instructions ? `<br><strong>Instructions:</strong> ${medication.instructions}` : ''}
            <br><strong>Start Date:</strong> ${medication.startDate.toLocaleDateString()}
          </div>
        `).join('') : '<p>No active medications found.</p>'}
      </div>
      ` : ''}

      <div class="footer">
        <p>This report was generated by ZeroWait Emergency Healthcare System</p>
        <p>For medical emergencies, call 108 immediately</p>
      </div>
    </body>
    </html>
    `
  }

  const toggleSection = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText size={24} />
              <div>
                <h2 className="text-xl font-bold">Health Report Generator</h2>
                <p className="text-blue-100">Generate comprehensive health reports</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!reportData ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Report Sections</h3>
                <div className="space-y-3">
                  {Object.entries(selectedSections).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => toggleSection(key as keyof typeof selectedSections)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-green-700">
                  <FileText size={20} />
                  <span className="font-semibold">Report Generated Successfully!</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Generated on {reportData.generatedAt.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{reportData.healthRecords.length}</div>
                  <div className="text-sm text-blue-700">Health Records</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{reportData.appointments.length}</div>
                  <div className="text-sm text-green-700">Appointments</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <Pill className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{reportData.medications.length}</div>
                  <div className="text-sm text-yellow-700">Medications</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">1</div>
                  <div className="text-sm text-purple-700">Patient</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={downloadPDF}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                >
                  <Download size={20} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setReportData(null)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Generate New
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HealthReportGenerator
