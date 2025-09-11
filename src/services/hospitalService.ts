import type { Hospital, Location } from '../context/AppContext'

// Mock hospital data for demo
const mockHospitals = [
  {
    id: '1',
    name: 'Apollo Hospitals',
    specialties: ['Cardiology', 'Emergency', 'ICU'],
    phone: '+91-40-2345-6789',
    address: 'Jubilee Hills, Hyderabad',
    coords: { lat: 17.4326, lng: 78.4071 }
  },
  {
    id: '2', 
    name: 'KIMS Hospital',
    specialties: ['Neurology', 'Emergency', 'Trauma'],
    phone: '+91-40-3456-7890',
    address: 'Kondapur, Hyderabad',
    coords: { lat: 17.4569, lng: 78.3689 }
  },
  {
    id: '3',
    name: 'Care Hospitals',
    specialties: ['General Medicine', 'Orthopedics'],
    phone: '+91-40-4567-8901',
    address: 'Banjara Hills, Hyderabad',
    coords: { lat: 17.4239, lng: 78.4738 }
  },
  {
    id: '4',
    name: 'Rainbow Children\'s Hospital',
    specialties: ['Pediatrics', 'Emergency'],
    phone: '+91-40-5678-9012',
    address: 'Vikrampuri, Hyderabad',
    coords: { lat: 17.4875, lng: 78.4867 }
  },
  {
    id: '5',
    name: 'Continental Hospitals',
    specialties: ['Multi-specialty', 'ICU', 'Emergency'],
    phone: '+91-40-6789-0123',
    address: 'Gachibowli, Hyderabad', 
    coords: { lat: 17.4434, lng: 78.3488 }
  }
]

export const searchNearbyHospitals = async (
  userLocation: Location,
  situation: 'emergency' | 'normal',
  severity: number
): Promise<Hospital[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

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

  const estimateCost = (specialties: string[], situation: string, distance: number): number => {
    const baseCost = situation === 'emergency' ? 1500 : 500
    const specialtyMultiplier = specialties.includes('Emergency') ? 1.2 : 1.0
    const distanceMultiplier = 1 + (distance * 0.1)
    
    return Math.round(baseCost * specialtyMultiplier * distanceMultiplier)
  }

  let hospitals = mockHospitals.map(hospital => {
    const distance = userLocation 
      ? calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          hospital.coords.lat, 
          hospital.coords.lng
        )
      : Math.random() * 10 + 2 // Random distance if no location

    return {
      ...hospital,
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      cost: estimateCost(hospital.specialties, situation, distance),
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0 rating
      availability: Math.random() > 0.2 // 80% chance of availability
    }
  })

  // Sort by priority for situation type
  if (situation === 'emergency') {
    // For emergency: prioritize by availability, then distance
    hospitals = hospitals.sort((a, b) => {
      if (a.availability !== b.availability) {
        return a.availability ? -1 : 1
      }
      return a.distance - b.distance
    })
  } else {
    // For normal: prioritize by cost, then rating
    hospitals = hospitals.sort((a, b) => {
      const costDiff = a.cost - b.cost
      if (Math.abs(costDiff) > 200) return costDiff
      return b.rating - a.rating
    })
  }

  return hospitals.slice(0, 4) // Return top 4 results
}
