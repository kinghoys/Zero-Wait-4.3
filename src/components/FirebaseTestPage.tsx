import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { User, Database, RefreshCw, Trash2, Edit, CheckCircle, XCircle, UserCheck } from 'lucide-react'
import AuthModal from './AuthModal'
import { UserType } from './AuthModal'

const FirebaseTestPage: React.FC = () => {
  const { state: authState, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [firestoreUsers, setFirestoreUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({})

  // Fetch all users from Firestore
  const fetchFirestoreUsers = async () => {
    setIsLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setFirestoreUsers(users)
      setTestResults(prev => ({ ...prev, firestoreFetch: true }))
    } catch (error) {
      console.error('Error fetching users:', error)
      setTestResults(prev => ({ ...prev, firestoreFetch: false }))
    } finally {
      setIsLoading(false)
    }
  }

  // Update user data test
  const updateUserTest = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        lastTestUpdate: new Date(),
        testField: 'Updated successfully'
      })
      setTestResults(prev => ({ ...prev, firestoreUpdate: true }))
      fetchFirestoreUsers() // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error)
      setTestResults(prev => ({ ...prev, firestoreUpdate: false }))
    }
  }

  // Delete user test (only for test users)
  const deleteUserTest = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this test user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId))
        setTestResults(prev => ({ ...prev, firestoreDelete: true }))
        fetchFirestoreUsers() // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error)
        setTestResults(prev => ({ ...prev, firestoreDelete: false }))
      }
    }
  }

  useEffect(() => {
    fetchFirestoreUsers()
  }, [])

  const renderTestResult = (testName: string, result: boolean | undefined) => {
    if (result === undefined) return null
    return (
      <div className={`flex items-center space-x-2 ${result ? 'text-green-600' : 'text-red-600'}`}>
        {result ? <CheckCircle size={16} /> : <XCircle size={16} />}
        <span className="text-sm font-medium">
          {testName}: {result ? 'PASS' : 'FAIL'}
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Database className="mr-3 text-blue-500" />
                Firebase Authentication & Firestore Test Page
              </h1>
              <p className="text-gray-600 mt-2">Test Firebase Auth and Firestore integration</p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center"
            >
              <UserCheck className="mr-2" size={20} />
              Open Auth Modal
            </button>
          </div>
        </div>

        {/* Test Results Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderTestResult('Firestore Fetch', testResults.firestoreFetch)}
            {renderTestResult('Firestore Update', testResults.firestoreUpdate)}
            {renderTestResult('Firestore Delete', testResults.firestoreDelete)}
            {renderTestResult('Auth State', authState.user !== null)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Authentication State */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User className="mr-2 text-blue-500" />
              Current Authentication State
            </h2>
            
            {authState.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : authState.user ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">✅ User Authenticated</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ID:</span>
                    <span className="text-gray-800 font-mono text-sm">{authState.user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">User Type:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      authState.user.userType === 'patient' ? 'bg-blue-100 text-blue-800' :
                      authState.user.userType === 'doctor' ? 'bg-green-100 text-green-800' :
                      authState.user.userType === 'nurse' ? 'bg-purple-100 text-purple-800' :
                      authState.user.userType === 'admin' ? 'bg-red-100 text-red-800' :
                      authState.user.userType === 'pharmacy' ? 'bg-orange-100 text-orange-800' :
                      'bg-pink-100 text-pink-800'
                    }`}>
                      {authState.user.userType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="text-gray-800">{authState.user.firstName} {authState.user.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="text-gray-800">{authState.user.email}</span>
                  </div>
                  {authState.user.phone && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="text-gray-800">{authState.user.phone}</span>
                    </div>
                  )}
                  {authState.user.licenseNumber && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">License:</span>
                      <span className="text-gray-800">{authState.user.licenseNumber}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800">❌ No user authenticated</p>
                </div>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Open Login Modal
                </button>
              </div>
            )}

            {authState.error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">Error: {authState.error}</p>
              </div>
            )}
          </div>

          {/* Firestore Data */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Database className="mr-2 text-green-500" />
                Firestore Users ({firestoreUsers.length})
              </h2>
              <button
                onClick={fetchFirestoreUsers}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading users...</p>
              </div>
            ) : firestoreUsers.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {firestoreUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.userType === 'patient' ? 'bg-blue-100 text-blue-800' :
                            user.userType === 'doctor' ? 'bg-green-100 text-green-800' :
                            user.userType === 'nurse' ? 'bg-purple-100 text-purple-800' :
                            user.userType === 'admin' ? 'bg-red-100 text-red-800' :
                            user.userType === 'pharmacy' ? 'bg-orange-100 text-orange-800' :
                            'bg-pink-100 text-pink-800'
                          }`}>
                            {user.userType}
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 font-mono">ID: {user.id}</p>
                        {user.lastTestUpdate && (
                          <p className="text-xs text-green-600 mt-1">
                            Last updated: {new Date(user.lastTestUpdate.seconds * 1000).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateUserTest(user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Test update"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteUserTest(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No users found in Firestore</p>
                <p className="text-sm text-gray-500 mt-2">Create some test users using the login modal</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Authentication Testing:</h4>
              <ul className="space-y-1">
                <li>• Click "Open Auth Modal" to test login/signup</li>
                <li>• Try different user types (patient, doctor, etc.)</li>
                <li>• Check if user data appears correctly after login</li>
                <li>• Test logout functionality</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Firestore Testing:</h4>
              <ul className="space-y-1">
                <li>• View all users stored in Firestore</li>
                <li>• Test update functionality (Edit icon)</li>
                <li>• Test delete functionality (Trash icon)</li>
                <li>• Refresh to see real-time changes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onUserTypeSelect={(userType: UserType, action: 'login' | 'signup') => {
            // Modal handles the authentication
          }}
        />
      </div>
    </div>
  )
}

export default FirebaseTestPage
