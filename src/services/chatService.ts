interface ChatResponse {
  message: string
  type: 'general' | 'medical' | 'appointment' | 'emergency'
}

export const generateChatResponse = async (input: string, context: {
  userSymptoms?: string
  selectedHospital?: any
  appointmentStatus?: string
  conversationHistory?: string[]
}): Promise<ChatResponse> => {
  const GEMINI_API_KEY = 'AIzaSyCbubGrkxoLO4gBOvn-eClA8QEvqCyOf3k'
  
  // Determine conversation type
  const conversationType = determineConversationType(input)
  
  try {
    const prompt = buildConversationPrompt(input, context, conversationType)
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    )

    const data = await response.json()
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      let aiResponse = data.candidates[0].content.parts[0].text
      
      // Clean up the response
      aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '').trim()
      
      return {
        message: aiResponse,
        type: conversationType
      }
    }
    
    return generateFallbackResponse(input, conversationType)
  } catch (error) {
    console.error('Chat API error:', error)
    return generateFallbackResponse(input, conversationType)
  }
}

const determineConversationType = (input: string): ChatResponse['type'] => {
  const lowerInput = input.toLowerCase()
  
  if (lowerInput.includes('appointment') || lowerInput.includes('booking') || lowerInput.includes('doctor')) {
    return 'appointment'
  }
  
  const medicalTerms = [
    'pain', 'hurt', 'ache', 'symptom', 'medicine', 'treatment', 'diagnosis',
    'fever', 'headache', 'cough', 'cold', 'sick', 'illness', 'health'
  ]
  
  if (medicalTerms.some(term => lowerInput.includes(term))) {
    return 'medical'
  }
  
  const emergencyTerms = [
    'emergency', 'urgent', 'severe', 'critical', 'ambulance', 'help'
  ]
  
  if (emergencyTerms.some(term => lowerInput.includes(term))) {
    return 'emergency'
  }
  
  return 'general'
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
