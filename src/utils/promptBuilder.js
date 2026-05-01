/**
 * Prompt Builder - Creates structured prompts for medical analysis
 */

const serializeAnswers = (answers = {}, questions = []) => {
  if (!Object.keys(answers).length) {
    return 'No questionnaire answers provided.';
  }

  const questionMap = new Map(
    questions.map((question) => [question._id?.toString?.() || String(question._id), question.question])
  );

  return Object.entries(answers)
    .map(([key, value], index) => {
      const questionText = questionMap.get(key) || `Question ${index + 1}`;
      return `- ${questionText}: ${value}`;
    })
    .join('\n');
};

export const buildMedicalAnalysisPrompt = ({
  disease,
  symptoms,
  answers,
  personalDetails,
  questions = [],
  documentAnalysis = '',
  analysisMode = 'disease-specific',
  baseScore,
  questionnaireScore,
  symptomScore,
}) => {
  return `
You are an expert clinical AI assistant creating a detailed preliminary health report.

Analyze the following patient information carefully:

DISEASE AREA:
${disease}

ANALYSIS MODE:
${analysisMode}

PATIENT SYMPTOMS:
${symptoms}

UPLOADED FILE CONTEXT:
${documentAnalysis || 'No uploaded file context provided.'}

PERSONAL DETAILS:
- Age: ${personalDetails.age || 'Not provided'}
- Gender: ${personalDetails.gender || 'Not provided'}
- Weight: ${personalDetails.weight || 'Not provided'}
- Height: ${personalDetails.height || 'Not provided'}
- Blood Type: ${personalDetails.bloodType || 'Not provided'}
- Medical History: ${personalDetails.medicalHistory || 'Not provided'}

QUESTIONNAIRE RESPONSES:
${serializeAnswers(answers, questions)}

RULE-BASED SCORING CONTEXT:
- Questionnaire Score: ${questionnaireScore}
- Symptom Score: ${symptomScore}
- Preliminary Base Score: ${baseScore}

Return ONLY valid JSON. Do not include markdown fences.
Use this exact structure:
{
  "score": 0,
  "riskLevel": "Low",
  "confidence": 0.0,
  "sentiment": 0.0,
  "summary": "2-4 sentence overview",
  "symptomAnalysis": "Detailed analysis of the symptom pattern and likely concern areas",
  "likelyCondition": "Most likely condition or disease area in cautious terms",
  "probableConditions": ["possible condition 1", "possible condition 2"],
  "documentAnalysis": "How the uploaded photo/report influenced the assessment",
  "riskFactors": ["factor 1", "factor 2"],
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "medicalAdvice": "Practical medical guidance and caution notes",
  "urgentCare": "Clear note on when urgent or immediate care is needed",
  "followUpTests": ["test 1", "test 2"],
  "suggestedMedicines": [
    {
      "name": "medicine name",
      "dosage": "dosage",
      "frequency": "frequency",
      "reason": "why it may help"
    }
  ]
}

Rules:
- Score must be an integer from 0 to 100.
- Risk level must match the score severity.
- Base the result on all submitted information, not on symptoms alone.
- Be medically cautious and avoid claiming a definitive diagnosis.
- If the analysis mode is "general-condition", identify the most likely condition area and list a few probable conditions based on the uploaded file context and symptoms.
- If the uploaded file is a photo or report, explain how it influenced the assessment inside "documentAnalysis".
- If medicine suggestions are uncertain, return an empty array instead of guessing.
`;
};

export const buildDoctorRecommendationPrompt = (disease, symptoms, score) => {
  return `
Based on the following medical information, recommend the type of doctors the patient should consult:

Disease: ${disease}
Symptoms: ${symptoms}
Health Score: ${score}

Recommend:
1. Primary specialist
2. Secondary specialists if needed
3. Urgency of consultation
`;
};
