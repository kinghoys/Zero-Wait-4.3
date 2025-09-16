import { AmbulanceBooking } from '../context/AppContext'

// Mock ambulance data
const mockAmbulances = [
  {
    id: 'AP-AMB-247',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91-98765-43210',
    location: { lat: 17.385044, lng: 78.486671 }
  },
  {
    id: 'KH-AMB-156',
    driverName: 'Suresh Reddy',
    driverPhone: '+91-98765-43211',
    location: { lat: 17.395044, lng: 78.496671 }
  },
  {
    id: 'CR-AMB-089',
    driverName: 'Vijay Singh',
    driverPhone: '+91-98765-43212',
    location: { lat: 17.375044, lng: 78.476671 }
  }
]

// Calculate distance between two coordinates (simplified)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Book ambulance service
export const bookAmbulance = async (
  userLocation: { lat: number; lng: number } | null,
  hospitalName: string,
  hospitalAddress: string,
  emergencyType: string,
  patientCondition: string = 'Stable, conscious'
): Promise<AmbulanceBooking> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Find nearest ambulance
  const defaultLocation = { lat: 17.385044, lng: 78.486671 } // Default to Hyderabad center
  const userCoords = userLocation || defaultLocation
  
  let nearestAmbulance = mockAmbulances[0]
  let minDistance = Infinity

  mockAmbulances.forEach(ambulance => {
    const distance = calculateDistance(
      userCoords.lat, 
      userCoords.lng, 
      ambulance.location.lat, 
      ambulance.location.lng
    )
    if (distance < minDistance) {
      minDistance = distance
      nearestAmbulance = ambulance
    }
  })

  // Calculate estimated arrival time (assuming 30 km/h average speed in city)
  const estimatedArrival = Math.max(5, Math.round(minDistance / 0.5)) // minimum 5 minutes

  // Generate booking
  const booking: AmbulanceBooking = {
    id: `AMB-${Date.now().toString().slice(-6)}`,
    status: 'dispatched',
    hospitalName,
    ambulanceId: nearestAmbulance.id,
    driverName: nearestAmbulance.driverName,
    driverPhone: nearestAmbulance.driverPhone,
    estimatedArrival,
    pickupLocation: userLocation ? 'Current Location' : 'Default Location',
    destination: hospitalAddress,
    emergencyType,
    patientCondition,
    cost: Math.round(minDistance * 15 + 500), // Base cost + distance
    bookingTime: new Date()
  }

  return booking
}

// Simulate ambulance status progression
export const simulateAmbulanceProgress = (
  booking: AmbulanceBooking,
  onStatusUpdate: (status: AmbulanceBooking['status']) => void
) => {
  const statusProgression: AmbulanceBooking['status'][] = ['dispatched', 'en_route', 'arrived', 'completed']
  let currentIndex = statusProgression.indexOf(booking.status)
  
  const progressInterval = setInterval(() => {
    currentIndex++
    if (currentIndex < statusProgression.length) {
      const newStatus = statusProgression[currentIndex]
      onStatusUpdate(newStatus)
      
      // Stop at 'arrived' for demonstration
      if (newStatus === 'arrived') {
        clearInterval(progressInterval)
      }
    } else {
      clearInterval(progressInterval)
    }
  }, getIntervalForStatus(currentIndex))

  return () => clearInterval(progressInterval)
}

// Get interval based on current status
const getIntervalForStatus = (statusIndex: number): number => {
  switch (statusIndex) {
    case 0: return 8000  // dispatched -> en_route (8 seconds)
    case 1: return 12000 // en_route -> arrived (12 seconds)
    case 2: return 20000 // arrived -> completed (20 seconds)
    default: return 5000
  }
}

// Get real-time ETA based on current status and booking time
export const getRealTimeETA = (booking: AmbulanceBooking): string => {
  const now = new Date()
  const bookingTime = new Date(booking.bookingTime)
  const elapsedMinutes = Math.floor((now.getTime() - bookingTime.getTime()) / (1000 * 60))
  
  switch (booking.status) {
    case 'dispatched':
      return `${Math.max(1, booking.estimatedArrival - elapsedMinutes)} minutes`
    case 'en_route':
      return `${Math.max(1, Math.floor(booking.estimatedArrival * 0.6) - elapsedMinutes)} minutes`
    case 'arrived':
      return 'Arrived'
    case 'completed':
      return 'Completed'
    default:
      return `${booking.estimatedArrival} minutes`
  }
}

// Get patient care instructions based on emergency type
export const getPatientCareInstructions = (emergencyType: string): string[] => {
  const commonInstructions = [
    'Stay calm and keep patient comfortable',
    'Have ID and insurance documents ready',
    'Clear path for ambulance access',
    'Stay near phone for driver contact'
  ]

  const specificInstructions: { [key: string]: string[] } = {
    'chest pain': [
      'Help patient sit up and rest',
      'Loosen tight clothing',
      'If prescribed, assist with nitroglycerin'
    ],
    'breathing': [
      'Keep patient in upright position',
      'Ensure fresh air circulation',
      'Stay calm to help patient breathe easier'
    ],
    'injury': [
      'Do not move patient unless necessary',
      'Apply gentle pressure to bleeding wounds',
      'Keep injured area elevated if possible'
    ],
    'fever': [
      'Keep patient cool and hydrated',
      'Remove excess clothing',
      'Monitor temperature regularly'
    ]
  }

  const typeKey = Object.keys(specificInstructions).find(key => 
    emergencyType.toLowerCase().includes(key)
  )

  return typeKey 
    ? [...commonInstructions, ...specificInstructions[typeKey]]
    : commonInstructions
}
