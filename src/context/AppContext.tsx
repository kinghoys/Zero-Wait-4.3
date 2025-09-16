import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export type Situation = 'emergency' | 'normal' | null
export type Location = { lat: number; lng: number } | null

export interface Hospital {
  id: string
  name: string
  distance: number
  cost: number
  rating: number
  availability: boolean
  specialties: string[]
  phone: string
  address: string
  coords?: { lat: number; lng: number }
}

export interface AmbulanceBooking {
  id: string
  status: 'dispatched' | 'en_route' | 'arrived' | 'completed'
  hospitalName: string
  ambulanceId: string
  driverName: string
  driverPhone: string
  estimatedArrival: number // in minutes
  actualArrival?: string
  pickupLocation: string
  destination: string
  emergencyType: string
  patientCondition: string
  cost: number
  bookingTime: Date
}

interface AppState {
  userLocation: Location
  situation: Situation
  severity: number
  hospitals: Hospital[]
  selectedHospital: Hospital | null
  userInput: string
  isLoading: boolean
  bookingStatus: 'idle' | 'loading' | 'success' | 'error'
  ambulanceBooking: AmbulanceBooking | null
}

type AppAction = 
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'SET_SITUATION'; payload: { situation: Situation; severity: number } }
  | { type: 'SET_HOSPITALS'; payload: Hospital[] }
  | { type: 'SELECT_HOSPITAL'; payload: Hospital }
  | { type: 'SET_USER_INPUT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BOOKING_STATUS'; payload: AppState['bookingStatus'] }
  | { type: 'SET_AMBULANCE_BOOKING'; payload: AmbulanceBooking }
  | { type: 'UPDATE_AMBULANCE_STATUS'; payload: AmbulanceBooking['status'] }
  | { type: 'RESET' }

const initialState: AppState = {
  userLocation: null,
  situation: null,
  severity: 0,
  hospitals: [],
  selectedHospital: null,
  userInput: '',
  isLoading: false,
  bookingStatus: 'idle',
  ambulanceBooking: null
}

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, userLocation: action.payload }
    case 'SET_SITUATION':
      return { ...state, situation: action.payload.situation, severity: action.payload.severity }
    case 'SET_HOSPITALS':
      return { ...state, hospitals: action.payload }
    case 'SELECT_HOSPITAL':
      return { ...state, selectedHospital: action.payload }
    case 'SET_USER_INPUT':
      return { ...state, userInput: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_BOOKING_STATUS':
      return { ...state, bookingStatus: action.payload }
    case 'SET_AMBULANCE_BOOKING':
      return { ...state, ambulanceBooking: action.payload }
    case 'UPDATE_AMBULANCE_STATUS':
      return { 
        ...state, 
        ambulanceBooking: state.ambulanceBooking 
          ? { ...state.ambulanceBooking, status: action.payload }
          : null
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
