import { 
  doc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Notification service for emergency alerts, discharge notifications, and confirmations
export interface Notification {
  id?: string
  type: 'success' | 'error' | 'warning' | 'info' | 'emergency' | 'discharge' | 'preparation'
  title: string
  message: string
  timestamp: Date
  duration?: number // Auto-dismiss after milliseconds
  persistent?: boolean // Don't auto-dismiss
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary' | 'danger'
  }>
  // Discharge-specific fields
  targetUserType?: 'pharmacy' | 'nurse' | 'admin' | 'family' | 'all'
  targetUserId?: string
  patientId?: string
  patientName?: string
  dischargeId?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  isRead?: boolean
  completedBy?: string
  completedAt?: Date
}

export interface DischargeRequest {
  id?: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  dischargeDate: Date
  estimatedDischargeTime: string
  diagnosis: string
  prescriptions: string[]
  specialInstructions: string
  requiredPreparations: {
    pharmacy: {
      required: boolean
      medications: string[]
      status: 'pending' | 'in-progress' | 'completed'
      assignedTo?: string
      completedAt?: Date
      notes?: string
    }
    nursing: {
      required: boolean
      tasks: string[]
      status: 'pending' | 'in-progress' | 'completed'
      assignedTo?: string
      completedAt?: Date
      notes?: string
    }
    administration: {
      required: boolean
      tasks: string[]
      status: 'pending' | 'in-progress' | 'completed'
      assignedTo?: string
      completedAt?: Date
      notes?: string
    }
    family: {
      required: boolean
      tasks: string[]
      status: 'pending' | 'in-progress' | 'completed'
      notifiedAt?: Date
      confirmedAt?: Date
    }
  }
  overallStatus: 'pending' | 'in-progress' | 'ready' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

// Browser notification support
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Show browser notification
export const showBrowserNotification = (
  title: string, 
  message: string, 
  options?: {
    icon?: string
    badge?: string
    sound?: boolean
    vibrate?: number[]
  }
) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon: options?.icon || '/favicon.ico',
      badge: options?.badge || '/favicon.ico',
      silent: !options?.sound,
      requireInteraction: true,
      tag: 'zerowait-emergency'
    })

    // Vibrate for mobile devices
    if (options?.vibrate && navigator.vibrate) {
      navigator.vibrate(options.vibrate)
    }

    return notification
  }
  return null
}

// Emergency notification with sound and vibration
export const showEmergencyNotification = (
  title: string,
  message: string,
  actions?: Array<{ label: string; action: () => void }>
) => {
  // Browser notification
  const browserNotification = showBrowserNotification(title, message, {
    sound: true,
    vibrate: [200, 100, 200, 100, 200] // Emergency vibration pattern
  })

  // Create in-app notification
  const notification: Notification = {
    id: `emergency-${Date.now()}`,
    type: 'emergency',
    title,
    message,
    timestamp: new Date(),
    persistent: true,
    actions: actions || []
  }

  return { browserNotification, notification }
}

// Success notification for booking confirmation
export const showBookingConfirmation = (ambulanceId: string, eta: string) => {
  const title = '🚨 Ambulance Dispatched!'
  const message = `Emergency team ${ambulanceId} is on the way. ETA: ${eta}`
  
  return showEmergencyNotification(title, message, [
    {
      label: 'Track Ambulance',
      action: () => {
        // This will be handled by the component
        console.log('Navigate to ambulance tracking')
      }
    },
    {
      label: 'Call Driver',
      action: () => {
        // This will be handled by the component
        console.log('Call ambulance driver')
      }
    }
  ])
}

// Request location with emergency priority
export const requestEmergencyLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    // High accuracy, short timeout for emergency
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000, // 5 seconds max
      maximumAge: 30000 // Accept 30-second old location
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

// Emergency alert sound (using Web Audio API)
export const playEmergencyAlert = () => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Create emergency siren sound
    const createTone = (frequency: number, duration: number, delay: number = 0) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + delay)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + delay)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + duration)
      
      oscillator.start(audioContext.currentTime + delay)
      oscillator.stop(audioContext.currentTime + delay + duration)
    }

    // Emergency siren pattern: alternating high-low tones
    createTone(800, 0.3, 0)     // High tone
    createTone(400, 0.3, 0.3)   // Low tone
    createTone(800, 0.3, 0.6)   // High tone
    
  } catch (error) {
    console.warn('Could not play emergency alert sound:', error)
  }
}

// Format emergency message based on location
export const formatEmergencyMessage = (
  location: GeolocationPosition | null,
  userInput?: string
) => {
  const coords = location?.coords
  const accuracy = coords?.accuracy ? Math.round(coords.accuracy) : 'unknown'
  
  let locationText = 'Location unavailable'
  if (coords) {
    locationText = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)} (±${accuracy}m)`
  }

  return {
    title: '🚨 EMERGENCY REQUEST',
    message: `Emergency assistance requested\n\nLocation: ${locationText}\nIssue: ${userInput || 'Immediate help needed'}\nTime: ${new Date().toLocaleString()}`,
    shortMessage: `Emergency at ${locationText}`
  }
}

// Discharge-related notification functions
export const createDischargeRequest = async (dischargeData: Omit<DischargeRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const request: DischargeRequest = {
      ...dischargeData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'dischargeRequests'), request)
    
    // Send notifications to all required departments
    await sendDischargeNotifications(docRef.id, request)
    
    return { success: true, id: docRef.id, request: { ...request, id: docRef.id } }
  } catch (error: any) {
    console.error('Error creating discharge request:', error)
    return { success: false, error: error.message }
  }
}

export const sendDischargeNotifications = async (dischargeId: string, dischargeRequest: DischargeRequest) => {
  try {
    const notifications: Notification[] = []
    
    // Pharmacy notification
    if (dischargeRequest.requiredPreparations.pharmacy.required) {
      const pharmacyNotification: Notification = {
        type: 'discharge',
        title: '💊 Discharge Medication Preparation',
        message: `Patient ${dischargeRequest.patientName} scheduled for discharge at ${dischargeRequest.estimatedDischargeTime}. Please prepare discharge medications.`,
        timestamp: new Date(),
        targetUserType: 'pharmacy',
        patientId: dischargeRequest.patientId,
        patientName: dischargeRequest.patientName,
        dischargeId: dischargeId,
        priority: 'high',
        isRead: false,
        persistent: true
      }
      notifications.push(pharmacyNotification)
    }
    
    // Nursing notification
    if (dischargeRequest.requiredPreparations.nursing.required) {
      const nursingNotification: Notification = {
        type: 'preparation',
        title: '👩‍⚕️ Patient Discharge Preparation',
        message: `Patient ${dischargeRequest.patientName} scheduled for discharge at ${dischargeRequest.estimatedDischargeTime}. Please complete discharge preparations.`,
        timestamp: new Date(),
        targetUserType: 'nurse',
        patientId: dischargeRequest.patientId,
        patientName: dischargeRequest.patientName,
        dischargeId: dischargeId,
        priority: 'high',
        isRead: false,
        persistent: true
      }
      notifications.push(nursingNotification)
    }
    
    // Administration notification
    if (dischargeRequest.requiredPreparations.administration.required) {
      const adminNotification: Notification = {
        type: 'discharge',
        title: '📋 Discharge Administration Tasks',
        message: `Patient ${dischargeRequest.patientName} scheduled for discharge at ${dischargeRequest.estimatedDischargeTime}. Please complete administrative tasks.`,
        timestamp: new Date(),
        targetUserType: 'admin',
        patientId: dischargeRequest.patientId,
        patientName: dischargeRequest.patientName,
        dischargeId: dischargeId,
        priority: 'medium',
        isRead: false,
        persistent: true
      }
      notifications.push(adminNotification)
    }
    
    // Family notification
    if (dischargeRequest.requiredPreparations.family.required) {
      const familyNotification: Notification = {
        type: 'info',
        title: '👨‍👩‍👧‍👦 Patient Discharge Notification',
        message: `${dischargeRequest.patientName} is scheduled for discharge at ${dischargeRequest.estimatedDischargeTime}. Please prepare for pickup and follow discharge instructions.`,
        timestamp: new Date(),
        targetUserType: 'family',
        patientId: dischargeRequest.patientId,
        patientName: dischargeRequest.patientName,
        dischargeId: dischargeId,
        priority: 'medium',
        isRead: false,
        persistent: true
      }
      notifications.push(familyNotification)
    }
    
    // Save all notifications to Firestore
    const notificationPromises = notifications.map(notification => 
      addDoc(collection(db, 'notifications'), notification)
    )
    
    await Promise.all(notificationPromises)
    
    // Send browser notifications to active users
    notifications.forEach(notification => {
      showBrowserNotification(notification.title, notification.message, {
        sound: true,
        vibrate: [100, 50, 100]
      })
    })
    
    return { success: true, notificationsSent: notifications.length }
  } catch (error: any) {
    console.error('Error sending discharge notifications:', error)
    return { success: false, error: error.message }
  }
}

export const getNotificationsByUser = async (userType: string, userId?: string) => {
  try {
    let notificationsQuery = query(
      collection(db, 'notifications'),
      where('targetUserType', 'in', [userType, 'all']),
      orderBy('timestamp', 'desc')
    )
    
    if (userId) {
      notificationsQuery = query(
        collection(db, 'notifications'),
        where('targetUserId', '==', userId),
        orderBy('timestamp', 'desc')
      )
    }
    
    const snapshot = await getDocs(notificationsQuery)
    const notifications: Notification[] = []
    
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification)
    })
    
    return { success: true, notifications }
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return { success: false, error: error.message, notifications: [] }
  }
}

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, {
      isRead: true,
      completedBy: userId,
      completedAt: new Date()
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return { success: false, error: error.message }
  }
}

export const updateDischargePreparationStatus = async (
  dischargeId: string, 
  department: 'pharmacy' | 'nursing' | 'administration' | 'family',
  status: 'pending' | 'in-progress' | 'completed',
  userId: string,
  notes?: string
) => {
  try {
    const dischargeRef = doc(db, 'dischargeRequests', dischargeId)
    const updateData: any = {
      [`requiredPreparations.${department}.status`]: status,
      [`requiredPreparations.${department}.assignedTo`]: userId,
      updatedAt: new Date()
    }
    
    if (status === 'completed') {
      updateData[`requiredPreparations.${department}.completedAt`] = new Date()
    }
    
    if (notes) {
      updateData[`requiredPreparations.${department}.notes`] = notes
    }
    
    await updateDoc(dischargeRef, updateData)
    
    // Check if all preparations are completed
    await checkDischargeReadiness(dischargeId)
    
    return { success: true }
  } catch (error: any) {
    console.error('Error updating discharge preparation status:', error)
    return { success: false, error: error.message }
  }
}

export const checkDischargeReadiness = async (dischargeId: string) => {
  try {
    // This would check if all required preparations are completed
    // and update the overall discharge status accordingly
    const dischargeRef = doc(db, 'dischargeRequests', dischargeId)
    
    // In a real implementation, you would fetch the document and check all statuses
    // For now, we'll just log that the check is happening
    console.log(`Checking discharge readiness for ${dischargeId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error('Error checking discharge readiness:', error)
    return { success: false, error: error.message }
  }
}
