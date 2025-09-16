import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { UserType } from '../components/AuthModal'

export interface UserData {
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
  createdAt: Date
}

export const createUserAccount = async (userData: Omit<UserData, 'id' | 'isAuthenticated' | 'createdAt'>, password: string) => {
  try {
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password)
    const user = userCredential.user

    // Update display name
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    })

    // Store additional user data in Firestore
    const userDocData: UserData = {
      ...userData,
      id: user.uid,
      isAuthenticated: true,
      createdAt: new Date()
    }

    await setDoc(doc(db, 'users', user.uid), userDocData)

    return {
      success: true,
      user: userDocData
    }
  } catch (error: any) {
    console.error('Error creating user account:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData
      return {
        success: true,
        user: {
          ...userData,
          isAuthenticated: true
        }
      }
    } else {
      // If no Firestore doc exists, create basic user data
      const basicUserData: UserData = {
        id: user.uid,
        userType: 'patient' as UserType,
        email: user.email || '',
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ')[1] || '',
        isAuthenticated: true,
        createdAt: new Date()
      }

      await setDoc(doc(db, 'users', user.uid), basicUserData)
      
      return {
        success: true,
        user: basicUserData
      }
    }
  } catch (error: any) {
    console.error('Error logging in user:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error('Error logging out:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const getCurrentUserData = async (user: User): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    
    return null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}
