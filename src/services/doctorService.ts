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
  deleteDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { Appointment, HealthRecord } from './patientService'

export interface Prescription {
  id?: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
  diagnosis: string
  notes?: string
  createdAt: Date
  isActive: boolean
}

export interface Consultation {
  id?: string
  appointmentId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  chiefComplaint: string
  symptoms: string[]
  vitals?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    height?: number
    oxygenSaturation?: number
  }
  examination: string
  diagnosis: string
  treatmentPlan: string
  followUpDate?: Date
  prescriptions: string[]
  labOrdersRequested?: string[]
  notes: string
  consultationDate: Date
  status: 'in-progress' | 'completed' | 'cancelled'
}

export interface DoctorSchedule {
  id?: string
  doctorId: string
  date: string
  timeSlots: {
    time: string
    isAvailable: boolean
    appointmentId?: string
    patientName?: string
  }[]
  totalSlots: number
  bookedSlots: number
}

// Patient Management
export const getDoctorPatients = async (doctorId: string) => {
  try {
    // Get all appointments for this doctor to find their patients
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      orderBy('date', 'desc')
    )
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery)
    const patientIds = new Set<string>()
    const patientsMap = new Map()
    
    appointmentsSnapshot.forEach((doc) => {
      const appointment = doc.data() as Appointment
      if (!patientIds.has(appointment.patientId)) {
        patientIds.add(appointment.patientId)
        patientsMap.set(appointment.patientId, {
          id: appointment.patientId,
          name: `${appointment.patientName || 'Unknown Patient'}`,
          lastVisit: appointment.date,
          totalAppointments: 1,
          status: appointment.status
        })
      } else {
        const existing = patientsMap.get(appointment.patientId)
        existing.totalAppointments++
        if (new Date(appointment.date) > new Date(existing.lastVisit)) {
          existing.lastVisit = appointment.date
          existing.status = appointment.status
        }
      }
    })

    return { 
      success: true, 
      patients: Array.from(patientsMap.values()) 
    }
  } catch (error: any) {
    console.error('Error fetching doctor patients:', error)
    return { success: false, error: error.message, patients: [] }
  }
}

export const searchPatients = async (doctorId: string, searchTerm: string) => {
  try {
    const patientsResult = await getDoctorPatients(doctorId)
    if (!patientsResult.success) {
      return patientsResult
    }

    const filteredPatients = patientsResult.patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return { success: true, patients: filteredPatients }
  } catch (error: any) {
    console.error('Error searching patients:', error)
    return { success: false, error: error.message, patients: [] }
  }
}

// Appointment Management
export const getDoctorAppointments = async (doctorId: string, date?: string) => {
  try {
    let appointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      orderBy('date', 'asc')
    )

    if (date) {
      appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId),
        where('date', '==', date),
        orderBy('time', 'asc')
      )
    }

    const snapshot = await getDocs(appointmentsQuery)
    const appointments: Appointment[] = []
    
    snapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment)
    })

    return { success: true, appointments }
  } catch (error: any) {
    console.error('Error fetching doctor appointments:', error)
    return { success: false, error: error.message, appointments: [] }
  }
}

export const updateAppointmentByDoctor = async (appointmentId: string, updates: Partial<Appointment>) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId)
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: new Date()
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error updating appointment:', error)
    return { success: false, error: error.message }
  }
}

// Prescription Management
export const createPrescription = async (prescription: Omit<Prescription, 'id' | 'createdAt'>) => {
  try {
    const prescriptionData: Prescription = {
      ...prescription,
      createdAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionData)
    return { success: true, id: docRef.id, prescription: { ...prescriptionData, id: docRef.id } }
  } catch (error: any) {
    console.error('Error creating prescription:', error)
    return { success: false, error: error.message }
  }
}

export const getPatientPrescriptions = async (patientId: string, doctorId?: string) => {
  try {
    let prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    )

    if (doctorId) {
      prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId),
        where('doctorId', '==', doctorId),
        orderBy('createdAt', 'desc')
      )
    }

    const snapshot = await getDocs(prescriptionsQuery)
    const prescriptions: Prescription[] = []
    
    snapshot.forEach((doc) => {
      prescriptions.push({ id: doc.id, ...doc.data() } as Prescription)
    })

    return { success: true, prescriptions }
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error)
    return { success: false, error: error.message, prescriptions: [] }
  }
}

// Medical Records Management
export const getPatientMedicalHistory = async (patientId: string, doctorId?: string) => {
  try {
    // Get health records
    let healthRecordsQuery = query(
      collection(db, 'healthRecords'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    if (doctorId) {
      healthRecordsQuery = query(
        collection(db, 'healthRecords'),
        where('patientId', '==', patientId),
        where('createdBy', '==', doctorId),
        orderBy('createdAt', 'desc')
      )
    }

    // Get appointments
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    )

    // Get prescriptions
    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    )

    const [healthRecordsSnapshot, appointmentsSnapshot, prescriptionsSnapshot] = await Promise.all([
      getDocs(healthRecordsQuery),
      getDocs(appointmentsQuery),
      getDocs(prescriptionsQuery)
    ])

    const healthRecords: HealthRecord[] = []
    const appointments: Appointment[] = []
    const prescriptions: Prescription[] = []

    healthRecordsSnapshot.forEach((doc) => {
      healthRecords.push({ id: doc.id, ...doc.data() } as HealthRecord)
    })

    appointmentsSnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment)
    })

    prescriptionsSnapshot.forEach((doc) => {
      prescriptions.push({ id: doc.id, ...doc.data() } as Prescription)
    })

    return { 
      success: true, 
      medicalHistory: {
        healthRecords,
        appointments,
        prescriptions
      }
    }
  } catch (error: any) {
    console.error('Error fetching patient medical history:', error)
    return { success: false, error: error.message }
  }
}

export const addMedicalRecord = async (record: Omit<HealthRecord, 'id' | 'createdAt'>) => {
  try {
    const healthRecord: HealthRecord = {
      ...record,
      createdAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'healthRecords'), healthRecord)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error('Error adding medical record:', error)
    return { success: false, error: error.message }
  }
}

// Consultation Management
export const createConsultation = async (consultation: Omit<Consultation, 'id' | 'consultationDate'>) => {
  try {
    const consultationData: Consultation = {
      ...consultation,
      consultationDate: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'consultations'), consultationData)
    return { success: true, id: docRef.id, consultation: { ...consultationData, id: docRef.id } }
  } catch (error: any) {
    console.error('Error creating consultation:', error)
    return { success: false, error: error.message }
  }
}

export const updateConsultation = async (consultationId: string, updates: Partial<Consultation>) => {
  try {
    const consultationRef = doc(db, 'consultations', consultationId)
    await updateDoc(consultationRef, updates)
    
    return { success: true }
  } catch (error: any) {
    console.error('Error updating consultation:', error)
    return { success: false, error: error.message }
  }
}

export const getDoctorConsultations = async (doctorId: string, date?: string) => {
  try {
    let consultationsQuery = query(
      collection(db, 'consultations'),
      where('doctorId', '==', doctorId),
      orderBy('consultationDate', 'desc'),
      limit(50)
    )

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      consultationsQuery = query(
        collection(db, 'consultations'),
        where('doctorId', '==', doctorId),
        where('consultationDate', '>=', startDate),
        where('consultationDate', '<', endDate),
        orderBy('consultationDate', 'desc')
      )
    }

    const snapshot = await getDocs(consultationsQuery)
    const consultations: Consultation[] = []
    
    snapshot.forEach((doc) => {
      consultations.push({ id: doc.id, ...doc.data() } as Consultation)
    })

    return { success: true, consultations }
  } catch (error: any) {
    console.error('Error fetching consultations:', error)
    return { success: false, error: error.message, consultations: [] }
  }
}

// Doctor Schedule Management
export const getDoctorSchedule = async (doctorId: string, date: string) => {
  try {
    const scheduleQuery = query(
      collection(db, 'doctorSchedules'),
      where('doctorId', '==', doctorId),
      where('date', '==', date)
    )

    const snapshot = await getDocs(scheduleQuery)
    let schedule: DoctorSchedule | null = null
    
    snapshot.forEach((doc) => {
      schedule = { id: doc.id, ...doc.data() } as DoctorSchedule
    })

    return { success: true, schedule }
  } catch (error: any) {
    console.error('Error fetching doctor schedule:', error)
    return { success: false, error: error.message, schedule: null }
  }
}

export const updateDoctorSchedule = async (scheduleId: string, updates: Partial<DoctorSchedule>) => {
  try {
    const scheduleRef = doc(db, 'doctorSchedules', scheduleId)
    await updateDoc(scheduleRef, updates)
    
    return { success: true }
  } catch (error: any) {
    console.error('Error updating doctor schedule:', error)
    return { success: false, error: error.message }
  }
}
