interface ChatResponse {
  message: string
  type: 'general' | 'medical' | 'appointment' | 'emergency'
}

const buildPrompt = (message: string, context?: any): string => {
  const basePrompt = `You are a helpful medical assistant for ZeroWait Emergency healthcare app. 
  Provide concise, helpful responses. Keep responses under 100 words.
  
  User message: ${message}`
  
  if (context?.userSymptoms) {
    return basePrompt + `\n\nContext: User has described symptoms: ${context.userSymptoms}`
  }
  
  return basePrompt
}

const determineConversationType = (input: string): 'general' | 'medical' | 'appointment' | 'emergency' => {
  const medicalKeywords = ['pain', 'sick', 'symptoms', 'hurt', 'fever', 'nausea', 'dizzy', 'cough', 'ache', 'bleeding']
  const emergencyKeywords = ['emergency', 'urgent', 'critical', 'severe', 'heart attack', 'stroke', 'unconscious']
  const appointmentKeywords = ['appointment', 'book', 'schedule', 'visit', 'consultation']
  
  const lowerInput = input.toLowerCase()
  
  if (emergencyKeywords.some(keyword => lowerInput.includes(keyword))) {
    return 'emergency'
  } else if (medicalKeywords.some(keyword => lowerInput.includes(keyword))) {
    return 'medical'
  } else if (appointmentKeywords.some(keyword => lowerInput.includes(keyword))) {
    return 'appointment'
  }
  
  return 'general'
}

const getFallbackResponse = (type: string): string => {
  const responses = {
    'medical': "I understand you're looking for medical guidance. For accurate diagnosis and treatment, I recommend consulting with a healthcare professional. In the meantime, please monitor your symptoms and seek immediate care if they worsen.",
    'emergency': "If this is a medical emergency, please call emergency services immediately or use our emergency ambulance booking. Your safety is our top priority.",
    'appointment': "I can help you book an appointment. Please use our appointment booking feature to schedule a visit with a healthcare provider at your preferred time.",
    'general': "I'm here to help with your healthcare questions. Feel free to ask about symptoms, appointments, or general health concerns.",
    'error': "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or contact our support team if the issue persists.",
    'network': "There seems to be a connection issue. Please check your internet connection and try again.",
    'timeout': "The request is taking longer than expected. Please try again with a shorter message.",
    'rate_limit': "I'm receiving too many requests right now. Please wait a moment and try again.",
    'server_error': "Our AI assistant is temporarily unavailable. Please try again shortly or contact support for immediate assistance."
  }
  
  return responses[type as keyof typeof responses] || responses['general']
}

export const getChatResponse = async (message: string, context?: any): Promise<string> => {
  try {
    const API_KEY = 'AIzaSyBvmNPHDOWZhsZKQK1boaFMHJ2xJVqAyg8' // Replace with env variable
    
    if (!API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    const prompt = buildPrompt(message, context)
    const conversationType = determineConversationType(message)
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: conversationType === 'medical' ? 0.3 : 0.7,
          maxOutputTokens: 200,
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        return getFallbackResponse('rate_limit')
      } else if (response.status >= 500) {
        return getFallbackResponse('server_error')
      } else {
        throw new Error(`API request failed: ${response.status}`)
      }
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!aiResponse || aiResponse.trim() === '') {
      return getFallbackResponse(conversationType)
    }
    
    return aiResponse
    
  } catch (error) {
    console.error('Chat service error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return getFallbackResponse('timeout')
      } else if (error.message.includes('fetch')) {
        return getFallbackResponse('network')
      }
    }
    
    return getFallbackResponse('error')
  }
}

const buildConversationPrompt = (input: string, context: any, type: ChatResponse['type']): string => {
  const baseContext = `
You are ZeroWait Health Assistant, a friendly and knowledgeable AI chatbot for healthcare services.
User input: "${input}"
${context.userSymptoms ? `User's reported symptoms: ${context.userSymptoms}` : ''}
${context.selectedHospital ? `Selected hospital: ${context.selectedHospital.name}` : ''}
${context.appointmentStatus ? `Appointment status: ${context.appointmentStatus}` : ''}
`

  switch (type) {
    case 'general':
      return `${baseContext}
      
Respond naturally and conversationally. You can discuss:
- General health and wellness topics
- Healthcare system information
- Hospital services and facilities
- General questions about medical procedures
- Friendly conversation about health-related topics

Be helpful, informative, and maintain a warm, professional tone. Keep responses concise but comprehensive.`

    case 'medical':
      return `${baseContext}
      
Provide helpful medical information while being clear that this is not a substitute for professional medical advice. You can:
- Explain common symptoms and conditions
- Suggest when to seek medical care
- Provide general health tips
- Discuss treatment options in general terms
- Recommend appropriate specialists

Always remind users to consult healthcare professionals for personalized advice.`

    case 'appointment':
      return `${baseContext}
      
Help with appointment-related queries:
- What to expect during appointments
- How to prepare for medical visits
- What documents to bring
- Questions to ask doctors
- Follow-up care instructions

Be practical and specific in your advice.`

    case 'emergency':
      return `${baseContext}
      
Handle emergency-related questions with appropriate urgency:
- Provide immediate guidance for emergency situations
- Explain when to call emergency services
- Give first aid suggestions when appropriate
- Help assess severity of conditions
- Direct to immediate medical care when needed

Maintain calm but urgent tone when discussing serious conditions.`

    default:
      return `${baseContext}
      
Respond helpfully and naturally to any health-related questions or general conversation.`
  }
}

const generateFallbackResponse = (input: string, type: ChatResponse['type']): ChatResponse => {
  const responses = {
    general: [
      "I'm here to help with your health questions! Feel free to ask me anything about healthcare, symptoms, or medical services.",
      "Thanks for chatting with me! I can help you with health-related questions, appointment information, or general medical guidance.",
      "I'd be happy to help! You can ask me about health topics, medical procedures, or anything related to your healthcare needs."
    ],
    medical: [
      "That's an important health question. While I can provide general information, I'd recommend discussing your specific symptoms with a healthcare professional for personalized advice.",
      "I understand your concern about this health issue. For the most accurate diagnosis and treatment, please consult with a doctor who can evaluate your specific situation.",
      "Health symptoms can have various causes. It's always best to speak with a medical professional who can properly assess your condition."
    ],
    appointment: [
      "For appointment-related questions, I'm here to help! You can ask about preparing for visits, what to expect, or how to make the most of your appointment time.",
      "I can help you with appointment information. Feel free to ask about scheduling, preparation, or what to bring to your medical visit.",
      "Let me help you with your appointment concerns. I can provide guidance on medical visits and what to expect."
    ],
    emergency: [
      "For any emergency situation, please don't hesitate to call emergency services immediately. I can provide general guidance, but professional medical care is essential.",
      "If this is a medical emergency, please seek immediate professional help. I'm here to provide support and general information.",
      "Emergency situations require immediate medical attention. Please contact emergency services if you need urgent care."
    ]
  }
  
  const typeResponses = responses[type] || responses.general
  const randomResponse = typeResponses[Math.floor(Math.random() * typeResponses.length)]
  
  return {
    message: randomResponse,
    type
  }
}

// Quick response suggestions based on conversation type
export const getQuickSuggestions = (type: ChatResponse['type']): string[] => {
  const suggestions = {
    general: [
      "Tell me about your services",
      "How does ZeroWait work?",
      "What makes you different?",
      "I have a general health question"
    ],
    medical: [
      "What should I know about my symptoms?",
      "When should I see a doctor?",
      "Tell me about treatment options",
      "How can I manage my condition?"
    ],
    appointment: [
      "What should I bring to my appointment?",
      "How do I prepare for my visit?",
      "What questions should I ask my doctor?",
      "What happens after my appointment?"
    ],
    emergency: [
      "Is this an emergency situation?",
      "What should I do right now?",
      "Should I call an ambulance?",
      "How urgent is this condition?"
    ]
  }
  
  return suggestions[type] || suggestions.general
}
