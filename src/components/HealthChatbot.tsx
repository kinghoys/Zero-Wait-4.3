import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Mic, MicOff, Loader2 } from 'lucide-react'
import { generateChatResponse, getQuickSuggestions } from '../services/chatService'
import { useAppContext } from '../context/AppContext'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'general' | 'medical' | 'appointment' | 'emergency'
}

interface HealthChatbotProps {
  variant?: 'compact' | 'full'
  placeholder?: string
  welcomeMessage?: string
  context?: {
    userSymptoms?: string
    selectedHospital?: any
    appointmentStatus?: string
  }
}

const HealthChatbot: React.FC<HealthChatbotProps> = ({ 
  variant = 'full', 
  placeholder = "Ask me anything about your health...",
  welcomeMessage = "Hi! I'm your ZeroWait Health Assistant. How can I help you today?",
  context = {}
}) => {
  const { state } = useAppContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([])
  const [recognition, setRecognition] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize welcome message
  useEffect(() => {
    const welcomeMsg: Message = {
      id: 'welcome',
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
      type: 'general'
    }
    setMessages([welcomeMsg])
    setQuickSuggestions(getQuickSuggestions('general'))
  }, [welcomeMessage])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        setIsListening(false)
      }
      
      recognition.onerror = () => {
        setIsListening(false)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognition)
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const conversationHistory = messages.map(m => `${m.sender}: ${m.text}`).slice(-5)
      
      const chatContext = {
        ...context,
        userSymptoms: context.userSymptoms || state.userInput,
        selectedHospital: context.selectedHospital || state.selectedHospital,
        conversationHistory
      }

      const response = await generateChatResponse(text.trim(), chatContext)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type
      }

      setMessages(prev => [...prev, botMessage])
      setQuickSuggestions(getQuickSuggestions(response.type))
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'general'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const handleQuickSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const chatHeight = variant === 'compact' ? 'h-96' : 'h-[500px]'

  return (
    <div className={`bg-white rounded-2xl shadow-lg ${variant === 'compact' ? 'w-full max-w-md' : 'w-full'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold">ZeroWait Health Assistant</h3>
            <p className="text-sm opacity-90">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={`${chatHeight} overflow-y-auto p-4 space-y-4`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot size={16} className="text-gray-600" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin text-gray-500" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {quickSuggestions.length > 0 && !isLoading && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 pr-12"
              disabled={isLoading}
            />
            {recognition && (
              <button
                onClick={handleVoiceInput}
                className={`absolute right-3 top-2 p-1 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HealthChatbot
