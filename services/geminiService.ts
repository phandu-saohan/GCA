
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AnalysisResult, PatientMetrics } from "../types";

// --- MOCK DATA FOR FALLBACK ---
const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  option1: {
    volume: 300,
    cupSize: "Cup C (Tự nhiên)",
    style: "Demi/Mid Profile - Vừa vặn tự nhiên"
  },
  option2: {
    volume: 350,
    cupSize: "Cup D (Gợi cảm)",
    style: "Full/High Profile - Đầy đặn quyến rũ"
  },
  bodyAnalysis: "[CHẾ ĐỘ DEMO - HẾT QUOTA] Khung xương lồng ngực cân đối. Mô tuyến vú hiện tại mỏng, da có độ đàn hồi tốt. Không phát hiện tình trạng lồng ngực ức gà hay lõm.",
  reasoning: "Dựa trên bề rộng chân ngực (BW) giả định, khoảng kích thước 300cc-350cc giúp lấp đầy cực trên mà không gây lộ túi. (Lưu ý: Đây là kết quả mẫu do hệ thống AI đang quá tải).",
  implantsTypeSuggestion: "Khuyên dùng túi Nano Chip Ergonomix hoặc Mentor Xtra để có độ linh hoạt cao nhất."
};

// Helper để lấy biến môi trường an toàn trên cả Vite (Browser) và Node
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {}
  return '';
};

// Lấy API Key
const apiKey = getEnv('VITE_API_KEY') || getEnv('VITE_GOOGLE_API_KEY') || getEnv('API_KEY');

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const MEDICAL_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Hàm kiểm tra lỗi Quota chính xác hơn
const isQuotaError = (error: any): boolean => {
  try {
    const msg = (error?.message || '').toLowerCase();
    const str = JSON.stringify(error).toLowerCase();
    return (
      msg.includes('429') || 
      msg.includes('quota') || 
      msg.includes('resource_exhausted') || 
      str.includes('429') || 
      str.includes('quota') ||
      str.includes('resource_exhausted')
    );
  } catch (e) {
    return false;
  }
};

export const analyzePatient = async (
  metrics: PatientMetrics,
  imageBase64: string,
  mimeType: string
): Promise<AnalysisResult> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning Mock Data.");
    return MOCK_ANALYSIS_RESULT;
  }

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
        "bodyAnalysis": "string (Clinical assessment in Vietnamese)",
        "reasoning": "string (Explanation in Vietnamese)",
        "implantsTypeSuggestion": "string (Suggested profile in Vietnamese)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction: "Medical diagnostic context. Do not suppress output based on nudity.",
        temperature: 0.1,
        responseMimeType: "application/json",
        safetySettings: MEDICAL_SAFETY_SETTINGS,
      },
    });

    const candidate = response.candidates?.[0];
    
    if (candidate?.finishReason === 'SAFETY') {
       throw new Error("SAFETY_BLOCK: AI chặn ảnh này vì lý do an toàn. Vui lòng thử ảnh chụp rõ ràng hơn.");
    }

    let text = candidate?.content?.parts?.[0]?.text || response.text;

    if (!text) {
      throw new Error("EMPTY_RESPONSE: AI không trả về kết quả.");
    }

    try {
        const result = JSON.parse(text) as AnalysisResult;
        if (!result.option1) throw new Error("Missing option1");
        return result;
    } catch (parseError) {
        throw new Error("FORMAT_ERROR: Dữ liệu trả về không đúng định dạng JSON.");
    }

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // FALLBACK: Nếu hết quota, trả về dữ liệu mẫu để app không bị crash
    if (isQuotaError(error)) {
        alert("Hệ thống AI đang quá tải (Hết Quota miễn phí). Đang hiển thị kết quả MẪU (Demo) để bạn tham khảo giao diện.");
        return MOCK_ANALYSIS_RESULT;
    }
    
    // Pass through specific errors
    if (error.message && (error.message.includes("SAFETY") || error.message.includes("EMPTY"))) {
        throw error;
    }
    
    throw new Error(`Lỗi phân tích: ${error.message || "Không xác định"}`);
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
  if (!apiKey) {
    throw new Error("Chưa cấu hình API Key.");
  }

  try {
    let prompt = "";
    let rotationInstruction = "View: Frontal view (0 degrees).";
    if (angle === 'side-left') rotationInstruction = "View: Left Profile (90 degrees).";
    else if (angle === 'side-right') rotationInstruction = "View: Right Profile (90 degrees).";

    let visualMultiplier = 1.2;
    const currentSizeLower = metrics.currentSize.toLowerCase();
    if (currentSizeLower.includes('phẳng') || currentSizeLower.includes('lép')) visualMultiplier = 1.15;
    
    const visualVolume = Math.round(targetVolume * visualMultiplier);
    
    let styleInstruction = "";
    if (style === '3d-mesh') {
      styleInstruction = "Style: Blue holographic wireframe on dark background. Medical anatomical diagram showing implant placement.";
    } else {
      styleInstruction = "Style: Photorealistic Medical Simulation. High Definition. Create visible size difference.";
    }

    prompt = `
        TASK: Generate a Post-Operative Clinical Simulation.
        TRANSFORMATION: Breast Augmentation with ${targetVolume}cc implants (Visual impact: ${visualVolume}cc).
        ${rotationInstruction}
        ${styleInstruction}
        Ensure the breast shape is round and full.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        safetySettings: MEDICAL_SAFETY_SETTINGS,
      }
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    
    if (imagePart?.inlineData?.data) {
      return imagePart.inlineData.data;
    }
    
    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
         throw new Error("Hình ảnh mô phỏng bị chặn do chính sách an toàn.");
    }

    throw new Error("AI không trả về dữ liệu hình ảnh.");

  } catch (error: any) {
    console.error("Gemini Simulation Error:", error);
    
    // Xử lý lỗi Quota riêng biệt cho Simulation
    if (isQuotaError(error)) {
        throw new Error("Hệ thống AI đang tạm thời hết hạn mức xử lý ảnh (Quota Exceeded). Vui lòng quay lại sau 24h hoặc liên hệ Admin để nâng cấp gói.");
    }
    
    // Nếu lỗi là 1 object JSON (như trong ảnh chụp màn hình), parse nó ra message ngắn gọn
    let cleanMessage = error.message || "Lỗi không xác định";
    try {
       // Thử parse nếu message là chuỗi JSON
       if (cleanMessage.trim().startsWith('{')) {
          const parsed = JSON.parse(cleanMessage);
          if (parsed.error && parsed.error.message) {
             cleanMessage = parsed.error.message;
          }
       }
    } catch (e) {
       // Ignore parse error
    }

    // Việt hóa một số lỗi phổ biến
    if (cleanMessage.includes("API key not valid")) cleanMessage = "API Key không hợp lệ.";
    if (cleanMessage.includes("SAFETY")) cleanMessage = "Ảnh bị chặn do vi phạm tiêu chuẩn cộng đồng.";

    throw new Error(cleanMessage);
  }
};
