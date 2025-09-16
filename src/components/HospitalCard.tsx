import React, { useState } from 'react'
import { MapPin, Phone, Star, Clock, IndianRupee, Truck, Calendar, Navigation, ExternalLink } from 'lucide-react'
import type { Hospital, Location } from '../context/AppContext'
import { buildMapsDirectionsLink, buildGoogleSearchLink } from '../utils/mapsLinks'

interface HospitalCardProps {
  hospital: Hospital
  situation: 'emergency' | 'normal' | null
  onSelect: () => void
  onAppointment: () => void
  userLocation: Location
}

const HospitalCard: React.FC<HospitalCardProps> = ({ 
  hospital, 
  situation, 
  onSelect, 
  onAppointment,
  userLocation 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const directionsUrl = buildMapsDirectionsLink({
    originCoords: userLocation || undefined,
    originQuery: userLocation ? undefined : 'My Location',
    destinationQuery: `${hospital.name} ${hospital.address}`,
    travelMode: 'driving'
  })

  const reviewsUrl = buildGoogleSearchLink(`${hospital.name} reviews`)
  const phoneUrl = buildGoogleSearchLink(`${hospital.name} phone contact`)

  const handleBooking = () => {
    if (situation === 'emergency') {
      onSelect() // Emergency ambulance booking
    } else {
      onAppointment() // Normal appointment booking
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover-lift">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{hospital.name}</h3>
            <div className="flex items-center space-x-1 text-gray-600 mb-2">
              <MapPin size={14} />
              <span className="text-sm">{hospital.address}</span>
            </div>
          </div>
          
          {/* Availability indicator */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium animate-pulse ${
            hospital.availability 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {hospital.availability ? '🟢 Available' : '🔴 Busy'}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-blue-600 font-semibold">
              <MapPin size={16} />
              <span>{hospital.distance}km</span>
            </div>
            <div className="text-xs text-gray-500">Distance</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-green-600 font-semibold">
              <IndianRupee size={16} />
              <span>{hospital.cost}</span>
            </div>
            <div className="text-xs text-gray-500">Est. Cost</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-orange-500 font-semibold">
              <Star size={16} fill="currentColor" />
              <span>{hospital.rating}</span>
            </div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {hospital.specialties.map((specialty, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Primary Action Button */}
          <button
            onClick={handleBooking}
            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 button-press hover:shadow-lg ${
              situation === 'emergency'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white animate-pulse'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
            }`}
          >
            {situation === 'emergency' ? (
              <>
                <Truck size={18} />
                <span>🚑 Book Ambulance</span>
              </>
            ) : (
              <>
                <Calendar size={18} />
                <span>📅 Book Appointment</span>
              </>
            )}
          </button>

          {/* Directions Button */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 button-press hover:shadow-lg"
          >
            <Navigation size={18} />
            <span>📍 Directions</span>
          </a>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={phoneUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center space-x-1 py-2 px-3 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg text-sm font-medium transition-all duration-200 hover-lift"
          >
            <Phone size={14} />
            <span>📞 Call</span>
            <ExternalLink size={12} />
          </a>
          
          <a
            href={reviewsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center space-x-1 py-2 px-3 bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg text-sm font-medium transition-all duration-200 hover-lift"
          >
            <Star size={14} />
            <span>⭐ Reviews</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Expand/Collapse Details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          {isExpanded ? '↑ Less Details' : '↓ More Details'}
        </button>

        {/* Expanded Details */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated ETA:</span>
              <span className="font-medium">{Math.round(hospital.distance * 2)} mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Emergency Services:</span>
              <span className="font-medium">
                {hospital.specialties.includes('Emergency') ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ICU Available:</span>
              <span className="font-medium">
                {hospital.specialties.includes('ICU') ? '✅ Yes' : '❓ Call to confirm'}
              </span>
            </div>
            {situation === 'normal' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Next Appointment:</span>
                <span className="font-medium text-green-600">Today 3:30 PM</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency badge overlay */}
      {situation === 'emergency' && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
          URGENT
        </div>
      )}
    </div>
  )
}

export default HospitalCard
