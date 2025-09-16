import React, { useState, useRef } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

interface VoiceInputProps {
  onSubmit: (input: string) => void
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onSubmit }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setTranscript('')
      }

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex
        const transcriptText = event.results[current][0].transcript
        setTranscript(transcriptText)
        
        if (event.results[current].isFinal) {
          onSubmit(transcriptText)
          setIsListening(false)
        }
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.start()
    } else {
      alert('Speech recognition not supported in this browser')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 button-press ${
          isListening 
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white voice-active shadow-lg' 
            : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:from-blue-600 hover:to-primary shadow-md hover:shadow-lg'
        }`}
      >
        <div className="flex items-center justify-center space-x-3">
          {isListening ? (
            <>
              <div className="animate-pulse">
                <MicOff size={24} />
              </div>
              <span>🎤 Listening... Tap to stop</span>
            </>
          ) : (
            <>
              <Mic size={24} />
              <span>🎤 Tap to speak</span>
            </>
          )}
        </div>
      </button>

      {/* Live transcript display */}
      {transcript && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-slide-down">
          <div className="flex items-start space-x-2">
            <Volume2 size={16} className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <div className="text-sm text-blue-600 font-medium mb-1">I heard:</div>
              <div className="text-gray-800 animate-typing">"{transcript}"</div>
            </div>
          </div>
        </div>
      )}

      {isListening && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-blue-700 text-sm font-medium ml-2">Speak now...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceInput
