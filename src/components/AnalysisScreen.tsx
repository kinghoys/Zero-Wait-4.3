import React, { useState, useEffect } from 'react'
import { Brain, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { analyzeSymptoms } from '../services/geminiService'
import { searchNearbyHospitals } from '../services/hospitalService'

interface AnalysisScreenProps {
  onNext: () => void
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ onNext }) => {
  const { state, dispatch } = useAppContext()
  const [analysisStage, setAnalysisStage] = useState(0)
  const [analysisText, setAnalysisText] = useState('')

  const analysisStages = [
    { icon: Brain, text: "Analyzing your symptoms...", color: "text-blue-500" },
    { icon: Zap, text: "Detecting urgency level...", color: "text-orange-500" },
    { icon: Clock, text: "Finding nearby hospitals...", color: "text-green-500" },
    { icon: CheckCircle, text: "Ready to show results!", color: "text-green-600" }
  ]

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        // Stage 1: Analyze symptoms
        setAnalysisStage(0)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const analysis = await analyzeSymptoms(state.userInput)
        dispatch({ 
          type: 'SET_SITUATION', 
          payload: { 
            situation: analysis.situation, 
            severity: analysis.severity 
          } 
        })

        // Stage 2: Detect urgency
        setAnalysisStage(1)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Stage 3: Find hospitals
        setAnalysisStage(2)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const hospitals = await searchNearbyHospitals(
          state.userLocation, 
          analysis.situation, 
          analysis.severity
        )
        dispatch({ type: 'SET_HOSPITALS', payload: hospitals })

        // Stage 4: Complete
        setAnalysisStage(3)
        await new Promise(resolve => setTimeout(resolve, 1000))

        dispatch({ type: 'SET_LOADING', payload: false })
        setTimeout(() => onNext(), 500)
      } catch (error) {
        console.error('Analysis error:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    runAnalysis()
  }, [state.userInput, state.userLocation, dispatch, onNext])

  const currentStage = analysisStages[analysisStage]
  const IconComponent = currentStage.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4 pt-20">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-8 animate-slide-up">
        {/* User input display */}
        <div className="bg-white rounded-2xl p-6 shadow-lg animate-slide-down">
          <div className="text-sm text-gray-500 mb-2">You said:</div>
          <div className="text-gray-800 font-medium">"{state.userInput}"</div>
        </div>

        {/* AI Brain Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
              <IconComponent size={40} className="text-white" />
            </div>
            
            {/* Rotating circles */}
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin opacity-30"></div>
            <div className="absolute inset-2 border-2 border-purple-200 rounded-full animate-spin animation-delay-1000 opacity-50" style={{ animationDirection: 'reverse' }}></div>
          </div>
        </div>

        {/* Analysis progress */}
        <div className="space-y-6">
          <div className={`text-xl font-semibold ${currentStage.color} animate-fade-in`}>
            {currentStage.text}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out animate-pulse"
              style={{ width: `${((analysisStage + 1) / analysisStages.length) * 100}%` }}
            ></div>
          </div>

          {/* Stage indicators */}
          <div className="flex justify-between items-center">
            {analysisStages.map((stage, index) => {
              const StageIcon = stage.icon
              const isActive = index === analysisStage
              const isCompleted = index < analysisStage
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col items-center transition-all duration-500 ${
                    isActive ? 'scale-110' : isCompleted ? 'scale-105' : 'scale-95'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? `bg-gradient-to-br ${stage.color.replace('text-', 'from-')} to-blue-600 text-white animate-pulse` 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    <StageIcon size={16} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Situation alert */}
        {state.situation && (
          <div className={`animate-scale-in p-4 rounded-xl ${
            state.situation === 'emergency' 
              ? 'bg-red-50 border-2 border-red-200' 
              : 'bg-blue-50 border-2 border-blue-200'
          }`}>
            <div className="flex items-center space-x-3">
              <AlertCircle 
                size={24} 
                className={state.situation === 'emergency' ? 'text-red-500' : 'text-blue-500'} 
              />
              <div>
                <div className={`font-semibold ${
                  state.situation === 'emergency' ? 'text-red-700' : 'text-blue-700'
                }`}>
                  {state.situation === 'emergency' ? '🚨 Emergency Detected' : '📋 Routine Care'}
                </div>
                <div className="text-sm text-gray-600">
                  Severity: {state.severity}/10 | 
                  {state.situation === 'emergency' 
                    ? ' Finding immediate care options' 
                    : ' Finding suitable appointments'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>

        {/* Fun facts during loading */}
        <div className="bg-blue-50 rounded-lg p-4 animate-fade-in">
          <div className="text-sm text-blue-700">
            💡 Did you know? Our AI analyzes over 200 medical symptoms to find you the best care in seconds!
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisScreen
