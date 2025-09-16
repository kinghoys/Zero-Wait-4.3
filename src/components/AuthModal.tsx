import React, { useState } from 'react'
import { X, User, Stethoscope, Shield, Pill, Users, UserCheck } from 'lucide-react'
import LoginForm from './LoginForm'
import { useAuth } from '../context/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onUserTypeSelect: (userType: UserType, action: 'login' | 'signup') => void
}

export type UserType = 'patient' | 'doctor' | 'nurse' | 'admin' | 'pharmacy' | 'family'

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onUserTypeSelect }) => {
  const [authMode, setAuthMode] = useState<'select' | 'login' | 'signup'>('select')
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)
  const [selectedAction, setSelectedAction] = useState<'login' | 'signup' | null>(null)
  const { login } = useAuth()
  
  const userTypes = [
    {
      type: 'patient' as UserType,
      label: 'Patient',
      icon: User,
      color: 'bg-blue-500',
      description: 'Book appointments, emergency services, health tracking'
    },
    {
      type: 'doctor' as UserType,
      label: 'Doctor',
      icon: Stethoscope,
      color: 'bg-green-500',
      description: 'Manage appointments, patient records, consultations'
    },
    {
      type: 'nurse' as UserType,
      label: 'Nurse',
      icon: UserCheck,
      color: 'bg-purple-500',
      description: 'Patient care, medication management, ward management'
    },
    {
      type: 'admin' as UserType,
      label: 'Admin',
      icon: Shield,
      color: 'bg-red-500',
      description: 'System management, user administration, reports'
    },
    {
      type: 'pharmacy' as UserType,
      label: 'Pharmacy',
      icon: Pill,
      color: 'bg-orange-500',
      description: 'Prescription management, inventory, drug dispensing'
    },
    {
      type: 'family' as UserType,
      label: 'Family Member',
      icon: Users,
      color: 'bg-pink-500',
      description: 'Emergency contacts, patient advocacy, care coordination'
    }
  ]

  const handleUserSelection = (userType: UserType, action: 'login' | 'signup') => {
    setSelectedUserType(userType)
    setSelectedAction(action)
    setAuthMode(action)
  }

  const handleBackToSelection = () => {
    setAuthMode('select')
    setSelectedUserType(null)
    setSelectedAction(null)
  }

  const handleLoginSuccess = (userData: any) => {
    // Firebase auth state listener will handle the authentication
    // No need to manually call login - Firebase handles this automatically
    onClose()
    // Reset modal state
    setAuthMode('select')
    setSelectedUserType(null)
    setSelectedAction(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto relative animate-in slide-in-from-top-4 duration-300">
        {/* Header - Only show for selection mode */}
        {authMode === 'select' && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Choose Your Role</h2>
              <p className="text-gray-600 mt-1">Select your user type to continue</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {authMode === 'select' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {userTypes.map((userType) => {
                  const IconComponent = userType.icon
                  return (
                    <div
                      key={userType.type}
                      className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => setAuthMode('login')}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-16 h-16 ${userType.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <IconComponent size={32} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{userType.label}</h3>
                          <p className="text-sm text-gray-600 mt-2">{userType.description}</p>
                        </div>
                        <div className="flex space-x-3 w-full">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserSelection(userType.type, 'login')
                            }}
                            className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                          >
                            Login
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserSelection(userType.type, 'signup')
                            }}
                            className="flex-1 py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                          >
                            Sign Up
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Access for Patients */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <div className="flex items-center space-x-3">
                  <User size={20} className="text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-800">Patient Quick Access</h4>
                    <p className="text-sm text-blue-600 mt-1">
                      For emergency services, you can continue without login. Account needed only for appointment history and personal data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Login/Signup Form */}
          {(authMode === 'login' || authMode === 'signup') && selectedUserType && selectedAction && (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoginForm
                userType={selectedUserType}
                action={selectedAction}
                onBack={handleBackToSelection}
                onSuccess={handleLoginSuccess}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
