import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Heart, Users, Clipboard, AlertTriangle, LogOut, User, Clock, Activity } from 'lucide-react'

const NurseDashboard: React.FC = () => {
  const { state: authState, logout } = useAuth()

  const patientQueue = [
    { id: 1, name: 'Sarah Wilson', room: '101', priority: 'high', condition: 'Post-surgery monitoring' },
    { id: 2, name: 'James Miller', room: '203', priority: 'medium', condition: 'Medication administration' },
    { id: 3, name: 'Lisa Davis', room: '105', priority: 'low', condition: 'Routine check-up' }
  ]

  const nurseTasks = [
    { id: 1, task: 'Administer medication - Room 101', time: '10:00 AM', completed: false },
    { id: 2, task: 'Vital signs check - Room 203', time: '10:30 AM', completed: true },
    { id: 3, task: 'Patient discharge - Room 105', time: '11:00 AM', completed: false }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <Heart size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {authState.user?.firstName} {authState.user?.lastName}
                </h1>
                <p className="text-gray-600">Registered Nurse • {authState.user?.department || 'General Care'}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <User size={14} className="mr-1" />
                  Employee ID: {authState.user?.employeeId || 'Not provided'}
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
          {/* Patient Queue */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Patient Queue</h2>
              <span className="text-sm text-gray-500">{patientQueue.length} patients</span>
            </div>

            <div className="space-y-4">
              {patientQueue.map((patient) => (
                <div key={patient.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        patient.priority === 'high' ? 'bg-red-500' :
                        patient.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div>
                        <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{patient.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-purple-600">Room {patient.room}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.priority === 'high' ? 'bg-red-100 text-red-700' :
                        patient.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {patient.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks & Actions */}
          <div className="space-y-6">
            {/* Today's Tasks */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Tasks</h2>
              <div className="space-y-3">
                {nurseTasks.map((task) => (
                  <div key={task.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    task.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      className="w-4 h-4 text-purple-600"
                      readOnly
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${task.completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                        {task.task}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock size={12} className="mr-1" />
                        {task.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors">
                  <Users className="text-purple-600" size={20} />
                  <span className="text-purple-700 font-medium">Patient Records</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                  <Clipboard className="text-blue-600" size={20} />
                  <span className="text-blue-700 font-medium">Update Charts</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors">
                  <Activity className="text-orange-600" size={20} />
                  <span className="text-orange-700 font-medium">Vital Signs</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors">
                  <AlertTriangle className="text-red-600" size={20} />
                  <span className="text-red-700 font-medium">Report Emergency</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NurseDashboard
