import React, { useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'

interface TextInputProps {
  onSubmit: (input: string) => void
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input.trim())
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-102' : ''}`}>
        <div className="flex items-center space-x-2 bg-white border-2 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md">
          <MessageCircle 
            size={20} 
            className={`transition-colors duration-200 ${isFocused ? 'text-primary' : 'text-gray-400'}`} 
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms or situation..."
            className="flex-1 resize-none border-none outline-none bg-transparent text-gray-800 placeholder-gray-400 min-h-[60px] max-h-32"
            rows={2}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`p-2 rounded-lg transition-all duration-200 button-press ${
              input.trim() 
                ? 'bg-primary text-white hover:bg-blue-600 transform hover:scale-110 shadow-md hover:shadow-lg' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        
        {/* Animated border */}
        <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-300 pointer-events-none ${
          isFocused ? 'border-primary shadow-lg shadow-blue-200/50' : 'border-transparent'
        }`} />
      </div>

      {/* Character counter and tips */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="space-x-4">
          <span>💡 Be specific about your symptoms</span>
          {input.length > 100 && (
            <span className="text-orange-500 animate-fade-in">
              ⚡ Great detail! This will help us find the best care.
            </span>
          )}
        </div>
        <span className={`transition-colors duration-200 ${input.length > 200 ? 'text-orange-500' : ''}`}>
          {input.length}/500
        </span>
      </div>

      {/* Quick suggestions */}
      {!input && (
        <div className="animate-slide-up">
          <div className="text-sm text-gray-500 mb-2">Quick examples:</div>
          <div className="flex flex-wrap gap-2">
            {[
              "Severe headache for 2 hours",
              "Chest tightness when walking",
              "High fever with chills",
              "Sharp stomach pain"
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setInput(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full text-sm transition-all duration-200 hover:scale-105 button-press"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}

export default TextInput
