import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Shield, Users, BarChart3, Settings, LogOut, User, Database, Activity } from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const { state: authState, logout } = useAuth()

  const systemStats = {
    totalUsers: 1247,
    dailyRegistrations: 23,
    activeNow: 156,
    systemHealth: 98.5
  }

  const recentActivities = [
    { id: 1, action: 'New doctor registered - Dr. Smith', time: '2 mins ago', type: 'user' },
    { id: 2, action: 'System backup completed', time: '1 hour ago', type: 'system' },
    { id: 3, action: 'Emergency alert triggered - Zone 3', time: '3 hours ago', type: 'alert' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <Shield size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {authState.user?.firstName} {authState.user?.lastName}
                </h1>
                <p className="text-gray-600">System Administrator</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <User size={14} className="mr-1" />
                  Admin ID: {authState.user?.employeeId || 'Not provided'}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{systemStats.totalUsers}</p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Daily Registrations</p>
                <p className="text-2xl font-bold text-gray-800">{systemStats.dailyRegistrations}</p>
              </div>
              <BarChart3 className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Now</p>
                <p className="text-2xl font-bold text-gray-800">{systemStats.activeNow}</p>
              </div>
              <Activity className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">System Health</p>
                <p className="text-2xl font-bold text-gray-800">{systemStats.systemHealth}%</p>
              </div>
              <Database className="text-purple-500" size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent System Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'alert' ? 'bg-red-500' :
                    activity.type === 'user' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm">{activity.action}</p>
                    <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors">
                <Users className="text-red-600" size={20} />
                <span className="text-red-700 font-medium">Manage Users</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                <BarChart3 className="text-blue-600" size={20} />
                <span className="text-blue-700 font-medium">View Analytics</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors">
                <Database className="text-green-600" size={20} />
                <span className="text-green-700 font-medium">Database Management</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors">
                <Settings className="text-purple-600" size={20} />
                <span className="text-purple-700 font-medium">System Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
