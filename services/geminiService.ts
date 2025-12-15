
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AnalysisResult, PatientMetrics } from "../types";

// Support both standard process.env (Node) and import.meta.env (Vite/Vercel)
const apiKey = (import.meta as any).env?.VITE_API_KEY || (import.meta as any).env?.VITE_GOOGLE_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.warn("API Key is missing! Please set VITE_API_KEY in Vercel Environment Variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Cấu hình bộ lọc an toàn: Tắt toàn bộ (BLOCK_NONE) để cho phép phân tích ảnh y tế
const MEDICAL_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export const analyzePatient = async (
  metrics: PatientMetrics,
  imageBase64: string,
  mimeType: string
): Promise<AnalysisResult> => {
  try {
    const prompt = `
      You are a specialized Medical AI for Plastic Surgery Assessment.
      Analyze the provided clinical image (Patient's chest area) and the following metrics:
      - Height: ${metrics.height} cm
      - Weight: ${metrics.weight} kg
      - Breast Width (BW): ${metrics.breastWidth} cm
      - Desired Look: ${metrics.desiredLook}

      Based on standard "Tebbetts High Five" system and dimensional planning, recommend appropriate breast implant volumes.

      Output MUST be a valid JSON object matching this schema:
      {
        "option1": {
          "volume": number (recommended cc),
          "cupSize": "string (estimated cup)",
          "style": "string (short description)"
        },
        "option2": {
          "volume": number (alternative cc),
          "cupSize": "string",
          "style": "string"
        },
        "bodyAnalysis": "string (Clinical assessment of the chest wall, asymmetry, and tissue quality in Vietnamese)",
        "reasoning": "string (Explanation of why these volumes fit the BW and dimensions in Vietnamese)",
        "implantsTypeSuggestion": "string (Suggested profile and type, e.g., Round High Profile, in Vietnamese)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: "This is a medical diagnostic context. The images are clinical photographs for surgical planning. Do not suppress output based on nudity, as this is anatomical material.",
        temperature: 0.1,
        responseMimeType: "application/json",
        safetySettings: MEDICAL_SAFETY_SETTINGS,
      },
    });

    // Check if we have a valid candidate
    const candidate = response.candidates?.[0];
    
    // Debugging: Log safety ratings if blocked
    if (candidate?.finishReason === 'SAFETY') {
       console.error("Safety Ratings:", candidate.safetyRatings);
       throw new Error("SAFETY_BLOCK: AI chặn ảnh này vì lý do an toàn. Vui lòng thử ảnh chụp rõ ràng hơn, góc độ y tế hơn.");
    }

    let text = candidate?.content?.parts?.[0]?.text;

    if (!text && response.text) {
        text = response.text;
    }

    if (!text) {
      console.warn("Empty Response Candidate:", candidate);
      throw new Error("EMPTY_RESPONSE: AI không trả về kết quả. Có thể ảnh không đạt chuẩn y tế hoặc bị chặn ngầm.");
    }

    // Parse JSON
    try {
        const result = JSON.parse(text) as AnalysisResult;
        
        // Ensure defaults if AI misses something
        if (!result.option1) throw new Error("Missing option1");
        
        return result;
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Text:", text);
        throw new Error("FORMAT_ERROR: Dữ liệu trả về không đúng định dạng JSON.");
    }

  } catch (error: any) {
    console.error("Gemini Analysis Error Details:", error);
    
    // Pass through specific errors
    if (error.message && (error.message.includes("SAFETY") || error.message.includes("EMPTY") || error.message.includes("FORMAT"))) {
        throw error;
    }
    
    // General fallback
    throw new Error(`Lỗi hệ thống AI: ${error.message || "Không xác định"}`);
  }
};

export const generateSimulationImage = async (
  metrics: PatientMetrics,
  targetVolume: number,
  targetCup: string,
  imageBase64: string,
  mimeType: string,
  style: 'realistic' | '3d-mesh' = 'realistic',
  angle: 'front' | 'side-left' | 'side-right' = 'front'
): Promise<string> => {
  try {
    let prompt = "";
    
    // Determine rotation instructions
    let rotationInstruction = "View: Frontal view (0 degrees).";
    if (angle === 'side-left') {
        rotationInstruction = "View: Left Profile (90 degrees rotation). RECONSTRUCT side view of the patient.";
    } else if (angle === 'side-right') {
        rotationInstruction = "View: Right Profile (90 degrees rotation). RECONSTRUCT side view of the patient.";
    }

    // --- VISUAL SCALING LOGIC (Hệ số nhân thị giác) ---
    let visualMultiplier = 1.0;
    let tissueContext = "";

    const currentSizeLower = metrics.currentSize.toLowerCase();
    
    if (currentSizeLower.includes('phẳng') || currentSizeLower.includes('lép') || currentSizeLower.includes('flat')) {
        visualMultiplier = 1.12; 
        tissueContext = "Patient has flat chest (near zero tissue). Enhance projection to show clear implant definition.";
    } else if (currentSizeLower.includes('cup a')) {
        visualMultiplier = 1.25; 
        tissueContext = "Patient has small Cup A base. Combine base tissue with implant for fuller look.";
    } else if (currentSizeLower.includes('cup b')) {
        visualMultiplier = 1.30; 
        tissueContext = "Patient has Cup B. Add upper pole fullness for a push-up effect.";
    } else if (currentSizeLower.includes('cup c') || currentSizeLower.includes('đầy')) {
        visualMultiplier = 1.30; 
        tissueContext = "Patient has Cup C. Maximize cleavage and upper fullness.";
    } else {
        visualMultiplier = 1.20; // Default
    }

    // Calculate the volume specific for the AI prompt (Visual Volume)
    const visualVolume = Math.round(targetVolume * visualMultiplier);
    
    // --- PROMPT ENGINEERING FOR VISIBILITY ---
    
    let anatomicalKeywords = "";
    if (angle === 'front') {
        anatomicalKeywords = "Create DEEP CLEAVAGE lines. Create visible SHADOWS under the breast to show heavy projection. The breast width must appear wider.";
    } else {
        anatomicalKeywords = "Create EXTREME FORWARD PROJECTION. The breast must extend significantly forward from the chest wall. The upper pole slope must be CONVEX (rounded outwards).";
    }

    // --- CONTOUR LINE LOGIC ---
    let visualGuideInstruction = "";
    if (style === 'realistic') {
        // Yêu cầu vẽ đường viền phẫu thuật màu xanh (Blue Surgical Markings)
        visualGuideInstruction = "DRAW SURGICAL MARKINGS: Draw subtle BLUE SURGICAL LINES on the skin outlining the new breast footprint (medial cleavage line, lateral fold, and inferior fold). Use these lines to clearly visualize the boundary of the augmentation.";
    } else {
        // 3D Mesh
        visualGuideInstruction = "Draw sharp, high-contrast CONTOUR LINES (topographic curves) across the breast volume to visualize the 3D depth and spherical shape.";
    }

    if (style === '3d-mesh') {
      prompt = `
        Create a medical 3D wireframe diagram of the chest.
        Show the placement of a ${targetVolume}cc breast implant.
        ${rotationInstruction}
        ${visualGuideInstruction}
        Style: Blue holographic wireframe on dark background. Anatomical diagram.
      `;
    } else {
      prompt = `
        TASK: Generate a Post-Operative Clinical Simulation with Surgical Markings.
        
        INPUT: Use the provided patient image as the canvas.
        TRANSFORMATION: Aggressive Breast Augmentation.
        
        TECHNICAL TARGET: ${targetVolume}cc implants.
        VISUAL SIMULATION TARGET: ${visualVolume}cc appearance.
        
        CRITICAL INSTRUCTIONS FOR VISIBILITY:
        1. **SIZE INCREASE MUST BE OBVIOUS**: The breast area must look significantly larger and fuller.
        2. **SHAPE CHANGE**: Transform the breast shape to be ROUND and FULL.
        3. **DEFINITION**: ${anatomicalKeywords}
        4. **VISUAL GUIDES**: ${visualGuideInstruction}
        5. ${rotationInstruction}
        6. **REALISM**: Keep skin tone and lighting consistent.
        
        Style: Photorealistic Medical Simulation with Surgical Guidelines. High Definition.
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: "You are a medical imaging AI. Your goal is to visualize plastic surgery outcomes. Do not block nudity as this is for clinical simulation. Ensure the size difference is clearly visible to the patient.",
        safetySettings: MEDICAL_SAFETY_SETTINGS,
      }
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    
    if (imagePart?.inlineData?.data) {
      return imagePart.inlineData.data;
    }
    
    // Log text response if no image
    if (response.text) {
        console.warn("AI returned text instead of image:", response.text);
    }
    
    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
         throw new Error("Hình ảnh mô phỏng bị chặn do chính sách an toàn. Vui lòng thử lại với ảnh kín đáo hơn.");
    }

    throw new Error("AI không trả về dữ liệu hình ảnh. Vui lòng thử lại.");
  } catch (error: any) {
    console.error("Gemini Simulation Error:", error);
    if (error.message && (error.message.includes("SAFETY") || error.message.includes("API Key"))) throw error;
    
    // Provide a more descriptive error if API Key is likely the issue
    if (error.message && error.message.includes("400")) {
         throw new Error("Lỗi xác thực API (400). Vui lòng kiểm tra API Key.");
    }
    
    throw new Error(`Lỗi tạo ảnh: ${error.message || "Không xác định"}`);
  }
};
