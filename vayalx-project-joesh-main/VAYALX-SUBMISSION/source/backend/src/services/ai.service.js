// ── VAYALX Real AI Crop Disease Diagnosis & Agronomy Service (Phase 5) ──
// Secure server-side multimodal image analysis with Google Gemini SDK (@google/genai) and Zod schema validation.

const { GoogleGenAI } = require('@google/genai');
const { z } = require('zod');
const env = require('../config/env');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/error.util');

// Initialize Google Gemini Client strictly server-side
let geminiClient = null;
if (env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  } catch (err) {
    logger.warn('Failed to initialize GoogleGenAI client:', err.message);
  }
}

/**
 * Strict Zod Schema for Gemini AI Diagnosis Response
 */
const DiagnosisSchema = z.object({
  crop: z.string().default('Unknown Crop'),
  status: z.enum(['healthy', 'diseased', 'possible_issue', 'insufficient_evidence', 'unknown']).default('unknown'),
  condition: z.string().nullable().default(null),
  confidence: z.number().min(0).max(1).default(0.5),
  confidenceLabel: z.enum(['high', 'moderate', 'low', 'uncertain']).default('uncertain'),
  severity: z.enum(['none', 'low', 'moderate', 'high', 'critical', 'unknown']).default('unknown'),
  pathogen: z.string().nullable().default(null),
  symptoms: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  chemicalTreatment: z.array(z.string()).default([]),
  prevention: z.array(z.string()).default([]),
  insufficientEvidence: z.boolean().default(false),
  notes: z.string().default('')
});

/**
 * System Instruction for Agricultural Pathology Multimodal Analysis
 */
const SYSTEM_DIAGNOSIS_PROMPT = `
You are the official Agricultural Plant Pathology AI Diagnostic Assistant for the VAYALX platform in Tamil Nadu, India.
Analyze the supplied crop/plant image with scientific rigor and agronomic precision.

EVALUATION RULES:
1. Determine whether the image contains clear, visible botanical/crop foliage, stem, fruit, or root evidence.
2. If the image is blurry, out of focus, off-topic (e.g. human, animal, vehicle, indoor object, document, or non-plant), or lacks visual detail to identify any plant or disease:
   Set "status": "insufficient_evidence", "insufficientEvidence": true, "condition": null, "confidence": 0.0, "confidenceLabel": "uncertain", "notes": "Please upload a clear, focused close-up photo of the affected crop leaf or plant part."
3. If the crop appears completely healthy:
   Set "status": "healthy", "condition": "Healthy Foliage", "severity": "none", "confidenceLabel": "high" or "moderate".
4. If a disease, pest, nutrient deficiency, or fungal pathogen is visible:
   Set "status": "diseased" or "possible_issue".
   Identify the specific disease name (include both English and Tamil name if common in Tamil Nadu, e.g. "Tomato Late Blight (தக்காளி இலைக்கருகல்)").
   Provide causative pathogen (fungus, bacterium, virus, or pest name).
   Estimate AI visual confidence strictly between 0.00 and 1.00 based on visible symptom clarity.
   Set "confidenceLabel": "high" (>=0.85), "moderate" (0.65-0.84), "low" (0.40-0.64), or "uncertain" (<0.40).
   List concrete visual symptoms observed in the image.
   Provide Organic / Bio-Remedies (e.g., Panchagavya, Neem Seed Kernel Extract / NSKE, Trichoderma viride, Pseudomonas fluorescens).
   Provide Chemical Management (approved TNAU / CIBRC standards, e.g. Mancozeb, Copper Oxychloride, Carbendazim with dosages).
   Provide preventive cultural practices.

IMPORTANT SAFETY & COMPLIANCE:
- Never fabricate a diagnosis if symptoms are ambiguous or absent.
- You must return ONLY valid, parseable JSON matching the required schema. Do not enclose in any introductory text.

JSON FORMAT:
{
  "crop": "Tomato / நெல் / etc.",
  "status": "healthy" | "diseased" | "possible_issue" | "insufficient_evidence" | "unknown",
  "condition": "Disease name or Healthy",
  "confidence": 0.92,
  "confidenceLabel": "high" | "moderate" | "low" | "uncertain",
  "severity": "none" | "low" | "moderate" | "high" | "critical" | "unknown",
  "pathogen": "Scientific name or null",
  "symptoms": ["Symptom 1", "Symptom 2"],
  "recommendations": ["Organic remedy 1", "Organic remedy 2"],
  "chemicalTreatment": ["Chemical spray 1 with dosage", "Chemical spray 2"],
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "insufficientEvidence": false,
  "notes": "General agronomic guidance note"
}
`;

/**
 * Deterministic Demo Response for DEMO mode
 */
const DEMO_DIAGNOSES = {
  tomato: {
    crop: 'Tomato (தக்காளி)',
    status: 'diseased',
    condition: 'Tomato Late Blight (தக்காளி இலைக்கருகல்)',
    confidence: 0.96,
    confidenceLabel: 'high',
    severity: 'moderate',
    pathogen: 'Phytophthora infestans',
    symptoms: [
      'Irregular dark brown water-soaked lesions on upper leaf surface',
      'White fungal downy growth on underside of leaves in humid conditions',
      'Rapid browning and necrosis of leaf petiole and stems'
    ],
    recommendations: [
      'Foliar spray of 3% Panchagavya or Jeevamrutham early morning (6:00–8:00 AM)',
      'Spray Neem Seed Kernel Extract (NSKE 5%) or cold-pressed Neem Oil (3 ml/L)',
      'Enrich farmyard manure with Trichoderma viride (2 kg/acre) and apply to soil'
    ],
    chemicalTreatment: [
      'Spray Mancozeb 75% WP @ 2.0g per litre of water',
      'Or Copper Oxychloride (COC 50% WP) @ 2.5g per litre of water',
      'Repeat spray after 10–12 days if damp cloudy weather persists'
    ],
    prevention: [
      'Avoid overhead sprinkler irrigation; use drip irrigation to keep foliage dry',
      'Maintain wide crop spacing (60 x 45 cm) for optimal air circulation',
      'Prune and safely burn infected lower canopy leaves immediately'
    ],
    insufficientEvidence: false,
    notes: 'AI-assisted visual guidance based on TNAU Agronomy standards. Verify with field symptoms.'
  },
  rice: {
    crop: 'Paddy / Rice (நெல்)',
    status: 'diseased',
    condition: 'Rice Blast Disease (நெல் குலை நோய் / இலைக்கருகல்)',
    confidence: 0.94,
    confidenceLabel: 'high',
    severity: 'high',
    pathogen: 'Magnaporthe oryzae (Pyricularia oryzae)',
    symptoms: [
      'Spindle-shaped or diamond-shaped lesions with greyish center and dark brown margin',
      'Lesions enlarge and coalesce causing complete drying of leaf blades',
      'Blackish-brown discoloration at the neck node of the panicle'
    ],
    recommendations: [
      'Foliar application of Pseudomonas fluorescens (10g/L or 2.5 kg/ha)',
      'Silicon fertilizer (Silixol 2%) foliar spray to strengthen leaf epidermal silica cells',
      '3% Panchagavya spray at active tillering and panicle initiation stages'
    ],
    chemicalTreatment: [
      'Spray Tricyclazole 75% WP @ 0.6g per litre of water',
      'Or Isoprothiolane 40% EC @ 1.5 ml per litre of water',
      'Temporarily withhold top-dressing of Urea to prevent excessive succulent growth'
    ],
    prevention: [
      'Seed treatment with Pseudomonas fluorescens @ 10g/kg of paddy seeds',
      'Avoid high plant density in nursery and main field',
      'Ensure balanced N:P:K fertilization (avoid excess Nitrogen)'
    ],
    insufficientEvidence: false,
    notes: 'TNAU Rice Crop Protection Advisory. Critical stage requires immediate field intervention.'
  }
};

class AiService {
  /**
   * Primary Multimodal Crop Pathology Analysis
   * @param {Object} params
   * @param {Buffer} params.imageBuffer - Image buffer from memory
   * @param {string} params.mimeType - Validated image MIME type
   * @param {string} [params.cropName] - Optional farmer-supplied crop hint
   * @param {string} [params.location] - Optional location context
   * @param {string} [params.additionalNotes] - Optional farmer observations
   * @returns {Promise<{ diagnosis: Object, source: Object }>}
   */
  async analyzeCropImage({ imageBuffer, mimeType, cropName = '', location = '', additionalNotes = '' }) {
    const mode = process.env.AI_MODE || env.AI_MODE;
    const modelName = process.env.GEMINI_MODEL || env.GEMINI_MODEL;

    // ── 1. DEMO MODE EXECUTION (Deterministic & Transparent) ──
    if (mode === 'DEMO' || !env.GEMINI_API_KEY) {
      logger.info(`[VAYALX AI Service] Operating in DEMO mode for crop diagnosis.`);
      
      const sampleKey = cropName && cropName.toLowerCase().includes('rice') ? 'rice' : 'tomato';
      const sampleDiagnosis = DEMO_DIAGNOSES[sampleKey] || DEMO_DIAGNOSES.tomato;

      return {
        diagnosis: sampleDiagnosis,
        source: {
          provider: 'Google Gemini (Simulated Demo)',
          model: modelName,
          mode: 'DEMO',
          timestamp: new Date().toISOString()
        }
      };
    }

    // ── 2. LIVE MODE EXECUTION (Google Gemini API via @google/genai) ──
    if (!geminiClient) {
      geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }

    // Sanitize optional contextual inputs to prevent prompt manipulation
    const sanitizedCrop = cropName ? String(cropName).slice(0, 50).replace(/[^\w\s-]/gi, '') : '';
    const sanitizedLocation = location ? String(location).slice(0, 50).replace(/[^\w\s-]/gi, '') : '';
    const sanitizedNotes = additionalNotes ? String(additionalNotes).slice(0, 200).replace(/[<>{}]/g, '') : '';

    let userPromptText = `Please analyze this agricultural crop/plant image. Return ONLY the strict JSON object.`;
    if (sanitizedCrop) userPromptText += `\nFarmer Crop Hint: ${sanitizedCrop}`;
    if (sanitizedLocation) userPromptText += `\nFarm Location: ${sanitizedLocation} (Tamil Nadu, India)`;
    if (sanitizedNotes) userPromptText += `\nObserved Field Symptoms: ${sanitizedNotes}`;

    const base64Data = imageBuffer.toString('base64');

    const apiCallPromise = geminiClient.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_DIAGNOSIS_PROMPT },
            { text: userPromptText },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    // Enforce strict request timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new ApiError('AI diagnosis timed out. Please try again.', 504)), env.AI_REQUEST_TIMEOUT_MS);
    });

    try {
      const startTime = Date.now();
      const response = await Promise.race([apiCallPromise, timeoutPromise]);
      const latencyMs = Date.now() - startTime;

      let responseText = '';
      if (response && response.text) {
        responseText = typeof response.text === 'function' ? response.text() : response.text;
      } else if (response && response.candidates && response.candidates[0]?.content?.parts) {
        responseText = response.candidates[0].content.parts.map(p => p.text || '').join('');
      }

      if (!responseText || typeof responseText !== 'string') {
        throw new ApiError('AI diagnosis service returned an empty response.', 502);
      }

      // Clean JSON formatting (strip markdown code block if present)
      let cleanedJson = responseText.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }

      let parsedRaw;
      try {
        parsedRaw = JSON.parse(cleanedJson);
      } catch (parseErr) {
        logger.warn('[VAYALX AI Service] JSON parse failure on Gemini output:', responseText.slice(0, 200));
        throw new ApiError('AI diagnosis response could not be safely processed.', 502);
      }

      // Validate parsed object with strict Zod schema
      const validatedDiagnosis = DiagnosisSchema.parse(parsedRaw);

      // Normalize confidence to 0..1 range safely
      validatedDiagnosis.confidence = Math.max(0, Math.min(1, Number(validatedDiagnosis.confidence) || 0));

      logger.info(`[VAYALX AI Service] Live diagnosis complete. Crop: ${validatedDiagnosis.crop}, Status: ${validatedDiagnosis.status}, Latency: ${latencyMs}ms`);

      return {
        diagnosis: validatedDiagnosis,
        source: {
          provider: 'Google Gemini',
          model: modelName,
          mode: 'LIVE',
          latencyMs,
          timestamp: new Date().toISOString()
        }
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;

      // Handle Gemini SDK / Rate Limit / Auth errors gracefully
      logger.error('[VAYALX AI Service] Gemini Execution Error:', err.message);

      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new ApiError('AI diagnosis service configuration error.', 503);
      }
      if (err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota'))) {
        throw new ApiError('AI diagnosis service is currently experiencing high load. Please try again in a few moments.', 429);
      }

      throw new ApiError('AI diagnosis is temporarily unavailable. Please try again.', 503);
    }
  }

  /**
   * Conversational Agronomy Assistant (Secure Backend Chatbot Support)
   * @param {Object} params
   * @param {string} params.message
   * @param {Array} [params.history]
   * @param {string} [params.language]
   * @returns {Promise<{ reply: string, source: Object }>}
   */
  async chatAgronomist({ message, history = [], language = 'auto' }) {
    const mode = process.env.AI_MODE || env.AI_MODE;
    const modelName = process.env.GEMINI_MODEL || env.GEMINI_MODEL;

    if (mode === 'DEMO' || !env.GEMINI_API_KEY || !geminiClient) {
      return {
        reply: `[VAYALX Agronomist Demo Mode]: For ${message}, we recommend consulting the Tamil Nadu Agricultural University (TNAU) package of practices. Ensure adequate drainage, balanced NPK application, and regular scouting for early pest symptoms.`,
        source: { provider: 'Google Gemini (Simulated Demo)', model: modelName, mode: 'DEMO' }
      };
    }

    const systemPrompt = `You are VAYALX AgriBot, an expert agronomy AI assistant for farmers in Tamil Nadu, India.
Provide practical, actionable, scientific, and localized farming advice for Tamil Nadu agro-climatic zones (Cauvery Delta, Western, Southern, High Rainfall zones).
Support both Tamil and English. If the user speaks Tamil, reply in helpful, conversational Tamil.
Advise on: crop care, soil health, pest management, bio-fertilizers (Panchagavya, Jeevamrutham), irrigation, and TN government schemes (Uzhavan app, PM-KISAN, Free Power).`;

    try {
      const response = await geminiClient.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }, { text: message }] }
        ],
        config: { temperature: 0.7 }
      });

      const reply = response.text || 'Unable to generate reply at this moment.';
      return {
        reply,
        source: { provider: 'Google Gemini', model: modelName, mode: 'LIVE' }
      };
    } catch (err) {
      logger.error('[VAYALX AI Service] Chat error:', err.message);
      return {
        reply: 'VAYALX AgriBot is momentarily busy. Please try again shortly.',
        source: { provider: 'Google Gemini', model: modelName, mode: 'ERROR' }
      };
    }
  }
}

module.exports = new AiService();
