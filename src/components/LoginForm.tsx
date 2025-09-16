import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, CreditCard, ArrowLeft } from 'lucide-react'
import { UserType } from './AuthModal'
import { createUserAccount, loginUser } from '../services/authService'

interface LoginFormProps {
  userType: UserType
  action: 'login' | 'signup'
  onBack: () => void
  onSuccess: (userData: any) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ userType, action, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    licenseNumber: '',
    hospital: '',
    department: '',
    employeeId: '',
    specialization: '',
    pharmacyLicense: '',
    relationship: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const userTypeLabels = {
    patient: 'Patient',
    doctor: 'Doctor',
    nurse: 'Nurse',
    admin: 'Admin',
    pharmacy: 'Pharmacy',
    family: 'Family Member'
  }

  const userTypeColors = {
    patient: 'bg-blue-500',
    doctor: 'bg-green-500',
    nurse: 'bg-purple-500',
    admin: 'bg-red-500',
    pharmacy: 'bg-orange-500',
    family: 'bg-pink-500'
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    
    if (action === 'signup') {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password'
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }

      // User type specific validations
      if (userType === 'doctor' && !formData.licenseNumber) {
        newErrors.licenseNumber = 'Medical license number is required'
      }
      if (userType === 'nurse' && !formData.employeeId) {
        newErrors.employeeId = 'Employee ID is required'
      }
      if (userType === 'admin' && !formData.employeeId) {
        newErrors.employeeId = 'Employee ID is required'
      }
      if (userType === 'pharmacy' && !formData.pharmacyLicense) {
        newErrors.pharmacyLicense = 'Pharmacy license is required'
      }
      if (userType === 'family' && !formData.relationship) {
        newErrors.relationship = 'Relationship is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      if (action === 'login') {
        // Firebase login
        const result = await loginUser(formData.email, formData.password)
        
        if (result.success && result.user) {
          onSuccess(result.user)
        } else {
          setErrors({ general: result.error || 'Login failed. Please try again.' })
        }
      } else {
        // Firebase signup
        const userData = {
          userType,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          licenseNumber: formData.licenseNumber,
          employeeId: formData.employeeId,
          specialization: formData.specialization,
          department: formData.department,
          pharmacyLicense: formData.pharmacyLicense,
          hospital: formData.hospital,
          relationship: formData.relationship
        }
        
        const result = await createUserAccount(userData, formData.password)
        
        if (result.success && result.user) {
          onSuccess(result.user)
        } else {
          setErrors({ general: result.error || 'Account creation failed. Please try again.' })
        }
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderUserSpecificFields = () => {
    if (action === 'login') return null

    switch (userType) {
      case 'doctor':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical License Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter license number"
                  />
                </div>
                {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g. Cardiology"
                />
              </div>
            </div>
          </>
        )
      
      case 'nurse':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter employee ID"
                />
              </div>
              {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. ICU, Emergency"
              />
            </div>
          </div>
        )

      case 'admin':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Employee ID
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter admin ID"
              />
            </div>
            {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
          </div>
        )

      case 'pharmacy':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pharmacy License
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.pharmacyLicense}
                  onChange={(e) => handleInputChange('pharmacyLicense', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter license number"
                />
              </div>
              {errors.pharmacyLicense && <p className="text-red-500 text-sm mt-1">{errors.pharmacyLicense}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pharmacy Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => handleInputChange('hospital', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Pharmacy name"
                />
              </div>
            </div>
          </div>
        )

      case 'family':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship to Patient
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => handleInputChange('relationship', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="guardian">Guardian</option>
              <option value="other">Other</option>
            </select>
            {errors.relationship && <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className={`w-12 h-12 ${userTypeColors[userType]} rounded-full flex items-center justify-center`}>
          <User size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {action === 'login' ? 'Login' : 'Sign Up'} as {userTypeLabels[userType]}
          </h2>
          <p className="text-gray-600 text-sm">
            {action === 'login' ? 'Enter your credentials' : 'Create your account'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Basic Fields */}
        {action === 'signup' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="First name"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last name"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {action === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Phone number"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        )}

        {/* User Type Specific Fields */}
        {renderUserSpecificFields()}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {action === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full ${userTypeColors[userType]} hover:opacity-90 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {isLoading ? 'Processing...' : action === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          {action === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {action === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
