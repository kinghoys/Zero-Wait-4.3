import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, LogOut, Settings, Shield, Stethoscope, Building2, Pill, Users, ChevronDown } from 'lucide-react'
import { AppScreen } from '../App'

interface UserProfileDropdownProps {
  onNavigate?: (screen: AppScreen) => void
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onNavigate }) => {
  const { state: authState, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!authState.user) return null

  const getUserIcon = () => {
    if (!authState.user) return User
    switch (authState.user.userType) {
      case 'doctor': return Stethoscope
      case 'nurse': return Shield
      case 'admin': return Building2
      case 'pharmacy': return Pill
      case 'family': return Users
      default: return User
    }
  }

  const getUserColor = () => {
    if (!authState.user) return 'bg-gray-500'
    switch (authState.user.userType) {
      case 'doctor': return 'bg-blue-500'
      case 'nurse': return 'bg-green-500'
      case 'admin': return 'bg-purple-500'
      case 'pharmacy': return 'bg-orange-500'
      case 'family': return 'bg-pink-500'
      default: return 'bg-gray-500'
    }
  }

  const getSpecificFields = () => {
    const user = authState.user
    if (!user) return null
    
    switch (user.userType) {
      case 'doctor':
        return (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">License:</span>
              <span className="font-medium">{user.licenseNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Specialization:</span>
              <span className="font-medium">{user.specialization || 'N/A'}</span>
            </div>
          </>
        )
      case 'nurse':
        return (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Employee ID:</span>
              <span className="font-medium">{user.employeeId || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{user.department || 'N/A'}</span>
            </div>
          </>
        )
      case 'admin':
        return (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Employee ID:</span>
            <span className="font-medium">{user.employeeId || 'N/A'}</span>
          </div>
        )
      case 'pharmacy':
        return (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">License:</span>
              <span className="font-medium">{user.pharmacyLicense || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hospital:</span>
              <span className="font-medium">{user.hospital || 'N/A'}</span>
            </div>
          </>
        )
      case 'family':
        return (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Relationship:</span>
            <span className="font-medium">{user.relationship || 'N/A'}</span>
          </div>
        )
      default:
        return null
    }
  }

  const UserIcon = getUserIcon()

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className={`w-8 h-8 ${getUserColor()} rounded-full flex items-center justify-center`}>
          <UserIcon size={16} className="text-white" />
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-gray-800">
            {authState.user.firstName} {authState.user.lastName}
          </span>
          <span className="text-xs text-gray-600 capitalize">
            {authState.user.userType}
          </span>
        </div>
        <ChevronDown size={16} className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${getUserColor()} rounded-full flex items-center justify-center`}>
                <UserIcon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {authState.user.firstName} {authState.user.lastName}
                </h3>
                <p className="text-gray-600 text-sm capitalize">
                  {authState.user.userType}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{authState.user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{authState.user.phone || 'N/A'}</span>
            </div>
            {getSpecificFields()}
          </div>

          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => {
                setIsOpen(false)
                // Add navigation to profile settings if needed
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings size={16} />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={async () => {
                setIsOpen(false)
                await logout()
                // Navigate to welcome screen after logout
                if (onNavigate) {
                  onNavigate('welcome')
                }
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfileDropdown
