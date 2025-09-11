// Notification service for emergency alerts and confirmations
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'emergency'
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
