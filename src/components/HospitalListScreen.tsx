import React, { useEffect, useState } from 'react'
import { MapPin, Filter, ArrowLeft } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import HospitalCard from './HospitalCard'

interface HospitalListScreenProps {
  onSelect: () => void
  onAppointment: () => void
}

const HospitalListScreen: React.FC<HospitalListScreenProps> = ({ onSelect, onAppointment }) => {
  const { state, dispatch } = useAppContext()
  const [sortBy, setSortBy] = useState<'distance' | 'cost' | 'rating'>('distance')
  const [showFilters, setShowFilters] = useState(false)

  const handleHospitalSelect = (hospital: any) => {
    dispatch({ type: 'SELECT_HOSPITAL', payload: hospital })
    onSelect()
  }

  const handleAppointmentBooking = (hospital: any) => {
    dispatch({ type: 'SELECT_HOSPITAL', payload: hospital })
    onAppointment()
  }

  const sortedHospitals = [...state.hospitals].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return a.distance - b.distance
      case 'cost':
        return a.cost - b.cost
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pt-20">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {state.situation === 'emergency' ? '🚨 Emergency Hospitals' : '🏥 Recommended Hospitals'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>Found {state.hospitals.length} nearby hospitals</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  state.situation === 'emergency' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  Severity: {state.severity}/10
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200 hover-lift button-press"
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          <div className={`transition-all duration-300 overflow-hidden ${
            showFilters ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="flex items-center space-x-4 pt-4 border-t">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              {['distance', 'cost', 'rating'].map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 button-press ${
                    sortBy === option
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Input Reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-fade-in">
          <div className="text-sm text-blue-700">
            <strong>Your situation:</strong> "{state.userInput}"
          </div>
        </div>

        {/* Hospital Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedHospitals.map((hospital, index) => (
            <div
              key={hospital.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <HospitalCard 
                hospital={hospital}
                situation={state.situation}
                onSelect={() => handleHospitalSelect(hospital)}
                onAppointment={() => handleAppointmentBooking(hospital)}
                userLocation={state.userLocation}
              />
            </div>
          ))}
        </div>

        {/* Emergency Notice */}
        {state.situation === 'emergency' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mt-6 animate-pulse">
            <div className="text-center">
              <div className="text-red-700 font-semibold mb-2">⚠️ Emergency Situation Detected</div>
              <div className="text-red-600 text-sm">
                For life-threatening emergencies, consider calling emergency services (108/102) immediately
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {state.hospitals.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding the best hospitals for you...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HospitalListScreen
