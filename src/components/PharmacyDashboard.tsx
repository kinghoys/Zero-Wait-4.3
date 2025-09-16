import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Pill, Package, ShoppingCart, AlertCircle, LogOut, User, Clock, FileText } from 'lucide-react'

const PharmacyDashboard: React.FC = () => {
  const { state: authState, logout } = useAuth()

  const pendingOrders = [
    { id: 1, patient: 'John Smith', medication: 'Amoxicillin 500mg', quantity: '30 tablets', doctor: 'Dr. Johnson', status: 'pending' },
    { id: 2, patient: 'Emma Davis', medication: 'Insulin Glargine', quantity: '5 vials', doctor: 'Dr. Chen', status: 'ready' },
    { id: 3, patient: 'Michael Brown', medication: 'Lisinopril 10mg', quantity: '90 tablets', doctor: 'Dr. Wilson', status: 'urgent' }
  ]

  const inventoryAlerts = [
    { id: 1, medication: 'Paracetamol 500mg', currentStock: 15, minStock: 50, severity: 'high' },
    { id: 2, medication: 'Aspirin 325mg', currentStock: 35, minStock: 100, severity: 'medium' },
    { id: 3, medication: 'Metformin 850mg', currentStock: 8, minStock: 25, severity: 'critical' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <Pill size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {authState.user?.hospital || 'Pharmacy Dashboard'}
                </h1>
                <p className="text-gray-600">Licensed Pharmacist • {authState.user?.firstName} {authState.user?.lastName}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <User size={14} className="mr-1" />
                  License: {authState.user?.pharmacyLicense || 'Not provided'}
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
          {/* Pending Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Pending Prescriptions</h2>
              <span className="text-sm text-gray-500">{pendingOrders.length} orders</span>
            </div>

            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{order.patient}</h3>
                      <p className="text-orange-600 font-medium">{order.medication}</p>
                      <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                      <p className="text-sm text-gray-500">Prescribed by: {order.doctor}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'urgent' ? 'bg-red-100 text-red-700' :
                        order.status === 'ready' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                      <div className="mt-2 space-x-2">
                        <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs hover:bg-orange-200 transition-colors">
                          Process
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory & Actions */}
          <div className="space-y-6">
            {/* Inventory Alerts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Alerts</h2>
              <div className="space-y-3">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-800 text-sm">{alert.medication}</h4>
                      <AlertCircle className={`${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`} size={16} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Stock: {alert.currentStock}</span>
                      <span className="text-gray-600">Min: {alert.minStock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors">
                  <ShoppingCart className="text-orange-600" size={20} />
                  <span className="text-orange-700 font-medium">New Prescription</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                  <Package className="text-blue-600" size={20} />
                  <span className="text-blue-700 font-medium">Inventory Management</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors">
                  <FileText className="text-green-600" size={20} />
                  <span className="text-green-700 font-medium">Generate Reports</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors">
                  <Clock className="text-purple-600" size={20} />
                  <span className="text-purple-700 font-medium">Order History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PharmacyDashboard
