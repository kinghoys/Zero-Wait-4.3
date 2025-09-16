import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '../config/firebase'
import { UserType } from '../components/AuthModal'
import { getCurrentUserData, logoutUser } from '../services/authService'

export interface User {
  id: string
  userType: UserType
  email: string
  firstName: string
  lastName: string
  phone?: string
  licenseNumber?: string
  employeeId?: string
  specialization?: string
  department?: string
  pharmacyLicense?: string
  hospital?: string
  relationship?: string
  isAuthenticated: boolean
  createdAt?: Date
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }

interface AuthContextType {
  state: AuthState
  login: (userData: User) => void
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: { ...action.payload, isAuthenticated: true },
        error: null
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        user: null
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        error: null,
        isLoading: false
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = (userData: User) => {
    dispatch({ type: 'AUTH_START' })
    try {
      // Store user data in localStorage for persistence
      localStorage.setItem('zeroWaitUser', JSON.stringify(userData))
      dispatch({ type: 'AUTH_SUCCESS', payload: userData })
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Login failed' })
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
      localStorage.removeItem('zeroWaitUser')
      dispatch({ type: 'AUTH_LOGOUT' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        const userData = await getCurrentUserData(firebaseUser)
        if (userData) {
          localStorage.setItem('zeroWaitUser', JSON.stringify(userData))
          dispatch({ type: 'AUTH_SUCCESS', payload: userData })
        }
      } else {
        // User is signed out
        localStorage.removeItem('zeroWaitUser')
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    state,
    login,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
