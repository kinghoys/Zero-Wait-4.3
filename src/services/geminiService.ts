interface AnalysisResult {
  situation: 'emergency' | 'normal'
  severity: number
  recommendations: string[]
  urgencyKeywords: string[]
}

export const analyzeSymptoms = async (input: string): Promise<AnalysisResult> => {
  const GEMINI_API_KEY = 'AIzaSyCbubGrkxoLO4gBOvn-eClA8QEvqCyOf3k'
  
  // Critical emergency keywords (only the most severe)
  const criticalKeywords = [
    'heart attack', 'stroke', 'unconscious', 'not breathing', 'choking',
    'severe bleeding', 'major accident', 'can\'t breathe', 'cardiac arrest'
  ]
  
  // Check for critical emergencies only
  const hasCriticalKeywords = criticalKeywords.some(keyword => 
    input.toLowerCase().includes(keyword.toLowerCase())
  )
  
  if (hasCriticalKeywords) {
    return {
      situation: 'emergency',
      severity: 9,
      recommendations: [
        'Call emergency services immediately',
        'Seek immediate medical attention',
        'Stay calm and follow first aid if trained'
      ],
      urgencyKeywords: criticalKeywords.filter(keyword => 
        input.toLowerCase().includes(keyword.toLowerCase())
      )
    }
  }

  try {
    const prompt = `
    You are a medical triage AI. Analyze this patient input: "${input}"
    
    Classify as EMERGENCY only if:
    - Life-threatening conditions (heart attack, stroke, severe trauma)
    - Severe breathing difficulty or cardiac symptoms
    - Major injuries or accidents
    - Loss of consciousness or severe bleeding
    
    Classify as NORMAL for:
    - Routine symptoms (headache, fever, cough)
    - Mild pain or discomfort
    - Check-ups or consultations
    - Non-urgent conditions
    
    Respond in this exact JSON format:
    {
      "situation": "emergency",
      "severity": 8,
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
      "urgencyKeywords": ["keyword1"]
    }
    `

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
      const aiResponse = data.candidates[0].content.parts[0].text
      
      try {
        // Try to parse JSON response
        const parsed = JSON.parse(aiResponse.replace(/```json|```/g, ''))
        return parsed
      } catch {
        // Fallback analysis based on keywords
        return analyzeKeywords(input)
      }
    }
    
    return analyzeKeywords(input)
  } catch (error) {
    console.error('Gemini API error:', error)
    return analyzeKeywords(input)
  }
}

// Fallback keyword-based analysis
const analyzeKeywords = (input: string): AnalysisResult => {
  const lowerInput = input.toLowerCase()
  
  // More specific emergency indicators
  const emergencyTerms = [
    'severe chest pain', 'crushing pain', 'can\'t breathe', 'major bleeding',
    'severe trauma', 'loss of consciousness', 'severe burn'
  ]
  
  // Clear normal indicators  
  const normalTerms = [
    'mild', 'slight', 'occasional', 'check-up', 'routine', 'appointment',
    'headache', 'fever', 'cough', 'cold', 'consultation'
  ]
  
  // Check for emergency phrases (not just individual words)
  const hasEmergencyTerms = emergencyTerms.some(term => lowerInput.includes(term))
  const hasNormalTerms = normalTerms.some(term => lowerInput.includes(term))
  
  // Only classify as emergency if clear emergency indicators AND no normal terms
  if (hasEmergencyTerms && !hasNormalTerms) {
    return {
      situation: 'emergency',
      severity: 7,
      recommendations: [
        'Seek immediate medical attention',
        'Monitor symptoms closely',
        'Have someone accompany you to hospital'
      ],
      urgencyKeywords: emergencyTerms.filter(term => lowerInput.includes(term))
    }
  }
  
  // Default to normal for unclear cases
  return {
    situation: 'normal',
    severity: Math.floor(Math.random() * 3) + 2, // 2-4 severity for normal
    recommendations: [
      'Schedule appointment with appropriate specialist',
      'Monitor symptoms and note changes',
      'Consider consulting your doctor if symptoms persist'
    ],
    urgencyKeywords: []
  }
}
