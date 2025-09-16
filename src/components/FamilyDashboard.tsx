import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Users, Phone, MapPin, Bell, LogOut, User, Clock, Heart } from 'lucide-react'

const FamilyDashboard: React.FC = () => {
  const { state: authState, logout } = useAuth()

  const familyMembers = [
    { id: 1, name: 'John Smith', relation: 'Father', status: 'Healthy', lastCheckup: '2024-01-10', hospital: 'City Medical' },
    { id: 2, name: 'Sarah Smith', relation: 'Mother', status: 'Under Treatment', lastCheckup: '2024-01-12', hospital: 'Metro Hospital' },
    { id: 3, name: 'Emily Smith', relation: 'Daughter', status: 'Healthy', lastCheckup: '2023-12-15', hospital: 'General Clinic' }
  ]

  const emergencyContacts = [
    { id: 1, name: 'Emergency Services', number: '108', type: 'emergency' },
    { id: 2, name: 'Family Doctor', number: '+1-555-0123', type: 'doctor' },
    { id: 3, name: 'Hospital Main', number: '+1-555-0456', type: 'hospital' }
  ]

  const notifications = [
    { id: 1, message: 'Sarah Smith has an appointment tomorrow at 2:00 PM', time: '2 hours ago', type: 'appointment' },
    { id: 2, message: 'Prescription ready for pickup - Metro Pharmacy', time: '1 day ago', type: 'prescription' },
    { id: 3, message: 'Annual checkup reminder for Emily Smith', time: '3 days ago', type: 'reminder' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {authState.user?.firstName} {authState.user?.lastName}
                </h1>
                <p className="text-gray-600">Family Care Coordinator • {authState.user?.relationship || 'Family Member'}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <User size={14} className="mr-1" />
                  Managing 3 family members
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Family Members */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Family Members</h2>
              <span className="text-sm text-gray-500">{familyMembers.length} members</span>
            </div>

            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{member.name}</h3>
                        <p className="text-pink-600 text-sm font-medium">{member.relation}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            Last checkup: {member.lastCheckup}
                          </div>
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {member.hospital}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.status === 'Healthy' ? 'bg-green-100 text-green-700' :
                        member.status === 'Under Treatment' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {member.status}
                      </span>
                      <div className="mt-2 space-x-2">
                        <button className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs hover:bg-pink-200 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Emergency Contacts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Emergency Contacts</h2>
              <div className="space-y-3">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className={`${
                        contact.type === 'emergency' ? 'text-red-500' :
                        contact.type === 'doctor' ? 'text-blue-500' :
                        'text-green-500'
                      }`} size={16} />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{contact.name}</p>
                        <p className="text-gray-600 text-xs">{contact.number}</p>
                      </div>
                    </div>
                    <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                      <Phone size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors">
                  <Phone className="text-red-600" size={20} />
                  <span className="text-red-700 font-medium">Emergency Call</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                  <MapPin className="text-blue-600" size={20} />
                  <span className="text-blue-700 font-medium">Find Hospitals</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors">
                  <Heart className="text-green-600" size={20} />
                  <span className="text-green-700 font-medium">Health Records</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors">
                  <Bell className="text-purple-600" size={20} />
                  <span className="text-purple-700 font-medium">Set Reminders</span>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
                <Bell className="text-gray-400" size={20} />
              </div>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 text-sm">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-gray-500 text-xs">{notification.time}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.type === 'appointment' ? 'bg-blue-100 text-blue-700' :
                        notification.type === 'prescription' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {notification.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FamilyDashboard
