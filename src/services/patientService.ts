import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../config/firebase'

export interface HealthRecord {
  id?: string
  patientId: string
  type: 'vitals' | 'symptoms' | 'diagnosis' | 'prescription' | 'lab_result' | 'visit'
  data: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    height?: number
    symptoms?: string[]
    diagnosis?: string
    medications?: string[]
    notes?: string
    doctorName?: string
    hospitalName?: string
    labResults?: any
  }
  createdAt: Date
  createdBy?: string
}

export interface Appointment {
  id?: string
  patientId: string
  doctorId?: string
  doctorName: string
  specialty: string
  hospitalName: string
  hospitalId?: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  symptoms?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MedicationReminder {
  id?: string
  patientId: string
  medicationName: string
  dosage: string
  frequency: string // e.g., "twice daily", "every 8 hours"
  startDate: Date
  endDate?: Date
  times: string[] // e.g., ["08:00", "20:00"]
  instructions?: string
  isActive: boolean
  createdAt: Date
}

export interface ChatHistory {
  id?: string
  patientId: string
  messages: {
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
    type?: 'general' | 'medical' | 'appointment' | 'emergency'
  }[]
  extractedSymptoms?: string
  recommendations?: string[]
  createdAt: Date
  updatedAt: Date
}

// Health Records
export const saveHealthRecord = async (record: Omit<HealthRecord, 'id' | 'createdAt'>) => {
  try {
    const healthRecord: HealthRecord = {
      ...record,
      createdAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'healthRecords'), healthRecord)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error('Error saving health record:', error)
    return { success: false, error: error.message }
  }
}

export const getPatientHealthRecords = async (patientId: string, recordType?: string, limitCount: number = 50) => {
  try {
    let q = query(
      collection(db, 'healthRecords'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    if (recordType) {
      q = query(
        collection(db, 'healthRecords'),
        where('patientId', '==', patientId),
        where('type', '==', recordType),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    }

    const snapshot = await getDocs(q)
    const records: HealthRecord[] = []
    
    snapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as HealthRecord)
    })

    return { success: true, records }
  } catch (error: any) {
    console.error('Error fetching health records:', error)
    return { success: false, error: error.message, records: [] }
  }
}

// Appointments
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const appointmentData: Appointment = {
      ...appointment,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'appointments'), appointmentData)
    return { success: true, id: docRef.id, appointment: { ...appointmentData, id: docRef.id } }
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    return { success: false, error: error.message }
  }
}

export const getPatientAppointments = async (patientId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('date', 'asc')
    )

    const snapshot = await getDocs(q)
    const appointments: Appointment[] = []
    
    snapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment)
    })

    return { success: true, appointments }
  } catch (error: any) {
    console.error('Error fetching appointments:', error)
    return { success: false, error: error.message, appointments: [] }
  }
}

export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status'], notes?: string) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId)
    await updateDoc(appointmentRef, {
      status,
      notes: notes || '',
      updatedAt: new Date()
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error updating appointment:', error)
    return { success: false, error: error.message }
  }
}

// Medication Reminders
export const createMedicationReminder = async (reminder: Omit<MedicationReminder, 'id' | 'createdAt'>) => {
  try {
    const reminderData: MedicationReminder = {
      ...reminder,
      createdAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'medicationReminders'), reminderData)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error('Error creating medication reminder:', error)
    return { success: false, error: error.message }
  }
}

export const getPatientMedications = async (patientId: string) => {
  try {
    const q = query(
      collection(db, 'medicationReminders'),
      where('patientId', '==', patientId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    const medications: MedicationReminder[] = []
    
    snapshot.forEach((doc) => {
      medications.push({ id: doc.id, ...doc.data() } as MedicationReminder)
    })

    return { success: true, medications }
  } catch (error: any) {
    console.error('Error fetching medications:', error)
    return { success: false, error: error.message, medications: [] }
  }
}

// Chat History
export const saveChatHistory = async (chatData: Omit<ChatHistory, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const chatHistory: ChatHistory = {
      ...chatData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'chatHistory'), chatHistory)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error('Error saving chat history:', error)
    return { success: false, error: error.message }
  }
}

export const getPatientChatHistory = async (patientId: string) => {
  try {
    const q = query(
      collection(db, 'chatHistory'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc'),
      limit(10)
    )

    const snapshot = await getDocs(q)
    const chatSessions: ChatHistory[] = []
    
    snapshot.forEach((doc) => {
      chatSessions.push({ id: doc.id, ...doc.data() } as ChatHistory)
    })

    return { success: true, chatSessions }
  } catch (error: any) {
    console.error('Error fetching chat history:', error)
    return { success: false, error: error.message, chatSessions: [] }
  }
}

// Generate Health Report Data
export const generateHealthReportData = async (patientId: string) => {
  try {
    const [healthRecordsResult, appointmentsResult, medicationsResult] = await Promise.all([
      getPatientHealthRecords(patientId),
      getPatientAppointments(patientId),
      getPatientMedications(patientId)
    ])

    return {
      success: true,
      reportData: {
        healthRecords: healthRecordsResult.records || [],
        appointments: appointmentsResult.appointments || [],
        medications: medicationsResult.medications || [],
        generatedAt: new Date()
      }
    }
  } catch (error: any) {
    console.error('Error generating health report data:', error)
    return { success: false, error: error.message }
  }
}
